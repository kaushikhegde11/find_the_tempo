'use client'

import { useState } from 'react'
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
  const [recOn, setRecOn] = useState(true)

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav — product-tag wordmark with status LED */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-2.5 sm:px-8">
          <span
            id="nav-wordmark"
            className="inline-flex items-stretch overflow-hidden rounded-md border border-foreground/70 bg-card"
          >
            {/* clickable record button — glows only while pressed (no real action) */}
            <button
              type="button"
              onClick={() => setRecOn((v) => !v)}
              aria-pressed={recOn}
              title="Record"
              className="flex items-center justify-center border-r border-foreground/40 px-3 transition-[box-shadow,filter] hover:brightness-105"
              style={{
                boxShadow: recOn
                  ? 'inset 0 2px 5px rgba(0,0,0,0.45)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              <span
                className={'h-2.5 w-2.5 rounded-full bg-primary ' + (recOn ? 'rec-glow' : '')}
              />
            </button>
            {/* wordmark — footer font */}
            <span className="px-4 py-1.5 text-sm font-bold lowercase tracking-tight">
              find the tempo
            </span>
          </span>
        </div>
      </nav>

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

      {/* Footer — structured orange block */}
      <footer className="bg-primary text-black">
        {/* link columns */}
        <div className="grid grid-cols-1 divide-y divide-black/20 border-y border-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* BLCK.01 — wordmark contained in the box */}
          <div className="relative flex flex-col overflow-hidden px-5 py-1.5">
            <Node className="absolute right-3 top-3 !bg-black" />
            <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest">
              blck. 01
            </div>
            <span className="block break-words font-bold leading-[0.85] tracking-tighter text-[clamp(1.75rem,5vw,3rem)]">
              find the tempo
            </span>
          </div>

          <FooterCol code="blck. 02" title="Follow" align="center">
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/20 px-4 py-1 font-mono text-[11px] uppercase tracking-[0.15em] sm:px-6">
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
  align = 'start',
}: {
  code: string
  title: string
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
}) {
  const alignCls = align === 'end' ? 'items-end' : align === 'center' ? 'items-center' : 'items-start'
  return (
    <div className="relative px-5 py-1.5">
      <Node className="absolute right-3 top-3 !bg-black" />
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest">{code}</div>
      <div className="mb-2 text-lg font-bold">{title}</div>
      <div className={`flex flex-col gap-2 ${alignCls}`}>{children}</div>
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
      className="te-key te-key--light te-key--sm inline-flex w-full items-center justify-center gap-2 rounded-md bg-card px-3 py-1.5 text-center font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
    >
      {icon}
      {children}
    </a>
  )
}
