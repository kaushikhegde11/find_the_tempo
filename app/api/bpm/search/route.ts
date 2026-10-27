import { NextRequest, NextResponse } from 'next/server'
import { searchBPM } from '@/lib/getsongbpm-api'
import { rateLimit, LIMITS } from '@/lib/rate-limit'
import { parseSongsBody } from '@/lib/security'

/**
 * POST /api/bpm/search
 * Body: { songs: Array<{ id; originalName; artist; ... }> }  (max 50)
 *
 * Returns the songs array enriched with `bpm` (via GetSongBPM.com).
 * Degrades gracefully — a missing GETSONGBPM_API_KEY or a lookup miss
 * just leaves `bpm` unset rather than failing the batch.
 */
export async function POST(req: NextRequest) {
  if (!process.env.GETSONGBPM_API_KEY) {
    console.error('[BPM] GETSONGBPM_API_KEY is not set')
    return NextResponse.json({ error: 'BPM lookup is unavailable.' }, { status: 503 })
  }

  const limited = await rateLimit(req, LIMITS.lookup)
  if (limited) return limited

  try {
    const parsed = parseSongsBody(await req.json())
    if ('error' in parsed) return parsed.error

    const results = await Promise.all(
      parsed.songs.map(async (song) => {
        try {
          const match = await searchBPM(song.artist, song.originalName)
          if (match) {
            return { ...song, ...match }
          }
        } catch (err) {
          console.warn('[GetSongBPM] Lookup failed:', err)
        }
        return song
      })
    )

    return NextResponse.json({ songs: results })
  } catch (error) {
    console.error('[BPM Search API]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
