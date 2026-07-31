/**
 * Apple Music lookup via the public iTunes Search API.
 * No auth required. Docs: https://performance-partners.apple.com/search-api
 */

export interface AppleMusicMatch {
  appleMusicUrl: string
  applePreviewUrl?: string
  appleTrackName: string
  appleArtist: string
  appleAlbum?: string
  appleArtwork?: string
}

interface ITunesResult {
  trackViewUrl?: string
  previewUrl?: string
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  kind?: string
}

/**
 * Search the iTunes catalog for a single best-match song.
 * Returns undefined when nothing usable is found.
 */
export async function searchAppleMusic(
  artist: string,
  name: string
): Promise<AppleMusicMatch | undefined> {
  const term = [artist, name].filter(Boolean).join(' ').trim()
  if (!term) return undefined

  const url =
    'https://itunes.apple.com/search?' +
    new URLSearchParams({
      term,
      entity: 'song',
      media: 'music',
      limit: '5',
    }).toString()

  const res = await fetch(url, {
    // iTunes API has no CORS for browsers, so this runs server-side.
    headers: { Accept: 'application/json' },
    // Revalidate cache lightly to be polite to the free endpoint.
    next: { revalidate: 60 * 60 },
  })

  if (!res.ok) {
    throw new Error(`iTunes search failed: ${res.status}`)
  }

  const data = (await res.json()) as { results?: ITunesResult[] }
  const results = (data.results || []).filter(
    (r) => r.kind === 'song' && r.trackViewUrl
  )
  if (results.length === 0) return undefined

  // Prefer a result whose track name loosely matches the queried song name.
  const wanted = name.toLowerCase()
  const best =
    results.find((r) => (r.trackName || '').toLowerCase().includes(wanted)) ||
    results[0]

  return {
    appleMusicUrl: best.trackViewUrl!,
    applePreviewUrl: best.previewUrl,
    appleTrackName: best.trackName || name,
    appleArtist: best.artistName || artist,
    appleAlbum: best.collectionName,
    appleArtwork: best.artworkUrl100,
  }
}
