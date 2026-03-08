"use client"

import { useRef, useState, useCallback, memo } from "react"
import { ChevronLeft, ChevronRight, Zap, Compass, Smile, Search, Wand2, BookOpen, Skull, Stethoscope, Eye, Heart, Telescope, AlertTriangle, Film, Drama } from "lucide-react"
import { genres } from "@/lib/data"
import { cn } from "@/lib/utils"

const GENRE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  All:        { icon: Film,          color: "oklch(0.62 0.25 25)",   bg: "oklch(0.62 0.25 25 / 0.12)" },
  Action:     { icon: Zap,           color: "oklch(0.72 0.22 40)",   bg: "oklch(0.72 0.22 40 / 0.12)" },
  Adventure:  { icon: Compass,       color: "oklch(0.70 0.18 55)",   bg: "oklch(0.70 0.18 55 / 0.12)" },
  Comedy:     { icon: Smile,         color: "oklch(0.80 0.18 85)",   bg: "oklch(0.80 0.18 85 / 0.12)" },
  Crime:      { icon: Search,        color: "oklch(0.55 0.10 0)",    bg: "oklch(0.55 0.10 0 / 0.12)" },
  Drama:      { icon: Drama,         color: "oklch(0.68 0.16 20)",   bg: "oklch(0.68 0.16 20 / 0.12)" },
  Fantasy:    { icon: Wand2,         color: "oklch(0.65 0.18 310)",  bg: "oklch(0.65 0.18 310 / 0.12)" },
  History:    { icon: BookOpen,      color: "oklch(0.70 0.14 60)",   bg: "oklch(0.70 0.14 60 / 0.12)" },
  Horror:     { icon: Skull,         color: "oklch(0.50 0.18 15)",   bg: "oklch(0.50 0.18 15 / 0.12)" },
  Medical:    { icon: Stethoscope,   color: "oklch(0.65 0.16 185)",  bg: "oklch(0.65 0.16 185 / 0.12)" },
  Mystery:    { icon: Eye,           color: "oklch(0.55 0.12 280)",  bg: "oklch(0.55 0.12 280 / 0.12)" },
  Romance:    { icon: Heart,         color: "oklch(0.65 0.22 5)",    bg: "oklch(0.65 0.22 5 / 0.12)" },
  "Sci-Fi":   { icon: Telescope,     color: "oklch(0.60 0.18 230)",  bg: "oklch(0.60 0.18 230 / 0.12)" },
  Thriller:   { icon: AlertTriangle, color: "oklch(0.65 0.20 45)",   bg: "oklch(0.65 0.20 45 / 0.12)" },
}

interface GenreRailProps {
  selectedGenre: string
  onGenreChange: (genre: string) => void
}

export const GenreRail = memo(function GenreRail({ selectedGenre, onGenreChange }: GenreRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const rafId = useRef<number | null>(null)

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" })
  }, [])

  const updateArrows = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    rafId.current = null
  }, [])

  const handleScroll = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = window.requestAnimationFrame(updateArrows)
    }
  }, [updateArrows])

  return (
    <div
      className="relative py-4 sticky z-30 top-0"
      style={{
        background: "oklch(0.06 0.01 15 / 0.9)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid oklch(0.62 0.25 25 / 0.06)",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              style={{
                background: "oklch(0.12 0.02 20 / 0.9)",
                border: "1px solid oklch(0.62 0.25 25 / 0.15)",
                backdropFilter: "blur(12px)"
              }}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              style={{
                background: "oklch(0.12 0.02 20 / 0.9)",
                border: "1px solid oklch(0.62 0.25 25 / 0.15)",
                backdropFilter: "blur(12px)"
              }}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2.5 overflow-x-auto px-8 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {genres.map((genre) => {
              const cfg = GENRE_CONFIG[genre] ?? GENRE_CONFIG["All"]
              const Icon = cfg.icon
              const isActive = selectedGenre === genre
              return (
                <button
                  key={genre}
                  onClick={() => onGenreChange(genre)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-300 whitespace-nowrap",
                    isActive ? "scale-105" : "hover:scale-[1.03]",
                  )}
                  style={
                    isActive
                      ? {
                          background: cfg.bg,
                          border: `1px solid ${cfg.color}55`,
                          color: cfg.color,
                          boxShadow: `0 0 20px ${cfg.color}30, inset 0 1px 0 oklch(1 0 0 / 0.08)`,
                        }
                      : {
                          background: "oklch(0.12 0.02 20 / 0.6)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid oklch(0.62 0.25 25 / 0.08)",
                          color: "oklch(0.55 0.02 15)",
                        }
                  }
                >
                  <Icon 
                    className="h-3.5 w-3.5 shrink-0 transition-all duration-300" 
                    style={{ 
                      color: isActive ? cfg.color : "oklch(0.55 0.02 15)",
                      filter: isActive ? `drop-shadow(0 0 6px ${cfg.color}50)` : "none"
                    }} 
                  />
                  {genre}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
