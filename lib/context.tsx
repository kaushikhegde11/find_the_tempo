'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Song } from './types'
import { Platform, DEFAULT_PLATFORMS } from '@/components/platform-toggle'

interface AppContextType {
  songs: Song[]
  setSongs: (songs: Song[]) => void
  selectedPlatforms: Platform[]
  setSelectedPlatforms: (platforms: Platform[]) => void
  reset: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS)

  const reset = useCallback(() => {
    setSongs([])
    setSelectedPlatforms(DEFAULT_PLATFORMS)
  }, [])

  return (
    <AppContext.Provider
      value={{
        songs,
        setSongs,
        selectedPlatforms,
        setSelectedPlatforms,
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
