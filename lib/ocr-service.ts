import { Song } from './types'

/**
 * Extracts songs from a screenshot by sending the image to the
 * /api/extract-songs Next.js API route, which reads the image with a vision model.
 */
export async function extractSongsFromScreenshot(
  imageFile: File,
  signal?: AbortSignal
): Promise<Song[]> {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch('/api/extract-songs', {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    // Netlify can return HTML or its own JSON envelope on gateway failures.
    const err = await response.json().catch(() => null)
    if (typeof err?.error === 'string' && err.error.trim()) {
      throw new Error(err.error)
    }
    if (response.status === 504) {
      throw new Error('Song detection took too long. Please try again.')
    }
    if (response.status === 502 || response.status === 503) {
      throw new Error('Song detection is temporarily unavailable. Please try again shortly.')
    }
    if (response.status === 429) {
      throw new Error('You have reached the upload limit for now. Please try again in a while.')
    }
    throw new Error('Screenshot upload failed. Please try again.')
  }

  const data = await response.json()

  if (!data.songs || data.songs.length === 0) {
    return []
  }

  // Map extraction output to our Song type
  const songs: Song[] = data.songs.map((s: any, index: number) => ({
    id: `ocr-${Date.now()}-${index}`,
    originalName: s.name,
    artist: s.artist || 'Unknown Artist',
    confidence: s.confidence ?? 0.75,
    fromScreenshot: imageFile.name,
  }))

  return songs
}

/**
 * Validates a file is an acceptable image format and under the size limit.
 */
export async function validateImage(file: File): Promise<boolean> {
  const validTypes = ['image/png', 'image/jpeg', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10 MB

  return validTypes.includes(file.type) && file.size <= maxSize
}
