'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { UploadFlow } from '@/components/upload-flow'

/**
 * Intercepting modal for /upload. Overlays the still-mounted home page:
 * strong backdrop blur + white dim behind, a centered bounded card in front.
 * Closes on backdrop click, the X button, or Escape (router.back keeps the
 * URL behavior identical to a normal /upload -> home navigation).
 */
export default function UploadModal() {
  const router = useRouter()
  const pathname = usePathname()
  const close = () => router.back()

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Safety net: if the slot stays mounted after navigating away from /upload
  // (e.g. clicking the header wordmark -> "/", which the catch-all can't cover),
  // render nothing so the overlay can't linger on top of the new page.
  if (pathname !== '/upload') return null

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 p-4 backdrop-blur-lg dark:bg-black/50 sm:p-6"
    >
      {/* Centered card — fixed footprint; inner content scrolls so the card and
          close button never move between the upload and processing states. */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Upload your screenshots"
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-md sm:p-10"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          style={{ position: 'absolute' }}
          className="te-key te-key--light te-key--sm left-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[11px] bg-card text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <UploadFlow />
        </div>
      </div>
    </div>
  )
}
