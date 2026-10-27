import { ImageResponse } from 'next/og'

export const alt = 'Find the tempo: screenshot to song links'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Generated once at build time (no dynamic input), so it costs nothing per request.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#efe9da',
          padding: 56,
          fontFamily: 'sans-serif',
          color: '#1b1814',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: '#ff6a3c' }} />
          <div style={{ letterSpacing: 6, textTransform: 'uppercase' }}>find the tempo</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            Convert screenshots into findable links
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#5c554a' }}>
            Apple Music · Spotify · YouTube Music
          </div>
        </div>
        <div style={{ display: 'flex', height: 18, background: '#ff6a3c', borderRadius: 4 }} />
      </div>
    ),
    size
  )
}
