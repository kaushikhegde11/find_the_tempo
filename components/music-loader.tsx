'use client'

import { useEffect, useState } from 'react'

const COLS = 5
const ROWS = 8

// VU / decibel colors by cell height: green (low) → yellow (mid) → red (peak).
function cellColor(row: number): string {
  if (row >= ROWS - 1) return '#E5484D' // red — top
  if (row >= ROWS - 3) return '#F5C518' // yellow — upper mid
  return '#3AC15A' // green — low
}

// Random-walk each column toward a lively bounce, clamped to [1, ROWS].
function nextLevels(prev: number[]): number[] {
  return prev.map((lvl) => {
    const step = Math.floor(Math.random() * 5) - 2 // -2..+2
    return Math.max(1, Math.min(ROWS, lvl + step))
  })
}

/**
 * Analog pixel decibel meter — the only loading animation. Five columns of
 * square pixel segments jump up and down like a VU meter while OCR runs.
 */
export function MusicLoader() {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: COLS }, (_, i) => 3 + (i % 3))
  )

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setLevels(nextLevels), 130)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      <div className="flex items-end gap-[3px] rounded-sm border border-border bg-background/60 p-1.5">
        {levels.map((lvl, col) => (
          <div key={col} className="flex flex-col-reverse gap-[2px]">
            {Array.from({ length: ROWS }).map((_, row) => {
              const lit = row < lvl
              return (
                <span
                  key={row}
                  className="h-1 w-2.5"
                  style={{
                    backgroundColor: cellColor(row),
                    opacity: lit ? 1 : 0.12,
                    boxShadow: lit ? `0 0 4px 0 ${cellColor(row)}` : 'none',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        finding your tempo
      </p>
    </div>
  )
}
