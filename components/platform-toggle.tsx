'use client'

import { cn } from '@/lib/utils'

export type Platform =
  | 'apple'
  | 'spotify'
  | 'ytmusic'
  | 'beatport'
  | 'soundcloud'
  | 'discogs'
  | 'bandcamp'

// Single source of truth for platform label + accent, shared by the toggle,
// the picker dialog, and anywhere a platform needs a name/color.
export const PLATFORMS: { key: Platform; label: string; accent: string }[] = [
  { key: 'apple', label: 'Apple Music', accent: '#FA2D48' },
  { key: 'spotify', label: 'Spotify', accent: '#1DB954' },
  { key: 'ytmusic', label: 'YT Music', accent: '#FF0000' },
  { key: 'beatport', label: 'Beatport', accent: '#A8E00F' },
  { key: 'soundcloud', label: 'SoundCloud', accent: '#FF5500' },
  { key: 'discogs', label: 'Discogs', accent: '#333333' },
  { key: 'bandcamp', label: 'Bandcamp', accent: '#4FD1C5' },
]

// What we default the picker to when the user hasn't chosen yet.
export const DEFAULT_PLATFORMS: Platform[] = ['apple', 'spotify', 'ytmusic']

interface PlatformToggleProps {
  value: Platform
  onChange: (value: Platform) => void
  // Restrict the toggle to a subset (the platforms the user picked). When
  // omitted, all platforms are shown.
  options?: Platform[]
}

// Cassette-transport style: one housing, keys divided by seams, active key depressed.
export function PlatformToggle({ value, onChange, options }: PlatformToggleProps) {
  const shown = options && options.length > 0
    ? PLATFORMS.filter((p) => options.includes(p.key))
    : PLATFORMS

  return (
    <div className="te-segment flex-wrap bg-neutral-300">
      {shown.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            className={cn(
              'te-cassette-key te-dots min-w-[120px] justify-between overflow-hidden pt-4 text-neutral-800',
              active && 'is-pressed'
            )}
          >
            <span className="px-5 pb-3 font-mono text-xs font-semibold uppercase tracking-wide">
              {opt.label}
            </span>
            {/* full-width colored accent bar at the bottom of the key — glows when active */}
            <span
              className="block h-2.5 w-full transition-shadow"
              style={{
                backgroundColor: opt.accent,
                opacity: 1,
                boxShadow:
                  active && opt.key !== 'discogs'
                    ? `0 0 12px 1px ${opt.accent}, 0 0 5px 0 ${opt.accent}`
                    : 'none',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
