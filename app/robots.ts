import type { MetadataRoute } from "next"

const BASE_URL = "https://freehandyflix.online"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/search", "/movie/", "/series/", "/terms"],
        disallow: ["/api/", "/admin/", "/onboarding/", "/profile/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/search", "/movie/", "/series/", "/terms"],
        disallow: ["/api/", "/admin/", "/onboarding/", "/profile/"],
      },
      {
        userAgent: "DuckDuckBot",
        allow: ["/", "/search", "/movie/", "/series/"],
        disallow: ["/api/", "/admin/", "/onboarding/", "/profile/"],
      },
      {
        userAgent: "Slurp",
        allow: ["/", "/search", "/movie/", "/series/"],
        disallow: ["/api/", "/admin/", "/onboarding/", "/profile/"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: ["/", "/movie/", "/series/"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "Twitterbot",
        allow: ["/", "/movie/", "/series/"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "LinkedInBot",
        allow: ["/", "/movie/", "/series/"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "*",
        allow: ["/", "/search", "/movie/", "/series/", "/terms", "/login", "/register"],
        disallow: ["/api/", "/admin/", "/onboarding/", "/profile/", "/my-list/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
