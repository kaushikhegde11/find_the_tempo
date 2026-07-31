'use client'

import Link from 'next/link'
import { ArrowRight, ImageUp, ScanLine, Link2, Instagram, Music, Newspaper } from 'lucide-react'

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
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav — product-tag wordmark with status LED */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-4 sm:px-8">
          <span className="inline-flex items-center gap-2 rounded border border-foreground/80 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em]">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            find the tempo
            <span className="text-muted-foreground">/ ft-1</span>
          </span>
        </div>
      </nav>

      {/* Hero — device faceplate on a blueprint grid */}
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {/* Faceplate header strip */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
            <span>tracklist scanner</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          {/* Hero body — blueprint canvas */}
          <div className="relative te-dotgrid px-6 py-6 text-center sm:px-10">
            {/* corner nodes */}
            <Node className="absolute left-3 top-3" />
            <Node className="absolute right-3 top-3" />
            <Node className="absolute bottom-3 left-3" />
            <Node className="absolute bottom-3 right-3" />
            {/* coordinate readouts */}
            <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              scr-01
            </span>
            <span className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              x:1080 · y:1920
            </span>

            <div className="relative mx-auto max-w-3xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                screenshot → links
              </p>
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

          {/* Steps — BLCK-style numbered grid */}
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.n} className="relative flex flex-col gap-4 px-5 py-6">
                  <Node className="absolute right-3 top-3" />
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <span>blck. {step.n}</span>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded border border-border bg-background">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{step.label}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                      {step.hint}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer — structured orange block */}
      <footer className="bg-primary text-black">
        {/* link columns */}
        <div className="grid grid-cols-1 divide-y divide-black/20 border-y border-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* BLCK.01 — wordmark contained in the box */}
          <div className="relative flex flex-col overflow-hidden px-5 py-4">
            <Node className="absolute right-3 top-4 !bg-black" />
            <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest">
              blck. 01
            </div>
            <span className="block break-words font-bold leading-[0.85] tracking-tighter text-[clamp(1.75rem,5vw,3rem)]">
              find the tempo
            </span>
          </div>

          <FooterCol code="blck. 02" title="Follow">
            <FooterLink href="https://music.apple.com/profile/musicforkaey" icon={<Music className="h-4 w-4" />}>
              Apple Music
            </FooterLink>
            <FooterLink
              href="https://substack.com/@kaeywrites?r=6tdkpy&utm_campaign=profile&utm_medium=profile-page"
              icon={<Newspaper className="h-4 w-4" />}
            >
              Substack
            </FooterLink>
            <FooterLink href="https://www.instagram.com/artofkaey/" icon={<Instagram className="h-4 w-4" />}>
              Instagram
            </FooterLink>
          </FooterCol>

          <FooterCol code="blck. 03" title="System">
            <p className="font-mono text-xs leading-relaxed text-black/70">
              apple music · spotify · youtube music. no login.
            </p>
          </FooterCol>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] sm:px-6">
          <span>© 2026 find the tempo</span>
          <span className="text-black/60">screenshot → links</span>
        </div>
      </footer>
    </main>
  )
}

function FooterCol({
  code,
  title,
  children,
}: {
  code: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="relative px-5 py-4">
      <Node className="absolute right-3 top-4 !bg-black" />
      <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest">{code}</div>
      <div className="mb-3 text-lg font-bold">{title}</div>
      <div className="flex flex-col items-start gap-2">{children}</div>
    </div>
  )
}

// Social links as small physical keys.
function FooterLink({
  href,
  children,
  icon,
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="te-key te-key--light te-key--sm inline-flex w-48 items-center justify-center gap-2 rounded-md bg-card px-3 py-1.5 text-center font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
    >
      {icon}
      {children}
    </a>
  )
}
