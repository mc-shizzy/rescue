"use client"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  X, ChevronRight, Loader2, Settings, Check, Play, Pause,
  Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack,
  AlertCircle, RefreshCw, Captions, Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SubtitleTrack {
  id: string
  label: string
  language: string
  src: string
}

export interface VideoSource {
  quality: string
  src: string
}

export interface VideoPlayerProps {
  title: string
  poster?: string
  sources: VideoSource[]
  subtitles?: SubtitleTrack[]
  onClose?: () => void
  autoPlay?: boolean
  startTime?: number
  initialDuration?: number
  preferredSubtitleLang?: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  nextEpisode?: { title: string; onPlay: () => void }
}

export function VideoPlayer({
  title,
  poster,
  sources,
  subtitles = [],
  onClose,
  autoPlay = true,
  startTime = 0,
  initialDuration = 0,
  preferredSubtitleLang,
  onTimeUpdate,
  onEnded,
  nextEpisode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeout = useRef<NodeJS.Timeout>()
  const timeUpdateRafRef = useRef<number | null>(null)
  const mouseMoveRafRef = useRef<number | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [duration, setDuration] = useState(initialDuration)
  const [currentTime, setCurrentTime] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string>("")
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [playbackRate, setPlaybackRate] = useState(1)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null)
  const subtitleAutoSelected = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [doubleTapSide, setDoubleTapSide] = useState<"left" | "right" | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"main" | "quality" | "speed" | "subtitles">("main")
  const [isSeeking, setIsSeeking] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 })
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null)
  const seekTimeRef = useRef<number | null>(null)
  const wasPlayingRef = useRef(autoPlay)
  const isInitialLoadRef = useRef(true)
  const isPlayingRef = useRef(false)
  const menuOpenRef = useRef(false)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    let resizeRaf: number | null = null
    const checkMobile = () => {
      if (resizeRaf !== null) return
      resizeRaf = requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
        resizeRaf = null
      })
    }
    checkMobile()
    window.addEventListener("resize", checkMobile, { passive: true })
    return () => {
      window.removeEventListener("resize", checkMobile)
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf)
    }
  }, [])

  const getDefaultQuality = useMemo(() => {
    if (sources.length === 0) return null
    if (sources.length === 1) return sources[0]
    const middleIndex = Math.floor(sources.length / 2)
    return sources[middleIndex]
  }, [sources])

  useEffect(() => {
    if (getDefaultQuality) {
      setSelectedQuality(getDefaultQuality.quality)
      setCurrentUrl(getDefaultQuality.src)
    }
  }, [getDefaultQuality])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid || !currentUrl) return
    vid.src = currentUrl
    vid.load()
  }, [currentUrl])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    const onLoadedMetadata = () => {
      setDuration(vid.duration)
      setIsReady(true)
      setHasError(false)
      setErrorMessage("")
      const targetTime = seekTimeRef.current !== null ? seekTimeRef.current : startTime
      if (targetTime > 0) {
        vid.currentTime = targetTime
        seekTimeRef.current = null
      }
      const shouldPlay = isInitialLoadRef.current ? autoPlay : wasPlayingRef.current
      if (shouldPlay) vid.play().catch(() => {})
      isInitialLoadRef.current = false
    }

    const onTimeUpdate = () => {
      if (timeUpdateRafRef.current !== null) return
      timeUpdateRafRef.current = requestAnimationFrame(() => {
        if (vid.duration > 0) {
          setCurrentTime(vid.currentTime)
          setPlayed(vid.currentTime / vid.duration)
        }
        timeUpdateRafRef.current = null
      })
    }

    const onProgress = () => {
      if (vid.buffered.length > 0 && vid.duration > 0) {
        setLoaded(vid.buffered.end(vid.buffered.length - 1) / vid.duration)
      }
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => setIsBuffering(false)
    const onEnded_ = () => onEnded?.()

    const onError = () => {
      setHasError(true)
      setIsBuffering(false)
      const err = vid.error
      let message = "Unable to load video. Please try again or select a different quality."
      if (err) {
        if (err.code === 1) message = "Video loading was aborted. Please try again."
        else if (err.code === 2) message = "Network error. Please check your connection and try again."
        else if (err.code === 3) message = "Error decoding video. Try a different quality option."
        else if (err.code === 4) message = "This video format is not supported. Try a different quality."
      }
      setErrorMessage(message)
    }

    vid.addEventListener("loadedmetadata", onLoadedMetadata)
    vid.addEventListener("timeupdate", onTimeUpdate)
    vid.addEventListener("progress", onProgress)
    vid.addEventListener("play", onPlay)
    vid.addEventListener("pause", onPause)
    vid.addEventListener("waiting", onWaiting)
    vid.addEventListener("canplay", onCanPlay)
    vid.addEventListener("ended", onEnded_)
    vid.addEventListener("error", onError)
    return () => {
      vid.removeEventListener("loadedmetadata", onLoadedMetadata)
      vid.removeEventListener("timeupdate", onTimeUpdate)
      vid.removeEventListener("progress", onProgress)
      vid.removeEventListener("play", onPlay)
      vid.removeEventListener("pause", onPause)
      vid.removeEventListener("waiting", onWaiting)
      vid.removeEventListener("canplay", onCanPlay)
      vid.removeEventListener("ended", onEnded_)
      vid.removeEventListener("error", onError)
      if (timeUpdateRafRef.current !== null) {
        cancelAnimationFrame(timeUpdateRafRef.current)
        timeUpdateRafRef.current = null
      }
    }
  }, [autoPlay, startTime, onEnded])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      onTimeUpdate?.(currentTime)
      if (nextEpisode && currentTime / duration > 0.9) setShowNextEpisode(true)
      else setShowNextEpisode(false)
    }
  }, [currentTime, duration, nextEpisode, onTimeUpdate])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const existingTracks = vid.querySelectorAll("track")
    existingTracks.forEach((t) => t.remove())
    if (subtitles.length === 0) return
    subtitles.forEach((sub) => {
      const track = document.createElement("track")
      track.kind = "subtitles"
      track.src = sub.src
      track.srclang = sub.language
      track.label = sub.label
      vid.appendChild(track)
    })
    requestAnimationFrame(() => {
      for (let i = 0; i < vid.textTracks.length; i++) {
        const tt = vid.textTracks[i]
        const matchingSub = subtitles.find(s => s.language === tt.language && s.label === tt.label)
        tt.mode = matchingSub && selectedSubtitle === matchingSub.id ? "showing" : "hidden"
      }
    })
    return () => {
      existingTracks.forEach((t) => t.remove())
    }
  }, [subtitles, selectedSubtitle])

  useEffect(() => {
    if (subtitleAutoSelected.current || subtitles.length === 0 || !preferredSubtitleLang) return
    subtitleAutoSelected.current = true
    const preferred = subtitles.find(s => s.language.toLowerCase() === preferredSubtitleLang.toLowerCase())
    if (preferred) {
      setSelectedSubtitle(preferred.id)
      return
    }
    const english = subtitles.find(s => s.language.toLowerCase() === "en")
    if (english) {
      setSelectedSubtitle(english.id)
    }
  }, [subtitles, preferredSubtitleLang])

  const controlBarHoveredRef = useRef(false)

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlayingRef.current && !menuOpenRef.current && !controlBarHoveredRef.current) {
        setShowControls(false)
        setShowSettingsPanel(false)
      }
    }, 5000)
  }, [])

  const revealControls = useCallback(() => {
    setShowControls((prev) => {
      if (!prev) controlsShownAtRef.current = Date.now()
      return true
    })
    resetHideTimer()
  }, [resetHideTimer])

  const handleMouseMove = useCallback(() => {
    if (mouseMoveRafRef.current !== null) return
    mouseMoveRafRef.current = requestAnimationFrame(() => {
      revealControls()
      mouseMoveRafRef.current = null
    })
  }, [revealControls])

  const handleQualityChange = useCallback((quality: string) => {
    const source = sources.find((s) => s.quality === quality)
    if (!source) return
    seekTimeRef.current = videoRef.current?.currentTime ?? 0
    wasPlayingRef.current = !videoRef.current?.paused
    isInitialLoadRef.current = false
    setSelectedQuality(quality)
    setCurrentUrl(source.src)
    setHasError(false)
    setErrorMessage("")
    setShowSettingsPanel(false)
    menuOpenRef.current = false
  }, [sources])

  const handleRetry = useCallback(() => {
    setHasError(false)
    setErrorMessage("")
    setIsReady(false)
    try {
      if (currentUrl.startsWith("http://") || currentUrl.startsWith("https://")) {
        const url = new URL(currentUrl)
        url.searchParams.set("_t", Date.now().toString())
        setCurrentUrl(url.toString())
      } else {
        const separator = currentUrl.includes("?") ? "&" : "?"
        setCurrentUrl(`${currentUrl}${separator}_t=${Date.now()}`)
      }
    } catch {
      const separator = currentUrl.includes("?") ? "&" : "?"
      setCurrentUrl(`${currentUrl}${separator}_t=${Date.now()}`)
    }
  }, [currentUrl])

  const calculateSeekPosition = useCallback((clientX: number) => {
    if (!progressRef.current) return null
    const rect = progressRef.current.getBoundingClientRect()
    if (rect.width === 0) return null
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const seekToFraction = useCallback((fraction: number) => {
    if (videoRef.current && duration > 0) videoRef.current.currentTime = fraction * duration
  }, [duration])

  const handleSeekMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setIsSeeking(true)
    const p = calculateSeekPosition(e.clientX)
    if (p !== null) seekToFraction(p)
  }, [calculateSeekPosition, seekToFraction])

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const p = calculateSeekPosition(e.clientX)
    if (p !== null && duration > 0) {
      setHoverTime(p * duration)
      setHoverX(e.clientX - (progressRef.current?.getBoundingClientRect().left ?? 0))
    }
  }, [calculateSeekPosition, duration])

  useEffect(() => {
    if (!isSeeking) return
    const onMove = (e: MouseEvent) => {
      const p = calculateSeekPosition(e.clientX)
      if (p !== null) seekToFraction(p)
    }
    const onUp = () => setIsSeeking(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [isSeeking, calculateSeekPosition, seekToFraction])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsSeeking(true)
    const p = calculateSeekPosition(e.touches[0].clientX)
    if (p !== null) seekToFraction(p)
  }, [calculateSeekPosition, seekToFraction])

  useEffect(() => {
    if (!isSeeking) return
    const onMove = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const p = calculateSeekPosition(e.touches[0].clientX)
      if (p !== null) seekToFraction(p)
    }
    const onEnd = () => setIsSeeking(false)
    window.addEventListener("touchmove", onMove)
    window.addEventListener("touchend", onEnd)
    window.addEventListener("touchcancel", onEnd)
    return () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); window.removeEventListener("touchcancel", onEnd) }
  }, [isSeeking, calculateSeekPosition, seekToFraction])

  const handleSkip = useCallback((seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, (videoRef.current.currentTime || 0) + seconds))
  }, [duration])

  const togglePlayPause = useCallback(() => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) vid.play().catch(() => {})
    else vid.pause()
  }, [])

  const controlsShownAtRef = useRef(0)

  const handleTap = useCallback((e: React.MouseEvent) => {
    if (!isMobile) {
      togglePlayPause()
      revealControls()
      return
    }

    const now = Date.now()
    const clientX = e.clientX
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const timeDiff = now - lastTapRef.current.time

    if (timeDiff < 300) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current)
        singleTapTimerRef.current = null
      }
      const isLeft = clientX < rect.left + rect.width / 2
      handleSkip(isLeft ? -10 : 10)
      setDoubleTapSide(isLeft ? "left" : "right")
      setTimeout(() => setDoubleTapSide(null), 600)
      lastTapRef.current = { time: 0, x: 0 }
    } else {
      lastTapRef.current = { time: now, x: clientX }
      singleTapTimerRef.current = setTimeout(() => {
        const timeSinceShown = Date.now() - controlsShownAtRef.current
        setShowControls((prev) => {
          if (!prev) {
            controlsShownAtRef.current = Date.now()
            resetHideTimer()
            return true
          }
          if (timeSinceShown < 2000) {
            resetHideTimer()
            return true
          }
          return false
        })
        singleTapTimerRef.current = null
      }, 250)
    }
  }, [isMobile, handleSkip, togglePlayPause, revealControls, resetHideTimer])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {})
    else document.exitFullscreen()
  }, [])

  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", h)
    return () => document.removeEventListener("fullscreenchange", h)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlayPause(); revealControls(); break
        case "ArrowLeft": e.preventDefault(); handleSkip(-10); revealControls(); break
        case "ArrowRight": e.preventDefault(); handleSkip(10); revealControls(); break
        case "ArrowUp": e.preventDefault(); setVolume((v) => { const n = Math.min(1, v + 0.1); if (videoRef.current) videoRef.current.volume = n; return n }); break
        case "ArrowDown": e.preventDefault(); setVolume((v) => { const n = Math.max(0, v - 0.1); if (videoRef.current) videoRef.current.volume = n; return n }); break
        case "m": setIsMuted((m) => { const n = !m; if (videoRef.current) videoRef.current.muted = n; return n }); break
        case "f": toggleFullscreen(); break
        case "Escape": if (showSettingsPanel) { setShowSettingsPanel(false); menuOpenRef.current = false } else if (onClose && !isFullscreen) onClose(); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSkip, toggleFullscreen, onClose, isFullscreen, togglePlayPause, revealControls, showSettingsPanel])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && !document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {})
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current)
      if (mouseMoveRafRef.current) cancelAnimationFrame(mouseMoveRafRef.current)
    }
  }, [])

  const openSettings = useCallback((tab: "main" | "quality" | "speed" | "subtitles" = "main") => {
    setSettingsTab(tab)
    setShowSettingsPanel(true)
    menuOpenRef.current = true
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
  }, [])

  const closeSettings = useCallback(() => {
    setShowSettingsPanel(false)
    setSettingsTab("main")
    menuOpenRef.current = false
    resetHideTimer()
  }, [resetHideTimer])

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black w-full overflow-hidden select-none",
        isFullscreen ? "fixed inset-0 z-[200] h-screen w-screen" : "aspect-video h-full",
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (!menuOpenRef.current && !controlBarHoveredRef.current) {
          if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
          hideControlsTimeout.current = setTimeout(() => {
            if (isPlayingRef.current && !menuOpenRef.current && !controlBarHoveredRef.current) {
              setShowControls(false)
              setShowSettingsPanel(false)
            }
          }, 2000)
        }
      }}
    >
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          playsInline
          poster={poster}
          preload="metadata"
        />
      </div>

      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {doubleTapSide && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none",
          doubleTapSide === "left" ? "left-[10%]" : "right-[10%]"
        )}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-ping-once">
              {doubleTapSide === "left"
                ? <SkipBack className="h-8 w-8 text-white" />
                : <SkipForward className="h-8 w-8 text-white" />
              }
            </div>
            <span className="text-white/90 text-xs font-bold tracking-wide">10s</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-[100] transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-b from-black/70 via-black/30 to-transparent px-4 sm:px-6 pt-3 sm:pt-4 pb-14">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-200 active:scale-90"
              >
                <X className="h-4.5 w-4.5 text-white" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate drop-shadow-lg">{title}</h2>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[100] transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          controlBarHoveredRef.current = true
          if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
        }}
        onMouseLeave={() => {
          controlBarHoveredRef.current = false
          resetHideTimer()
        }}
      >
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 sm:px-6 pb-4 sm:pb-5 pt-16">
          <div
            ref={progressRef}
            className={cn("relative cursor-pointer group mb-3", isMobile ? "py-3" : "py-2")}
            onMouseDown={handleSeekMouseDown}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
            onTouchStart={handleTouchStart}
          >
            {!isMobile && hoverTime !== null && (
              <div
                className="absolute -top-9 px-2 py-1 bg-black/90 backdrop-blur-sm rounded-md text-xs font-mono text-white pointer-events-none z-10 border border-white/10"
                style={{ left: `${hoverX}px`, transform: "translateX(-50%)" }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
            <div className={cn(
              "relative rounded-full transition-all duration-150",
              isSeeking ? "h-2" : isMobile ? "h-1.5" : "h-1 group-hover:h-2"
            )} style={{ background: "rgba(255,255,255,0.15)" }}>
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: `${loaded * 100}%`, background: "rgba(255,255,255,0.25)" }}
              />
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-colors"
                style={{ width: `${played * 100}%`, background: "oklch(0.65 0.22 250)" }}
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg transition-all duration-150",
                  isMobile ? "w-4 h-4" : "w-0 h-0 group-hover:w-3.5 group-hover:h-3.5",
                  isSeeking && "!w-4 !h-4"
                )}
                style={{
                  left: `calc(${played * 100}% - ${isMobile ? 8 : 7}px)`,
                  background: "oklch(0.65 0.22 250)",
                  boxShadow: "0 0 8px oklch(0.65 0.22 250 / 0.5)"
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all duration-150"
              >
                {isPlaying
                  ? <Pause className="h-5 w-5 text-white fill-white" />
                  : <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                }
              </button>

              {!isMobile && (
                <>
                  <button onClick={() => handleSkip(-10)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">
                    <SkipBack className="h-4 w-4 text-white/80" />
                  </button>
                  <button onClick={() => handleSkip(10)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">
                    <SkipForward className="h-4 w-4 text-white/80" />
                  </button>
                </>
              )}

              {!isMobile && (
                <div className="flex items-center gap-1.5 ml-1 group/vol">
                  <button
                    onClick={() => { const n = !isMuted; setIsMuted(n); if (videoRef.current) videoRef.current.muted = n }}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    {isMuted || volume === 0
                      ? <VolumeX className="h-4 w-4 text-white/80" />
                      : <Volume2 className="h-4 w-4 text-white/80" />
                    }
                  </button>
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        setVolume(v); setIsMuted(false)
                        if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = false }
                      }}
                      className="w-20 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-track]:bg-white/20 [&::-webkit-slider-track]:rounded-full"
                    />
                  </div>
                </div>
              )}

              <span className="text-white/70 text-xs font-medium ml-1 tabular-nums select-none">
                {formatTime(currentTime)}
                <span className="text-white/30 mx-1">/</span>
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {!isMobile && subtitles.length > 0 && (
                <button
                  onClick={() => openSettings("subtitles")}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-all",
                    selectedSubtitle && "text-primary"
                  )}
                >
                  <Captions className={cn("h-4 w-4", selectedSubtitle ? "text-primary" : "text-white/80")} />
                </button>
              )}

              {!isMobile && (
                <button
                  onClick={() => openSettings("main")}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <Settings className="h-4 w-4 text-white/80" />
                </button>
              )}

              {isMobile && (
                <button
                  onClick={() => openSettings("main")}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <Settings className="h-4.5 w-4.5 text-white/80" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
              >
                {isFullscreen
                  ? <Minimize className="h-4.5 w-4.5 text-white/80" />
                  : <Maximize className="h-4.5 w-4.5 text-white/80" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettingsPanel && (
        <div
          className={cn(
            "fixed z-[250] transition-all duration-300",
            isMobile ? "inset-0 flex items-end justify-center" : "absolute bottom-20 right-4"
          )}
          onClick={closeSettings}
        >
          {isMobile && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}
          <div
            className={cn(
              "relative overflow-hidden",
              isMobile
                ? "w-full max-h-[65vh] rounded-t-2xl"
                : "w-72 rounded-xl shadow-2xl"
            )}
            style={{
              background: "oklch(0.10 0.02 260 / 0.97)",
              backdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid oklch(0.7 0.05 240 / 0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />}

            <div className="p-3">
              {settingsTab === "main" && (
                <div className="space-y-0.5">
                  {sources.length > 1 && (
                    <button
                      onClick={() => setSettingsTab("quality")}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-white/50" />
                        <span className="text-sm text-white font-medium">Quality</span>
                      </div>
                      <span className="text-xs text-white/40">{selectedQuality}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSettingsTab("speed")}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Gauge className="h-4 w-4 text-white/50" />
                      <span className="text-sm text-white font-medium">Speed</span>
                    </div>
                    <span className="text-xs text-white/40">{playbackRate}x</span>
                  </button>
                  {subtitles.length > 0 && (
                    <button
                      onClick={() => setSettingsTab("subtitles")}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Captions className="h-4 w-4 text-white/50" />
                        <span className="text-sm text-white font-medium">Subtitles</span>
                      </div>
                      <span className="text-xs text-white/40">{selectedSubtitle ? subtitles.find(s => s.id === selectedSubtitle)?.label : "Off"}</span>
                    </button>
                  )}
                </div>
              )}

              {settingsTab === "quality" && (
                <div>
                  <button onClick={() => setSettingsTab("main")} className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors mb-1">
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Quality
                  </button>
                  <div className="space-y-0.5">
                    {sources.map((source) => (
                      <button
                        key={source.quality}
                        onClick={() => handleQualityChange(source.quality)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                          selectedQuality === source.quality ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                        )}
                      >
                        <span className={cn("text-sm", selectedQuality === source.quality ? "text-white font-semibold" : "text-white/70")}>{source.quality}</span>
                        {selectedQuality === source.quality && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === "speed" && (
                <div>
                  <button onClick={() => setSettingsTab("main")} className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors mb-1">
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Speed
                  </button>
                  <div className="space-y-0.5">
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => { setPlaybackRate(rate); closeSettings() }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                          playbackRate === rate ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                        )}
                      >
                        <span className={cn("text-sm", playbackRate === rate ? "text-white font-semibold" : "text-white/70")}>{rate === 1 ? "Normal" : `${rate}x`}</span>
                        {playbackRate === rate && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === "subtitles" && (
                <div>
                  <button onClick={() => setSettingsTab("main")} className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors mb-1">
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Subtitles
                  </button>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => { setSelectedSubtitle(null); closeSettings() }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                        selectedSubtitle === null ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <span className={cn("text-sm", selectedSubtitle === null ? "text-white font-semibold" : "text-white/70")}>Off</span>
                      {selectedSubtitle === null && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                    {subtitles.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => { setSelectedSubtitle(sub.id); closeSettings() }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                          selectedSubtitle === sub.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                        )}
                      >
                        <span className={cn("text-sm", selectedSubtitle === sub.id ? "text-white font-semibold" : "text-white/70")}>{sub.label}</span>
                        {selectedSubtitle === sub.id && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNextEpisode && nextEpisode && (
        <div className={cn(
          "absolute z-[100] transition-all duration-500",
          isMobile ? "bottom-28 right-3 left-3" : "bottom-24 right-6",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        )}>
          <button
            onClick={nextEpisode.onPlay}
            className={cn(
              "flex items-center gap-2 font-semibold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95",
              isMobile ? "w-full justify-center px-5 py-3.5 text-sm" : "px-5 py-3 text-sm"
            )}
            style={{
              background: "oklch(0.65 0.22 250)",
              color: "white",
              boxShadow: "0 4px 24px oklch(0.65 0.22 250 / 0.4)"
            }}
          >
            <span className="truncate">Next: {nextEpisode.title}</span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          </button>
        </div>
      )}

      {!isPlaying && !isBuffering && !hasError && isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className={cn("rounded-full flex items-center justify-center backdrop-blur-sm", isMobile ? "w-16 h-16" : "w-18 h-18")}
            style={{ background: "oklch(0.65 0.22 250 / 0.85)", boxShadow: "0 0 40px oklch(0.65 0.22 250 / 0.3)" }}
          >
            <Play className={cn("text-white fill-white ml-1", isMobile ? "h-7 w-7" : "h-8 w-8")} />
          </div>
        </div>
      )}

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "oklch(0.65 0.22 250)" }} />
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-50 gap-5 p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-white text-base font-medium mb-1">Playback Error</p>
            <p className="text-white/50 text-sm">{errorMessage}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: "oklch(0.65 0.22 250)", boxShadow: "0 2px 12px oklch(0.65 0.22 250 / 0.3)" }}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            {sources.length > 1 && (
              <button
                onClick={() => openSettings("quality")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 transition-all hover:scale-[1.03] active:scale-95"
              >
                <Settings className="h-4 w-4" />
                Change Quality
              </button>
            )}
          </div>
        </div>
      )}

      {!isReady && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 gap-3">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "oklch(0.65 0.22 250)" }} />
          <p className="text-white/40 text-sm font-medium">Loading...</p>
        </div>
      )}
    </div>
  )
}
