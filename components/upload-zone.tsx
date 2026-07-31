'use client'

import { useCallback, useState } from 'react'
import { Cloud, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  isProcessing?: boolean
  disabled?: boolean
}

export function UploadZone({
  onFilesSelected,
  isProcessing = false,
  disabled = false,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !isProcessing) {
        setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
      }
    },
    [disabled, isProcessing]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled || isProcessing) return

      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) =>
        ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
      )

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles)
      }
    },
    [disabled, isProcessing, onFilesSelected]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected]
  )

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors',
        isDragActive && !disabled && !isProcessing
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/30 hover:border-primary/50',
        (disabled || isProcessing) && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        disabled={disabled || isProcessing}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-4">
          {isDragActive ? (
            <Cloud className="h-8 w-8 text-primary animate-bounce" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {isDragActive ? 'Drop your screenshots here' : 'Upload song screenshots'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop PNG, JPEG, or WebP images, or click to browse
          </p>
        </div>

        <button
          disabled={disabled || isProcessing}
          className={cn(
            'mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50',
            (disabled || isProcessing) && 'cursor-not-allowed'
          )}
        >
          <Upload className="h-4 w-4" />
          Select Files
        </button>

        <p className="text-xs text-muted-foreground pt-2">
          Max 10MB per file
        </p>
      </div>
    </div>
  )
}
