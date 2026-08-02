'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Platform, PLATFORMS } from '@/components/platform-toggle'
import { cn } from '@/lib/utils'

interface PlatformPickerDialogProps {
  open: boolean
  initial: Platform[]
  onConfirm: (platforms: Platform[]) => void
  onCancel: () => void
}

// In-theme pop-up: user picks which services they want links for before the
// screenshot is scanned. Multi-select; at least one required to continue.
export function PlatformPickerDialog({
  open,
  initial,
  onConfirm,
  onCancel,
}: PlatformPickerDialogProps) {
  const [selected, setSelected] = useState<Platform[]>(initial)

  // Re-seed the selection each time the dialog opens.
  useEffect(() => {
    if (open) setSelected(initial)
  }, [open, initial])

  const toggle = (key: Platform) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-border bg-card p-0 sm:max-w-md"
      >
        {/* Faceplate header strip */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Link services</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
          </span>
        </div>

        <div className="px-5 pb-5 pt-1">
          <DialogHeader className="mb-4 space-y-1 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Where do you want links?
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Pick one or more services. You can switch between them on the results page.
            </DialogDescription>
          </DialogHeader>

          {/* Platform list — one row per service, physical toggle switch */}
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
            {PLATFORMS.map((p) => {
              const active = selected.includes(p.key)
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => toggle(p.key)}
                  aria-pressed={active}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex items-center gap-3">
                    {/* service accent chip */}
                    <span
                      className="h-3.5 w-3.5 rounded-sm border border-black/20"
                      style={{ backgroundColor: p.accent, opacity: active ? 1 : 0.4 }}
                    />
                    <span
                      className={cn(
                        'font-mono text-xs font-semibold uppercase tracking-wide',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {p.label}
                    </span>
                  </span>
                  {/* TE-style toggle: orange track + textured knob when on */}
                  <span className="te-switch" data-on={active}>
                    <span className="te-switch-knob" />
                  </span>
                </button>
              )
            })}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="te-key te-key--light te-key--sm inline-flex items-center gap-2 rounded-md bg-card px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onConfirm(selected)}
              className="te-key inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Scan {selected.length > 0 && `(${selected.length})`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
