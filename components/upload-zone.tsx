'use client'

import { useCallback, useRef, useState } from 'react'
import { CassetteTape, ArrowUpFromLine } from 'lucide-react'
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
  const inputRef = useRef<HTMLInputElement>(null)

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
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        disabled={disabled || isProcessing}
        className="absolute inset-0 z-0 cursor-pointer opacity-0"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full border border-primary/30 bg-primary/10 p-4 shadow-[inset_0_2px_6px_rgba(0,0,0,0.30)]">
          <CassetteTape
            className={cn('h-8 w-8 text-primary', isDragActive && 'animate-bounce')}
          />
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
          type="button"
          disabled={disabled || isProcessing}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'te-key relative z-10 mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50',
            (disabled || isProcessing) && 'cursor-not-allowed'
          )}
        >
          <ArrowUpFromLine className="h-4 w-4" />
          Select Files
        </button>

        <p className="text-xs text-muted-foreground pt-2">
          Max 10MB per file
        </p>
      </div>
    </div>
  )
}
