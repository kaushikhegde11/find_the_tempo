import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/components/content-page'
import { JsonLd } from '@/components/json-ld'
import { AUTHOR_NAME, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Find the tempo is a small tool built by Kaushik Hegde that turns a screenshot of a tracklist into song links and BPM.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <ContentPage
      code="blck. about"
      title="About Find the tempo"
      path="/about"
      intro="A small tool for people who keep finding songs in screenshots."
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          url: absoluteUrl('/about'),
          mainEntity: {
            '@type': 'Person',
            name: AUTHOR_NAME,
            sameAs: [
              'https://music.apple.com/profile/musicforkaey',
              'https://substack.com/@kaeywrites',
              'https://www.instagram.com/artofkaey/',
            ],
          },
        }}
      />

      <h2>Why it exists</h2>
      <p>
        Tracklists travel as images: a DJ posts a set list on a story, a friend screenshots a
        playlist, a festival shares a lineup card. You cannot tap a picture. Typing each song into
        a search bar one by one is slow, and it is easy to give up halfway.
      </p>
      <p>
        Find the tempo does that part for you. Upload the screenshot, check what it found, and
        open each song on the service you use. The tempo (BPM) is shown beside each song, which is
        handy if you are building a set or picking music to run to.
      </p>

      <h2>How it is built</h2>
      <p>
        It is a Next.js site. An AI vision model reads the names off the image, the Apple Music
        search finds the matching song, and a public BPM database supplies the tempo. There is no
        login, and nothing is added to your music accounts. See the{' '}
        <Link href="/privacy">privacy policy</Link> for what each outside service receives.
      </p>

      <h2>Why it looks like this</h2>
      <p>
        The look is borrowed from small music hardware: a flat faceplate, labelled blocks, one
        orange accent and physical-looking keys. The job is three steps (upload, detect, get
        links), so the page is kept to one device with one clear action instead of a menu of
        features. Motion respects your reduced-motion setting.
      </p>

      <h2>The person behind it</h2>
      <p>
        Find the tempo is made and maintained by {AUTHOR_NAME}. You can follow along on{' '}
        <a href="https://music.apple.com/profile/musicforkaey" rel="noopener noreferrer" target="_blank">
          Apple Music
        </a>
        ,{' '}
        <a href="https://substack.com/@kaeywrites" rel="noopener noreferrer" target="_blank">
          Substack
        </a>{' '}
        and{' '}
        <a href="https://www.instagram.com/artofkaey/" rel="noopener noreferrer" target="_blank">
          Instagram
        </a>
        . Questions or a song it got wrong? Email is on the <Link href="/privacy">privacy page</Link>.
      </p>

      <h2>Credits</h2>
      <ul>
        <li>
          Tempo data from{' '}
          <a href="https://getsongbpm.com" rel="noopener noreferrer" target="_blank">
            GetSongBPM
          </a>
          .
        </li>
        <li>Song matching, artwork and 30-second previews from the Apple iTunes Search API.</li>
        <li>Typeface: Geist, by Vercel, under the SIL Open Font License.</li>
      </ul>
      <p>
        Find the tempo is an independent project. It is not affiliated with or endorsed by Apple,
        Spotify, YouTube or any other service named on this site.
      </p>

      <h2>Accessibility</h2>
      <p>
        The site aims to meet WCAG 2.2 level AA. It works with a keyboard, has a skip link, and
        respects reduced-motion settings. If something blocks you, please email so it can be fixed.
      </p>
    </ContentPage>
  )
}
