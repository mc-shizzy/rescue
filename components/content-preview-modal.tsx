"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, Play, Plus, Check, Star, Clock, Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchInfo, type NormalizedContent } from "@/lib/api"
import { isInMyList, toggleMyList } from "@/lib/my-list"

interface ContentPreviewModalProps {
  item: NormalizedContent | null
  onClose: () => void
}

export function ContentPreviewModal({ item, onClose }: ContentPreviewModalProps) {
  const router = useRouter()
  const [detail, setDetail] = useState<NormalizedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [inMyList, setInMyList] = useState(false)
  const [visible, setVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const fetchedId = useRef<string | null>(null)

  // Animate in
  useEffect(() => {
    if (item) {
      setDetail(null)
      setVisible(false)
      // Tiny delay so the browser paints the hidden state first, enabling the transition
      const t = setTimeout(() => setVisible(true), 16)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [item])

  // Fetch detail
  useEffect(() => {
    if (!item) return
    if (fetchedId.current === item.id) return
    fetchedId.current = item.id
    setLoading(true)
    setInMyList(isInMyList(item.id))

    fetchInfo(item.id)
      .then((data) => {
        if (fetchedId.current === item.id) setDetail(data)
      })
      .catch(() => {
        if (fetchedId.current === item.id) setDetail(item)
      })
      .finally(() => {
        if (fetchedId.current === item.id) setLoading(false)
      })
  }, [item])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleNavigate = useCallback(() => {
    if (!item) return
    const url = item.type === "series" ? `/series/${item.id}` : `/movie/${item.id}`
    handleClose()
    setTimeout(() => router.push(url), 150)
  }, [item, router, handleClose])

  const SMARTLINK = "https://wayanatomyunavailable.com/jii6kzj5z?key=113992b7b0e3f198a058a3cd8d7f54a4"

  const handleToggleList = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item) return
    window.open(SMARTLINK, "_blank", "noopener,noreferrer")
    const { isInList } = toggleMyList(item.id)
    setInMyList(isInList)
  }, [item])

  // Close on backdrop click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose()
  }, [handleClose])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleClose])

  // Lock scroll
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [item])

  if (!item) return null

  const display = detail ?? item
  const backdrop = display.backdrop || display.poster

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-[90] flex items-end sm:items-center justify-center transition-all duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      style={{
        background: visible
          ? "oklch(0.03 0.01 260 / 0.85)"
          : "oklch(0.03 0.01 260 / 0)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "background 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      aria-modal="true"
      role="dialog"
      aria-label={display.title}
    >
      <div
        className={cn(
          "relative w-full sm:max-w-[520px] sm:mx-4 rounded-t-3xl sm:rounded-2xl overflow-hidden",
          "transition-transform duration-300",
          visible ? "translate-y-0 sm:scale-100" : "translate-y-full sm:scale-95 sm:translate-y-4",
        )}
        style={{
          background: "oklch(0.09 0.025 258 / 0.97)",
          border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          boxShadow: "0 32px 80px oklch(0 0 0 / 0.8), 0 0 0 1px oklch(0.7 0.05 240 / 0.06)",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Backdrop image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={backdrop || "/placeholder.svg"}
            alt={display.title}
            fill
            className={cn("object-cover transition-opacity duration-500", loading ? "opacity-60" : "opacity-100")}
            priority
            sizes="(max-width: 640px) 100vw, 520px"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, oklch(0 0 0 / 0.1) 0%, oklch(0.09 0.025 258 / 0.95) 100%)",
            }}
          />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{
                background: display.type === "series"
                  ? "oklch(0.58 0.22 245 / 0.85)"
                  : "oklch(0.55 0.25 27 / 0.85)",
                backdropFilter: "blur(8px)",
                color: "white",
              }}
            >
              {display.type === "series" ? "SERIES" : "MOVIE"}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: "oklch(0.1 0.02 258 / 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid oklch(0.7 0.05 240 / 0.15)",
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Skeleton shimmer when loading */}
          {loading && (
            <div className="absolute inset-0 animate-pulse" style={{ background: "oklch(0.12 0.02 255 / 0.5)" }} />
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-3">
          {/* Title + meta */}
          <div className="mb-4">
            <h2 className="text-xl font-black tracking-tight text-foreground mb-1.5 text-balance">
              {display.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {display.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{display.rating.toFixed(1)}</span>
                </span>
              )}
              {display.year > 0 && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {display.year}
                </span>
              )}
              {display.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {display.duration}
                </span>
              )}
              {display.genre?.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{
                    background: "oklch(0.58 0.22 245 / 0.12)",
                    border: "1px solid oklch(0.58 0.22 245 / 0.2)",
                    color: "oklch(0.75 0.12 245)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Description skeleton or text */}
          {loading ? (
            <div className="space-y-2 mb-5">
              {[100, 90, 70].map((w) => (
                <div
                  key={w}
                  className="h-3 rounded-full animate-pulse"
                  style={{
                    width: `${w}%`,
                    background: "oklch(0.18 0.03 255 / 0.8)",
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
              {display.description || "No description available."}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Watch Now — primary CTA */}
            <button
              onClick={handleNavigate}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm",
                "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                "shadow-lg",
              )}
              style={{
                background: "oklch(0.58 0.22 245)",
                color: "white",
                boxShadow: "0 8px 24px oklch(0.58 0.22 245 / 0.4)",
              }}
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Now
            </button>

            {/* My List toggle */}
            <button
              onClick={handleToggleList}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-200 hover:scale-110 active:scale-95",
              )}
              style={{
                background: inMyList
                  ? "oklch(0.58 0.22 245 / 0.2)"
                  : "oklch(0.16 0.03 255 / 0.8)",
                border: `1px solid ${inMyList ? "oklch(0.58 0.22 245 / 0.5)" : "oklch(0.7 0.05 240 / 0.15)"}`,
                color: inMyList ? "oklch(0.65 0.18 245)" : "oklch(0.65 0.02 250)",
              }}
              aria-label={inMyList ? "Remove from list" : "Add to list"}
            >
              {inMyList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>

            {/* More info arrow */}
            <button
              onClick={handleNavigate}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: "oklch(0.16 0.03 255 / 0.8)",
                border: "1px solid oklch(0.7 0.05 240 / 0.15)",
                color: "oklch(0.65 0.02 250)",
              }}
              aria-label="More info"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bottom safe area for mobile */}
        <div className="h-safe-area-inset-bottom sm:hidden" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  )
}
