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
- **Vision model**: Google Gemini 2.5 Flash via OpenRouter (screenshot → songs)
- **Music lookup**: public iTunes Search API (Apple Music, no auth)

### Project Structure

```
app/
├── page.tsx                        # Landing page (hero, 3 steps, footer)
├── upload/page.tsx                 # Upload screenshots + processing state
├── results/page.tsx                # Song links table (Apple/Spotify/YT toggle)
├── layout.tsx
├── globals.css
└── api/
    ├── extract-songs/route.ts      # POST image → vision model → songs JSON
    └── apple-music/search/route.ts # POST songs → iTunes lookup → Apple links

components/
├── upload-zone.tsx                 # Drag-and-drop file upload
├── processing-state.tsx            # Multi-stage progress indicator
├── results-table.tsx               # Song table with per-platform links + edit/delete
├── platform-toggle.tsx             # Apple / Spotify / YouTube Music switch
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

Required:
- `OPENROUTER_API_KEY` — for the vision model.
- `QWEN_MODEL` / `VISION_MODEL` — optional override (default `google/gemini-2.5-flash`).
- `NEXT_PUBLIC_APP_URL` — used as HTTP-Referer for OpenRouter.

**Legacy / unused** (playlist creation removed — safe to drop): `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`.

## Run Locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Notes

- Apple links require no key (public iTunes API); Spotify/YouTube links need no key either (search URLs). Only the screenshot read needs OpenRouter credit.
- No auth, no database, no playlist writes — nothing leaves the user's browser except the screenshot (to the vision model) and song terms (to iTunes).
