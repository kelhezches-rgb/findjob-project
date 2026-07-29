import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobboard.example.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function getJobRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/jobs?limit=50&sort=latest`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.jobs || []).map((job: { id: string; updatedAt: string }) => ({
      url: `${SITE_URL}/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {
    // API unreachable at build time — sitemap still returns the static routes.
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/jobs`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/auth/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/auth/register`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const jobRoutes = await getJobRoutes()
  return [...staticRoutes, ...jobRoutes]
}
