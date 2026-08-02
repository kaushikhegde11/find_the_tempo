'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/upload-zone'
import { ProcessingState } from '@/components/processing-state'
import { PlatformPickerDialog } from '@/components/platform-picker-dialog'
import { Platform } from '@/components/platform-toggle'
import { useAppContext } from '@/lib/context'
import { extractSongsFromScreenshot, validateImage } from '@/lib/ocr-service'

/**
 * The screenshot upload + OCR flow. Rendered both as a full page (/upload) and
 * inside the intercepting modal. Aborts any in-flight scan when it unmounts
 * (e.g. the modal closes or the user navigates home).
 */
export function UploadFlow() {
  const router = useRouter()
  const { setSongs, selectedPlatforms, setSelectedPlatforms } = useAppContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  // Files waiting on the platform picker before the scan starts.
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  // Controls the in-flight OCR request so Cancel / unmount can abort it.
  const abortRef = useRef<AbortController | null>(null)

  // Abort any in-flight scan if this flow unmounts (modal close / navigate away).
  useEffect(() => () => abortRef.current?.abort(), [])

  // Stop an in-flight scan and reset to the empty upload state.
  const cancelProcessing = () => {
    abortRef.current?.abort()
    setIsProcessing(false)
    setProcessingStage(0)
    setUploadedFiles([])
    setError(null)
  }

  // Step 1: validate the dropped files, then open the platform picker.
  const handleFilesSelected = async (files: File[]) => {
    setError(null)

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

    setPendingFiles(validFiles)
    setPickerOpen(true)
  }

  // Picker cancelled — discard the pending upload, back to the empty zone.
  const handlePickerCancel = () => {
    setPickerOpen(false)
    setPendingFiles([])
  }

  // Picker confirmed — remember the chosen services, then scan.
  const handlePickerConfirm = (platforms: Platform[]) => {
    setSelectedPlatforms(platforms)
    setPickerOpen(false)
    const files = pendingFiles
    setPendingFiles([])
    startScan(files)
  }

  // Step 2: run OCR on the validated files and hand off to results.
  const startScan = async (validFiles: File[]) => {
    if (validFiles.length === 0) return

    setUploadedFiles(validFiles)
    setIsProcessing(true)
    setProcessingStage(0)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      setProcessingStage(1)
      const allSongs: any[] = []
      for (const file of validFiles) {
        const songs = await extractSongsFromScreenshot(file, controller.signal)
        allSongs.push(...songs)
      }

      if (controller.signal.aborted) return

      if (allSongs.length === 0) {
        setError('No songs detected in the screenshot. Try a clearer image with visible song names.')
        setIsProcessing(false)
        setUploadedFiles([])
        return
      }

      setProcessingStage(2)
      setSongs(allSongs)
      router.push('/results')
    } catch (error: any) {
      if (error?.name === 'AbortError' || controller.signal.aborted) return

      console.error('[Upload] Error processing files:', error)
      setError(error.message || 'Something went wrong while processing your screenshot.')
      setIsProcessing(false)
      setProcessingStage(0)
      setUploadedFiles([])
    }
  }

  return (
    <div className="space-y-8">
      {/* Platform picker — choose which services to build links for */}
      <PlatformPickerDialog
        open={pickerOpen}
        initial={selectedPlatforms}
        onConfirm={handlePickerConfirm}
        onCancel={handlePickerCancel}
      />

      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Upload Your Screenshots
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Drop your song list screenshots below, and we&apos;ll extract all the songs automatically.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {!isProcessing && uploadedFiles.length === 0 ? (
        <UploadZone onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
      ) : null}

      {isProcessing && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <ProcessingState
              isProcessing={isProcessing}
              currentStage={processingStage}
              onCancel={cancelProcessing}
              onComplete={() => {
                // Navigation happens in startScan above.
              }}
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Processing {uploadedFiles.length} screenshot{uploadedFiles.length !== 1 ? 's' : ''}...
          </p>
        </div>
      )}
    </div>
  )
}
