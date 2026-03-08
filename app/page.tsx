"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { SplashScreen } from "@/components/splash-screen"
import { HeroSection } from "@/components/hero-section"
import { GenreRail } from "@/components/genre-rail"
import { PremiumCarousel } from "@/components/premium-carousel"
import { Footer } from "@/components/footer"
import { fetchTrending, fetchHomepage, type NormalizedContent } from "@/lib/api"

// Cache configuration
const CACHE_KEY = "handyflix_homepage_cache"
const CACHE_VERSION = "1.2.0" // Increment this when website updates to invalidate cache
const CACHE_EXPIRY_MS = 12 * 60 * 60 * 1000 // 12 hours

interface HomepageCache {
  content: NormalizedContent[]
  categories: { title: string; items: NormalizedContent[] }[]
  platforms: string[]
  timestamp: number
  version: string
}

function getCache(): HomepageCache | null {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const data: HomepageCache = JSON.parse(cached)
    if (data.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(data: Omit<HomepageCache, "timestamp" | "version">): void {
  if (typeof window === "undefined") return
  try {
    const cacheData: HomepageCache = {
      ...data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch {
    // Ignore storage errors
  }
}

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [content, setContent] = useState<NormalizedContent[]>([])
  const [apiCategories, setApiCategories] = useState<{ title: string; items: NormalizedContent[] }[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true)

      const cached = getCache()
      if (cached && cached.content.length > 0) {
        setContent(cached.content)
        setApiCategories(cached.categories)
        setPlatforms(cached.platforms)
        setIsLoading(false)
        return
      }

      const [apiContent, homepageData] = await Promise.all([fetchTrending(), fetchHomepage()])

      if (homepageData.categories.length > 0) {
        setApiCategories(homepageData.categories)
      }

      if (homepageData.platforms.length > 0) {
        setPlatforms(homepageData.platforms)
      }

      if (apiContent.length > 0) {
        setContent(apiContent)
        setCache({
          content: apiContent,
          categories: homepageData.categories,
          platforms: homepageData.platforms,
        })
      }
      setIsLoading(false)
    }
    loadContent()
  }, [])

  // Memoize expensive filtering operations
  const filteredContent = useMemo(() =>
    selectedGenre === "All"
      ? content
      : content.filter((item) => item.genre.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))),
    [content, selectedGenre]
  )

  const movies = useMemo(() => content.filter((item) => item.type === "movie"), [content])
  const series = useMemo(() => content.filter((item) => item.type === "series"), [content])
  const topContent = useMemo(() => [...content].sort((a, b) => b.rating - a.rating).slice(0, 10), [content])
  const heroContent = useMemo(() => content.slice(0, 5), [content])
  
  const actionContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("action"))), [content])
  const dramaContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("drama"))), [content])
  const comedyContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("comedy"))), [content])
  const horrorContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("horror"))), [content])
  const romanceContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("romance"))), [content])
  const sciFiContent = useMemo(() => content.filter((m) =>
    m.genre.some((g) => g.toLowerCase().includes("sci-fi") || g.toLowerCase().includes("fantasy")),
  ), [content])
  const thrillerContent = useMemo(() => content.filter((m) => m.genre.some((g) => g.toLowerCase().includes("thriller"))), [content])

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre)
  }, [])

  return (
    <main className="min-h-screen bg-background relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, oklch(0.62 0.25 25 / 0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
            animation: "glow-pulse 8s ease-in-out infinite"
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, oklch(0.50 0.20 30 / 0.06) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "glow-pulse 10s ease-in-out infinite 2s"
          }}
        />
      </div>

      <SplashScreen isLoading={isLoading} />
      <Navbar />
      <HeroSection content={heroContent} />

      <GenreRail selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

      <div className="relative z-10 space-y-2 pb-12">
        {/* Top 10 */}
        <PremiumCarousel title="Top 10 Today" items={topContent} variant="numbered" />

        {/* Show filtered content if genre selected, otherwise show all categories */}
        {selectedGenre !== "All" ? (
          <PremiumCarousel title={`${selectedGenre} Collection`} items={filteredContent} variant="large" />
        ) : (
          <>
            {apiCategories.map((category) => 
              category.items.length > 0 ? (
                <PremiumCarousel key={category.title} title={category.title} items={category.items} />
              ) : null
            )}

            {/* Trending section as fallback */}
            {apiCategories.length === 0 && <PremiumCarousel id="trending" title="Trending Now" items={content} />}

            {apiCategories.length === 0 && (
              <>
                {series.length > 0 && <PremiumCarousel title="TV Series" items={series} variant="large" />}
                {movies.length > 0 && <PremiumCarousel title="Movies" items={movies} />}
                {actionContent.length > 0 && <PremiumCarousel title="Action & Adventure" items={actionContent} />}
                {dramaContent.length > 0 && <PremiumCarousel title="Drama" items={dramaContent} />}
                {comedyContent.length > 0 && <PremiumCarousel title="Comedy" items={comedyContent} />}
                {horrorContent.length > 0 && <PremiumCarousel title="Horror" items={horrorContent} />}
                {romanceContent.length > 0 && <PremiumCarousel title="Romance" items={romanceContent} />}
                {thrillerContent.length > 0 && <PremiumCarousel title="Thriller" items={thrillerContent} />}
                {sciFiContent.length > 0 && <PremiumCarousel title="Sci-Fi & Fantasy" items={sciFiContent} />}
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
