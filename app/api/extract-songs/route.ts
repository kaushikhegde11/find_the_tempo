import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Vision model for reading the screenshot. Gemini 2.5 Flash is served by a single
// fast provider (~4s, consistent) — Qwen on OpenRouter routes to varied providers
// whose latency swings past serverless timeouts.
const VISION_MODEL = process.env.QWEN_MODEL || 'google/gemini-2.5-flash'

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
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

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString('base64')
    const mimeType = file.type

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(25_000),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[Qwen/OpenRouter] API error:', body)
      return NextResponse.json(
        { error: 'OpenRouter API request failed', detail: body },
        { status: res.status }
      )
    }

    const data = await res.json()
    const rawContent: string = data.choices?.[0]?.message?.content ?? ''

    const parsed = parseSongs(rawContent)
    if (parsed === null) {
      console.error('[Qwen/OpenRouter] Unparseable response:', rawContent)
      return NextResponse.json({ error: 'Model returned unreadable output' }, { status: 500 })
    }

    const songs = parsed.filter(
      (s) => s.name && typeof s.name === 'string' && s.name.trim().length > 0
    )

    return NextResponse.json({ songs, count: songs.length })
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timed out. Try again.' }, { status: 504 })
    }
    console.error('[Qwen/OpenRouter] Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
