"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface SplashScreenProps {
  isLoading?: boolean
}

export function SplashScreen({ isLoading = false }: SplashScreenProps) {
  const [phase, setPhase] = useState<
    "init" | "reveal" | "logo" | "brand" | "ready" | "exit" | "done"
  >("init")
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("reveal"), 100)
    const t1 = setTimeout(() => setPhase("logo"), 600)
    const t2 = setTimeout(() => setPhase("brand"), 1200)
    const t3 = setTimeout(() => setPhase("ready"), 2000)
    const t4 = setTimeout(() => setMinTimeElapsed(true), 2800)
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase !== "ready") return
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (isLoading && p >= 85) return p
        if (!isLoading && p >= 100) { clearInterval(progressRef.current!); return 100 }
        return p + (isLoading ? Math.random() * 5 + 1 : Math.random() * 12 + 8)
      })
    }, 80)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [phase, isLoading])

  useEffect(() => {
    if (!isLoading && minTimeElapsed && phase === "ready") {
      setProgress(100)
      const t = setTimeout(() => setPhase("exit"), 400)
      return () => clearTimeout(t)
    }
  }, [isLoading, minTimeElapsed, phase])

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => setPhase("done"), 800)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (phase === "done") return null

  const isAfter = (target: string) => {
    const order = ["init", "reveal", "logo", "brand", "ready", "exit"]
    return order.indexOf(phase) >= order.indexOf(target)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
      style={{
        background: "#050510",
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.8s cubic-bezier(0.4,0,0.2,1)" : undefined,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 45%, oklch(0.15 0.12 250 / 0.5) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 30% 60%, oklch(0.12 0.08 280 / 0.3) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 40% 35% at 75% 35%, oklch(0.12 0.06 220 / 0.25) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: phase === "init" ? 1 : 0,
          transition: "opacity 1.5s ease",
          background: "#050510",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: isAfter("logo") ? "200vmax" : "0px",
            height: isAfter("logo") ? "200vmax" : "0px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid oklch(0.4 0.15 245 / 0.08)",
            transition: "width 2.5s cubic-bezier(0.16,1,0.3,1), height 2.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: isAfter("logo") ? "150vmax" : "0px",
            height: isAfter("logo") ? "150vmax" : "0px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid oklch(0.4 0.15 245 / 0.05)",
            transition: "width 2s cubic-bezier(0.16,1,0.3,1) 0.2s, height 2s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          className="relative mb-8"
          style={{
            opacity: isAfter("logo") ? 1 : 0,
            transform: isAfter("logo") ? "translateY(0) scale(1)" : "translateY(20px) scale(0.85)",
            transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "oklch(0.58 0.22 245 / 0.4)",
              filter: "blur(40px)",
              transform: "scale(1.8)",
              animation: isAfter("logo") ? "sp-glow 3s ease-in-out infinite" : undefined,
            }}
          />

          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 0 0 1px oklch(0.5 0.15 245 / 0.3), 0 20px 60px oklch(0.2 0.15 250 / 0.5)",
            }}
          >
            <Image
              src="/hf-logo.png"
              alt="HANDYFLIX"
              width={80}
              height={80}
              priority
              className="rounded-2xl"
            />
          </div>
        </div>

        <div
          className="flex items-baseline select-none overflow-hidden"
          style={{
            opacity: isAfter("brand") ? 1 : 0,
            transition: "opacity 0.6s ease 0.1s",
          }}
        >
          <span
            className="font-black"
            style={{
              fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
              letterSpacing: "-0.05em",
              color: "oklch(0.58 0.22 245)",
              textShadow: "0 0 80px oklch(0.58 0.22 245 / 0.5), 0 0 30px oklch(0.58 0.22 245 / 0.3)",
              transform: isAfter("brand") ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
              display: "inline-block",
            }}
          >
            HANDY
          </span>
          <span
            className="font-black"
            style={{
              fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
              letterSpacing: "-0.06em",
              color: "oklch(0.97 0.005 240)",
              textShadow: "0 0 40px oklch(1 0 0 / 0.15)",
              transform: isAfter("brand") ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s",
              display: "inline-block",
            }}
          >
            FLIX
          </span>
        </div>

        <div
          className="overflow-hidden mt-3"
          style={{
            opacity: isAfter("brand") ? 1 : 0,
            transition: "opacity 0.5s ease 0.5s",
          }}
        >
          <p
            style={{
              fontSize: "clamp(0.6rem, 1.3vw, 0.75rem)",
              letterSpacing: "0.35em",
              color: "oklch(0.45 0.04 250)",
              textTransform: "uppercase",
              fontWeight: 500,
              transform: isAfter("brand") ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s",
            }}
          >
            Watch Without Limits
          </p>
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            width: "clamp(160px, 28vw, 240px)",
            opacity: isAfter("ready") ? 1 : 0,
            transform: isAfter("ready") ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-full"
            style={{
              height: "2px",
              background: "oklch(0.2 0.04 255 / 0.4)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: "linear-gradient(90deg, oklch(0.5 0.2 250), oklch(0.65 0.22 235))",
                boxShadow: "0 0 12px oklch(0.58 0.22 245 / 0.8)",
                transition: "width 0.15s ease-out",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.3) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s linear infinite",
              }}
            />
          </div>
          <p
            className="text-center mt-3 font-mono"
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.3em",
              color: "oklch(0.35 0.03 250)",
              transition: "color 0.3s ease",
            }}
          >
            {progress >= 100 ? "READY" : "LOADING"}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-6"
        style={{
          opacity: isAfter("ready") ? 1 : 0,
          transition: "opacity 0.6s ease 0.3s",
        }}
      >
        {["HD", "4K", "HDR"].map((tag, i) => (
          <span
            key={tag}
            className="font-mono"
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: "oklch(0.3 0.04 250)",
              opacity: isAfter("ready") ? 1 : 0,
              transform: isAfter("ready") ? "translateY(0)" : "translateY(8px)",
              transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.1}s`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
