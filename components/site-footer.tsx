import Link from 'next/link'
import { Instagram, Music, Newspaper } from 'lucide-react'
import { CookieSettingsButton } from '@/components/cookie-consent'

// Structured orange footer block — shared by the landing and results screens.
export function SiteFooter() {
  return (
    <footer className="bg-primary text-black">
      {/* link columns */}
      <div className="grid grid-cols-1 divide-y divide-black/20 border-y border-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Wordmark */}
        <div className="relative flex flex-col overflow-hidden px-5 py-4">
          <span className="block break-words font-bold leading-none tracking-tight text-[clamp(1.75rem,5vw,3rem)]">
            find the tempo
          </span>
        </div>

        <FooterCol title="Follow" align="center">
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

        <FooterCol title="System">
          <p className="font-mono text-xs leading-relaxed text-black">
            apple music · spotify · youtube music. no login.
          </p>
        </FooterCol>
      </div>

      {/* Site links */}
      <nav
        aria-label="Site"
        className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-black/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] sm:px-6"
      >
        <Link href="/about" className="underline-offset-2 hover:underline">
          About
        </Link>
        <Link href="/faq" className="underline-offset-2 hover:underline">
          FAQ
        </Link>
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>
        <CookieSettingsButton className="uppercase tracking-[0.12em] underline-offset-2 hover:underline" />
      </nav>

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/20 px-4 py-1 font-mono text-[11px] uppercase tracking-[0.15em] sm:px-6">
        <span>© 2026 find the tempo</span>
        <span>not affiliated with apple, spotify or youtube</span>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  children,
  align = 'start',
}: {
  title: string
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
}) {
  const alignCls = align === 'end' ? 'items-end' : align === 'center' ? 'items-center' : 'items-start'
  return (
    <div className="px-5 py-4">
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
