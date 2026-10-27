import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, SITE_NAME } from '@/lib/site'

// Shared faceplate shell for text pages (about, faq, privacy, terms): same device
// frame as the rest of the app, a breadcrumb trail, one h1, then prose.
export function ContentPage({
  code,
  title,
  path,
  intro,
  updated,
  children,
}: {
  code: string
  title: string
  path: string
  intro?: string
  updated?: string
  children: React.ReactNode
}) {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: title, href: path },
  ]

  return (
    <main id="main-content" className="flex min-h-[calc(100svh-3.5rem)] flex-col bg-background text-foreground">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.href),
          })),
        }}
      />
      <section className="flex w-full flex-1 flex-col px-2.5 py-2.5">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
            <span>{code}</span>
            <span className="flex items-center gap-1.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
            </span>
          </div>

          <div className="te-dotgrid flex-1 px-3 py-6 sm:px-8 sm:py-10">
            <article className="mx-auto max-w-3xl rounded-md bg-card px-5 py-6 sm:px-8 sm:py-8">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <li>
                    <Link href="/" className="underline underline-offset-2 hover:text-foreground">
                      {SITE_NAME.toLowerCase()}
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="text-foreground">
                    {title.toLowerCase()}
                  </li>
                </ol>
              </nav>

              <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>
              {intro && (
                <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
                  {intro}
                </p>
              )}
              {updated && (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Last updated {updated}
                </p>
              )}

              <div className="mt-8 text-[15px] leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2:first-child]:mt-0 [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3 [&_strong]:font-semibold [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
                {children}
              </div>
            </article>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
