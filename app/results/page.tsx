'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Info, ImageUp } from 'lucide-react'
import { ResultsTable } from '@/components/results-table'
import { PlatformToggle, Platform } from '@/components/platform-toggle'
import { SiteFooter } from '@/components/site-footer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppContext } from '@/lib/context'
import { Song } from '@/lib/types'

export default function ResultsPage() {
  const router = useRouter()
  const { songs, setSongs, selectedPlatforms } = useAppContext()
  // Default the active toggle to the first service the user picked.
  const [platform, setPlatform] = useState<Platform>(selectedPlatforms[0] ?? 'apple')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Confirm before leaving results to add more screenshots (a new scan replaces this list).
  const [confirmBack, setConfirmBack] = useState(false)

  // Always hold the latest songs so async edits merge against fresh state.
  const songsRef = useRef(songs)
  songsRef.current = songs

  // Consider enriched once any song has an Apple link.
  const alreadyEnriched = songs.some((s) => s.appleMusicUrl)

  // Re-run the Apple lookup for a single (edited) song and merge the result.
  const applyApple = async (target: Song) => {
    try {
      const res = await fetch('/api/apple-music/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: [target] }),
      })
      if (!res.ok) return
      const enriched = (await res.json()).songs?.[0] as Song | undefined
      if (enriched) setSongs(songsRef.current.map((s) => (s.id === target.id ? enriched : s)))
    } catch {
      /* keep the cleared song with key-free search links */
    }
  }

  // Edit a song's name/artist: clear stale link data, then re-look-up Apple.
  const handleEdit = (id: string, name: string, artist: string) => {
    const base = songsRef.current.find((s) => s.id === id)
    if (!base) return
    const cleared: Song = {
      ...base,
      originalName: name,
      artist,
      appleMusicUrl: undefined,
      appleTrackName: undefined,
      appleArtist: undefined,
      appleAlbum: undefined,
      appleArtwork: undefined,
      applePreviewUrl: undefined,
      spotifyTrackId: undefined,
      previewUrl: undefined,
    }
    setSongs(songsRef.current.map((s) => (s.id === id ? cleared : s)))
    applyApple(cleared)
  }

  const handleDelete = (id: string) => {
    setSongs(songsRef.current.filter((s) => s.id !== id))
  }

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
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Faceplate card — same device frame as the landing page, 10px page padding */}
      <section className="flex w-full flex-1 flex-col px-2.5 py-2.5">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[11px] border border-border bg-card shadow-sm">
          {/* Faceplate header strip: upload-more (top-left, 10px from card edge) + status LEDs */}
          <div className="flex items-center justify-between border-b border-border p-2.5">
            <button
              type="button"
              onClick={() => setConfirmBack(true)}
              className="te-key te-key--light te-key--sm inline-flex items-center gap-2 rounded-md bg-card px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Upload more
            </button>
            <span className="flex items-center gap-1.5 pr-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          {/* Body — blueprint dot-grid sits behind the text/button layer, 10px inset */}
          <div className="relative flex flex-1 flex-col te-dotgrid p-2.5">
            <div className="mx-auto w-full max-w-6xl space-y-8 py-10 sm:py-14">
              {/* Header */}
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Your song links</h1>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Preview each track, open it on your service, then add the ones you want to any playlist yourself.
                  Something misread? Edit a row to fix its links.
                </p>
              </div>

              {/* Platform toggle + hint (centered) */}
              <div className="flex flex-col items-center gap-2">
                <PlatformToggle value={platform} onChange={setPlatform} options={selectedPlatforms} />
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Switch link platform anytime
                </span>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding links across services…
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Table */}
              {!loading && (
                <ResultsTable
                  songs={songs}
                  platform={platform}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Confirm before heading back to upload more screenshots */}
      <Dialog open={confirmBack} onOpenChange={setConfirmBack}>
        <DialogContent
          showCloseButton={false}
          className="overflow-hidden border-border bg-card p-0 sm:max-w-md"
        >
          {/* Faceplate header strip */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Upload more</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          <div className="px-5 pb-5 pt-1">
            <DialogHeader className="mb-4 space-y-1 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Add more screenshots?
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                You&apos;ll go back to upload. Scanning a new screenshot replaces the
                current list — open or copy any links you want to keep first.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setConfirmBack(false)}
                className="te-key te-key--light te-key--sm inline-flex items-center gap-2 rounded-md bg-card px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmBack(false)
                  router.push('/upload')
                }}
                className="te-key inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground"
              >
                <ImageUp className="h-4 w-4" />
                Upload more
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
