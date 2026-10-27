import type { Metadata } from 'next'
import { UploadFlow } from '@/components/upload-flow'

export const metadata: Metadata = {
  title: 'Upload a screenshot',
  description:
    'Upload a screenshot of any tracklist and get Apple Music, Spotify and YouTube Music links for every song.',
  alternates: { canonical: '/upload' },
}

// Full-page /upload — shown on a direct visit / hard load. Soft navigation from
// the home page is intercepted and rendered as a modal instead (see @modal).
export default function UploadPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <section className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        <UploadFlow />
      </section>
    </main>
  )
}
