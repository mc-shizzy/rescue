"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bookmark, Flame, Home, Sparkles, X, Download, Smartphone, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home",       href: "/",        icon: Home },
  { label: "Trending",   href: "/#trending", icon: Flame },
  { label: "New",        href: "/#new",    icon: Sparkles },
  { label: "My List",    href: "/my-list",  icon: Bookmark },
]

function AppComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 pb-28 sm:pb-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "oklch(0.10 0.02 20 / 0.97)",
          backdropFilter: "blur(48px) saturate(200%)",
          border: "1px solid oklch(0.62 0.25 25 / 0.15)",
          boxShadow: "0 0 0 1px oklch(0 0 0 / 0.4), 0 40px 100px oklch(0 0 0 / 0.7), 0 0 60px oklch(0.62 0.25 25 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
        <div
          className="mx-auto mb-6 w-18 h-18 rounded-2xl flex items-center justify-center relative"
          style={{ background: "oklch(0.62 0.25 25 / 0.12)", border: "1px solid oklch(0.62 0.25 25 / 0.3)" }}
        >
          <div className="absolute inset-0 rounded-2xl blur-2xl" style={{ background: "oklch(0.62 0.25 25 / 0.25)" }} />
          <Rocket className="relative h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">App Coming Soon</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7">
          {"We're building the HANDYFLIX mobile experience. Stay tuned for something amazing."}
        </p>
        <div className="flex items-center justify-center gap-3 mb-7">
          {["iOS", "Android"].map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground"
              style={{ background: "oklch(0.14 0.02 20 / 0.8)", border: "1px solid oklch(0.62 0.25 25 / 0.08)" }}
            >
              <Smartphone className="h-4 w-4" />
              {p}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="btn-primary w-full py-4 rounded-2xl text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export function Navbar() {
  const [showAppModal, setShowAppModal] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60)
    } else {
      setSearchQuery("")
    }
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen((v) => !v) }
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      {showAppModal && <AppComingSoonModal onClose={() => setShowAppModal(false)} />}

      {/* Search overlay — fullscreen dimmed */}
      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-end justify-center p-4 pb-28 transition-all duration-400",
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSearchOpen(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <form
          onSubmit={handleSearchSubmit}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative z-10 w-full max-w-xl flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
            searchOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
          )}
          style={{
            background: "oklch(0.10 0.02 20 / 0.98)",
            backdropFilter: "blur(40px)",
            border: "1px solid oklch(0.62 0.25 25 / 0.15)",
            boxShadow: "0 25px 80px oklch(0 0 0 / 0.6), 0 0 50px oklch(0.62 0.25 25 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.08)",
          }}
        >
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, series, genres..."
            className="flex-1 bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground/50 bg-muted/30 border border-border/30">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Bottom floating pill navbar */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={cn(
            "pointer-events-auto flex items-center gap-1.5 p-2 rounded-[26px] transition-all duration-500",
            scrolled && "scale-[0.98]"
          )}
          style={{
            background: "oklch(0.08 0.015 20 / 0.9)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid oklch(0.62 0.25 25 / 0.1)",
            boxShadow:
              "0 0 0 1px oklch(0 0 0 / 0.3), 0 12px 40px oklch(0 0 0 / 0.5), 0 0 80px oklch(0.62 0.25 25 / 0.05), inset 0 1px 0 oklch(1 0 0 / 0.06)",
          }}
        >
          {/* Logo pill */}
          <Link
            href="/"
            className="flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-[20px] transition-all duration-300 hover:bg-primary/5 group"
          >
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: "oklch(0.62 0.25 25 / 0.5)" }}
              />
              <Image
                src="/hf-logo.png"
                alt="HANDYFLIX"
                width={30}
                height={30}
                className="relative rounded-xl"
                priority
              />
            </div>
            <div className="flex flex-col leading-none gap-[2px]">
              <span className="text-[14px] font-black tracking-tight leading-none">
                <span className="text-primary">HANDY</span>
                <span className="text-foreground">FLIX</span>
              </span>
              <span className="text-[8px] text-muted-foreground/50 tracking-wide font-medium leading-none hidden sm:block">
                by Andy Mrlit &amp; Infos Partage
              </span>
            </div>
          </Link>

          {/* Separator */}
          <div className="w-px h-7 mx-1" style={{ background: "oklch(0.62 0.25 25 / 0.08)" }} />

          {/* Nav items */}
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]))
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-14 sm:w-auto sm:flex-row sm:gap-2 sm:px-4 py-2.5 rounded-[18px] text-[10px] sm:text-[12px] font-semibold transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                )}
                style={
                  isActive
                    ? {
                        background: "oklch(0.62 0.25 25 / 0.12)",
                        boxShadow: "0 0 25px oklch(0.62 0.25 25 / 0.2), inset 0 1px 0 oklch(0.62 0.25 25 / 0.12)",
                      }
                    : {}
                }
              >
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-[18px] pointer-events-none"
                    style={{ border: "1px solid oklch(0.62 0.25 25 / 0.25)" }}
                  />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "drop-shadow-[0_0_8px_oklch(0.62_0.25_25/0.5)]")} />
                <span className="sm:inline">{label}</span>
              </Link>
            )
          })}

          {/* Separator */}
          <div className="w-px h-7 mx-1" style={{ background: "oklch(0.62 0.25 25 / 0.08)" }} />

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-14 sm:w-auto sm:flex-row sm:gap-2 sm:px-4 py-2.5 rounded-[18px] text-[10px] sm:text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all duration-300"
            aria-label="Search"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search</span>
          </button>

          {/* Get App */}
          <button
            onClick={() => setShowAppModal(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-14 sm:w-auto sm:flex-row sm:gap-2 sm:px-4 py-2.5 rounded-[18px] text-[10px] sm:text-[12px] font-semibold text-primary hover:bg-primary/10 transition-all duration-300"
            aria-label="Get App"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Get App</span>
          </button>
        </nav>
      </div>

      {/* Safe-area spacer */}
      <div className="h-24" aria-hidden />
    </>
  )
}
