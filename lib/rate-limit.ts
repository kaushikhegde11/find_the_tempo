import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@netlify/blobs'
import { getClientIp } from './security'

interface Window {
  count: number
  resetAt: number
}

export interface RateLimitRule {
  /** Bucket name, so different routes keep separate counters. */
  bucket: string
  limit: number
  windowMs: number
}

const STORE_NAME = 'rate-limit'

// Fallback for local dev and any runtime without Netlify Blobs. Per-instance only.
const memory = new Map<string, Window>()

function nextWindow(cur: Window | null | undefined, rule: RateLimitRule, now: number): Window {
  return !cur || cur.resetAt <= now
    ? { count: 1, resetAt: now + rule.windowMs }
    : { count: cur.count + 1, resetAt: cur.resetAt }
}

function memoryHit(key: string, rule: RateLimitRule, now: number): Window {
  const next = nextWindow(memory.get(key), rule, now)
  memory.set(key, next)
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
  }
  return next
}

async function blobHit(key: string, rule: RateLimitRule, now: number): Promise<Window> {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })
  const cur = (await store.get(key, { type: 'json' })) as Window | null
  const next = nextWindow(cur, rule, now)
  await store.setJSON(key, next)
  return next
}

// Keys carry the day they were made. Anything from an earlier day is dead, so an
// occasional sweep keeps stored data to roughly one day.
async function purgeOldKeys(day: string): Promise<void> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: 'strong' })
    const { blobs } = await store.list()
    await Promise.all(
      blobs.filter((b) => b.key.split(':')[1] < day).map((b) => store.delete(b.key))
    )
  } catch {
    /* best effort */
  }
}

/**
 * Fixed-window per-IP limiter. The IP is hashed with the current date before it
 * is used as a key, so no raw address is stored and keys cannot be linked across
 * days. Returns a 429 response when over the limit, otherwise null. Never throws:
 * if the store fails, it falls back to memory. The read-modify-write is not
 * atomic, so it is a cost guard, not a hard cap.
 */
export async function rateLimit(
  req: NextRequest,
  rule: RateLimitRule
): Promise<NextResponse | null> {
  const now = Date.now()
  const day = new Date(now).toISOString().slice(0, 10)
  const hash = createHash('sha256')
    .update(`${day}|${getClientIp(req)}`)
    .digest('hex')
    .slice(0, 24)
  const key = `${rule.bucket}:${day}:${hash}`

  let win: Window
  try {
    win = await blobHit(key, rule, now)
    if (Math.random() < 0.01) void purgeOldKeys(day)
  } catch {
    win = memoryHit(key, rule, now)
  }

  if (win.count > rule.limit) {
    const retryAfter = Math.max(1, Math.ceil((win.resetAt - now) / 1000))
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }
  return null
}

export const LIMITS = {
  extract: { bucket: 'extract', limit: 10, windowMs: 60 * 60 * 1000 },
  lookup: { bucket: 'lookup', limit: 60, windowMs: 60 * 60 * 1000 },
} satisfies Record<string, RateLimitRule>
