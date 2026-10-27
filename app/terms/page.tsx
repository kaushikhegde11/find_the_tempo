import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/components/content-page'
import { AUTHOR_NAME, CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'The rules for using Find the tempo: acceptable use, third-party services, accuracy of results and liability.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of use"
      path="/terms"
      intro="Using Find the tempo means you agree to these short terms."
      updated="27 October 2026"
    >
      <h2>The service</h2>
      <p>
        Find the tempo reads a screenshot you upload and returns links for the
        songs it finds. It is a free personal project run by {AUTHOR_NAME}, provided as it is, and
        it can change or stop at any time.
      </p>

      <h2>Your uploads</h2>
      <ul>
        <li>Only upload images you have the right to use.</li>
        <li>Do not upload images that contain other people&apos;s private information.</li>
        <li>Do not upload unlawful content. Images are limited to 10 MB.</li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>No automated or bulk use, scraping, or attempts to get around the usage limits.</li>
        <li>No attempts to break, probe or overload the site or its connected services.</li>
        <li>No use that breaks the terms of the services the site relies on.</li>
      </ul>

      <h2>Accuracy</h2>
      <p>
        Song detection uses AI and can be wrong. Links open searches or matches on third-party
        services and may lead to a different version of a song. Check results before relying on them.
      </p>

      <h2>Third-party services and trademarks</h2>
      <p>
        Apple Music, Spotify, YouTube Music, Beatport, SoundCloud, Discogs, Bandcamp, WhatsApp,
        Telegram, X and other names are trademarks of their owners and are used only to describe
        where a link goes. Find the tempo is not affiliated with or endorsed by them. Using those
        services is subject to their own terms.
      </p>

      <h2>Ownership</h2>
      <p>
        The site&apos;s design and code belong to {AUTHOR_NAME}. You keep the rights to your
        screenshots. Song titles, artwork and previews belong to their owners.
      </p>

      <h2>Liability</h2>
      <p>
        The service is provided without warranties of any kind. To the extent the law allows, the
        owner is not liable for losses that come from using or being unable to use the site.
        Nothing here limits rights you have under the law where you live that cannot be waived.
      </p>

      <h2>Changes and contact</h2>
      <p>
        These terms may be updated, and the date above changes when they are. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Also read the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </ContentPage>
  )
}
