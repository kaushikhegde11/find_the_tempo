'use client'

import { useEffect, useState } from 'react'
import { Disc3, Music, Music2, Music4, AudioLines, Headphones, Radio } from 'lucide-react'

/** A row of animated equalizer bars (reuses the .eq-bar keyframe). */
function Equalizer({ count = 5 }: { count?: number }) {
  return (
    <div className="flex h-16 items-end gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="eq-bar w-2 rounded-full bg-foreground"
          style={{ height: '100%', animationDelay: `${(i % count) * 0.13}s` }}
        />
      ))}
    </div>
  )
}

// 6 music-themed scenes, shown 3s each, then it loops.
const SCENES: { node: React.ReactNode; caption: string }[] = [
  { node: <Equalizer count={5} />, caption: 'Reading the vibes…' },
  { node: <Disc3 className="h-16 w-16 spin-slow text-foreground" strokeWidth={1.5} />, caption: 'Spinning the record…' },
  {
    node: (
      <div className="flex items-end gap-2">
        <Music className="h-10 w-10 animate-bob text-foreground" style={{ animationDelay: '0s' }} />
        <Music2 className="h-12 w-12 animate-bob text-foreground" style={{ animationDelay: '0.2s' }} />
        <Music4 className="h-10 w-10 animate-bob text-foreground" style={{ animationDelay: '0.4s' }} />
      </div>
    ),
    caption: 'Catching the melody…',
  },
  { node: <AudioLines className="h-16 w-16 animate-pulse text-foreground" strokeWidth={1.5} />, caption: 'Listening closely…' },
  {
    node: (
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/20" />
        <Headphones className="relative h-14 w-14 text-foreground" strokeWidth={1.5} />
      </div>
    ),
    caption: 'Feeling the beat…',
  },
  { node: <Radio className="h-16 w-16 animate-bob text-foreground" strokeWidth={1.5} />, caption: 'Tuning in…' },
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
      {/* key restarts the fade-in on each scene change */}
      <div key={scene} className="flex h-16 items-center justify-center animate-fade-in">
        {current.node}
      </div>
      <p key={`c-${scene}`} className="animate-fade-in text-sm font-medium text-muted-foreground">
        {current.caption}
      </p>
    </div>
  )
}
