"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface SplashScreenProps {
  isLoading?: boolean
}

// Deterministic pseudo-random particles to avoid hydration mismatch
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: ((i * 73 + 17) % 97),
  top: ((i * 37 + 53) % 100),
  size: ((i * 11 + 3) % 3) + 2,
  delay: ((i * 0.23) % 4),
  duration: ((i * 0.31) % 3) + 3,
}))

const RINGS = [0, 1, 2]

export function SplashScreen({ isLoading = false }: SplashScreenProps) {
  const [phase, setPhase] = useState<
    "bars-in" | "bars-out" | "logo-in" | "brand" | "tagline" | "progress" | "exiting" | "done"
  >("bars-in")
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("bars-out"),   400)
    const t2 = setTimeout(() => setPhase("logo-in"),    900)
    const t3 = setTimeout(() => setPhase("brand"),      1300)
    const t4 = setTimeout(() => setPhase("tagline"),    1900)
    const t5 = setTimeout(() => setPhase("progress"),   2200)
    const t6 = setTimeout(() => setMinTimeElapsed(true), 2600)
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase !== "progress") return
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (isLoading && p >= 80) return p
        if (!isLoading && p >= 100) { clearInterval(progressRef.current!); return 100 }
        return p + (isLoading ? Math.random() * 6 : Math.random() * 14 + 6)
      })
    }, 100)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [phase, isLoading])

  useEffect(() => {
    if (!isLoading && minTimeElapsed && phase === "progress") {
      setProgress(100)
      const t = setTimeout(() => setPhase("exiting"), 300)
      return () => clearTimeout(t)
    }
  }, [isLoading, minTimeElapsed, phase])

  useEffect(() => {
    if (phase === "exiting") {
      const t = setTimeout(() => setPhase("done"), 700)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (phase === "done") return null

  const isExiting = phase === "exiting"
  const showLogo   = ["logo-in","brand","tagline","progress","exiting"].includes(phase)
  const showBrand  = ["brand","tagline","progress","exiting"].includes(phase)
  const showTagline= ["tagline","progress","exiting"].includes(phase)
  const showProgress = ["progress","exiting"].includes(phase)
  const barsIn     = phase === "bars-in"
  const barsOut    = phase === "bars-out" || showLogo

  return (
    <div
      className="fixed inset-0 z-[300] overflow-hidden"
      style={{
        background: "oklch(0.04 0.01 15)",
        animation: isExiting ? "splash-exit 0.7s cubic-bezier(0.4,0,0.2,1) forwards" : undefined,
      }}
    >
      {/* Grain/noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
          opacity: 0.5,
          animation: "noise-drift 0.15s steps(2) infinite",
          mixBlendMode: "overlay",
        }}
      />

      {/* Deep ambient red glow pools */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "80vw", height: "80vw",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.45 0.22 25 / 0.2) 0%, transparent 60%)",
          filter: "blur(100px)",
          animation: "glow-pulse 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60vw", height: "60vw",
          bottom: "-15%", right: "-10%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.35 0.18 20 / 0.15) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "glow-pulse 7s ease-in-out infinite 1.5s",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "40vw", height: "40vw",
          top: "10%", left: "5%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.3 0.15 30 / 0.1) 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "glow-pulse 6s ease-in-out infinite 0.5s",
        }}
      />

      {/* Floating particles — red tinted */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: "oklch(0.62 0.25 25)",
            opacity: 0,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 4}px oklch(0.62 0.25 25 / 0.8)`,
          }}
        />
      ))}

      {/* Scan line sweep — red tinted */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent, oklch(0.62 0.25 25 / 0.3), transparent)",
          animation: "scanline 3.5s linear infinite",
          top: 0,
        }}
      />

      {/* Letterbox bars (cinema effect) */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: "12%",
          background: "oklch(0.02 0.005 15)",
          animation: barsIn
            ? "bar-top-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards"
            : barsOut
            ? "bar-top-out 0.5s cubic-bezier(0.55,0,1,0.45) forwards"
            : undefined,
          transform: barsIn ? "translateY(-100%)" : barsOut ? "translateY(0)" : "translateY(-100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: "12%",
          background: "oklch(0.02 0.005 15)",
          animation: barsIn
            ? "bar-bottom-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards"
            : barsOut
            ? "bar-bottom-out 0.5s cubic-bezier(0.55,0,1,0.45) forwards"
            : undefined,
          transform: barsIn ? "translateY(100%)" : barsOut ? "translateY(0)" : "translateY(100%)",
        }}
      />

      {/* Center stage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">

        {/* Logo icon + expanding rings */}
        {showLogo && (
          <div className="relative flex items-center justify-center mb-7">
            {/* Expanding concentric rings — red */}
            {RINGS.map((r) => (
              <div
                key={r}
                className="absolute rounded-full pointer-events-none border"
                style={{
                  width: 100,
                  height: 100,
                  borderColor: "oklch(0.62 0.25 25 / 0.4)",
                  animation: `ring-expand 2s cubic-bezier(0.2,0.6,0.4,1) ${r * 0.5}s infinite`,
                }}
              />
            ))}

            {/* Bloom glow behind logo — red */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 160,
                height: 160,
                background: "radial-gradient(circle, oklch(0.62 0.25 25 / 0.5) 0%, transparent 70%)",
                filter: "blur(35px)",
                animation: "bloom-in 0.8s cubic-bezier(0.2,0,0,1) forwards",
              }}
            />

            {/* Logo image */}
            <div
              className="relative z-10 rounded-2xl overflow-hidden"
              style={{
                animation: "logo-drop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
                boxShadow: "0 0 50px oklch(0.62 0.25 25 / 0.5), 0 0 0 1px oklch(0.62 0.25 25 / 0.2)",
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
        )}

        {/* Brand wordmark */}
        {showBrand && (
          <div
            className="flex items-baseline gap-0 select-none"
            style={{ lineHeight: 1 }}
          >
            {/* HANDY — red accent */}
            <span
              className="font-black tracking-tighter"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 7rem)",
                color: "oklch(0.62 0.25 25)",
                animation: "text-reveal-ltr 0.7s cubic-bezier(0.4,0,0.2,1) forwards",
                clipPath: "inset(0 100% 0 0)",
                textShadow: "0 0 80px oklch(0.62 0.25 25 / 0.6)",
                letterSpacing: "-0.05em",
                display: "inline-block",
              }}
            >
              HANDY
            </span>

            {/* FLIX — white */}
            <span
              className="font-black"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 7rem)",
                color: "oklch(0.96 0.005 15)",
                animation: "flix-snap 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.5s both",
                opacity: 0,
                letterSpacing: "-0.06em",
                display: "inline-block",
              }}
            >
              FLIX
            </span>
          </div>
        )}

        {/* Tagline */}
        {showTagline && (
          <p
            className="font-sans"
            style={{
              fontSize: "clamp(0.7rem, 1.6vw, 0.85rem)",
              letterSpacing: "0.35em",
              color: "oklch(0.50 0.04 20)",
              textTransform: "uppercase",
              marginTop: "1rem",
              animation: "tagline-up 0.6s cubic-bezier(0.2,0,0,1) forwards",
            }}
          >
            Watch Without Limits
          </p>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div
            style={{
              marginTop: "3rem",
              width: "clamp(200px, 32vw, 280px)",
              animation: "tagline-up 0.5s ease forwards",
            }}
          >
            {/* Track */}
            <div
              className="relative overflow-hidden rounded-full"
              style={{ height: "3px", background: "oklch(0.20 0.04 20 / 0.5)" }}
            >
              {/* Fill — red gradient */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-out"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: "linear-gradient(90deg, oklch(0.50 0.22 30), oklch(0.62 0.25 25))",
                  boxShadow: "0 0 15px oklch(0.62 0.25 25 / 0.9), 0 0 30px oklch(0.62 0.25 25 / 0.4)",
                }}
              />
              {/* Shimmer sweep on fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background:
                    "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.4) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s linear infinite",
                }}
              />
            </div>

            {/* Status label */}
            <p
              className="text-center font-mono mt-3"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                color: "oklch(0.38 0.03 20)",
              }}
            >
              {progress < 100 ? "Loading..." : "Ready"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom signature line */}
      <div
        className="absolute bottom-6 inset-x-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showTagline ? 1 : 0, transition: "opacity 0.5s ease 0.4s" }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            color: "oklch(0.25 0.03 20)",
            textTransform: "uppercase",
          }}
        >
          Stream &bull; Discover &bull; Experience
        </span>
      </div>

      {/* Top-right corner label */}
      <div
        className="absolute top-5 right-6 pointer-events-none"
        style={{ opacity: showBrand ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: "oklch(0.25 0.03 20)",
          }}
        >
          HD &bull; 4K &bull; HDR
        </span>
      </div>
    </div>
  )
}
