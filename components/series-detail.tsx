"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Play, Plus, Check, Star, Calendar, ChevronLeft,
  Volume2, VolumeX, Loader2, Tv, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isInMyList, toggleMyList } from "@/lib/my-list"
import { VideoPlayer } from "@/components/video-player"
import { AdBanner300x250 } from "@/components/ad-banner-300x250"
import { fetchSources } from "@/lib/api"
import type { NormalizedContent, NormalizedSources } from "@/lib/api"

interface SeriesDetailProps {
  series: NormalizedContent
}

export function SeriesDetail({ series }: SeriesDetailProps) {
  const [inMyList, setInMyList] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const initialSeasonNum = series.seasons?.[0]?.seasonNumber ?? 1
  const [selectedSeason, setSelectedSeason] = useState(initialSeasonNum)
  const [showPlayer, setShowPlayer] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<{ season: number; episode: number } | null>(null)
  const [isLoadingSources, setIsLoadingSources] = useState(false)
  const [loadingEpisodeKey, setLoadingEpisodeKey] = useState<string | null>(null)
  const [sources, setSources] = useState<NormalizedSources | null>(null)
  const [sourceError, setSourceError] = useState<string | null>(null)

  const seasons = series.seasons || []
  const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeason) || seasons[0]

  useEffect(() => {
    setInMyList(isInMyList(series.id))
  }, [series.id])

  const handleToggleMyList = () => {
    const { isInList } = toggleMyList(series.id)
    setInMyList(isInList)
  }

  const playEpisode = async (seasonNum: number, episodeNum: number) => {
    const key = `${seasonNum}-${episodeNum}`
    setLoadingEpisodeKey(key)
    setIsLoadingSources(true)
    setSourceError(null)
    try {
      const fetchedSources = await fetchSources(series.id, seasonNum, episodeNum)
      setSources(fetchedSources)
      if (fetchedSources.videos.length > 0) {
        setCurrentEpisode({ season: seasonNum, episode: episodeNum })
        setShowPlayer(true)
      } else {
        setSourceError("No playable sources available for this episode.")
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error)
      setSourceError("Failed to load video sources. Please try again.")
    } finally {
      setIsLoadingSources(false)
      setLoadingEpisodeKey(null)
    }
  }

  const getCurrentEpisodeInfo = () => {
    if (!currentEpisode) return null
    const season = seasons.find((s) => s.seasonNumber === currentEpisode.season)
    return season?.episodes.find((e) => e.episodeNumber === currentEpisode.episode)
  }

  const getNextEpisode = () => {
    if (!currentEpisode) return null
    const season = seasons.find((s) => s.seasonNumber === currentEpisode.season)
    if (!season) return null
    const nextEpIndex = currentEpisode.episode
    if (nextEpIndex < season.episodes.length) {
      return { season: currentEpisode.season, episode: nextEpIndex + 1, title: season.episodes[nextEpIndex].title }
    }
    const nextSeason = seasons.find((s) => s.seasonNumber === currentEpisode.season + 1)
    if (nextSeason && nextSeason.episodes.length > 0) {
      return { season: nextSeason.seasonNumber, episode: 1, title: nextSeason.episodes[0].title }
    }
    return null
  }

  const currentEpisodeInfo = getCurrentEpisodeInfo()
  const nextEpisode = getNextEpisode()

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

  const hasDirectTrailer = !!series.trailerVideo
  const trailerEmbedUrl = getYouTubeEmbedUrl(series.trailer)
  const hasYouTubeTrailer = !!trailerEmbedUrl
  const hasTrailer = hasDirectTrailer || hasYouTubeTrailer

  const availableResolutions = series.resource?.seasons?.[0]?.resolutions || []
  const hasResource = series.hasResource && availableResolutions.length > 0
  const maxResolution = availableResolutions.length > 0 ? Math.max(...availableResolutions) : 0

  return (
    <>
      <section className="relative min-h-screen bg-background">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="relative h-[62vh] min-h-[460px] max-h-[680px] w-full overflow-hidden">
          {hasDirectTrailer ? (
            <video src={series.trailerVideo} autoPlay muted={isMuted} loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : hasYouTubeTrailer ? (
            <iframe src={trailerEmbedUrl!} title={`${series.title} Trailer`} className="absolute inset-0 w-full h-[130%] -mt-[15%] pointer-events-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : null}

          <div className={cn("absolute inset-0", hasTrailer ? "-z-10" : "z-0")}>
            <Image src={series.backdrop || series.poster || "/placeholder.svg"} alt={series.title} fill priority className="object-cover" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20 z-[1] pointer-events-none" />
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(135deg, oklch(0.25 0.1 250 / 0.12) 0%, transparent 60%)" }} />

          {/* Back */}
          <Link
            href="/"
            className="absolute top-4 left-4 lg:left-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Mute */}
          {hasTrailer && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-8 right-6 z-20 p-2.5 rounded-xl glass-pill hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          {/* Hero content */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-8 lg:px-12 pb-10">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-primary" style={{ background: "oklch(0.58 0.22 245 / 0.15)", border: "1px solid oklch(0.58 0.22 245 / 0.3)" }}>
                  <Tv className="h-3 w-3" /> Series
                </span>
                <span className="glass-pill px-2.5 py-1 rounded-full text-[11px] text-muted-foreground font-medium">
                  {seasons.length} Season{seasons.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1 glass-pill px-2.5 py-1 rounded-full text-[11px]">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">{series.rating?.toFixed(1)}</span>
                </span>
                {hasResource && (
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-primary">{maxResolution}p</span>
                )}
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {series.releaseDate ? new Date(series.releaseDate).getFullYear() : "N/A"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance leading-tight">
                {series.title}
              </h1>

              <div className="flex flex-wrap gap-1.5">
                {series.genre.slice(0, 4).map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full text-[11px] text-white/55" style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.09)" }}>
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Play S1:E1 */}
                <button
                  onClick={() => seasons.length > 0 && seasons[0].episodes.length > 0 && playEpisode(seasons[0].seasonNumber, 1)}
                  disabled={(!hasResource && seasons.length === 0) || isLoadingSources}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-black/40",
                    (hasResource || seasons.length > 0) && !isLoadingSources
                      ? "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 active:scale-95"
                      : "bg-foreground/30 text-foreground/40 cursor-not-allowed",
                  )}
                >
                  {isLoadingSources && !loadingEpisodeKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  {isLoadingSources && !loadingEpisodeKey ? "Loading..." : `Play S${seasons[0]?.seasonNumber || 1}:E1`}
                </button>

                {/* My List */}
                <button
                  onClick={handleToggleMyList}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95",
                    inMyList ? "text-primary shadow-[0_0_20px_oklch(0.58_0.22_245/0.3)]" : "text-muted-foreground hover:text-foreground",
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
              </div>

              {sourceError && (
                <p className="text-sm text-red-400 mt-2">{sourceError}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Detail content ──────────────────────────────────── */}
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-12 py-10">
          {/* Adsterra 300x250 Banner */}
          <AdBanner300x250 hidden={showPlayer} />
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Poster */}
            <div className="hidden lg:block flex-shrink-0">
              <div
                className="relative w-[180px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                style={{ border: "1px solid oklch(0.7 0.05 240 / 0.15)" }}
              >
                <Image src={series.poster || "/placeholder.svg"} alt={series.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <div className="absolute bottom-3 inset-x-3">
                  <span className="block text-center text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 rounded-lg" style={{ background: "oklch(0.58 0.22 245 / 0.2)", border: "1px solid oklch(0.58 0.22 245 / 0.3)" }}>
                    Series
                  </span>
                </div>
              </div>
            </div>

            {/* Info + Episodes */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* Description */}
              <div
                className="p-5 rounded-2xl"
                style={{ background: "oklch(0.12 0.03 255 / 0.5)", border: "1px solid oklch(0.7 0.05 240 / 0.1)" }}
              >
                <p className="text-[15px] text-muted-foreground leading-relaxed">{series.description}</p>
              </div>

              {/* Episodes section */}
              {seasons.length > 0 && currentSeason && (
                <div>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="section-title-line w-6" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Episodes</h2>
                    <div className="flex-1" />

                    {/* Season tab selector */}
                    {seasons.length > 1 && (
                      <div
                        className="flex items-center gap-1 p-1 rounded-xl"
                        style={{ background: "oklch(0.12 0.03 255 / 0.6)", border: "1px solid oklch(0.7 0.05 240 / 0.1)" }}
                      >
                        {seasons.map((season) => (
                          <button
                            key={season.seasonNumber}
                            onClick={() => setSelectedSeason(season.seasonNumber)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
                              selectedSeason === season.seasonNumber
                                ? "text-primary shadow-[0_0_12px_oklch(0.58_0.22_245/0.25)]"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                            style={
                              selectedSeason === season.seasonNumber
                                ? {
                                    background: "oklch(0.58 0.22 245 / 0.15)",
                                    border: "1px solid oklch(0.58 0.22 245 / 0.3)",
                                  }
                                : { background: "transparent", border: "1px solid transparent" }
                            }
                          >
                            S{season.seasonNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Episode cards */}
                  <div className="space-y-2">
                    {currentSeason.episodes.map((episode) => {
                      const epKey = `${selectedSeason}-${episode.episodeNumber}`
                      const isLoading = loadingEpisodeKey === epKey
                      const isCurrentlyPlaying = currentEpisode?.season === selectedSeason && currentEpisode?.episode === episode.episodeNumber

                      return (
                        <button
                          key={episode.episodeNumber}
                          onClick={() => playEpisode(selectedSeason, episode.episodeNumber)}
                          disabled={isLoading}
                          className={cn(
                            "w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left",
                            isCurrentlyPlaying
                              ? "shadow-[0_0_20px_oklch(0.58_0.22_245/0.15)]"
                              : "hover:scale-[1.01]",
                          )}
                          style={
                            isCurrentlyPlaying
                              ? {
                                  background: "oklch(0.58 0.22 245 / 0.1)",
                                  border: "1px solid oklch(0.58 0.22 245 / 0.25)",
                                }
                              : {
                                  background: "oklch(0.12 0.03 255 / 0.4)",
                                  border: "1px solid oklch(0.7 0.05 240 / 0.08)",
                                }
                          }
                        >
                          {/* Episode number */}
                          <span
                            className={cn(
                              "w-7 text-center text-sm font-black tabular-nums flex-shrink-0 transition-colors",
                              isCurrentlyPlaying ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground",
                            )}
                          >
                            {episode.episodeNumber}
                          </span>

                          {/* Play icon */}
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                              isCurrentlyPlaying
                                ? "bg-primary/20 ring-1 ring-primary/40"
                                : "group-hover:bg-primary/15 group-hover:ring-1 group-hover:ring-primary/30",
                            )}
                            style={{ background: isCurrentlyPlaying ? undefined : "oklch(0.18 0.04 255 / 0.5)" }}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                            ) : (
                              <Play className={cn("h-3.5 w-3.5 fill-current", isCurrentlyPlaying ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                            )}
                          </div>

                          {/* Title + description */}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-semibold truncate transition-colors", isCurrentlyPlaying ? "text-primary" : "group-hover:text-foreground text-foreground/80")}>
                              {episode.title}
                            </p>
                            {isCurrentlyPlaying && (
                              <p className="text-[10px] text-primary/70 mt-0.5 font-medium">Now playing</p>
                            )}
                          </div>

                          {/* Duration + arrow */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {episode.duration && (
                              <span className="text-[11px] text-muted-foreground tabular-nums">{episode.duration}</span>
                            )}
                            <ChevronRight className={cn("h-3.5 w-3.5 transition-all duration-200", isCurrentlyPlaying ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5")} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cast */}
            {series.actors && series.actors.length > 0 && (
              <div className="lg:w-56 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="section-title-line w-5" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cast</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {series.actors.slice(0, 8).map((actor) => (
                    <div
                      key={actor.name}
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

      {/* Video Player */}
      {showPlayer && currentEpisode && currentEpisodeInfo && (
        <div className="fixed inset-0 z-[200] bg-black">
          <VideoPlayer
            title={`${series.title} — S${currentEpisode.season}:E${currentEpisode.episode} "${currentEpisodeInfo.title}"`}
            poster={series.backdrop || series.poster}
            sources={videoSources}
            subtitles={subtitles}
            onClose={() => { setShowPlayer(false); setCurrentEpisode(null) }}
            autoPlay
            nextEpisode={nextEpisode ? { title: `S${nextEpisode.season}:E${nextEpisode.episode}`, onPlay: () => playEpisode(nextEpisode.season, nextEpisode.episode) } : undefined}
            onEnded={() => { if (nextEpisode) playEpisode(nextEpisode.season, nextEpisode.episode) }}
          />
        </div>
      )}
    </>
  )
}
