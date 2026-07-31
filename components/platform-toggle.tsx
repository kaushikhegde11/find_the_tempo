'use client'

import { cn } from '@/lib/utils'

export type Platform = 'apple' | 'spotify' | 'ytmusic'

interface PlatformToggleProps {
  value: Platform
  onChange: (value: Platform) => void
}

const OPTIONS: { key: Platform; label: string; accent: string }[] = [
  { key: 'apple', label: 'Apple Music', accent: '#FA2D48' },
  { key: 'spotify', label: 'Spotify', accent: '#1DB954' },
  { key: 'ytmusic', label: 'YT Music', accent: '#FF0000' },
]

// Cassette-transport style: one housing, keys divided by seams, active key depressed.
export function PlatformToggle({ value, onChange }: PlatformToggleProps) {
  return (
    <div className="te-segment bg-neutral-300">
      {OPTIONS.map((opt) => {
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
            {/* full-width colored accent bar at the bottom of the key */}
            <span
              className="block h-2.5 w-full"
              style={{ backgroundColor: opt.accent, opacity: active ? 1 : 0.5 }}
            />
          </button>
        )
      })}
    </div>
  )
}
