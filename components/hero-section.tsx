"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star, Loader2, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NormalizedContent } from "@/lib/api"

interface HeroSectionProps {
  content?: NormalizedContent[]
}

export const HeroSection = memo(function HeroSection({ content }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Only use real API content - no fallback to prevent broken links
  const featuredContent = content && content.length > 0 ? content.slice(0, 5) : []
  const isLoading = featuredContent.length === 0

  const currentItem = featuredContent[currentIndex]

  const goTo = useCallback(
    (index: number) => {
      if (index === currentIndex) return
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsTransitioning(false)
      }, 400)
    },
    [currentIndex],
  )

  const goNext = useCallback(
    () => goTo((currentIndex + 1) % featuredContent.length),
    [currentIndex, featuredContent.length, goTo],
  )
  const goPrev = useCallback(
    () => goTo((currentIndex - 1 + featuredContent.length) % featuredContent.length),
    [currentIndex, featuredContent.length, goTo],
  )

  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [muted, setMuted] = useState(true)

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)
    autoplayRef.current = setInterval(goNext, 8000)
    let p = 0
    progressRef.current = setInterval(() => {
      p += 100 / 80
      setProgress(Math.min(p, 100))
    }, 100)
  }, [goNext])

  useEffect(() => {
    if (featuredContent.length === 0) return
    startAutoplay()
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [featuredContent.length, startAutoplay])

  // Touch / mouse swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStartX(e.clientX)
    if (autoplayRef.current) clearInterval(autoplayRef.current)
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX === null) return
    const delta = e.clientX - dragStartX
    if (Math.abs(delta) > 40) delta < 0 ? goNext() : goPrev()
    setDragStartX(null)
    startAutoplay()
  }

  // Show loading state if no real content available
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pb-2 pt-3">
        <div
          className="relative mx-auto max-w-[1320px] overflow-hidden"
          style={{ borderRadius: "1.5rem" }}
        >
          {/* Loading placeholder */}
          <div className="relative h-[380px] sm:h-[440px] md:h-[520px] bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Loading content...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentItem) return null

  const detailUrl = currentItem.type === "series" ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-2 pt-3">
      <div
        ref={containerRef}
        className="relative mx-auto max-w-[1320px] overflow-hidden select-none"
        style={{ borderRadius: "1.5rem", cursor: "grab", boxShadow: "0 32px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.7 0.05 240 / 0.08)" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => { if (dragStartX !== null) handlePointerUp(e) }}
      >
        {/* Background image with crossfade */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            isTransitioning ? "opacity-0" : "opacity-100",
          )}
        >
          <Image
            src={currentItem.backdrop || currentItem.poster || "/placeholder.svg"}
            alt={currentItem.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            draggable={false}
          />
        </div>

        {/* Gradient overlays — richer layering */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.28 0.14 250 / 0.22) 0%, transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.07 0.02 260) 0%, transparent 30%)" }} />

        {/* Inner border shine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "1.5rem",
            boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.09), inset 0 0 0 1px oklch(1 0 0 / 0.04)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 h-[380px] sm:h-[440px] md:h-[520px] flex items-end pb-10 px-6 sm:px-12">
          <div
            className={cn(
              "max-w-xl space-y-4 transition-all duration-500 ease-out",
              isTransitioning ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0",
            )}
          >
            {/* Type + rating badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-primary"
                style={{ background: "oklch(0.58 0.22 245 / 0.15)", border: "1px solid oklch(0.58 0.22 245 / 0.3)" }}
              >
                {currentItem.type === "series" ? "Series" : "Film"}
              </span>
              <span className="flex items-center gap-1 glass-pill px-2 py-0.5 rounded-full text-[11px]">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">{currentItem.rating || "8.5"}</span>
              </span>
              <span className="glass-pill px-2 py-0.5 rounded-full text-[10px] text-muted-foreground font-medium">HD</span>
              <span className="text-[11px] text-muted-foreground/70">{currentItem.releaseDate?.split("-")[0]}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-balance leading-[1.08] drop-shadow-2xl">
              {currentItem.title}
            </h1>

            {/* Genre pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentItem.genre.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white/70"
                  style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.12)" }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            {currentItem.description && (
              <p className="text-sm text-white/60 leading-relaxed line-clamp-2 max-w-md hidden sm:block">
                {currentItem.description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Link href={detailUrl} draggable={false}>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-black text-sm hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-black/50">
                  <Play className="h-4 w-4 fill-black" />
                  Play Now
                </button>
              </Link>
              <Link href={detailUrl} draggable={false}>
                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200 text-white/90"
                  style={{
                    background: "oklch(0.15 0.04 255 / 0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid oklch(0.7 0.05 240 / 0.22)",
                    boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.08)",
                  }}
                >
                  <Info className="h-4 w-4" />
                  Details
                </button>
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); setMuted(v => !v) }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 hover:scale-110"
                style={{ background: "oklch(0.15 0.04 255 / 0.5)", backdropFilter: "blur(16px)", border: "1px solid oklch(0.7 0.05 240 / 0.18)" }}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Autoplay progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px]" style={{ background: "oklch(1 0 0 / 0.06)" }}>
          <div
            className="h-full transition-none"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, oklch(0.58 0.22 245), oklch(0.7 0.18 210))" }}
          />
        </div>

        {/* Slide counter — bottom right */}
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3">
          <span className="text-[11px] font-bold text-white/40 font-mono tabular-nums">
            {String(currentIndex + 1).padStart(2, "0")} / {String(featuredContent.length).padStart(2, "0")}
          </span>
        </div>

        {/* Progress dots — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
              className={cn(
                "rounded-full transition-all duration-400",
                index === currentIndex
                  ? "w-5 h-1.5 bg-white shadow-[0_0_6px_white/60]"
                  : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>

        {/* Poster thumbnails — right side, desktop only */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2.5">
          {featuredContent.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goTo(index)}
              className={cn(
                "relative w-12 aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300",
                index === currentIndex
                  ? "ring-2 ring-primary scale-105 shadow-lg shadow-primary/30 opacity-100"
                  : "opacity-40 hover:opacity-70 ring-1 ring-white/10 hover:scale-105",
              )}
            >
              <Image src={item.poster || "/placeholder.svg"} alt={item.title} fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})
