"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, ChevronRight, Loader2, Settings, Check, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactPlayer from "react-player"
import type { OnProgressProps } from "react-player/base"

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
  onTimeUpdate,
  onEnded,
  nextEpisode,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeout = useRef<NodeJS.Timeout>()

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string>("")
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [seekTime, setSeekTime] = useState<number | null>(null)
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [doubleTapSide, setDoubleTapSide] = useState<"left" | "right" | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 })
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get default quality (middle quality for balance)
  const getDefaultQuality = useCallback(() => {
    if (sources.length === 0) return sources[0]
    if (sources.length === 1) return sources[0]
    const middleIndex = Math.floor(sources.length / 2)
    return sources[middleIndex]
  }, [sources])

  // Initialize with default quality
  useEffect(() => {
    const defaultSource = getDefaultQuality()
    if (defaultSource) {
      setSelectedQuality(defaultSource.quality)
      setCurrentUrl(defaultSource.src)
    }
  }, [getDefaultQuality])

  // Handle mouse movement for controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
        setShowQualityMenu(false)
        setShowPlaybackMenu(false)
        setShowSubtitleMenu(false)
      }
    }, 3000)
  }, [isPlaying])

  // Handle quality change
  const handleQualityChange = useCallback(
    (quality: string) => {
      const source = sources.find((s) => s.quality === quality)
      if (!source) return

      // Store current time for seeking after quality change
      setSeekTime(currentTime)
      setSelectedQuality(quality)
      setCurrentUrl(source.src)
      setShowQualityMenu(false)
      setHasError(false)
      setErrorMessage("")
    },
    [sources, currentTime],
  )

  // Handle progress update
  const handleProgress = useCallback(
    (state: OnProgressProps) => {
      setPlayed(state.played)
      setLoaded(state.loaded)
      setCurrentTime(state.playedSeconds)
      onTimeUpdate?.(state.playedSeconds)

      // Show next episode button when near end (90% watched)
      if (nextEpisode && duration > 0 && state.played > 0.9) {
        setShowNextEpisode(true)
      } else {
        setShowNextEpisode(false)
      }
    },
    [duration, nextEpisode, onTimeUpdate],
  )

  // Handle player ready
  const handleReady = useCallback(() => {
    setIsReady(true)
    setHasError(false)
    setErrorMessage("")
    
    // Seek to start time or saved time after quality change
    const targetTime = seekTime !== null ? seekTime : startTime
    if (targetTime > 0 && playerRef.current) {
      playerRef.current.seekTo(targetTime, "seconds")
      setSeekTime(null)
    }
  }, [startTime, seekTime])

  // Handle player error with better error messages
  const handleError = useCallback((error: unknown) => {
    setHasError(true)
    setIsBuffering(false)
    
    // Provide user-friendly error messages based on error type
    let message = "Unable to load video. Please try again or select a different quality."
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes("src_not_supported") || errorMsg.includes("not supported") || errorMsg.includes("format")) {
        message = "This video format is not supported. Try a different quality."
      } else if (errorMsg.includes("network") || errorMsg.includes("fetch") || errorMsg.includes("connection")) {
        message = "Network error. Please check your connection and try again."
      } else if (errorMsg.includes("decode") || errorMsg.includes("corrupt")) {
        message = "Error decoding video. Try a different quality option."
      } else if (errorMsg.includes("aborted")) {
        message = "Video loading was interrupted. Please try again."
      }
    } else if (typeof error === "object" && error !== null) {
      // Handle MediaError objects from HTML5 video element
      const mediaError = error as { code?: number }
      if (mediaError.code === 1) {
        message = "Video loading was aborted. Please try again."
      } else if (mediaError.code === 2) {
        message = "Network error. Please check your connection and try again."
      } else if (mediaError.code === 3) {
        message = "Error decoding video. Try a different quality option."
      } else if (mediaError.code === 4) {
        message = "This video format is not supported. Try a different quality."
      }
    }
    
    setErrorMessage(message)
  }, [])

  // Retry playback
  const handleRetry = useCallback(() => {
    setHasError(false)
    setErrorMessage("")
    setIsReady(false)
    
    // Force re-render by updating URL with timestamp
    // Handle both absolute and relative URLs
    try {
      if (currentUrl.startsWith("http://") || currentUrl.startsWith("https://")) {
        const url = new URL(currentUrl)
        url.searchParams.set("_t", Date.now().toString())
        setCurrentUrl(url.toString())
      } else {
        // For relative URLs, append query parameter manually
        const separator = currentUrl.includes("?") ? "&" : "?"
        setCurrentUrl(`${currentUrl}${separator}_t=${Date.now()}`)
      }
    } catch {
      // Fallback: just append timestamp
      const separator = currentUrl.includes("?") ? "&" : "?"
      setCurrentUrl(`${currentUrl}${separator}_t=${Date.now()}`)
    }
  }, [currentUrl])

  const [isSeeking, setIsSeeking] = useState(false)

  // Calculate seek position from mouse/touch event
  const calculateSeekPosition = useCallback((clientX: number) => {
    if (!progressRef.current) return null
    const rect = progressRef.current.getBoundingClientRect()
    if (rect.width === 0) return null
    if (rect.width === 0) return null
    const x = clientX - rect.left
    return Math.max(0, Math.min(1, x / rect.width))
  }, [])

  // Handle drag start on progress bar
  const handleSeekMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.preventDefault()
      setIsSeeking(true)
      
      const percentage = calculateSeekPosition(e.clientX)
      if (percentage !== null && playerRef.current) {
        playerRef.current.seekTo(percentage, "fraction")
      }
    },
    [calculateSeekPosition],
  )

  // Handle mouse drag on progress bar (global listeners for smooth seeking)
  useEffect(() => {
    if (!isSeeking) return

    const handleMouseMove = (e: MouseEvent) => {
      const percentage = calculateSeekPosition(e.clientX)
      if (percentage !== null && playerRef.current) {
        playerRef.current.seekTo(percentage, "fraction")
      }
    }

    const handleMouseUp = () => {
      setIsSeeking(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isSeeking, calculateSeekPosition])

  // Handle touch events for mobile seeking
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation()
      setIsSeeking(true)
      
      const touch = e.touches[0]
      const percentage = calculateSeekPosition(touch.clientX)
      if (percentage !== null && playerRef.current) {
        playerRef.current.seekTo(percentage, "fraction")
      }
    },
    [calculateSeekPosition],
  )

  // Handle touch drag on progress bar (global listeners for smooth seeking)
  useEffect(() => {
    if (!isSeeking) return

    const handleTouchMoveGlobal = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const percentage = calculateSeekPosition(touch.clientX)
      if (percentage !== null && playerRef.current) {
        playerRef.current.seekTo(percentage, "fraction")
      }
    }

    const handleTouchEndGlobal = () => {
      setIsSeeking(false)
    }

    window.addEventListener("touchmove", handleTouchMoveGlobal)
    window.addEventListener("touchend", handleTouchEndGlobal)
    window.addEventListener("touchcancel", handleTouchEndGlobal)

    return () => {
      window.removeEventListener("touchmove", handleTouchMoveGlobal)
      window.removeEventListener("touchend", handleTouchEndGlobal)
      window.removeEventListener("touchcancel", handleTouchEndGlobal)
    }
  }, [isSeeking, calculateSeekPosition])

  // Skip forward/backward
  const handleSkip = useCallback((seconds: number) => {
    if (!playerRef.current) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    playerRef.current.seekTo(newTime, "seconds")
  }, [currentTime, duration])

  // Handle tap on mobile:
  // - single tap  → show/hide controls
  // - double tap  → seek -10s (left) or +10s (right)
  const handleTap = useCallback((e: React.MouseEvent) => {
    if (!isMobile) {
      // Desktop: simple click to play/pause
      setIsPlaying((p) => !p)
      return
    }

    const now = Date.now()
    const clientX = e.clientX
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const timeDiff = now - lastTapRef.current.time
    const isDoubleTap = timeDiff < 300

    if (isDoubleTap) {
      // Cancel the pending single-tap action
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current)
        singleTapTimerRef.current = null
      }
      // Seek left or right
      const isLeftSide = clientX < rect.left + rect.width / 2
      handleSkip(isLeftSide ? -10 : 10)
      setDoubleTapSide(isLeftSide ? "left" : "right")
      setTimeout(() => setDoubleTapSide(null), 600)
      // Reset so a 3rd tap doesn't re-trigger double tap
      lastTapRef.current = { time: 0, x: 0 }
    } else {
      // Record this tap and wait to see if a second tap comes
      lastTapRef.current = { time: now, x: clientX }
      singleTapTimerRef.current = setTimeout(() => {
        // No second tap arrived — it's a real single tap: toggle controls
        setShowControls((s) => !s)
        singleTapTimerRef.current = null
      }, 300)
    }
  }, [isMobile, handleSkip])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // Fullscreen may not be available in all contexts (e.g., iframes)
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          setIsPlaying((p) => !p)
          break
        case "ArrowLeft":
          e.preventDefault()
          handleSkip(-10)
          break
        case "ArrowRight":
          e.preventDefault()
          handleSkip(10)
          break
        case "ArrowUp":
          e.preventDefault()
          setVolume((v) => Math.min(1, v + 0.1))
          break
        case "ArrowDown":
          e.preventDefault()
          setVolume((v) => Math.max(0, v - 0.1))
          break
        case "m":
          setIsMuted((m) => !m)
          break
        case "f":
          toggleFullscreen()
          break
        case "Escape":
          if (onClose && !isFullscreen) {
            onClose()
          }
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSkip, toggleFullscreen, onClose, isFullscreen])

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {
          // Fullscreen may not be available in all contexts (e.g., iframes)
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current)
    }
  }, [])

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
        setShowControls(false)
        setShowQualityMenu(false)
        setShowPlaybackMenu(false)
        setShowSubtitleMenu(false)
      }}
    >
      {/* React Player */}
      <div className="absolute inset-0">
        {currentUrl && (
          <ReactPlayer
            ref={playerRef}
            url={currentUrl}
            playing={isPlaying && !hasError}
            muted={isMuted}
            volume={volume}
            playbackRate={playbackRate}
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
            onReady={handleReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onProgress={handleProgress}
            onDuration={setDuration}
            onEnded={onEnded}
            onError={handleError}
            progressInterval={500}
            config={{
              file: {
                attributes: {
                  crossOrigin: "anonymous",
                  playsInline: true,
                  poster: poster,
                },
                tracks: subtitles.map((sub) => ({
                  kind: "subtitles" as const,
                  src: sub.src,
                  srcLang: sub.language,
                  label: sub.label,
                  default: selectedSubtitle === sub.id,
                })),
                forceVideo: true,
              },
            }}
          />
        )}
      </div>

      {/* Click/tap overlay — single tap toggles controls (mobile), click plays/pauses (desktop), double tap seeks (mobile) */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleTap}
      />

      {/* Double-tap seek indicator */}
      {doubleTapSide && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none",
            doubleTapSide === "left" ? "left-[15%]" : "right-[15%]"
          )}
        >
          <div className="flex flex-col items-center gap-1 animate-pulse">
            <div className="flex items-center gap-0.5">
              {doubleTapSide === "left" ? (
                <>
                  <SkipBack className="h-8 w-8 text-white" />
                  <SkipBack className="h-8 w-8 text-white/50" />
                </>
              ) : (
                <>
                  <SkipForward className="h-8 w-8 text-white/50" />
                  <SkipForward className="h-8 w-8 text-white" />
                </>
              )}
            </div>
            <span className="text-white text-sm font-bold">10s</span>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-[100] flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-3 sm:pt-4 pb-12 sm:pb-16 px-3 sm:px-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {onClose && (
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          )}
          <h2 className="text-sm sm:text-lg font-medium text-white truncate">{title}</h2>
        </div>

        {/* Desktop: individual buttons | Mobile: single settings button */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile: Single settings button */}
          {isMobile && (
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Settings className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Desktop: Individual menu buttons */}
          {!isMobile && (
            <>
              {/* Subtitles Menu */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubtitleMenu(!showSubtitleMenu)
                      setShowQualityMenu(false)
                      setShowPlaybackMenu(false)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span className="text-sm text-white font-medium">CC</span>
                  </button>

                  {showSubtitleMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden z-[150]">
                      <div className="py-1 max-h-60 overflow-y-auto">
                        <div className="px-4 py-2 text-xs text-white/50 font-medium uppercase tracking-wider border-b border-white/10">
                          Subtitles
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSubtitle(null)
                            setShowSubtitleMenu(false)
                          }}
                          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span className="text-sm text-white">Off</span>
                          {selectedSubtitle === null && <Check className="h-4 w-4 text-primary" />}
                        </button>
                        {subtitles.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedSubtitle(sub.id)
                              setShowSubtitleMenu(false)
                            }}
                            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors"
                          >
                            <span className="text-sm text-white">{sub.label}</span>
                            {selectedSubtitle === sub.id && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPlaybackMenu(!showPlaybackMenu)
                    setShowQualityMenu(false)
                    setShowSubtitleMenu(false)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm text-white font-medium">{playbackRate}x</span>
                </button>

                {showPlaybackMenu && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-neutral-900/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden z-[150]">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-white/50 font-medium uppercase tracking-wider border-b border-white/10">
                        Speed
                      </div>
                      {playbackRates.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate)
                            setShowPlaybackMenu(false)
                          }}
                          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span className="text-sm text-white">{rate}x</span>
                          {playbackRate === rate && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Selector */}
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu)
                      setShowPlaybackMenu(false)
                      setShowSubtitleMenu(false)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">{selectedQuality}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-neutral-900/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden z-[150]">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-white/50 font-medium uppercase tracking-wider border-b border-white/10">
                          Quality
                        </div>
                        {sources.map((source) => (
                          <button
                            key={source.quality}
                            onClick={() => handleQualityChange(source.quality)}
                            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors"
                          >
                            <span className="text-sm text-white">{source.quality}</span>
                            {selectedQuality === source.quality && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Settings Panel (Bottom Sheet) */}
      {isMobile && showSettingsPanel && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          onClick={() => setShowSettingsPanel(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-h-[70vh] overflow-y-auto rounded-t-3xl p-4 pb-8 animate-in slide-in-from-bottom duration-300"
            style={{
              background: "oklch(0.12 0.03 255 / 0.98)",
              backdropFilter: "blur(32px)",
              border: "1px solid oklch(0.7 0.05 240 / 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            
            <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
            
            {/* Quality Section */}
            {sources.length > 1 && (
              <div className="mb-4">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Quality</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <button
                      key={source.quality}
                      onClick={() => { handleQualityChange(source.quality); setShowSettingsPanel(false) }}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        selectedQuality === source.quality
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {source.quality}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Playback Speed Section */}
            <div className="mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Playback Speed</p>
              <div className="flex flex-wrap gap-2">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => { setPlaybackRate(rate); setShowSettingsPanel(false) }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      playbackRate === rate
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
            
            {/* Subtitles Section */}
            {subtitles.length > 0 && (
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Subtitles</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedSubtitle(null); setShowSettingsPanel(false) }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      selectedSubtitle === null
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    Off
                  </button>
                  {subtitles.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubtitle(sub.id); setShowSettingsPanel(false) }}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        selectedSubtitle === sub.id
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 sm:pt-16 pb-3 sm:pb-4 px-3 sm:px-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Time display above progress bar on mobile */}
        {isMobile && (
          <div className="flex items-center justify-between text-xs text-white/80 mb-1 px-0.5">
            <span className="font-medium tabular-nums">{formatTime(currentTime)}</span>
            <span className="font-medium tabular-nums">{formatTime(duration)}</span>
          </div>
        )}

        {/* Progress Bar - larger touch target on mobile */}
        <div
          ref={progressRef}
          className={cn(
            "relative cursor-pointer group",
            isMobile ? "py-4 mb-1" : "py-3 mb-2"
          )}
          onMouseDown={handleSeekMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Visual progress bar */}
          <div className={cn(
            "relative bg-white/20 rounded-full transition-all",
            isSeeking ? "h-2.5" : isMobile ? "h-2" : "h-1.5 group-hover:h-2"
          )}>
            {/* Loaded progress */}
            <div
              className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
              style={{ width: `${loaded * 100}%` }}
            />
            {/* Played progress */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${played * 100}%` }}
            />
            {/* Seek handle - larger on mobile */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg transition-transform border-2 border-primary",
                isMobile ? "w-5 h-5" : "w-4 h-4",
                isSeeking ? "scale-125" : "scale-100 group-hover:scale-110"
              )}
              style={{ left: `calc(${played * 100}% - ${isMobile ? 10 : 8}px)` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Play/Pause - larger touch target */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 sm:p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
              ) : (
                <Play className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white" />
              )}
            </button>

            {/* Skip buttons - hidden on very small mobile, visible on larger */}
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors hidden xs:flex"
            >
              <SkipBack className="h-5 w-5 text-white" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors hidden xs:flex"
            >
              <SkipForward className="h-5 w-5 text-white" />
            </button>

            {/* Volume - hide on mobile (use device volume) */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value))
                    setIsMuted(false)
                  }}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            )}

            {/* Time Display - hidden on mobile (shown above progress bar) */}
            {!isMobile && (
              <span className="text-white text-sm font-medium ml-2 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
              ) : (
                <Maximize className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Next Episode Button - responsive positioning */}
      {showNextEpisode && nextEpisode && (
        <div
          className={cn(
            "absolute z-[100] transition-all duration-300",
            isMobile ? "bottom-28 right-3 left-3" : "bottom-24 right-4",
            showControls ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
          )}
        >
          <button
            onClick={nextEpisode.onPlay}
            className={cn(
              "flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:scale-105 active:scale-95",
              isMobile ? "w-full px-4 py-3 text-sm" : "px-5 py-3 text-sm"
            )}
          >
            <span className="truncate">Next: {nextEpisode.title}</span>
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Center Play Button (when paused) - responsive size */}
      {!isPlaying && !isBuffering && !hasError && isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className={cn(
            "rounded-full bg-primary/90 flex items-center justify-center shadow-2xl",
            isMobile ? "w-16 h-16" : "w-20 h-20"
          )}>
            <Play className={cn("text-white fill-white ml-1", isMobile ? "h-8 w-8" : "h-10 w-10")} />
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 gap-4 p-8">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <p className="text-white text-lg font-medium text-center max-w-md">{errorMessage}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            {sources.length > 1 && (
              <button
                onClick={() => {
                  setShowControls(true)
                  setShowQualityMenu(true)
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors"
              >
                <Settings className="h-4 w-4" />
                Try Different Quality
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ad Overlay */}
      <VideoAdOverlay />

      {/* Loading Indicator (initial load) */}
      {!isReady && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-white/60 text-sm">Loading player...</p>
        </div>
      )}
    </div>
  )
}
