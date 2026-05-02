"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, ChevronLeft, ChevronRight, Clock, X } from "lucide-react"
import { useWatchProgress } from "@/hooks/use-watch-progress"
import { cn } from "@/lib/utils"

interface WatchProgressItem {
  _id: string
  contentId: string
  contentType: "movie" | "series"
  contentTitle: string
  contentPoster: string
  season: number | null
  episode: number | null
  episodeTitle: string | null
  progressSeconds: number
  durationSeconds: number
  progressPercent: number
  lastWatched: string
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ContinueWatching() {
  const { getContinueWatching, isAuthenticated } = useWatchProgress()
  const [items, setItems] = useState<WatchProgressItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchProgress = async () => {
      setIsLoading(true)
      const data = await getContinueWatching(15)
      setItems(data)
      setIsLoading(false)
    }

    fetchProgress()
  }, [isAuthenticated, getContinueWatching])

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener("scroll", checkScroll)
      checkScroll()
    }

    return () => ref?.removeEventListener("scroll", checkScroll)
  }, [items])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissedIds((prev) => new Set([...prev, id]))
  }

  const visibleItems = items.filter((item) => !dismissedIds.has(item._id))

  if (!isAuthenticated || isLoading) return null
  if (visibleItems.length === 0) return null

  return (
    <section className="relative py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.58 0.22 245) 0%, oklch(0.45 0.22 280) 100%)",
              boxShadow: "0 4px 20px oklch(0.58 0.22 245 / 0.35)",
            }}
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-current ml-0.5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">Continue Watching</h2>
            <p className="text-xs text-muted-foreground/70">Pick up where you left off</p>
          </div>
        </div>

        {/* Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              canScrollLeft
                ? "bg-white/10 hover:bg-white/15 text-foreground"
                : "bg-white/5 text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              canScrollRight
                ? "bg-white/10 hover:bg-white/15 text-foreground"
                : "bg-white/5 text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {visibleItems.map((item) => {
          const href = item.contentType === "movie"
            ? `/movie/${item.contentId}`
            : `/series/${item.contentId}`

          const remainingTime = item.durationSeconds - item.progressSeconds

          return (
            <Link
              key={item._id}
              href={href}
              className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                scrollSnapAlign: "start",
                background: "oklch(0.12 0.03 255 / 0.6)",
                border: "1px solid oklch(0.7 0.05 240 / 0.1)",
              }}
            >
              {/* Dismiss Button */}
              <button
                onClick={(e) => handleDismiss(item._id, e)}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5 text-white/80" />
              </button>

              {/* Thumbnail */}
              <div className="relative aspect-video">
                {item.contentPoster ? (
                  <Image
                    src={item.contentPoster}
                    alt={item.contentTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{
                      background: "oklch(0.58 0.22 245 / 0.9)",
                      boxShadow: "0 8px 32px oklch(0.58 0.22 245 / 0.5)",
                    }}
                  >
                    <Play className="h-6 w-6 text-white fill-current ml-1" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="font-bold text-sm line-clamp-1 mb-1">{item.contentTitle}</h3>
                {item.contentType === "series" && item.season && item.episode && (
                  <p className="text-xs text-muted-foreground mb-2">
                    S{item.season} E{item.episode}
                    {item.episodeTitle && ` · ${item.episodeTitle}`}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDuration(remainingTime)} left
                  </span>
                  <span>{formatTimeAgo(item.lastWatched)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
