import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobboard.example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/seeker/', '/employer/', '/admin/', '/auth/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
