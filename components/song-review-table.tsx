'use client'

import { useState, useRef } from 'react'
import { Song } from '@/lib/types'
import { Edit2, Trash2, Search, Play, Pause, Music, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SongReviewTableProps {
  songs: Song[]
  onSongsChange: (songs: Song[]) => void
}

export function SongReviewTable({ songs, onSongsChange }: SongReviewTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredSongs = songs.filter(
    (song) =>
      song.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (song: Song) => {
    setEditingId(song.id)
    setEditName(song.originalName)
  }

  const handleSaveEdit = (song: Song) => {
    const updated = songs.map((s) =>
      s.id === song.id ? { ...s, originalName: editName } : s
    )
    onSongsChange(updated)
    setEditingId(null)
  }

  const handleCopy = (song: Song) => {
    const text = `${song.artist} ${song.originalName}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(song.id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  const handleRemove = (songId: string) => {
    if (playingId === songId) stopAudio()
    const updated = songs.filter((s) => s.id !== songId)
    onSongsChange(updated)
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingId(null)
  }

  const togglePreview = (song: Song) => {
    if (!song.previewUrl) return

    if (playingId === song.id) {
      stopAudio()
      return
    }

    stopAudio()
    const audio = new Audio(song.previewUrl)
    audio.volume = 0.6
    audio.addEventListener('ended', () => setPlayingId(null))
    audio.play().catch(console.error)
    audioRef.current = audio
    setPlayingId(song.id)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    if (confidence >= 0.75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12" />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Song
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Artist
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Match
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.map((song) => (
              <tr key={song.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                {/* Album Art / Preview */}
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 flex-shrink-0">
                    {song.albumArt ? (
                      <img
                        src={song.albumArt}
                        alt={song.originalName}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Music className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {song.previewUrl && (
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

                {/* Song Name */}
                <td className="px-4 py-3">
                  {editingId === song.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(song)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(song)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full rounded px-2 py-1 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <div>
                      <span className="text-foreground font-medium">{song.originalName}</span>
                      {song.spotifyTrackId && (
                        <a
                          href={`https://open.spotify.com/track/${song.spotifyTrackId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-green-600 hover:underline"
                        >
                          ↗ Spotify
                        </a>
                      )}
                    </div>
                  )}
                </td>

                {/* Artist */}
                <td className="px-4 py-3 text-muted-foreground">{song.artist}</td>

                {/* Confidence / Match */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold tabular-nums ring-1 ring-inset ring-current/25 shadow-sm',
                      getConfidenceColor(song.confidence)
                    )}
                  >
                    {Math.round(song.confidence * 100)}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(song)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Edit song name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(song)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title={`Copy: ${song.artist} ${song.originalName}`}
                    >
                      {copiedId === song.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(song.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Remove song"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No songs found</p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground flex items-center justify-between">
        <span>
          {songs.length} song{songs.length !== 1 ? 's' : ''} detected
          {searchQuery && ` (${filteredSongs.length} match${filteredSongs.length !== 1 ? 'es' : ''})`}
        </span>
        {songs.some((s) => s.spotifyTrackId) && (
          <span className="text-green-600 font-medium">
            ✓ {songs.filter((s) => s.spotifyTrackId).length} matching tracks
          </span>
        )}
      </div>
    </div>
  )
}
