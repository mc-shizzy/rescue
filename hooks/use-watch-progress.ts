"use client"

import { useCallback, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"

interface WatchProgressData {
  contentId: string
  contentType: "movie" | "series"
  contentTitle: string
  contentPoster?: string
  season?: number | null
  episode?: number | null
  episodeTitle?: string | null
  progressSeconds: number
  durationSeconds: number
}

interface UseWatchProgressOptions {
  throttleMs?: number
  minWatchTime?: number // Minimum seconds before saving
}

export function useWatchProgress(options: UseWatchProgressOptions = {}) {
  const { throttleMs = 30000, minWatchTime = 300 } = options // 30 seconds throttle, 5 min minimum
  const { data: session } = useSession()
  const lastSaveTime = useRef<number>(0)
  const pendingData = useRef<WatchProgressData | null>(null)
  const isSaving = useRef(false)

  const saveProgress = useCallback(async (data: WatchProgressData) => {
    if (!session?.user) return
    if (data.progressSeconds < minWatchTime) return

    try {
      isSaving.current = true
      await fetch("/api/user/watch-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Failed to save watch progress:", error)
    } finally {
      isSaving.current = false
    }
  }, [session, minWatchTime])

  const throttledSave = useCallback((data: WatchProgressData) => {
    if (!session?.user) return
    
    pendingData.current = data

    const now = Date.now()
    const timeSinceLastSave = now - lastSaveTime.current

    if (timeSinceLastSave >= throttleMs && !isSaving.current) {
      lastSaveTime.current = now
      saveProgress(data)
    }
  }, [session, throttleMs, saveProgress])

  // Save on unmount if there's pending data
  useEffect(() => {
    return () => {
      if (pendingData.current && session?.user) {
        // Use sendBeacon for reliable save on unmount
        const data = pendingData.current
        if (data.progressSeconds >= minWatchTime) {
          navigator.sendBeacon?.(
            "/api/user/watch-progress",
            JSON.stringify(data)
          )
        }
      }
    }
  }, [session, minWatchTime])

  const getProgress = useCallback(async (
    contentId: string,
    season?: number,
    episode?: number
  ): Promise<number | null> => {
    if (!session?.user) return null

    try {
      const params = new URLSearchParams({ contentId })
      if (season !== undefined) params.append("season", String(season))
      if (episode !== undefined) params.append("episode", String(episode))

      const res = await fetch(`/api/user/watch-progress?${params}`)
      if (!res.ok) return null

      const { progress } = await res.json()
      return progress?.progressSeconds || null
    } catch {
      return null
    }
  }, [session])

  const getContinueWatching = useCallback(async (limit = 10) => {
    if (!session?.user) return []

    try {
      const res = await fetch(`/api/user/watch-progress?incomplete=true&limit=${limit}`)
      if (!res.ok) return []

      const { progress } = await res.json()
      return progress || []
    } catch {
      return []
    }
  }, [session])

  const isWatched = useCallback(async (
    contentId: string,
    season?: number,
    episode?: number
  ): Promise<boolean> => {
    if (!session?.user) return false

    try {
      const params = new URLSearchParams({ contentId })
      if (season !== undefined) params.append("season", String(season))
      if (episode !== undefined) params.append("episode", String(episode))

      const res = await fetch(`/api/user/watch-progress?${params}`)
      if (!res.ok) return false

      const { progress } = await res.json()
      return progress?.completed || false
    } catch {
      return false
    }
  }, [session])

  return {
    saveProgress: throttledSave,
    forceSave: saveProgress,
    getProgress,
    getContinueWatching,
    isWatched,
    isAuthenticated: !!session?.user,
  }
}
