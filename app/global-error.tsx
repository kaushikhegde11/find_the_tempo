'use client'

import { useEffect } from 'react'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { ErrorScreen } from '@/components/error-screen'
import './globals.css'

// Catches errors thrown in the root layout itself — the worst case, where the
// normal error boundary can't render. Must supply its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global error]', error)
  }, [error])

  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <ErrorScreen
          label="Error"
          title="The whole thing stalled"
          message="Something broke before the app could load. Reload, or go back home."
          code={error.digest}
          actions={
            <>
              <button
                type="button"
                onClick={reset}
                className="te-key inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground"
              >
                <RotateCw className="h-4 w-4" />
                Reload
              </button>
              <a
                href="/"
                className="te-key te-key--light inline-flex items-center justify-center gap-2 rounded-md bg-card px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </a>
            </>
          }
        />
      </body>
    </html>
  )
}
