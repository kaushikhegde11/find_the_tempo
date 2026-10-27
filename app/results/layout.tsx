import type { Metadata } from 'next'

// /results only shows content for the current session, so it is not indexable.
export const metadata: Metadata = {
  title: 'Your song links',
  robots: { index: false, follow: false },
  alternates: { canonical: '/results' },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children
}
