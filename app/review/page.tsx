'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SongReviewTable } from '@/components/song-review-table'
import { useAppContext } from '@/lib/context'

export default function ReviewPage() {
  const router = useRouter()
  const { songs, setSongs } = useAppContext()

  if (songs.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">No songs to review</h1>
          <p className="text-muted-foreground">
            Please upload screenshots first
          </p>
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

  const handleContinue = () => {
    router.push('/results')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-32 sm:px-8 sm:pt-24">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Review & Edit Songs
            </h1>
            <p className="text-muted-foreground">
              Check the detected songs and make any corrections before creating your playlist.
            </p>
          </div>

          {/* Song Table */}
          <SongReviewTable songs={songs} onSongsChange={setSongs} />
        </div>
      </section>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4 sm:px-8">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload More
          </Link>
          <button
            onClick={handleContinue}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
