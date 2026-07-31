'use client'

import { useRef, useState } from 'react'
import { Song } from '@/lib/types'
import { Platform } from '@/components/platform-toggle'
import { Play, Pause, Music, ExternalLink, Copy, Check, Type, Table, Share2, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ResultsTableProps {
  songs: Song[]
  platform: Platform
  onEdit: (id: string, name: string, artist: string) => void
  onDelete: (id: string) => void
}

const SERVICE_NAME: Record<Platform, string> = {
  apple: 'Apple Music',
  spotify: 'Spotify',
  ytmusic: 'YouTube Music',
}

const trackName = (s: Song) => s.appleTrackName || s.originalName
const artistName = (s: Song) => s.appleArtist || s.artist
const albumName = (s: Song) => s.appleAlbum || ''

// Quote the exact title + put the song first so YT Music search stops "did-you-mean"
// autocorrecting an unusual title into something unrelated.
const ytMusicUrl = (s: Song) =>
  'https://music.youtube.com/search?q=' +
  encodeURIComponent(`"${trackName(s)}" ${artistName(s)}`)

// Direct track link when the API matched one, else a Spotify search link (no API needed).
const spotifyUrl = (s: Song) =>
  s.spotifyTrackId
    ? `https://open.spotify.com/track/${s.spotifyTrackId}`
    : 'https://open.spotify.com/search/' +
      encodeURIComponent(`${artistName(s)} ${trackName(s)}`)

/** Link for a song on the given platform, or undefined when not found. */
function linkFor(song: Song, platform: Platform): string | undefined {
  switch (platform) {
    case 'apple':
      return song.appleMusicUrl // exact match only; undefined ⇒ "Not found"
    case 'spotify':
      return spotifyUrl(song) // direct or search link — always available
    case 'ytmusic':
      return ytMusicUrl(song) // search link — always available
  }
}

export function ResultsTable({ songs, platform, onEdit, onDelete }: ResultsTableProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [tableCopied, setTableCopied] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editArtist, setEditArtist] = useState('')
  const [confirmSong, setConfirmSong] = useState<Song | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startEdit = (song: Song) => {
    setEditingId(song.id)
    setEditName(trackName(song))
    setEditArtist(artistName(song))
  }
  const cancelEdit = () => setEditingId(null)
  const saveEdit = (id: string) => {
    const name = editName.trim()
    if (name) onEdit(id, name, editArtist.trim())
    setEditingId(null)
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingId(null)
  }

  const togglePreview = (song: Song) => {
    const preview = song.applePreviewUrl || song.previewUrl
    if (!preview) return
    if (playingId === song.id) {
      stopAudio()
      return
    }
    stopAudio()
    const audio = new Audio(preview)
    audio.volume = 0.6
    audio.addEventListener('ended', () => setPlayingId(null))
    audio.play().catch(console.error)
    audioRef.current = audio
    setPlayingId(song.id)
  }

  const copy = (key: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
    })
  }

  // Plain readable list for the SELECTED service: service title, then
  // "<track> by <artist> — <link>" per song.
  const buildList = () => {
    const lines = songs.map((s) => {
      const link = linkFor(s, platform)
      return `${trackName(s)} by ${artistName(s)}${link ? ` — ${link}` : ''}`
    })
    return [`${SERVICE_NAME[platform]}`, '', ...lines].join('\n')
  }

  const copyTable = () => {
    navigator.clipboard.writeText(buildList()).then(() => {
      setTableCopied(true)
      setTimeout(() => setTableCopied(false), 1500)
    })
  }

  // Human-readable share message: one line per song + the current-platform link.
  const shareText = () => {
    const lines = songs.map((s) => {
      const link = linkFor(s, platform)
      return `${trackName(s)} — ${artistName(s)}${link ? `  ${link}` : ''}`
    })
    return `My playlist (${SERVICE_NAME[platform]}):\n\n${lines.join('\n')}`
  }

  const openShare = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'My playlist', text: shareText() })
    } catch {
      /* user cancelled or unsupported */
    }
  }

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const foundCount = songs.filter((s) => linkFor(s, platform)).length

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar — one segmented housing (copy + share) */}
      <div className="flex justify-end">
        <div className="te-segment te-segment--light bg-card font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
          <button
            onClick={copyTable}
            className="te-seg-key px-3 py-1.5"
            title="Copy the whole list (paste into Notion or Sheets)"
          >
            {tableCopied ? <Check className="h-4 w-4 text-green-500" /> : <Table className="h-4 w-4" />}
            {tableCopied ? 'Copied' : 'Copy list'}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="te-seg-key px-3 py-1.5" title="Share this list">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canNativeShare && (
              <>
                <DropdownMenuItem onClick={nativeShare}>
                  Share… (Instagram, more)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(shareText())}`)}
            >
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                openShare(`https://t.me/share/url?url=&text=${encodeURIComponent(shareText())}`)
              }
            >
              Telegram
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`)
              }
            >
              X (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                openShare(
                  `mailto:?subject=${encodeURIComponent('My playlist')}&body=${encodeURIComponent(shareText())}`
                )
              }
            >
              Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyTable}>
              Copy for Notion / Sheets
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12" />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Song</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Artist</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Album</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                {SERVICE_NAME[platform]}
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const link = linkFor(song, platform)
              const preview = song.applePreviewUrl || song.previewUrl
              const artwork = song.appleArtwork || song.albumArt
              return (
                <tr key={song.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  {/* Artwork / Preview */}
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                      {artwork ? (
                        <img
                          src={artwork}
                          alt={trackName(song)}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Music className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      {preview && (
                        <button
                          onClick={() => togglePreview(song)}
                          className={cn(
                            'absolute inset-0 flex items-center justify-center rounded',
                            'bg-black/50 opacity-0 hover:opacity-100 transition-opacity',
                            playingId === song.id && 'opacity-100'
                          )}
                          title={playingId === song.id ? 'Pause preview' : 'Play preview'}
                        >
                          {playingId === song.id ? (
                            <Pause className="h-4 w-4 text-white" />
                          ) : (
                            <Play className="h-4 w-4 text-white" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Song */}
                  <td className="px-4 py-3">
                    {editingId === song.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(song.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        placeholder="Song name"
                        className="w-full rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <span className="text-foreground font-medium">{trackName(song)}</span>
                    )}
                  </td>

                  {/* Artist */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {editingId === song.id ? (
                      <input
                        value={editArtist}
                        onChange={(e) => setEditArtist(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(song.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        placeholder="Artist"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      artistName(song)
                    )}
                  </td>

                  {/* Album */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {albumName(song) || <span className="text-muted-foreground/50">—</span>}
                  </td>

                  {/* Link + copy actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === song.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(song.id)}
                            className="te-key te-key--sm inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-primary-foreground"
                            title="Save & re-find links"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                      <>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="te-key te-key--sm inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-primary-foreground"
                          title={`Open in ${SERVICE_NAME[platform]}`}
                        >
                          Listen
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          Not found on {SERVICE_NAME[platform]}
                        </span>
                      )}

                      {/* Icon actions — one segmented housing (single body, seams) */}
                      <div className="te-segment te-segment--light bg-card text-muted-foreground">
                        {link && (
                          <button
                            onClick={() => copy(`${song.id}:link`, link)}
                            className="te-seg-key p-2"
                            title="Copy link"
                          >
                            {copiedKey === `${song.id}:link` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            copy(`${song.id}:combo`, `${artistName(song)} ${trackName(song)}`)
                          }
                          className="te-seg-key p-2"
                          title="Copy artist + track"
                        >
                          {copiedKey === `${song.id}:combo` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Type className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(song)}
                          className="te-seg-key p-2"
                          title="Edit song / artist"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmSong(song)}
                          className="te-seg-key p-2 hover:!text-destructive"
                          title="Remove song"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground flex items-center justify-between">
        <span>
          {songs.length} song{songs.length !== 1 ? 's' : ''} · add the ones you like to any playlist manually
        </span>
        <span className="font-medium text-foreground">
          {foundCount}/{songs.length} on {SERVICE_NAME[platform]}
        </span>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmSong} onOpenChange={(open) => !open && setConfirmSong(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this song?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmSong
                ? `"${trackName(confirmSong)}" by ${artistName(confirmSong)} will be removed from the list.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmSong) onDelete(confirmSong.id)
                setConfirmSong(null)
              }}
              className="te-key te-key--sm rounded-md bg-destructive font-mono text-xs font-semibold uppercase tracking-wide text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
