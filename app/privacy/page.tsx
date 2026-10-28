import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPage } from '@/components/content-page'
import { CookieSettingsButton } from '@/components/cookie-consent'
import { AUTHOR_NAME, CONTACT_EMAIL, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'What Find the tempo does with your screenshots, song lists and analytics data, which outside services receive it, and your choices.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy policy"
      path="/privacy"
      intro="Plain-language summary: no accounts, no ads, no selling of data. Your screenshot goes to an AI service to be read, and analytics run only if you allow them."
      updated="28 October 2026"
    >
      <h2>Who is responsible</h2>
      <p>
        {AUTHOR_NAME} runs Find the tempo ({SITE_URL.replace('https://', '')}) and is the person
        responsible for your data on this site. Contact:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>What happens to your data</h2>
      <ul>
        <li>
          <strong>Your screenshot.</strong> When you upload an image, it is sent to an AI vision
          service run by Google (the Gemini models), either directly or through the OpenRouter
          routing service, to read the song names. This site does not save the image. The
          provider&apos;s retention and data-use rules depend on the service and account settings;
          this site cannot promise immediate deletion by those providers. Screenshots can show usernames,
          avatars or notifications, so crop those out first.
        </li>
        <li>
          <strong>Song names and artists.</strong> After the image is read, the text of each song is
          sent to the Apple iTunes Search API to find the song. Your song list otherwise stays in
          your browser memory and clears when you reload or close the tab.
        </li>
        <li>
          <strong>Artwork and previews.</strong> Cover art and 30-second previews load directly from
          Apple servers, so Apple receives your IP address when you view them.
        </li>
        <li>
          <strong>Hosting and logs.</strong> The site is hosted on Netlify, which processes your IP
          address and request details to deliver pages and may retain server logs under its own policies.
        </li>
        <li>
          <strong>Abuse protection.</strong> To stop automated misuse, the upload and lookup
          requests are counted per visitor. The count is stored under a one-way hash of your IP
          address and the date, rather than the raw address. Counts expire after an hour;
          deletion of stored entries from earlier days is best effort and can happen later.
          These hashes are pseudonymous identifiers, not a guarantee of anonymity.
        </li>
      </ul>

      <h2>Cookies and analytics</h2>
      <p>
        The site sets no cookies of its own. If you press <strong>Accept</strong> on the banner,
        Google Analytics 4 is loaded. It sets cookies (<code>_ga</code> and <code>_ga_*</code>) and
        sends page views and device details to Google so visits can be counted. Pressing{' '}
        <strong>Reject</strong>, or sending a Global Privacy Control signal from your browser,
        keeps it off. Your choice is saved in your browser&apos;s local storage under the key{' '}
        <code>ftt-analytics-consent</code>.
      </p>
      <p>
        <CookieSettingsButton className="font-mono text-sm underline underline-offset-2" /> reopens
        the choice at any time. Withdrawing consent stops future analytics collection in this
        browser and removes the Google Analytics cookies. It does not delete data already sent
        to Google. Global Privacy Control keeps analytics disabled even if you reopen the choice.
      </p>

      <h2>Why we are allowed to use it (legal bases)</h2>
      <ul>
        <li>Reading your screenshot and finding links: needed to give you the service you asked for.</li>
        <li>Abuse protection and keeping the site running: legitimate interest.</li>
        <li>Analytics cookies: your consent, which you can withdraw at any time.</li>
      </ul>

      <h2>Who receives data</h2>
      <p>
        Google (AI vision, and Analytics if you accept), OpenRouter (only if used to reach the
        model), Apple (song search, artwork, previews) and Netlify (hosting) receive the data
        described above. They may process it outside your country under their own policies.
        This site does not sell your data or use it for advertising.
      </p>
      <p>
        Provider information:{' '}
        <a href="https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance">Google Vertex AI data governance</a>,{' '}
        <a href="https://ai.google.dev/gemini-api/terms">Gemini API terms</a>,{' '}
        <a href="https://openrouter.ai/privacy">OpenRouter privacy policy</a>,{' '}
        <a href="https://www.apple.com/legal/privacy/">Apple privacy policy</a>,{' '}
        <a href="https://www.netlify.com/privacy/">Netlify privacy policy</a>, and{' '}
        <a href="https://policies.google.com/privacy">Google privacy policy</a>.
      </p>

      <h2>How long data is kept</h2>
      <p>
        Screenshots and song lists are not saved by this site. The AI provider applies its own
        retention rules. Abuse-protection counts expire hourly, with older stored entries removed
        on a best-effort basis. Analytics data, if you accept it, follows the configured Google
        Analytics retention settings. Hosting logs follow Netlify&apos;s retention policy.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on the law that applies where you live, you may have rights to ask what data
        is held about you, ask for it to be corrected or deleted,
        object to processing, withdraw consent, and complain to your data protection authority.
        This site has no accounts or persistent song profiles. Write to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to make a request. Include the
        page and approximate time involved, but do not send passwords or identity documents.
      </p>

      <h2>Children</h2>
      <p>The site is not directed at children under 13, and no one under 13 should use it.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a meaningful way, the date at the top is updated. See also the{' '}
        <Link href="/terms">terms of use</Link>.
      </p>
    </ContentPage>
  )
}
