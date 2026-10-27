import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppProvider } from '@/lib/context'
import { SiteHeader } from '@/components/site-header'
import { CookieConsent } from '@/components/cookie-consent'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/site'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: screenshot to song links and BPM`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME}: screenshot to song links and BPM`,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME}: screenshot to song links and BPM`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#efe9da',
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppProvider>
          <SiteHeader />
          {children}
          {modal}
        </AppProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
