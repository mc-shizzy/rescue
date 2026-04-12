"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Play, Plus, Check, Star, Calendar, Clock, ChevronLeft,
  Download, Volume2, VolumeX, Loader2, X, Film, Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isInMyList, toggleMyList } from "@/lib/my-list"
import { VideoPlayer } from "@/components/video-player"
import { AdBanner300x250 } from "@/components/ad-banner-300x250"
import { fetchSources } from "@/lib/api"
import type { NormalizedContent, NormalizedSources } from "@/lib/api"

interface MovieDetailProps {
  movie: NormalizedContent
  frenchVersion?: NormalizedContent | null
}

export function MovieDetail({ movie, frenchVersion }: MovieDetailProps) {
  const [inMyList, setInMyList] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isLoadingSources, setIsLoadingSources] = useState(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState(false)
  const [sources, setSources] = useState<NormalizedSources | null>(null)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState<"original" | "french">(frenchVersion ? "french" : "original")

  const activeContent = selectedLang === "french" && frenchVersion ? frenchVersion : movie

  useEffect(() => {
    setInMyList(isInMyList(movie.id))
  }, [movie.id])

  useEffect(() => {
    setSources(null)
    setSourceError(null)
    setShowDownloadOptions(false)
    setShowPlayer(false)
  }, [selectedLang])

  const SMARTLINK = "https://wayanatomyunavailable.com/jii6kzj5z?key=113992b7b0e3f198a058a3cd8d7f54a4"

  const handleToggleMyList = () => {
    window.open(SMARTLINK, "_blank", "noopener,noreferrer")
    const { isInList } = toggleMyList(movie.id)
    setInMyList(isInList)
  }

  const handlePlay = async () => {
    setIsLoadingSources(true)
    setSourceError(null)
    try {
      const fetchedSources = await fetchSources(activeContent.id)
      setSources(fetchedSources)
      if (fetchedSources.videos.length > 0) {
        setShowPlayer(true)
      } else {
        setSourceError("No playable sources available for this title.")
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error)
      setSourceError("Failed to load video sources. Please try again.")
    } finally {
      setIsLoadingSources(false)
    }
  }

  const handleDownload = async () => {
    window.open(SMARTLINK, "_blank", "noopener,noreferrer")
    if (sources?.videos?.length) { setShowDownloadOptions(true); return }
    setIsLoadingDownload(true)
    setSourceError(null)
    try {
      const fetchedSources = await fetchSources(activeContent.id)
      setSources(fetchedSources)
      if (fetchedSources.videos.length > 0) {
        setShowDownloadOptions(true)
      } else {
        setSourceError("No download sources available for this content.")
      }
    } catch (error) {
      console.error("Failed to fetch download sources:", error)
      setSourceError("Failed to load download sources. Please try again.")
    } finally {
      setIsLoadingDownload(false)
    }
  }

  const downloadFile = (url: string) => {
    const trusted = ["bcdn.hakunaymatata.com", "hakunaymatata.com", "apiv3.freehandyflix.online"]
    try {
      const parsed = new URL(url)
      if (trusted.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
        // Route through /api/download proxy for reliable same-origin downloads
        const proxyUrl = `/api/download?url=${encodeURIComponent(url)}`
        const a = document.createElement("a")
        a.href = proxyUrl
        a.target = "_blank"
        a.rel = "noopener noreferrer"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch { /* noop */ }
    setShowDownloadOptions(false)
  }

  const videoSources = sources?.videos?.length
    ? sources.videos.map((v) => ({ quality: v.quality, src: v.src }))
    : []
  const subtitles = sources?.subtitles?.length ? sources.subtitles : []

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== "string" || url.length === 0) return null
    const videoId = url.split("/").pop()?.split("?")[0]
    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`
  }

  const hasDirectTrailer = !!movie.trailerVideo
  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailer)
  const hasYouTubeTrailer = !!trailerEmbedUrl
  const hasTrailer = hasDirectTrailer || hasYouTubeTrailer

  const availableResolutions = activeContent.resource?.seasons?.[0]?.resolutions || []
  const hasResource = activeContent.hasResource && availableResolutions.length > 0
  const maxResolution = availableResolutions.length > 0 ? Math.max(...availableResolutions) : 0

  const hasDubOptions = !!frenchVersion

  return (
    <>
      <section className="relative min-h-screen bg-background">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="relative h-[62vh] min-h-[460px] max-h-[680px] w-full overflow-hidden">
          {hasDirectTrailer ? (
            <video src={movie.trailerVideo} autoPlay muted={isMuted} loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : hasYouTubeTrailer ? (
            <iframe src={trailerEmbedUrl!} title={`${movie.title} Trailer`} className="absolute inset-0 w-full h-[130%] -mt-[15%] pointer-events-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : null}

          <div className={cn("absolute inset-0", hasTrailer ? "-z-10" : "z-0")}>
            <Image src={movie.backdrop || movie.poster || "/placeholder.svg"} alt={movie.title} fill priority className="object-cover" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20 z-[1] pointer-events-none" />
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(135deg, oklch(0.25 0.1 250 / 0.12) 0%, transparent 60%)" }} />

          <Link
            href="/"
            className="absolute top-4 left-4 lg:left-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          {hasTrailer && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-8 right-6 z-20 p-2.5 rounded-xl glass-pill hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-8 lg:px-12 pb-10">
            <div className="max-w-2xl space-y-4">

              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-primary" style={{ background: "oklch(0.58 0.22 245 / 0.15)", border: "1px solid oklch(0.58 0.22 245 / 0.3)" }}>
                  <Film className="h-3 w-3" /> Film
                </span>
                <span className="flex items-center gap-1 glass-pill px-2.5 py-1 rounded-full text-[11px]">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">{movie.rating?.toFixed(1)}</span>
                </span>
                {hasResource ? (
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-primary">{maxResolution}p</span>
                ) : (
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-medium text-muted-foreground">HD</span>
                )}
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A"}
                </span>
                {movie.duration && (
                  <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {movie.duration}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-1.5">
                {movie.genre.slice(0, 4).map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full text-[11px] text-white/55" style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.09)" }}>
                    {g}
                  </span>
                ))}
              </div>

              {hasDubOptions && (
                <div className="flex items-center gap-2 pt-0.5">
                  <Globe className="h-4 w-4 text-primary/70 flex-shrink-0" />
                  <div
                    className="flex items-center gap-0.5 p-0.5 rounded-xl"
                    style={{ background: "oklch(0.10 0.03 255 / 0.75)", border: "1px solid oklch(0.7 0.05 240 / 0.2)" }}
                  >
                    <button
                      onClick={() => setSelectedLang("original")}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200",
                        selectedLang === "original"
                          ? "text-white shadow-md"
                          : "text-white/50 hover:text-white/80"
                      )}
                      style={selectedLang === "original" ? {
                        background: "oklch(0.58 0.22 245 / 0.3)",
                        border: "1px solid oklch(0.58 0.22 245 / 0.5)",
                        boxShadow: "0 0 16px oklch(0.58 0.22 245 / 0.2)"
                      } : { border: "1px solid transparent" }}
                    >
                      <span className="text-base leading-none">🇬🇧</span>
                      English
                    </button>
                    <button
                      onClick={() => setSelectedLang("french")}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200",
                        selectedLang === "french"
                          ? "text-white shadow-md"
                          : "text-white/50 hover:text-white/80"
                      )}
                      style={selectedLang === "french" ? {
                        background: "oklch(0.58 0.22 245 / 0.3)",
                        border: "1px solid oklch(0.58 0.22 245 / 0.5)",
                        boxShadow: "0 0 16px oklch(0.58 0.22 245 / 0.2)"
                      } : { border: "1px solid transparent" }}
                    >
                      <span className="text-base leading-none">🇫🇷</span>
                      Fran&ccedil;ais
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={handlePlay}
                  disabled={!hasResource || isLoadingSources}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-black/40",
                    hasResource && !isLoadingSources
                      ? "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 active:scale-95"
                      : "bg-foreground/30 text-foreground/40 cursor-not-allowed",
                  )}
                >
                  {isLoadingSources ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  {isLoadingSources ? "Loading..." : hasResource ? "Play" : "Unavailable"}
                </button>

                <button
                  onClick={handleToggleMyList}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95",
                    inMyList
                      ? "text-primary shadow-[0_0_20px_oklch(0.58_0.22_245/0.3)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  style={{
                    background: inMyList ? "oklch(0.58 0.22 245 / 0.12)" : "oklch(0.15 0.04 255 / 0.65)",
                    backdropFilter: "blur(16px)",
                    border: inMyList ? "1px solid oklch(0.58 0.22 245 / 0.35)" : "1px solid oklch(0.7 0.05 240 / 0.18)",
                  }}
                >
                  {inMyList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inMyList ? "Saved" : "My List"}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!hasResource || isLoadingDownload}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95",
                    hasResource && !isLoadingDownload ? "text-muted-foreground hover:text-foreground" : "opacity-40 cursor-not-allowed",
                  )}
                  style={{
                    background: "oklch(0.15 0.04 255 / 0.65)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid oklch(0.7 0.05 240 / 0.18)",
                  }}
                >
                  {isLoadingDownload ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isLoadingDownload ? "Loading..." : hasResource ? `${maxResolution}p` : "Download"}
                </button>
              </div>

              {sourceError && (
                <p className="text-sm text-red-400 mt-2">{sourceError}</p>
              )}
        </div>
        </div>
        </div>

        {/* ── Detail content ──────────────────────────────────── */}
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-12 py-10">
          <AdBanner300x250 hidden={showPlayer} />
          <div className="flex flex-col lg:flex-row gap-10">

            <div className="hidden lg:block flex-shrink-0">
              <div
                className="relative w-[180px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                style={{ border: "1px solid oklch(0.7 0.05 240 / 0.15)" }}
              >
                <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div
                className="p-5 rounded-2xl"
                style={{ background: "oklch(0.12 0.03 255 / 0.5)", border: "1px solid oklch(0.7 0.05 240 / 0.1)" }}
              >
                <p className="text-[15px] text-muted-foreground leading-relaxed">{movie.description}</p>
              </div>

              {movie.country && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Country", value: movie.country },
                    { label: "Year", value: movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : "N/A" },
                    { label: "Duration", value: movie.duration || "N/A" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl"
                      style={{ background: "oklch(0.12 0.03 255 / 0.4)", border: "1px solid oklch(0.7 0.05 240 / 0.08)" }}
                    >
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {movie.actors && movie.actors.length > 0 && (
              <div className="lg:w-60 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="section-title-line w-5" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cast</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {movie.actors.slice(0, 8).map((actor, idx) => (
                    <div
                      key={`${actor.name}-${idx}`}
                      className="flex items-center gap-2.5 p-2 rounded-xl group cursor-pointer transition-all duration-200 hover:bg-white/[0.05]"
                    >
                      <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
                        <Image src={actor.image || "/placeholder.svg"} alt={actor.name} fill className="object-cover" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                        {actor.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {showPlayer && (
        <div className="fixed inset-0 z-[200] bg-black">
          <VideoPlayer
            title={selectedLang === "french" && frenchVersion ? frenchVersion.title : movie.title}
            poster={movie.backdrop || movie.poster}
            sources={videoSources}
            subtitles={subtitles}
            initialDuration={activeContent.durationSeconds}
            preferredSubtitleLang={selectedLang === "original" ? "fr" : undefined}
            onClose={() => setShowPlayer(false)}
            autoPlay
          />
        </div>
      )}

      {showDownloadOptions && sources?.videos && sources.videos.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowDownloadOptions(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl p-6"
            style={{
              background: "oklch(0.12 0.03 255 / 0.95)",
              backdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid oklch(0.7 0.05 240 / 0.18)",
              boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.1), 0 32px 80px oklch(0 0 0 / 0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black">Select Quality</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Choose download resolution</p>
              </div>
              <button onClick={() => setShowDownloadOptions(false)} className="p-1.5 rounded-lg glass-pill hover:border-primary/30 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {sources.videos.map((video) => (
                <button
                  key={video.quality}
                  onClick={() => downloadFile(video.downloadUrl || video.src)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl group transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "oklch(0.16 0.04 255 / 0.6)",
                    border: "1px solid oklch(0.7 0.05 240 / 0.12)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.58 0.22 245 / 0.15)", border: "1px solid oklch(0.58 0.22 245 / 0.25)" }}>
                      <Download className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">{video.quality}</span>
                  </div>
                  {video.size && (
                    <span className="text-[11px] text-muted-foreground">{Math.round(parseInt(video.size) / (1024 * 1024))} MB</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
