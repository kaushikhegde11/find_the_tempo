import { Song } from './types'

/**
 * Extracts songs from a screenshot by sending the image to the
 * /api/extract-songs Next.js API route, which reads the image with a vision model.
 */
export async function extractSongsFromScreenshot(
  imageFile: File,
  signal?: AbortSignal
): Promise<Song[]> {
  console.log('[OCR] Processing image:', imageFile.name)

  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch('/api/extract-songs', {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`OCR failed: ${err.error || response.statusText}`)
  }

  const data = await response.json()

  if (!data.songs || data.songs.length === 0) {
    console.warn('[OCR] No songs detected in screenshot')
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

  console.log(`[OCR] Detected ${songs.length} songs`)
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
