import { NextRequest, NextResponse } from 'next/server'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_SONGS_PER_REQUEST = 50
export const MAX_FIELD_LENGTH = 200

export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

/**
 * Identify an image by its leading bytes. The client-supplied File.type is
 * trivially spoofed, so the server trusts only the actual content.
 */
export function sniffImageMime(buf: Uint8Array): ImageMime | null {
  if (
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buf.length > 12 &&
    buf[0] === 0x52 && // R
    buf[1] === 0x49 && // I
    buf[2] === 0x46 && // F
    buf[3] === 0x46 && // F
    buf[8] === 0x57 && // W
    buf[9] === 0x45 && // E
    buf[10] === 0x42 && // B
    buf[11] === 0x50 // P
  ) {
    return 'image/webp'
  }
  if (
    buf.length > 6 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return 'image/gif'
  }
  return null
}

export interface SongInput {
  originalName: string
  artist: string
  [key: string]: unknown
}

/**
 * Validate the `{ songs: [...] }` body shared by the lookup routes. Returns the
 * parsed songs, or a ready-made 400 response.
 */
export function parseSongsBody(
  body: unknown
): { songs: SongInput[] } | { error: NextResponse } {
  const songs = (body as { songs?: unknown } | null)?.songs
  if (!Array.isArray(songs)) {
    return { error: NextResponse.json({ error: 'songs must be an array' }, { status: 400 }) }
  }
  if (songs.length === 0 || songs.length > MAX_SONGS_PER_REQUEST) {
    return {
      error: NextResponse.json(
        { error: `Send between 1 and ${MAX_SONGS_PER_REQUEST} songs per request` },
        { status: 400 }
      ),
    }
  }
  for (const s of songs) {
    if (
      !s ||
      typeof s !== 'object' ||
      typeof s.originalName !== 'string' ||
      typeof s.artist !== 'string' ||
      s.originalName.length > MAX_FIELD_LENGTH ||
      s.artist.length > MAX_FIELD_LENGTH
    ) {
      return { error: NextResponse.json({ error: 'Invalid song entry' }, { status: 400 }) }
    }
  }
  return { songs: songs as SongInput[] }
}

/** Best-effort client IP. Netlify sets x-nf-client-connection-ip. */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
