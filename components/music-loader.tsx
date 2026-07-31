'use client'

import { useEffect, useState } from 'react'

/** Pixel equalizer — chunky square bars rising in discrete steps. */
function PixelEqualizer() {
  const bars = 5
  return (
    <div className="flex h-14 items-end gap-1.5">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="px-bar w-3 bg-foreground"
          style={{ height: '100%', animationDelay: `${(i % bars) * 0.12}s` }}
        />
      ))}
    </div>
  )
}

/** Pixel ring — 8 square pixels blinking around a loop. */
function PixelRing() {
  const cells = [
    [0, 0], [1, 0], [2, 0],
    [2, 1],
    [2, 2], [1, 2], [0, 2],
    [0, 1],
  ]
  return (
    <div className="grid h-14 w-14 grid-cols-3 grid-rows-3 gap-1.5">
      {Array.from({ length: 9 }).map((_, idx) => {
        const col = idx % 3
        const row = Math.floor(idx / 3)
        const ringIndex = cells.findIndex(([c, r]) => c === col && r === row)
        if (ringIndex === -1) return <span key={idx} />
        return (
          <span
            key={idx}
            className="px-dot bg-foreground"
            style={{ animationDelay: `${ringIndex * 0.12}s` }}
          />
        )
      })}
    </div>
  )
}

/** Pixel progress — a row of square pixels filling left→right. */
function PixelProgress() {
  const count = 8
  return (
    <div className="flex h-14 items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="px-dot h-3.5 w-3.5 bg-foreground"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// 3 pixel scenes, 3s each, looping.
const SCENES: { node: React.ReactNode; caption: string }[] = [
  { node: <PixelEqualizer />, caption: 'reading the vibes…' },
  { node: <PixelRing />, caption: 'detecting songs…' },
  { node: <PixelProgress />, caption: 'finding links…' },
]

export function MusicLoader() {
  const [scene, setScene] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 3000)
    return () => clearInterval(id)
  }, [])

  const current = SCENES[scene]

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-6">
      <div key={scene} className="flex h-14 items-center justify-center animate-fade-in">
        {current.node}
      </div>
      <p
        key={`c-${scene}`}
        className="animate-fade-in font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        {current.caption}
      </p>
    </div>
  )
}
