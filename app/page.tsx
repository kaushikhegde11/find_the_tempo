import Link from 'next/link'
import { ArrowRight, ImageUp, ScanLine, Link2 } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'

const STEPS = [
  { n: '01', icon: ImageUp, label: 'Upload screenshot', hint: 'any tracklist image' },
  { n: '02', icon: ScanLine, label: 'Detect songs', hint: 'names & artists, read for you' },
  { n: '03', icon: Link2, label: 'Get links', hint: 'apple · spotify · youtube' },
]

// Small filled square used as a grid node marker.
function Node({ className = '' }: { className?: string }) {
  return <span className={`te-node ${className}`} aria-hidden />
}

export default function LandingPage() {
  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] flex-col bg-background text-foreground">
      {/* Hero — device faceplate on a blueprint grid */}
      <section className="flex w-full flex-1 flex-col px-2.5 py-2.5">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {/* Faceplate header strip */}
          <div className="flex items-center justify-end border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          {/* Hero body — blueprint canvas */}
          <div className="relative flex flex-1 flex-col justify-center te-dotgrid px-6 py-6 text-center sm:px-10">
            {/* corner nodes */}
            <Node className="absolute left-3 top-3" />
            <Node className="absolute right-3 top-3" />
            <Node className="absolute bottom-3 left-3" />
            <Node className="absolute bottom-3 right-3" />
            <div className="relative mx-auto max-w-3xl rounded-md bg-card px-5 py-5">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
                Convert screenshots into findable links
              </h1>
              <p className="mx-auto mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
                Upload a screenshot of any tracklist. Get every song as a ready to use link on
                Apple Music, Spotify, and YouTube Music.
              </p>
              <div className="mt-8">
                <Link
                  href="/upload"
                  className="te-key inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                >
                  Upload a screenshot
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Steps — STP numbered cards with arrows, centered near the bottom */}
          <div className="border-t border-border px-4 py-4 sm:px-5">
            <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.n} className="contents">
                    <div className="relative flex flex-1 flex-col gap-1.5 rounded-md border border-border bg-background px-2.5 py-3">
                      <Node className="absolute right-2 top-2" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        stp. {step.n}
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded border border-border bg-card">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <div>
                        <div className="text-xs font-semibold">{step.label}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                          {step.hint}
                        </div>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <ArrowRight
                        className="mx-auto h-4 w-4 flex-shrink-0 rotate-90 text-primary sm:rotate-0"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
