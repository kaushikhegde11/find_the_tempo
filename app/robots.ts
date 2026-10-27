import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /api is not for crawlers. /results is kept out of the index with a
        // noindex tag instead, which crawlers can only see if it is not blocked here.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
