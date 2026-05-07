"use client"

import type React from "react"
import { useRef, useState, useEffect, memo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Play, Plus, Check, Star } from "lucide-react"
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
    <section id={id} className="py-5 group/section">
      <ContentPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="group cursor-pointer">
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 transition-colors duration-200 hover:text-primary"
              style={{ background: "linear-gradient(135deg, oklch(0.97 0.005 240) 0%, oklch(0.78 0.06 240) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {title}
            </h2>
            <div className="section-title-line w-10 mt-1.5 group-hover:w-24 transition-all duration-500" />
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 opacity-0 group-hover/section:opacity-100">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-0 bottom-0 z-20 w-14 sm:w-20",
              "flex items-center justify-center",
              "bg-gradient-to-r from-background via-background/80 to-transparent",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300",
              !showLeftArrow && "!opacity-0 pointer-events-none",
            )}
            aria-label="Scroll left"
          >
            <div className="glass w-9 h-9 rounded-full flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 hover:scale-110">
              <ChevronLeft className="h-4 w-4" />
            </div>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-0 bottom-0 z-20 w-14 sm:w-20",
              "flex items-center justify-center",
              "bg-gradient-to-l from-background via-background/80 to-transparent",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300",
              !showRightArrow && "!opacity-0 pointer-events-none",
            )}
            aria-label="Scroll right"
          >
            <div className="glass w-9 h-9 rounded-full flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 hover:scale-110">
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Items */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth py-3"
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

  // Prefetch the route on hover so navigation is instant
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
            className="text-[80px] sm:text-[100px] font-black leading-none select-none"
            style={{
              WebkitTextStroke: "2px oklch(0.58 0.22 245 / 0.25)",
              color: "transparent",
              marginRight: "-18px",
              zIndex: 0,
              textShadow: "0 0 40px oklch(0.58 0.22 245 / 0.12)",
            }}
          >
            {index + 1}
          </span>
          <div className="relative w-[80px] sm:w-[100px] aspect-[2/3] rounded-xl overflow-hidden z-10 card-hover ring-1 ring-white/[0.08]">
            <Image
              src={item.poster || "/placeholder.svg"}
              alt={item.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 75px, 90px"
              className="object-cover"
            />
            {item.type === "series" && (
              <div className="absolute top-1.5 left-1.5 glass-pill px-1.5 py-0.5 rounded-full text-[8px] font-bold text-primary">
                S
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const cardWidth = variant === "large" ? "w-[180px] sm:w-[220px]" : "w-[140px] sm:w-[165px]"

  return (
    <div
      className={cn("flex-shrink-0 group/card relative cursor-pointer", cardWidth)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(item)}
    >
      <div
        className={cn(
          "relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/[0.07]",
          "transition-all duration-350 ease-out shine-hover",
          isHovered && "scale-105 shadow-2xl shadow-black/70 z-30 ring-primary/30",
          isHovered && "shadow-[0_16px_48px_oklch(0_0_0/0.7),0_0_0_1px_oklch(0.58_0.22_245/0.2)]",
        )}
      >
        <Image
          src={item.poster || "/placeholder.svg"}
          alt={item.title}
          fill
          loading="lazy"
          sizes={variant === "large" ? "(max-width: 640px) 180px, 220px" : "(max-width: 640px) 140px, 165px"}
          className="object-cover"
        />

        {/* Series badge */}
        {item.type === "series" && !isHovered && (
          <div className="absolute top-2 left-2 glass-pill px-1.5 py-0.5 rounded-full text-[8px] font-bold text-primary">
            SERIES
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-3",
            "transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
          style={{
            background: isHovered
              ? "linear-gradient(to top, oklch(0.05 0.02 255 / 0.97) 0%, oklch(0.1 0.02 255 / 0.7) 50%, transparent 100%)"
              : "transparent",
          }}
        >
          {/* Actions */}
          <div className="flex items-center gap-1.5 mb-2">
            <button
              className="w-8 h-8 rounded-full bg-foreground hover:bg-foreground/90 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              aria-label="Play"
              onClick={(e) => { e.stopPropagation(); onCardClick(item) }}
            >
              <Play className="h-3.5 w-3.5 fill-background text-background" />
            </button>
            <button
              onClick={handleToggleList}
              className={cn(
                "w-8 h-8 rounded-full glass flex items-center justify-center transition-all duration-200 hover:scale-110",
                inMyList ? "border-primary/60 bg-primary/20 text-primary" : "hover:border-primary/40 hover:bg-primary/10",
              )}
              aria-label={inMyList ? "Remove from list" : "Add to list"}
            >
              {inMyList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-300 text-[10px] font-bold">{item.rating?.toFixed(1) || "8.5"}</span>
              <span className="glass-pill px-1.5 py-0.5 rounded text-[8px] text-muted-foreground font-semibold">HD</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/60 flex-wrap">
              {item.genre.slice(0, 2).map((g, i) => (
                <span key={g} className="flex items-center gap-1">
                  {i > 0 && <span className="w-0.5 h-0.5 bg-white/30 rounded-full" />}
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-xs font-semibold truncate text-muted-foreground group-hover/card:text-white transition-colors duration-200">
        {item.title}
      </h3>
    </div>
  )
})
