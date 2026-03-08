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
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      }, 500)
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

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(goNext, 7000)
  }, [goNext])

  useEffect(() => {
    if (featuredContent.length === 0) return
    startAutoplay()
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [featuredContent.length, startAutoplay])

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

  if (isLoading) {
    return (
      <div className="relative min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative flex flex-col items-center gap-4 text-muted-foreground">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
            <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
          </div>
          <span className="text-sm font-medium tracking-wide">Loading cinematic experience...</span>
        </div>
      </div>
    )
  }

  if (!currentItem) return null

  const detailUrl = currentItem.type === "series" ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`

  return (
    <div className="relative">
      {/* Full-bleed hero container */}
      <div
        ref={containerRef}
        className="relative min-h-[85vh] overflow-hidden select-none"
        style={{ cursor: "grab" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => { if (dragStartX !== null) handlePointerUp(e) }}
      >
        {/* Background image with crossfade */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100",
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

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />
        
        {/* Red accent glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ 
            background: "radial-gradient(ellipse 60% 50% at 30% 60%, oklch(0.62 0.25 25 / 0.15) 0%, transparent 70%)" 
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 vignette pointer-events-none" />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-[85vh] flex items-end pb-32 sm:pb-40">
          <div className="mx-auto max-w-[1400px] w-full px-6 sm:px-10 lg:px-16">
            <div
              className={cn(
                "max-w-2xl space-y-5 transition-all duration-600 ease-out",
                isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0",
              )}
              style={{ animationDelay: "0.1s" }}
            >
              {/* Type + rating badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ 
                    background: "oklch(0.62 0.25 25 / 0.15)", 
                    border: "1px solid oklch(0.62 0.25 25 / 0.4)",
                    color: "oklch(0.75 0.2 25)"
                  }}
                >
                  {currentItem.type === "series" ? "Series" : "Film"}
                </span>
                <span className="flex items-center gap-1.5 glass-pill px-3 py-1 rounded-full text-[12px]">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-300 font-bold">{currentItem.rating || "8.5"}</span>
                </span>
                <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] text-muted-foreground font-semibold tracking-wider">
                  4K HDR
                </span>
                <span className="text-[12px] text-muted-foreground/70 font-medium">
                  {currentItem.releaseDate?.split("-")[0]}
                </span>
              </div>

              {/* Title */}
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-balance leading-[0.95] text-glow-red"
                style={{
                  textShadow: "0 4px 30px oklch(0 0 0 / 0.5)"
                }}
              >
                {currentItem.title}
              </h1>

              {/* Description (if available) */}
              {currentItem.description && (
                <p className="text-base sm:text-lg text-foreground/70 line-clamp-2 max-w-xl leading-relaxed">
                  {currentItem.description}
                </p>
              )}

              {/* Genre pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {currentItem.genre.slice(0, 4).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-[12px] font-medium text-foreground/60"
                    style={{ 
                      background: "oklch(1 0 0 / 0.06)", 
                      border: "1px solid oklch(1 0 0 / 0.08)" 
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Link href={detailUrl} draggable={false}>
                  <button className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl text-base">
                    <Play className="h-5 w-5 fill-current" />
                    Watch Now
                  </button>
                </Link>
                <Link href={detailUrl} draggable={false}>
                  <button className="btn-glass flex items-center gap-3 px-6 py-4 rounded-2xl text-base">
                    <Info className="h-5 w-5" />
                    More Info
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

        {/* Progress indicators — bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
              className="group relative h-1 overflow-hidden rounded-full transition-all duration-400"
              style={{ width: index === currentIndex ? "40px" : "12px" }}
            >
              <div 
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-primary glow-red-subtle" 
                    : "bg-foreground/20 group-hover:bg-foreground/40"
                )}
              />
              {index === currentIndex && (
                <div 
                  className="absolute inset-y-0 left-0 bg-foreground/30 rounded-full"
                  style={{
                    animation: "progress-fill 7s linear forwards"
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Poster thumbnails — right side, desktop only */}
        <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
          {featuredContent.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goTo(index)}
              className={cn(
                "relative w-14 aspect-[2/3] rounded-xl overflow-hidden transition-all duration-400",
                index === currentIndex
                  ? "ring-2 ring-primary scale-110 glow-red-subtle opacity-100"
                  : "opacity-30 hover:opacity-60 ring-1 ring-white/5 hover:scale-105",
              )}
            >
              <Image 
                src={item.poster || "/placeholder.svg"} 
                alt={item.title} 
                fill 
                className="object-cover" 
                sizes="56px" 
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              )}
            </button>
          ))}
        </div>

        {/* Sound toggle — bottom right */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-6 lg:right-12 z-20 glass w-11 h-11 rounded-full flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-primary" />
          )}
        </button>
      </div>
    </div>
  )
})
