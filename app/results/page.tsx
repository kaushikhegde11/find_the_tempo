'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Info } from 'lucide-react'
import { ResultsTable } from '@/components/results-table'
import { PlatformToggle, Platform } from '@/components/platform-toggle'
import { useAppContext } from '@/lib/context'
import { Song } from '@/lib/types'

export default function ResultsPage() {
  const { songs, setSongs } = useAppContext()
  const [platform, setPlatform] = useState<Platform>('apple')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Consider enriched once any song has an Apple link.
  const alreadyEnriched = songs.some((s) => s.appleMusicUrl)

  useEffect(() => {
    if (songs.length === 0 || alreadyEnriched) return

    let cancelled = false
    setLoading(true)
    setError(null)

    // Only Apple Music needs a lookup (exact links + previews). Spotify and
    // YouTube Music use key-free search links built client-side in the table.
    fetch('/api/apple-music/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Search failed (${res.status})`)
        const data = await res.json()
        if (!cancelled) setSongs(data.songs as Song[])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Something went wrong')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (songs.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">No songs yet</h1>
          <p className="text-muted-foreground">Upload screenshots first</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload Screenshots
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
          <Link
            href="/review"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Your songs</h1>
            <p className="text-muted-foreground">
              Preview each track, open it on your service, then add the ones you want to any playlist yourself.
            </p>
          </div>

          {/* Platform toggle + hint (centered) */}
          <div className="flex flex-col items-center gap-2">
            <PlatformToggle value={platform} onChange={setPlatform} />
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Switch link platform anytime
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding links across services…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Table */}
          {!loading && <ResultsTable songs={songs} platform={platform} />}
        </div>
      </section>
    </main>
  )
}
