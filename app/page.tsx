import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ImageUp, ScanLine, Link2 } from 'lucide-react'
import { SiteFooter } from '@/components/site-footer'
import { JsonLd } from '@/components/json-ld'
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME}: screenshot to song links`,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
  },
}

const STEPS = [
  { icon: ImageUp, label: 'Upload screenshot', hint: 'A playlist or shared song list' },
  { icon: ScanLine, label: 'Detect songs', hint: 'Names and artists, read for you' },
  { icon: Link2, label: 'Get links', hint: 'Apple · Spotify · YouTube' },
]

export default function LandingPage() {
  return (
    <main id="main-content" className="flex min-h-[calc(100svh-3.5rem)] flex-col bg-background text-foreground">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
            },
            {
              '@type': 'WebApplication',
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Any (web browser)',
              browserRequirements: 'Requires JavaScript',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              author: { '@type': 'Person', name: AUTHOR_NAME },
            },
          ],
        }}
      />

      {/* Hero — device faceplate on a blueprint grid */}
      <section className="flex min-h-[calc(100svh-3.5rem)] w-full flex-col px-2.5 py-2.5">
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
            <div className="relative mx-auto max-w-3xl rounded-md bg-card px-5 py-5">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
                Convert screenshots into findable links
              </h1>
              <p className="mx-auto mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
                Found songs in a screenshot? Upload it, check the song names, and open them on
                Apple Music, Spotify, or YouTube Music. Free, with no account needed.
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

          {/* Steps — icons and arrows show the upload-to-links sequence */}
          <div className="border-t border-border px-4 py-4 sm:px-5">
            <h2 className="sr-only">How it works</h2>
            <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.label} className="contents">
                    <div className="relative flex flex-1 flex-col gap-1.5 rounded-md border border-border bg-background px-2.5 py-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded border border-border bg-card">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="text-xs font-semibold">{step.label}</h3>
                        <div className="font-mono text-xs leading-relaxed text-muted-foreground">
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
