import { AlertTriangle } from 'lucide-react'

// Shared faceplate error/empty screen — same device frame + dot-grid as the
// rest of the app. Actions (buttons/links) are passed in by the caller.
export function ErrorScreen({
  label = 'Error',
  title,
  message,
  code,
  actions,
}: {
  label?: string
  title: string
  message: string
  code?: string
  actions: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="flex flex-1 items-center justify-center px-2.5 py-2.5">
        <div className="w-full max-w-lg overflow-hidden rounded-[11px] border border-border bg-card shadow-sm">
          {/* Faceplate header strip */}
          <div className="flex items-center justify-between border-b border-border p-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{label}</span>
            <span className="flex items-center gap-1.5 pr-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          {/* Blueprint canvas — grid behind the content */}
          <div className="te-dotgrid p-2.5">
            <div className="rounded-md bg-card px-6 py-10 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mx-auto mt-3 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
              {code && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  ref {code}
                </p>
              )}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {actions}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
