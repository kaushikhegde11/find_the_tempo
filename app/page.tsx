'use client'

import Link from 'next/link'
import { ArrowRight, ImageUp, ScanLine, Link2 } from 'lucide-react'

const STEPS = [
  { icon: ImageUp, label: 'Upload screenshot', hint: 'Any tracklist image' },
  { icon: ScanLine, label: 'Detect songs', hint: 'Names & artists, read for you' },
  { icon: Link2, label: 'Get links', hint: 'Apple · Spotify · YouTube' },
]

const WORDMARK = 'Find the tempo'

// A few live equalizer bars — the wordmark's "tempo" made visible.
function EqualizerGlyph({ className = '', bars = 4 }: { className?: string; bars?: number }) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-current"
          style={{ height: '100%', animationDelay: `${(i % bars) * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Nav — centered animated wordmark */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
          <div className="flex items-center justify-center gap-2.5">
            <EqualizerGlyph className="h-4 text-foreground" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              {WORDMARK.split('').map((ch, i) => (
                <span
                  key={i}
                  className="tempo-letter"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero — fills the first viewport, steps pinned to the bottom */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-8">
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="max-w-3xl space-y-6 animate-slide-up">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Convert screenshots into findable links
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Upload a screenshot of any tracklist. Get every song as a ready to use link on
              Apple Music, Spotify, and YouTube Music.
            </p>
            <div className="pt-4">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Upload a screenshot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* How it works — minimalist arrowed step strip at the bottom of the view */}
        <div className="pb-10">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <ol className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={step.label} className="contents">
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 sm:flex-col sm:gap-2 sm:px-6 sm:text-center">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.hint}</div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="mx-auto h-4 w-4 flex-shrink-0 rotate-90 text-muted-foreground/50 sm:rotate-0" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Footer — animated equalizer baseline (CSS transforms only) */}
      <footer className="relative overflow-hidden border-t border-border/50 bg-muted/30">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center gap-[4px] px-4 opacity-40"
          aria-hidden
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <span
              key={i}
              className="eq-bar w-[4px] flex-shrink rounded-t-sm bg-foreground/60"
              style={{
                height: '100%',
                animationDelay: `${(i % 12) * 0.09}s`,
                animationDuration: `${1 + (i % 5) * 0.12}s`,
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-8 sm:px-8">
          <p className="text-center text-sm text-muted-foreground">© 2026 Find the tempo</p>
        </div>
      </footer>
    </main>
  )
}
