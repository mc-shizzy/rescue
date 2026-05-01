"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeModal } from "@/components/welcome-modal"
import { HeroSection } from "@/components/hero-section"
import { GenreRail } from "@/components/genre-rail"
import { PremiumCarousel } from "@/components/premium-carousel"
import { Footer } from "@/components/footer"
import { fetchTrending, fetchHomepage, type NormalizedContent } from "@/lib/api"

// Cache configuration
const CACHE_KEY = "handyflix_homepage_cache"
const CACHE_VERSION = "1.1.0" // Increment this when website updates to invalidate cache
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
    // Check if cache version matches (invalidate on website update)
    if (data.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    // Check if cache is expired (12 hours)
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
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [content, setContent] = useState<NormalizedContent[]>([])
  const [apiCategories, setApiCategories] = useState<{ title: string; items: NormalizedContent[] }[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [splashComplete, setSplashComplete] = useState(false)

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true)

      // Check cache first
      const cached = getCache()
      if (cached && cached.content.length > 0) {
        console.log("[v0] Using cached homepage data")
        setContent(cached.content)
        setApiCategories(cached.categories)
        setPlatforms(cached.platforms)
        setIsLoading(false)
        return
      }

      // Fetch fresh data
      const [apiContent, homepageData] = await Promise.all([fetchTrending(), fetchHomepage()])

      console.log("[v0] Homepage API categories count:", homepageData.categories.length)
      console.log("[v0] Categories with content:", homepageData.categories.filter((cat) => cat.items.length > 0).length)

      if (homepageData.categories.length > 0) {
        setApiCategories(homepageData.categories)
      }

      if (homepageData.platforms.length > 0) {
        setPlatforms(homepageData.platforms)
      }

      if (apiContent.length > 0) {
        setContent(apiContent)
        // Cache the successful response
        setCache({
          content: apiContent,
          categories: homepageData.categories,
          platforms: homepageData.platforms,
        })
      }
      // Note: If API fails (apiContent.length === 0), we keep content empty
      // This prevents navigation to non-existent content with static IDs
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

  // Detect when splash screen completes (loading done)
  useEffect(() => {
    if (!isLoading) {
      // Splash screen takes ~3 seconds, add a buffer
      const timer = setTimeout(() => setSplashComplete(true), 3200)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <>
      <main className="min-h-screen bg-background">
        <SplashScreen isLoading={isLoading} />
        <WelcomeModal show={splashComplete} />
        <Navbar />
        <HeroSection content={heroContent} />

        <GenreRail selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

        <div className="space-y-1 pb-10">
          {/* Top 10 - Keep trending at the top */}
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
    </>
  )
}
