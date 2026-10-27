const DEFAULT_URL = 'https://findthetempo.netlify.app'

// NEXT_PUBLIC_APP_URL may point at localhost in a dev .env, so only trust an https value.
const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '')

export const SITE_URL = fromEnv && fromEnv.startsWith('https://') ? fromEnv : DEFAULT_URL
export const SITE_NAME = 'Find the tempo'
export const SITE_DESCRIPTION =
  'Turn a screenshot of any tracklist into ready-to-open links on Apple Music, Spotify, and YouTube Music, with tempo (BPM) for each song.'
export const AUTHOR_NAME = 'Kaushik Hegde'
export const CONTACT_EMAIL = 'kaushik.hgd@gmail.com'

/** Absolute URL for a site path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path === '/' ? '' : path}`
}
