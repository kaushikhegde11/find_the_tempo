'use client'

import { cn } from '@/lib/utils'

export type Platform = 'apple' | 'spotify' | 'ytmusic'

interface PlatformToggleProps {
  value: Platform
  onChange: (value: Platform) => void
}

const OPTIONS: { key: Platform; label: string; activeBg: string }[] = [
  { key: 'apple', label: 'Apple Music', activeBg: 'bg-[#FA2D48]' },
  { key: 'spotify', label: 'Spotify', activeBg: 'bg-[#1DB954]' },
  { key: 'ytmusic', label: 'YT Music', activeBg: 'bg-[#FF0000]' },
]

export function PlatformToggle({ value, onChange }: PlatformToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-muted p-1 select-none">
      {OPTIONS.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              'rounded-full px-5 py-1.5 text-sm font-medium transition-colors',
              active
                ? cn(opt.activeBg, 'text-white shadow-sm')
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
