'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Song, SpotifyUser, PlaylistData } from './types'

interface AppContextType {
  songs: Song[]
  setSongs: (songs: Song[]) => void
  spotifyUser: SpotifyUser | null
  setSpotifyUser: (user: SpotifyUser | null) => void
  spotifyAccessToken: string | null
  setSpotifyAccessToken: (token: string | null) => void
  playlist: PlaylistData | null
  setPlaylist: (playlist: PlaylistData | null) => void
  reset: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'spotify_access_token'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null)
  const [spotifyAccessToken, setSpotifyAccessTokenState] = useState<string | null>(
    () => (typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null)
  )
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null)

  const setSpotifyAccessToken = useCallback((token: string | null) => {
    setSpotifyAccessTokenState(token)
    if (typeof window !== 'undefined') {
      if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
      else sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [])

  const reset = useCallback(() => {
    setSongs([])
    setSpotifyUser(null)
    setSpotifyAccessToken(null)
    setPlaylist(null)
  }, [setSpotifyAccessToken])

  return (
    <AppContext.Provider
      value={{
        songs,
        setSongs,
        spotifyUser,
        setSpotifyUser,
        spotifyAccessToken,
        setSpotifyAccessToken,
        playlist,
        setPlaylist,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
