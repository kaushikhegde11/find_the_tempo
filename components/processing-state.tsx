'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, FileImage, Zap, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MusicLoader } from '@/components/music-loader'

interface ProcessingStage {
  id: 'reading' | 'detecting' | 'matching'
  label: string
  icon: React.ReactNode
}

const stages: ProcessingStage[] = [
  { id: 'reading', label: 'Reading screenshot', icon: <FileImage className="h-5 w-5" /> },
  { id: 'detecting', label: 'Detecting songs', icon: <Zap className="h-5 w-5" /> },
  { id: 'matching', label: 'Matching tracks', icon: <Search className="h-5 w-5" /> },
]

interface ProcessingStateProps {
  isProcessing: boolean
  currentStage?: number
  onComplete?: () => void
  onCancel?: () => void
}

export function ProcessingState({
  isProcessing,
  currentStage = 0,
  onComplete,
  onCancel,
}: ProcessingStateProps) {
  const [displayStage, setDisplayStage] = useState(0)

  useEffect(() => {
    if (!isProcessing) return

    if (currentStage > displayStage) {
      const timer = setTimeout(() => setDisplayStage(currentStage), 500)
      return () => clearTimeout(timer)
    }
  }, [isProcessing, currentStage, displayStage])

  useEffect(() => {
    if (!isProcessing || displayStage < stages.length - 1) return

    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [isProcessing, displayStage, onComplete])

  if (!isProcessing && displayStage === 0) {
    return null
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Cycling music-themed animations while OCR runs */}
      {isProcessing && (
        <div className="mb-2 border-b border-border/50 pb-6">
          <MusicLoader />
        </div>
      )}

      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-start gap-4">
          <div className="pt-0.5">
            {index < displayStage ? (
              <div className="rounded-full bg-green-100 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            ) : index === displayStage ? (
              <div className="rounded-full bg-primary/10 p-2.5 animate-pulse">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : (
              <div className="rounded-full bg-muted p-2.5">
                {stage.icon}
              </div>
            )}
          </div>

          <div className="flex-1 pt-1">
            <p
              className={cn(
                'text-sm font-medium transition-colors',
                index < displayStage
                  ? 'text-muted-foreground'
                  : 'text-foreground'
              )}
            >
              {stage.label}
            </p>
            {index === displayStage && (
              <div className="mt-1.5 h-1 w-40 overflow-hidden rounded-full bg-muted">
                <div className="progress-slide h-full w-1/3 rounded-full bg-primary" />
              </div>
            )}
          </div>
        </div>
      ))}

      {isProcessing && onCancel && (
        <div className="flex justify-center border-t border-border/50 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="te-key te-key--light te-key--sm inline-flex items-center gap-2 rounded-md bg-card px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
