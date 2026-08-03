import { Instagram, Music, Newspaper } from 'lucide-react'

// Small filled square used as a grid node marker.
function Node({ className = '' }: { className?: string }) {
  return <span className={`te-node ${className}`} aria-hidden />
}

// Structured orange footer block — shared by the landing and results screens.
export function SiteFooter() {
  return (
    <footer className="bg-primary text-black">
      {/* link columns */}
      <div className="grid grid-cols-1 divide-y divide-black/20 border-y border-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* BLCK.01 — wordmark contained in the box */}
        <div className="relative flex flex-col overflow-hidden px-5 py-1.5">
          <Node className="absolute right-3 top-3 !bg-black" />
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest">
            blck. 01
          </div>
          <span className="block break-words font-bold leading-[0.85] tracking-tighter text-[clamp(1.75rem,5vw,3rem)]">
            find the tempo
          </span>
        </div>

        <FooterCol code="blck. 02" title="Follow" align="center">
          <FooterLink href="https://music.apple.com/profile/musicforkaey" icon={<Music className="h-4 w-4" />}>
            Apple Music
          </FooterLink>
          <FooterLink
            href="https://substack.com/@kaeywrites?r=6tdkpy&utm_campaign=profile&utm_medium=profile-page"
            icon={<Newspaper className="h-4 w-4" />}
          >
            Substack
          </FooterLink>
          <FooterLink href="https://www.instagram.com/artofkaey/" icon={<Instagram className="h-4 w-4" />}>
            Instagram
          </FooterLink>
        </FooterCol>

        <FooterCol code="blck. 03" title="System">
          <p className="font-mono text-xs leading-relaxed text-black/70">
            apple music · spotify · youtube music. no login.
          </p>
        </FooterCol>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/20 px-4 py-1 font-mono text-[11px] uppercase tracking-[0.15em] sm:px-6">
        <span>© 2026 find the tempo</span>
        <span className="text-black/60">screenshot → links</span>
      </div>
    </footer>
  )
}

function FooterCol({
  code,
  title,
  children,
  align = 'start',
}: {
  code: string
  title: string
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
}) {
  const alignCls = align === 'end' ? 'items-end' : align === 'center' ? 'items-center' : 'items-start'
  return (
    <div className="relative px-5 py-1.5">
      <Node className="absolute right-3 top-3 !bg-black" />
      <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest">{code}</div>
      <div className="mb-2 text-lg font-bold">{title}</div>
      <div className={`flex flex-col gap-2 ${alignCls}`}>{children}</div>
    </div>
  )
}

// Social links as small physical keys.
function FooterLink({
  href,
  children,
  icon,
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="te-key te-key--light te-key--sm inline-flex w-full items-center justify-center gap-2 rounded-md bg-card px-3 py-1.5 text-center font-mono text-xs font-semibold uppercase tracking-wide text-foreground"
    >
      {icon}
      {children}
    </a>
  )
}
