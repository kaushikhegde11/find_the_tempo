import { NextRequest, NextResponse } from 'next/server'
import { searchAppleMusic } from '@/lib/apple-music-api'

/**
 * POST /api/apple-music/search
 * Body: { songs: Array<{ id; originalName; artist; ... }> }
 *
 * Returns the songs array enriched with Apple Music link + preview
 * (via the public iTunes Search API — no auth needed).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const songs: Array<{ originalName: string; artist: string; [k: string]: any }> =
      body.songs

    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: 'songs must be an array' }, { status: 400 })
    }

    const results = await Promise.all(
      songs.map(async (song) => {
        try {
          const match = await searchAppleMusic(song.artist, song.originalName)
          if (match) {
            return { ...song, ...match }
          }
        } catch (err) {
          console.warn(`[Apple Music] Failed for "${song.originalName}":`, err)
        }
        return song
      })
    )

    return NextResponse.json({ songs: results })
  } catch (error: any) {
    console.error('[Apple Music Search API]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
