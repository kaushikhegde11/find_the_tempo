export interface Song {
  id: string
  originalName: string
  artist: string
  spotifyTrackId?: string
  spotifyUri?: string
  albumArt?: string
  confidence: number
  fromScreenshot?: string
  previewUrl?: string
  // Apple Music (via iTunes Search API)
  appleMusicUrl?: string
  applePreviewUrl?: string
  appleTrackName?: string
  appleArtist?: string
  appleAlbum?: string
  appleArtwork?: string
}

export interface PlaylistData {
  songs: Song[]
  name: string
  description: string
  spotifyPlaylistId?: string
  spotifyPlaylistUrl?: string
}

export interface SpotifyUser {
  id: string
  displayName: string
  profileImage?: string
  isConnected: boolean
}

export interface ProcessingState {
  stage: 'idle' | 'reading' | 'detecting' | 'matching' | 'complete'
  progress: number
  message: string
}
