'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, FileImage, Zap, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export function ProcessingState({
  isProcessing,
  currentStage = 0,
  onComplete,
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
              <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full animate-pulse bg-primary" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
