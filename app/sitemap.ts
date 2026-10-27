import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

// Bump when the content of a page changes in a way search engines should notice.
const LAST_UPDATED = new Date('2026-10-27')

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: '/', priority: 1, changeFrequency: 'monthly' as const },
    { path: '/upload', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: LAST_UPDATED,
    changeFrequency,
    priority,
  }))
}
