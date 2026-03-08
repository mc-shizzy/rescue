"use client"

import type React from "react"
import { useRef, useState, useEffect, memo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Play, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { isInMyList, toggleMyList } from "@/lib/my-list"
import type { NormalizedContent } from "@/lib/api"
import { ContentPreviewModal } from "@/components/content-preview-modal"

interface PremiumCarouselProps {
  title: string
  items: NormalizedContent[]
  id?: string
  variant?: "default" | "large" | "numbered"
}

export const PremiumCarousel = memo(function PremiumCarousel({
  title,
  items,
  id,
  variant = "default",
}: PremiumCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [previewItem, setPreviewItem] = useState<NormalizedContent | null>(null)
  const rafId = useRef<number | null>(null)

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
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

  if (items.length === 0) return null

  return (
    <section id={id} className="py-6">
      <ContentPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
                style={{ background: "linear-gradient(180deg, oklch(0.62 0.25 25) 0%, oklch(0.45 0.2 30) 100%)" }}
              />
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-3 group cursor-pointer hover:text-primary transition-colors duration-300">
                {title}
                <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 text-primary transition-all duration-300" />
              </h2>
            </div>
          </div>
          <span className="text-xs text-muted-foreground/50 font-medium">{items.length} titles</span>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-0 bottom-0 z-20 w-16 sm:w-24",
              "flex items-center justify-center",
              "bg-gradient-to-r from-background via-background/90 to-transparent",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-400",
              !showLeftArrow && "!opacity-0 pointer-events-none",
            )}
            aria-label="Scroll left"
          >
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "oklch(0.12 0.025 20 / 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid oklch(0.62 0.25 25 / 0.15)",
                boxShadow: "0 4px 20px oklch(0 0 0 / 0.4)"
              }}
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </div>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-0 bottom-0 z-20 w-16 sm:w-24",
              "flex items-center justify-center",
              "bg-gradient-to-l from-background via-background/90 to-transparent",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-400",
              !showRightArrow && "!opacity-0 pointer-events-none",
            )}
            aria-label="Scroll right"
          >
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "oklch(0.12 0.025 20 / 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid oklch(0.62 0.25 25 / 0.15)",
                boxShadow: "0 4px 20px oklch(0 0 0 / 0.4)"
              }}
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </div>
          </button>

          {/* Items */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item, index) => (
              <ContentCard key={item.id} item={item} index={index} variant={variant} onCardClick={setPreviewItem} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

const ContentCard = memo(function ContentCard({
  item,
  index,
  variant,
  onCardClick,
}: {
  item: NormalizedContent
  index: number
  variant: "default" | "large" | "numbered"
  onCardClick: (item: NormalizedContent) => void
}) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [inMyList, setInMyList] = useState(false)
  const detailUrl = item.type === "series" ? `/series/${item.id}` : `/movie/${item.id}`

  useEffect(() => {
    setInMyList(isInMyList(item.id))
  }, [item.id])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    router.prefetch(detailUrl)
  }, [router, detailUrl])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const { isInList } = toggleMyList(item.id)
    setInMyList(isInList)
  }

  if (variant === "numbered") {
    return (
      <div
        className="flex-shrink-0 relative group/card shine-hover cursor-pointer"
        onClick={() => onCardClick(item)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-end">
          <span
            className="text-[90px] sm:text-[120px] font-black leading-none select-none transition-all duration-300 group-hover/card:scale-105"
            style={{
              WebkitTextStroke: "2px oklch(0.62 0.25 25 / 0.3)",
              color: "transparent",
              marginRight: "-24px",
              zIndex: 0,
              textShadow: "0 0 40px oklch(0.62 0.25 25 / 0.1)"
            }}
          >
            {index + 1}
          </span>
          <div 
            className={cn(
              "relative w-[85px] sm:w-[100px] aspect-[2/3] rounded-2xl overflow-hidden z-10 transition-all duration-400",
              isHovered && "scale-105 glow-red-subtle"
            )}
            style={{
              border: isHovered ? "1px solid oklch(0.62 0.25 25 / 0.3)" : "1px solid oklch(1 0 0 / 0.06)"
            }}
          >
            <Image
              src={item.poster || "/placeholder.svg"}
              alt={item.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 85px, 100px"
              className="object-cover"
            />
            {item.type === "series" && (
              <div 
                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ 
                  background: "oklch(0.62 0.25 25 / 0.2)", 
                  border: "1px solid oklch(0.62 0.25 25 / 0.4)",
                  color: "oklch(0.75 0.2 25)"
                }}
              >
                SERIES
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const cardWidth = variant === "large" ? "w-[200px] sm:w-[240px]" : "w-[150px] sm:w-[175px]"

  return (
    <div
      className={cn("flex-shrink-0 group/card relative cursor-pointer", cardWidth)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(item)}
    >
      <div
        className={cn(
          "relative aspect-[2/3] rounded-2xl overflow-hidden",
          "transition-all duration-400 ease-out shine-hover",
          isHovered && "scale-105 z-30",
        )}
        style={{
          border: isHovered ? "1px solid oklch(0.62 0.25 25 / 0.25)" : "1px solid oklch(1 0 0 / 0.05)",
          boxShadow: isHovered 
            ? "0 20px 60px oklch(0 0 0 / 0.7), 0 0 40px oklch(0.62 0.25 25 / 0.15), inset 0 1px 0 oklch(1 0 0 / 0.1)"
            : "0 4px 20px oklch(0 0 0 / 0.3)"
        }}
      >
        <Image
          src={item.poster || "/placeholder.svg"}
          alt={item.title}
          fill
          loading="lazy"
          sizes={variant === "large" ? "(max-width: 640px) 200px, 240px" : "(max-width: 640px) 150px, 175px"}
          className="object-cover"
        />

        {/* Series badge */}
        {item.type === "series" && !isHovered && (
          <div 
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{ 
              background: "oklch(0.62 0.25 25 / 0.2)", 
              backdropFilter: "blur(8px)",
              border: "1px solid oklch(0.62 0.25 25 / 0.4)",
              color: "oklch(0.75 0.2 25)"
            }}
          >
            SERIES
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-4",
            "transition-all duration-400",
            isHovered ? "opacity-100" : "opacity-0",
          )}
          style={{
            background: isHovered
              ? "linear-gradient(to top, oklch(0.04 0.015 20 / 0.98) 0%, oklch(0.08 0.02 20 / 0.8) 50%, transparent 100%)"
              : "transparent",
          }}
        >
          {/* Actions */}
          <div className="flex items-center gap-2 mb-3">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.25 25) 0%, oklch(0.52 0.22 30) 100%)",
                boxShadow: "0 4px 15px oklch(0.62 0.25 25 / 0.5)"
              }}
              aria-label="Play"
              onClick={(e) => { e.stopPropagation(); onCardClick(item) }}
            >
              <Play className="h-4 w-4 fill-white text-white ml-0.5" />
            </button>
            <button
              onClick={handleToggleList}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
              )}
              style={{
                background: inMyList ? "oklch(0.62 0.25 25 / 0.2)" : "oklch(0.15 0.02 20 / 0.8)",
                border: inMyList ? "1px solid oklch(0.62 0.25 25 / 0.5)" : "1px solid oklch(1 0 0 / 0.1)",
                backdropFilter: "blur(10px)"
              }}
              aria-label={inMyList ? "Remove from list" : "Add to list"}
            >
              {inMyList ? <Check className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-foreground/80" />}
            </button>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-[11px] font-bold">98% Match</span>
              <span 
                className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                style={{ background: "oklch(1 0 0 / 0.08)", color: "oklch(0.7 0 0)" }}
              >
                HD
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-foreground/60 flex-wrap">
              {item.genre.slice(0, 2).map((g, i) => (
                <span key={g} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-1 h-1 bg-primary/50 rounded-full" />}
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-semibold truncate text-muted-foreground group-hover/card:text-foreground transition-colors duration-300">
        {item.title}
      </h3>
      {/* Year */}
      <p className="text-xs text-muted-foreground/50 mt-0.5">
        {item.releaseDate?.split("-")[0]}
      </p>
    </div>
  )
})
