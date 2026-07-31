'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UploadZone } from '@/components/upload-zone'
import { ProcessingState } from '@/components/processing-state'
import { useAppContext } from '@/lib/context'
import { extractSongsFromScreenshot, validateImage } from '@/lib/ocr-service'

export default function UploadPage() {
  const router = useRouter()
  const { setSongs } = useAppContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = async (files: File[]) => {
    setError(null)

    // Validate all files
    const validFiles: File[] = []
    for (const file of files) {
      const isValid = await validateImage(file)
      if (isValid) {
        validFiles.push(file)
      }
    }

    if (validFiles.length === 0) {
      setError('No valid image files. Please upload PNG, JPEG or WebP images under 10 MB.')
      return
    }

    setUploadedFiles(validFiles)
    setIsProcessing(true)
    setProcessingStage(0) // Stage 0: reading

    try {
      // Stage 1: OCR – extract songs from screenshots
      setProcessingStage(1)
      const allSongs: any[] = []
      for (const file of validFiles) {
        const songs = await extractSongsFromScreenshot(file)
        allSongs.push(...songs)
      }

      if (allSongs.length === 0) {
        setError('No songs detected in the screenshot. Try a clearer image with visible song names.')
        setIsProcessing(false)
        setUploadedFiles([])
        return
      }

      // Stage 2: hand off to results (link lookups + any edits happen there)
      setProcessingStage(2)
      setSongs(allSongs)
      router.push('/results')
    } catch (error: any) {
      console.error('[Upload] Error processing files:', error)
      setError(error.message || 'Something went wrong while processing your screenshot.')
      setIsProcessing(false)
      setProcessingStage(0)
      setUploadedFiles([])
    }
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
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Upload Your Screenshots
            </h1>
            <p className="text-muted-foreground">
              Drop your song list screenshots below, and we&apos;ll extract all the songs automatically.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Upload Zone or Processing State */}
          {!isProcessing && uploadedFiles.length === 0 ? (
            <UploadZone
              onFilesSelected={handleFilesSelected}
              isProcessing={isProcessing}
            />
          ) : null}

          {isProcessing && (
            <div className="space-y-12">
              <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
                <ProcessingState
                  isProcessing={isProcessing}
                  currentStage={processingStage}
                  onComplete={() => {
                    // Navigation happens in the try block above
                  }}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Processing {uploadedFiles.length} screenshot{uploadedFiles.length !== 1 ? 's' : ''}...
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
