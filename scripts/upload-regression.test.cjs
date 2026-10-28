const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

// Exercise the real modules with only their network boundary replaced.
function loadModule(file, replacements = {}, globals = {}) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  })
  const module = { exports: {} }
  const math = Object.create(Math)
  math.random = () => 0.5 // Keep unrelated best-effort cleanup out of counter tests.
  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    require: (name) => replacements[name] ?? require(name),
    AbortController, AbortSignal, DOMException, FormData, Headers, Response,
    setTimeout, clearTimeout,
    Math: math,
    console: { warn() {} },
    ...globals,
  }, { filename: file })
  return module.exports
}

function limiter(network) {
  const security = loadModule('lib/security.ts')
  const blobClient = {
    getStore(options) {
      const send = options.fetch ?? network
      return {
        async get() {
          const response = await send('https://blobs.invalid/counter', { method: 'GET' })
          return response.status === 404 ? null : response.json()
        },
        async setJSON(key, value) {
          await send('https://blobs.invalid/counter', {
            method: 'PUT', body: JSON.stringify(value),
          })
        },
      }
    },
  }
  return loadModule('lib/rate-limit.ts', {
    '@netlify/blobs': blobClient,
    './security': security,
  }, { fetch: network }).rateLimit
}

const request = { headers: new Headers({ 'x-forwarded-for': '203.0.113.10' }) }
const rule = { bucket: 'extract', limit: 1, windowMs: 60 * 60 * 1000 }

async function withinBudget(promise) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Rate limiter stalled past 2.2 seconds')), 2200)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

test('healthy persistent counters still enforce the limit', async () => {
  let stored = null
  const limit = limiter(async (url, init) => {
    if (init.method === 'PUT') {
      stored = JSON.parse(init.body)
      return new Response(null, { status: 200 })
    }
    return stored ? Response.json(stored) : new Response(null, { status: 404 })
  })
  assert.equal(await limit(request, rule), null)
  const blocked = await limit(request, rule)
  assert.equal(blocked.status, 429)
  assert.ok(Number(blocked.headers.get('Retry-After')) > 0)
  assert.equal(stored.count, 2)
})

test('an unavailable store retains the existing in-memory limits', async () => {
  const limit = limiter(async () => { throw new Error('Store unavailable') })
  assert.equal(await limit(request, rule), null)
  assert.equal((await limit(request, rule)).status, 429)
  assert.equal(await limit(request, { ...rule, bucket: 'lookup' }), null)
})

for (const stalledMethod of ['GET', 'PUT']) {
  test(`a stalled store ${stalledMethod} aborts and falls back within the request budget`, async () => {
    let stalledSignal
    let unavailable = false
    const limit = limiter(async (url, init) => {
      if (unavailable) throw new Error('Store unavailable')
      if (init.method !== stalledMethod) return new Response(null, { status: 404 })
      stalledSignal = init.signal
      return new Promise((resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          unavailable = true
          reject(init.signal.reason)
        }, { once: true })
      })
    })
    assert.equal(await withinBudget(limit(request, rule)), null)
    assert.equal(stalledSignal.aborted, true)
    assert.equal((await withinBudget(limit(request, rule))).status, 429)
  })
}

test('a store operation that ignores cancellation cannot block the fallback', async () => {
  let retry
  let networkCalls = 0
  const limit = loadModule('lib/rate-limit.ts', {
    '@netlify/blobs': {
      getStore(options) {
        retry = () => options.fetch('https://blobs.invalid/retry', { method: 'PUT' })
        return { get: () => new Promise(() => {}) }
      },
    },
    './security': loadModule('lib/security.ts'),
  }, { fetch: async () => { networkCalls += 1 } }).rateLimit
  assert.equal(await withinBudget(limit(request, rule)), null)
  assert.throws(retry, (error) => error.name === 'TimeoutError')
  assert.equal(networkCalls, 0, 'SDK retries must not send requests after the deadline')
})

function extraction(response) {
  return loadModule('lib/ocr-service.ts', {}, {
    fetch: async () => response,
  }).extractSongsFromScreenshot(new File(['fixture'], 'tracklist.png', { type: 'image/png' }))
}

test('an HTML gateway timeout gives an actionable upload error', async () => {
  await assert.rejects(extraction(new Response('<h1>Inactivity Timeout</h1>', {
    status: 504, statusText: 'Gateway Timeout',
  })), /took too long.*try again/i)
})

test('a host-generated gateway error does not expose its internal payload', async () => {
  await assert.rejects(extraction(Response.json({
    errorType: 'Error', errorMessage: 'An unknown error has occurred',
  }, { status: 502 })), /temporarily unavailable.*try again/i)
})

test('an upstream busy response is preserved instead of mislabeled as an upload limit', async () => {
  await assert.rejects(extraction(Response.json({
    error: 'Song detection is busy right now. Please try again shortly.',
  }, { status: 429 })), /busy right now/i)
})
