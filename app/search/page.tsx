import type { Metadata } from "next"
import SearchPageClient from "@/components/search-page-client"

const BASE_URL = "https://freehandyflix.online"

export const metadata: Metadata = {
  title: "Search Movies & TV Shows — Find Anything to Watch Free",
  description:
    "Search thousands of movies and TV shows on HANDYFLIX. Find the latest releases, trending series, classic films, action, drama, comedy and more. Stream in HD for free — no subscription.",
  keywords: [
    "search movies online", "search TV shows", "find movies to watch", "find series to stream",
    "movie search engine", "HANDYFLIX search", "streaming search", "free movie finder",
    "search films HD", "find action movies", "find drama series", "search anime",
    "watch free movie search", "movie database search",
  ],
  alternates: {
    canonical: `${BASE_URL}/search`,
  },
  openGraph: {
    title: "Search Movies & TV Shows — HANDYFLIX Free HD Streaming",
    description:
      "Find and stream any movie or TV show for free on HANDYFLIX. Search thousands of titles in HD — no subscription required.",
    type: "website",
    url: `${BASE_URL}/search`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "HANDYFLIX Search" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Movies & TV Shows — HANDYFLIX",
    description: "Find and stream any movie or TV show for free. Search on HANDYFLIX now.",
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default function SearchPage() {
  return <SearchPageClient />
}
