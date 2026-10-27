/**
 * BPM lookup via the GetSongBPM.com API. Key-based (free tier).
 * Docs: https://getsongbpm.com/api
 */

export interface GetSongBpmMatch {
  bpm: number
}

interface GetSongBpmResult {
  tempo?: string
  title?: string
}

/**
 * Search GetSongBPM for a single best-match song's tempo.
 * Returns undefined when nothing usable is found (including when
 * GETSONGBPM_API_KEY is unset — callers should treat this as "no BPM").
 */
export async function searchBPM(
  artist: string,
  name: string
): Promise<GetSongBpmMatch | undefined> {
  const apiKey = process.env.GETSONGBPM_API_KEY
  if (!apiKey) return undefined

  const lookup = `song:${name} artist:${artist}`.trim()
  if (!lookup) return undefined

  const url =
    'https://api.getsongbpm.com/search/?' +
    new URLSearchParams({
      api_key: apiKey,
      type: 'song',
      lookup,
      limit: '1',
    }).toString()

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 },
  })

  if (!res.ok) {
    throw new Error(`GetSongBPM search failed: ${res.status}`)
  }

  const data = (await res.json()) as { search?: GetSongBpmResult[] }
  const best = (data.search || [])[0]
  if (!best?.tempo) return undefined

  const bpm = Number(best.tempo)
  if (!Number.isFinite(bpm)) return undefined

  return { bpm }
}
