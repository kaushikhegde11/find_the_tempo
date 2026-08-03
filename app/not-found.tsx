import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ErrorScreen } from '@/components/error-screen'

// 404 — a route that doesn't exist. Same faceplate, route home.
export default function NotFound() {
  return (
    <ErrorScreen
      label="404"
      title="Off the tracklist"
      message="This page isn't here. Head back home and start from a screenshot."
      actions={
        <Link
          href="/"
          className="te-key inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      }
    />
  )
}
