import Link from 'next/link'

/**
 * Persistent product header — wordmark + status LED.
 * Shown on every screen via the root layout. Wordmark links home.
 * The LED is decorative; it does not imply recording functionality.
 */
export function SiteHeader() {
  return (
    <nav aria-label="Main" className="te-dotgrid sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-2.5 sm:px-8">
        <span className="inline-flex items-stretch overflow-hidden rounded-md border border-foreground/70 bg-card">
          <span aria-hidden="true" className="flex items-center justify-center border-r border-foreground/40 px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          {/* Wordmark — links home. */}
          <Link
            href="/"
            className="px-4 py-1.5 text-sm font-bold lowercase tracking-tight text-foreground"
          >
            find the tempo
          </Link>
        </span>
      </div>
    </nav>
  )
}
