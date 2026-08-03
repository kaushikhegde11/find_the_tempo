'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { ErrorScreen } from '@/components/error-screen'

// Route-segment error boundary. Catches render/runtime errors anywhere in the
// app (below the root layout) and offers a retry + a way home.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <ErrorScreen
      label="Error"
      title="Something skipped a beat"
      message="The track dropped out. Try again, or head back to the start and re-upload."
      code={error.digest}
      actions={
        <>
          <button
            type="button"
            onClick={reset}
            className="te-key inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground"
          >
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="te-key te-key--light inline-flex items-center justify-center gap-2 rounded-md bg-card px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </>
      }
    />
  )
}
