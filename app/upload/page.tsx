import { UploadFlow } from '@/components/upload-flow'

// Full-page /upload — shown on a direct visit / hard load. Soft navigation from
// the home page is intercepted and rendered as a modal instead (see @modal).
export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <section className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        <UploadFlow />
      </section>
    </main>
  )
}
