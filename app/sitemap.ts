import type { MetadataRoute } from "next"
import { fetchTrending, fetchHomepage } from "@/lib/api"

const BASE_URL = "https://freehandyflix.online"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/my-list`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  try {
    const [trending, homepage] = await Promise.all([fetchTrending(), fetchHomepage()])

    const allContent = [
      ...trending,
      ...homepage.topPicks,
      ...homepage.categories.flatMap((c) => c.items),
    ]

    const seen = new Set<string>()
    const contentRoutes: MetadataRoute.Sitemap = []

    for (const item of allContent) {
      if (!item.id || seen.has(item.id)) continue
      seen.add(item.id)
      const segment = item.type === "series" ? "series" : "movie"
      contentRoutes.push({
        url: `${BASE_URL}/${segment}/${item.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: item.type === "series" ? 0.85 : 0.8,
      })
    }

    return [...staticRoutes, ...contentRoutes]
  } catch {
    return staticRoutes
  }
}
