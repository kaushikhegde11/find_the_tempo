'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { GoogleAnalytics } from '@next/third-parties/google'

const STORAGE_KEY = 'ftt-analytics-consent'
export const OPEN_CONSENT_EVENT = 'ftt:open-consent'

type Choice = 'granted' | 'denied'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
// The banner shows whenever an ID is set (so it can be tested locally); the GA
// script itself only loads in production, which keeps localhost out of the data.
const BANNER_ENABLED = !!GA_ID
const LOAD_GA = BANNER_ENABLED && process.env.NODE_ENV === 'production'

function hasGlobalPrivacyControl() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

function setAnalyticsEnabled(enabled: boolean) {
  if (GA_ID) {
    // Google's opt-out flag also stops hits from an already-loaded GA script.
    const analyticsWindow = window as unknown as Record<string, unknown>
    analyticsWindow[`ga-disable-${GA_ID}`] = !enabled
  }
}

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

function writeChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    /* storage blocked: choice only lasts for this page view */
  }
}

// Remove GA cookies (_ga, _ga_<id>) when consent is withdrawn.
function clearAnalyticsCookies() {
  const host = window.location.hostname
  const parts = host.split('.')
  const domains = new Set<string>([host, `.${host}`])
  if (parts.length > 2) domains.add(`.${parts.slice(-2).join('.')}`)
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      for (const d of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`
      }
    }
  }
}

/**
 * Consent-gated Google Analytics. Nothing from Google loads, and no analytics
 * cookie is set, until the visitor presses Accept. A Global Privacy Control
 * signal counts as a standing "Reject".
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [gpc, setGpc] = useState(false)

  useEffect(() => {
    const gpc = hasGlobalPrivacyControl()
    const saved = gpc ? 'denied' : readChoice()
    setGpc(gpc)
    setAnalyticsEnabled(saved === 'granted')
    if (saved === 'denied') clearAnalyticsCookies()
    setChoice(saved)
    setOpen(saved === null && BANNER_ENABLED)
    setReady(true)

    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [])

  const decide = useCallback((next: Choice) => {
    const effective = hasGlobalPrivacyControl() ? 'denied' : next
    setAnalyticsEnabled(effective === 'granted')
    writeChoice(effective)
    setChoice(effective)
    setOpen(false)
    if (effective === 'denied') clearAnalyticsCookies()
  }, [])

  if (!ready) return null

  return (
    <>
      {LOAD_GA && choice === 'granted' && <GoogleAnalytics gaId={GA_ID!} />}
      {open && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 p-2.5 sm:p-4"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center">
            <p className="flex-1 font-mono text-xs leading-relaxed text-foreground">
              We use Google Analytics, only if you allow it, to count visits and see which pages
              work. It sets cookies. Nothing else on this site uses cookies.{' '}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy policy
              </Link>
              {gpc && <span className="mt-2 block">Global Privacy Control is enabled. Analytics stays off.</span>}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide('denied')}
                className="te-key te-key--light min-h-11 rounded-md bg-card px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide('granted')}
                disabled={gpc}
                className="te-key min-h-11 rounded-md bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Cookie settings
    </button>
  )
}
