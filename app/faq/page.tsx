import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/components/content-page'
import { JsonLd } from '@/components/json-ld'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about Find the tempo: what screenshots work, how song detection and song matching work, what is stored, and what it costs.',
  alternates: { canonical: '/faq' },
}

// Plain-text answers feed both the visible list and the FAQPage schema.
const FAQ: { q: string; a: string }[] = [
  {
    q: 'What does Find the tempo do?',
    a: 'You upload a screenshot of a tracklist, such as a playlist, a set list or a DJ mix page. It reads the song names and artists, then gives you a link for each song on Apple Music, Spotify and YouTube Music.',
  },
  {
    q: 'Which screenshots work best?',
    a: 'Clear PNG, JPEG or WebP images up to 10 MB where the song titles and artist names are readable. GIF uploads are not supported. Crop out anything that is not the list. If a name is cut off at the edge, that song may be misread, so you can edit any row in the results before you open a link.',
  },
  {
    q: 'How does it read the songs?',
    a: 'The image is sent to an AI vision model (Google Gemini) that returns the song names and artists as text. The result can contain mistakes, so check anything important. You can edit or delete any row before you open a link.',
  },
  {
    q: 'Do you store my screenshots or song lists?',
    a: 'This site does not save your screenshots or song lists. The screenshot is sent to an AI service to read it; that provider has its own data policies. Your song list stays in browser memory and clears when you reload or close the tab. The privacy policy describes the services involved.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. There is no login and no playlist is created in your music account. You get links to open yourself.',
  },
  {
    q: 'Why did I get a limit message?',
    a: 'To keep the free service running, each visitor can read a limited number of screenshots per hour. Wait a while and try again.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. It is a personal project and has no ads.',
  },
  {
    q: 'Why is the site designed like a piece of hardware?',
    a: 'It borrows from pocket synths and drum machines: a flat faceplate, one orange accent, and keys that look pressable. The tool does one job in three steps, so the interface is built to feel like one small device, not a busy web app.',
  },
]

export default function FaqPage() {
  return (
    <ContentPage
      title="Frequently asked questions"
      path="/faq"
      intro="Short answers about screenshots, song detection, song links and privacy."
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <div className="divide-y divide-border border-y border-border">
        {FAQ.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
              <h2 className="!mt-0 text-base font-semibold tracking-normal">{f.q}</h2>
              <span
                aria-hidden
                className="mt-0.5 font-mono text-primary transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
      <p>
        Still stuck? Read the{' '}
        <Link href="/about">about page</Link> or the <Link href="/privacy">privacy policy</Link>.
      </p>
    </ContentPage>
  )
}
