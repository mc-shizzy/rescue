"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WatchedBadgeProps {
  size?: "sm" | "md" | "lg"
  className?: string
  showText?: boolean
}

export function WatchedBadge({ size = "md", className, showText = false }: WatchedBadgeProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
        )}
        style={{
          background: "linear-gradient(135deg, oklch(0.65 0.2 145) 0%, oklch(0.55 0.2 160) 100%)",
          boxShadow: "0 2px 8px oklch(0.6 0.2 145 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.2)",
        }}
      >
        <Check className={cn(iconSizes[size], "text-white")} strokeWidth={3} />
      </div>
      {showText && (
        <span className="text-xs font-semibold text-green-400">Watched</span>
      )}
    </div>
  )
}

interface EpisodeWatchedBadgeProps {
  watched: boolean
  size?: "sm" | "md"
}

export function EpisodeWatchedBadge({ watched, size = "sm" }: EpisodeWatchedBadgeProps) {
  if (!watched) return null

  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full",
        "backdrop-blur-md"
      )}
      style={{
        background: "oklch(0.6 0.2 145 / 0.2)",
        border: "1px solid oklch(0.6 0.2 145 / 0.4)",
      }}
    >
      <Check className="h-3 w-3 text-green-400" strokeWidth={3} />
      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
        Watched
      </span>
    </div>
  )
}
