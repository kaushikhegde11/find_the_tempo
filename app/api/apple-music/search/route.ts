import { NextRequest, NextResponse } from 'next/server'
import { searchAppleMusic } from '@/lib/apple-music-api'
import { rateLimit, LIMITS } from '@/lib/rate-limit'
import { parseSongsBody } from '@/lib/security'

/**
 * POST /api/apple-music/search
 * Body: { songs: Array<{ id; originalName; artist; ... }> }  (max 50)
 *
 * Returns the songs array enriched with Apple Music link + preview
 * (via the public iTunes Search API — no auth needed).
 */
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, LIMITS.lookup)
  if (limited) return limited

  try {
    const parsed = parseSongsBody(await req.json())
    if ('error' in parsed) return parsed.error

    const results = await Promise.all(
      parsed.songs.map(async (song) => {
        try {
          const match = await searchAppleMusic(song.artist, song.originalName)
          if (match) {
            return { ...song, ...match }
          }
        } catch (err) {
          console.warn('[Apple Music] Lookup failed:', err)
        }
        return song
      })
    )

    return NextResponse.json({ songs: results })
  } catch (error) {
    console.error('[Apple Music Search API]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
