# Find the tempo

Turn a screenshot of any tracklist into ready-to-use links on **Apple Music**, **Spotify**, and
**YouTube Music**. Upload an image, the app reads the song names and artists, then gives you a link
for each track on every service — no typing, no keys, no login.

## How it works

1. **Upload a screenshot** — any song list or tracklist image.
2. **Detect songs** — the app extracts song names and artists.
3. **Get links** — open each track on Apple Music, Spotify, or YouTube Music, and add the ones you
   like to a playlist yourself.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- Lucide icons

## Where the links come from

| Service       | Source                                              | Needs a key? |
| ------------- | --------------------------------------------------- | ------------ |
| Apple Music   | iTunes Search API (exact track link + 30s preview)  | No           |
| Spotify       | Public search link (`open.spotify.com/search/…`)    | No           |
| YouTube Music | Public search link (`music.youtube.com/search?q=…`) | No           |

No API keys or environment variables are required to run or host the app.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Deploy

Hosted on **Netlify**. Any host that runs a Next.js server works.

On Netlify:

1. Import the GitHub repo (Netlify auto-detects Next.js via the official Next Runtime — no
   `netlify.toml` needed for a standard build).
2. Build command `next build`, publish handled by the Next Runtime.
3. Add the environment variables under **Site settings → Environment variables** (they are not
   read from `.env.local` in production):
   - `OPENROUTER_API_KEY` — OCR model access
   - `QWEN_MODEL` — which vision model to call
   - `NEXT_PUBLIC_APP_URL` — your live URL (sent as HTTP-Referer to OpenRouter)
   - `NEXT_PUBLIC_GA_ID` — Google Analytics 4 measurement ID
4. Deploy.

## Project structure

```
app/
├─ page.tsx                 # Landing page
├─ upload/page.tsx          # Upload + OCR
├─ review/page.tsx          # Review / edit detected songs
├─ results/page.tsx         # Platform toggle + links table
└─ api/
   ├─ apple-music/search    # iTunes Search API lookup
   └─ extract-songs         # Screenshot → songs

components/                 # UI (results table, platform toggle, upload zone, …)
lib/                        # Context, iTunes helper, types
```
