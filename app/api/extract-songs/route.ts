import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Vision model for reading the screenshot. Gemini 2.5 Flash is served by a single
// fast provider (~4s, consistent) — Qwen on OpenRouter routes to varied providers
// whose latency swings past serverless timeouts.
const VISION_MODEL = process.env.QWEN_MODEL || 'google/gemini-2.5-flash'

// Which upstream reads the screenshot. 'gemini' hits the Google AI Studio Gemini
// API directly (billed to GCP credits); 'openrouter' is the original fallback path.
const OCR_PROVIDER = process.env.OCR_PROVIDER || 'openrouter'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

type RawSong = { name: string; artist: string; confidence: number }

/**
 * Tolerantly parse the model's reply into a songs array.
 * Handles code fences, stray prose, raw control characters, and truncated
 * output (a reply cut off mid-array still yields the complete song objects).
 * Returns null only when nothing usable can be recovered.
 */
function parseSongs(raw: string): RawSong[] | null {
  if (!raw) return null

  // Drop a ```json … ``` fence and isolate the outer JSON object.
  let text = raw.replace(/```(?:json)?/gi, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) text = text.slice(start, end + 1)

  // Escape raw control chars (literal newlines/tabs inside strings break JSON.parse).
  const cleaned = text.replace(/[\u0000-\u001F]+/g, ' ')

  // 1) Straight parse.
  try {
    const obj = JSON.parse(cleaned)
    if (Array.isArray(obj?.songs)) return obj.songs
  } catch {
    /* fall through to salvage */
  }

  // 2) Salvage: pull every complete { … } song object, even if the array was truncated.
  const objects = cleaned.match(/\{[^{}]*\}/g)
  if (objects) {
    const songs: RawSong[] = []
    for (const o of objects) {
      try {
        const s = JSON.parse(o)
        if (s && typeof s.name === 'string') {
          songs.push({ name: s.name, artist: s.artist ?? 'Unknown Artist', confidence: s.confidence ?? 0.75 })
        }
      } catch {
        /* skip malformed fragment */
      }
    }
    if (songs.length > 0) return songs
  }

  return null
}

const PROMPT = `You are a music recognition assistant. Look at this screenshot from a music app (Spotify, Apple Music, YouTube Music, etc.) or any image showing a song list.

Extract every song you can see and return ONLY valid JSON in this exact format with no extra text:
{
  "songs": [
    {"name": "Song Title", "artist": "Artist Name", "confidence": 0.95},
    {"name": "Another Song", "artist": "Another Artist", "confidence": 0.85}
  ]
}

Rules:
- Extract ALL visible songs, even partially visible ones
- confidence is a number from 0.5 (uncertain) to 1.0 (very clear)
- Use "Unknown Artist" only if no artist name is visible
- Skip UI elements like buttons, timestamps, playlist names, duration, play counts
- If no songs are visible, return {"songs": []}`

/**
 * Read the screenshot via OpenRouter (chat/completions with an image_url part).
 * Returns the model's raw text reply for parseSongs to handle.
 */
async function callOpenRouter(
  base64Image: string,
  mimeType: string,
  signal: AbortSignal
): Promise<string> {
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Screenshot to Playlist',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: PROMPT,
            },
          ],
        },
      ],
      temperature: 0.1,
      // OpenRouter pre-checks affordability against max_tokens. Omitting it
      // checks against the model's full 65k cap — guaranteed 402 on a low
      // balance. So a cap must exist; 2048 fits a long tracklist's JSON and
      // parseSongs salvages any truncation.
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
    signal,
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[OpenRouter] API error:', body)
    throw new UpstreamError('OpenRouter API request failed', res.status, body)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Read the screenshot via the Google AI Studio Gemini API (generateContent with
 * an inline base64 image part). Billed to the key's GCP project. Returns raw text.
 */
async function callGemini(
  base64Image: string,
  mimeType: string,
  signal: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Image } },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
    signal,
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[Gemini] API error:', body)
    throw new UpstreamError('Gemini API request failed', res.status, body)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// Carries the upstream HTTP status through so the route can mirror it to the client.
class UpstreamError extends Error {
  status: number
  detail: string
  constructor(message: string, status: number, detail: string) {
    super(message)
    this.name = 'UpstreamError'
    this.status = status
    this.detail = detail
  }
}

export async function POST(req: NextRequest) {
  // Provider-aware key guard.
  if (OCR_PROVIDER === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set (OCR_PROVIDER=gemini)' },
        { status: 503 }
      )
    }
  } else if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY is not set in .env.local' },
      { status: 503 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use PNG, JPEG, or WebP.' },
        { status: 400 }
      )
    }

    // Brief buffer so an accidental upload can still be cancelled before any
    // model work begins. Abortable: if the client cancels/navigates during it,
    // req.signal fires and we bail before spending any OpenRouter credit.
    await new Promise<void>((resolve, reject) => {
      if (req.signal.aborted) return reject(new DOMException('Aborted', 'AbortError'))
      const t = setTimeout(resolve, 2000)
      req.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(t)
          reject(new DOMException('Aborted', 'AbortError'))
        },
        { once: true }
      )
    })

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString('base64')
    const mimeType = file.type

    // Abort the upstream model call when the client disconnects
    // (Cancel button / navigation) OR after 25s, whichever comes first.
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(25_000)])

    const rawContent =
      OCR_PROVIDER === 'gemini'
        ? await callGemini(base64Image, mimeType, signal)
        : await callOpenRouter(base64Image, mimeType, signal)

    const parsed = parseSongs(rawContent)
    if (parsed === null) {
      console.error(`[${OCR_PROVIDER}] Unparseable response:`, rawContent)
      return NextResponse.json({ error: 'Model returned unreadable output' }, { status: 500 })
    }

    const songs = parsed.filter(
      (s) => s.name && typeof s.name === 'string' && s.name.trim().length > 0
    )

    return NextResponse.json({ songs, count: songs.length })
  } catch (error: any) {
    // Client disconnected (Cancel / navigation) — upstream call was aborted.
    // Nothing is listening for the response; end quietly, no error log.
    if (error.name === 'AbortError' || req.signal.aborted) {
      console.log('[OCR] Client aborted — upstream model call stopped.')
      return new NextResponse(null, { status: 499 })
    }
    if (error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timed out. Try again.' }, { status: 504 })
    }
    if (error instanceof UpstreamError) {
      return NextResponse.json(
        { error: error.message, detail: error.detail },
        { status: error.status }
      )
    }
    console.error(`[${OCR_PROVIDER}] Unexpected error:`, error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
