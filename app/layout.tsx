import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AppProvider } from '@/lib/context'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

// Only load GA in production with an ID set — keeps localhost out of the data.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const enableGA = process.env.NODE_ENV === 'production' && !!GA_ID

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Find the tempo',
  description: 'Turn a screenshot of any tracklist into ready-to-open links on Apple Music, Spotify, and YouTube Music.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
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
        <AppProvider>
          <SiteHeader />
          {children}
          {modal}
        </AppProvider>
      </body>
      {enableGA && <GoogleAnalytics gaId={GA_ID!} />}
    </html>
  )
}
