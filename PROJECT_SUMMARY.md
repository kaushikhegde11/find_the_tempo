# Find the Tempo — Project Summary

A web app that turns a screenshot of any tracklist into ready-to-use song links across **Apple Music, Spotify, and YouTube Music**. No login, no playlist creation — you get one link per song per platform and add them to your own playlists yourself.

## Overview

Upload a screenshot of any song list (from a music app, a story, a review, anywhere). A vision model reads the songs, then the app builds links for each track on all three services. Minimal, "Teenage Engineering"-style faceplate/blueprint UI.

> **Note:** No playlist is created and no music account is connected. The app only produces links. Spotify/YouTube Music links are search links built client-side (no auth); Apple Music links are exact-match track links from the public iTunes Search API.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix
- **State Management**: React Context API
- **Icons**: Lucide React
- **Vision model**: Google Gemini `gemini-3.5-flash-lite` via **Vertex AI** (screenshot → songs);
  provider is switchable (`OCR_PROVIDER`: vertex / gemini / openrouter — see Environment)
- **Music lookup**: public iTunes Search API (Apple Music, no auth)
- **Analytics**: Google Analytics 4 via `@next/third-parties` (prod-gated)
- **Hosting**: Netlify (Next Runtime; live at `findthetempo.netlify.app`)

### Project Structure

```
app/
├── page.tsx                        # Landing page (hero, 3 steps, footer)
├── upload/page.tsx                 # Full-page /upload (direct visit fallback)
├── results/page.tsx                # Song links table (platform toggle)
├── layout.tsx                      # SiteHeader + {children} + {modal} slot + GA4
├── globals.css
├── @modal/                         # Parallel route slot for the upload modal
│   ├── (.)upload/page.tsx          # Intercepting modal (soft-nav from home)
│   ├── [...catchAll]/page.tsx      # Resets slot on forward nav (→ /results)
│   └── default.tsx                 # Empty slot on other routes
└── api/
    ├── extract-songs/route.ts      # POST image → vision model → songs JSON
    └── apple-music/search/route.ts # POST songs → iTunes lookup → Apple links

components/
├── site-header.tsx                 # Persistent wordmark header (all screens)
├── upload-flow.tsx                 # Shared upload+OCR logic (page + modal)
├── upload-zone.tsx                 # Drag-and-drop file upload
├── processing-state.tsx            # Multi-stage progress indicator
├── platform-picker-dialog.tsx      # Pick which services to build links for
├── results-table.tsx               # Song table with per-platform links + edit/delete
├── platform-toggle.tsx             # Cassette-style platform switch (accent glow)
├── music-loader.tsx                # Loading animation
├── theme-provider.tsx
└── ui/                             # shadcn primitives

lib/
├── context.tsx                     # React Context (songs state)
├── ocr-service.ts                  # Client → /api/extract-songs; validateImage()
├── apple-music-api.ts              # iTunes Search API client
├── types.ts                        # Song, PlaylistData, etc.
└── utils.ts
```

### UI / navigation notes

- **Header**: single `SiteHeader` mounted in `layout.tsx` — shows on every screen
  (flat record LED, wordmark links home). Per-page navs were removed.
- **Upload as modal**: clicking "Upload a screenshot" soft-navigates to `/upload`,
  intercepted by `@modal/(.)upload` and rendered as a centered card over a blurred,
  white-dimmed home page. Direct/hard visits to `/upload` render the full page.
  The `[...catchAll]` slot forces the modal to close when the flow pushes to `/results`.
- **Palette**: warm neutrals tinted ~10% toward the signature orange (light + dark);
  dark mode keeps the orange brand color (does not wash to white). Border tokens
  unchanged but framed surfaces get a metallic edge + inner shadow.

## User Flow

1. **Landing (`/`)** — value prop, 3-step explainer (upload → detect → get links), footer links.
2. **Upload (`/upload`)** — drag-and-drop PNG/JPEG/WebP (≤10 MB). On upload:
   - `validateImage()` checks type/size.
   - Each image posted to `/api/extract-songs`; vision model returns `{ songs: [{ name, artist, confidence }] }`.
   - Parser tolerates code fences, stray prose, and truncated output.
   - Detected songs stored in context, routes to `/results`.
3. **Results (`/results`)** — on load, posts songs to `/api/apple-music/search` once to enrich with exact Apple links + previews. Table shows:
   - Platform toggle (Apple / Spotify / YouTube Music).
   - Apple = exact iTunes track link + preview when matched.
   - Spotify = direct track link if matched, else `open.spotify.com/search/...`.
   - YouTube Music = `music.youtube.com/search?q=...`.
   - Row **edit** (fix a misread name/artist → re-runs Apple lookup) and **delete**.

## Data Model (`lib/types.ts`)

`Song` carries the detected `originalName`, `artist`, `confidence`, `fromScreenshot`, plus optional Apple fields (`appleMusicUrl`, `applePreviewUrl`, `appleTrackName`, …) and optional `spotifyTrackId`. `PlaylistData` / `SpotifyUser` types remain in the file but are **legacy/unused** (playlist creation was removed).

## Environment (`.env.local`)

### OCR provider

`OCR_PROVIDER` selects which upstream reads the screenshot (`app/api/extract-songs/route.ts`):

- **`vertex`** (current prod) — Vertex AI `generateContent` on the **global** endpoint,
  auth via a service-account OAuth token. Billed to the project's Cloud Billing account,
  so it **spends GCP credits**. Requires:
  - `GOOGLE_SERVICE_ACCOUNT_JSON` — full service-account key JSON (one line). SA needs the
    **Vertex AI User** (`roles/aiplatform.user`) role; the Vertex AI API must be enabled.
  - `GOOGLE_VERTEX_PROJECT` — GCP project id (e.g. `gen-lang-client-0653784256`).
  - `GOOGLE_VERTEX_LOCATION` — default `global` (Gemini 3.x is served from `global`).
- **`gemini`** — Google AI Studio Gemini API via `GEMINI_API_KEY`. Separate *prepay* wallet,
  NOT the GCP trial credits — will 429 if that project's prepay balance is empty.
- **`openrouter`** (default / fallback) — OpenRouter. Requires `OPENROUTER_API_KEY`,
  `NEXT_PUBLIC_APP_URL` (HTTP-Referer). Model via `QWEN_MODEL` (default `google/gemini-2.5-flash`).

Model id for the Google paths: `GEMINI_MODEL` (default `gemini-3.5-flash-lite`).
Roll back instantly by flipping `OCR_PROVIDER` back to `openrouter`.

### Other

- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 measurement ID (`G-EMTQ7S4FWX`).
  GA is prod-gated, so it only fires in production builds (never on localhost).

On **Netlify**, set these under Site settings → Environment variables (production does
not read `.env.local`). `NEXT_PUBLIC_*` vars bake in at build time — a fresh deploy is
required after changing them.

**Legacy / unused** (playlist creation removed — safe to drop): `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_ID`, `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`. `SPOTIFY_CLIENT_SECRET` was removed from `.env.local` — **rotate it in the Spotify dashboard** since it sat in plaintext.

## Run Locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Notes

- Apple links require no key (public iTunes API); Spotify/YouTube links need no key either (search URLs). Only the screenshot read needs OpenRouter credit.
- No auth, no database, no playlist writes. Outside the browser, data goes only to: the vision model (screenshot), iTunes Search (song terms), Google Analytics (only after cookie consent), and Netlify Blobs (hashed-IP rate-limit counters, swept daily).
- Security/compliance: security headers + CSP in `next.config.mjs`; API input limits and per-IP rate limits in `lib/security.ts` and `lib/rate-limit.ts`; consent-gated GA in `components/cookie-consent.tsx`; legal pages at `/privacy` and `/terms`; SEO in `app/{robots,sitemap,manifest,opengraph-image}` plus per-page metadata and JSON-LD.
