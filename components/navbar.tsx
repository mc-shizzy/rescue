"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bookmark, Flame, Home, Sparkles, X, Smartphone, Rocket, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home",      href: "/",          icon: Home },
  { label: "Trending",  href: "/#trending", icon: Flame },
  { label: "New",       href: "/#new",      icon: Sparkles },
  { label: "My List",   href: "/my-list",   icon: Bookmark },
]

function AppComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-7 text-center"
        style={{
          background: "oklch(0.11 0.025 255 / 0.97)",
          backdropFilter: "blur(48px) saturate(180%)",
          border: "1px solid oklch(0.7 0.05 240 / 0.14)",
          boxShadow:
            "0 0 0 1px oklch(0 0 0 / 0.4), 0 40px 100px oklch(0 0 0 / 0.7), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center relative"
          style={{
            background: "oklch(0.58 0.22 245 / 0.12)",
            border: "1px solid oklch(0.58 0.22 245 / 0.28)",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl blur-2xl"
            style={{ background: "oklch(0.58 0.22 245 / 0.2)" }}
          />
          <Rocket className="relative h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-black mb-1.5 tracking-tight">App Coming Soon</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {"We're building the HANDYFLIX mobile experience. Stay tuned."}
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {["iOS", "Android"].map((p) => (
            <div
              key={p}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground"
              style={{
                background: "oklch(0.16 0.03 255 / 0.7)",
                border: "1px solid oklch(0.7 0.05 240 / 0.10)",
              }}
            >
              <Smartphone className="h-3.5 w-3.5" />
              {p}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
          style={{
            background: "oklch(0.58 0.22 245)",
            color: "oklch(1 0 0)",
            boxShadow: "0 4px 24px oklch(0.58 0.22 245 / 0.4)",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export function Navbar() {
  const [showAppModal, setShowAppModal]     = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const router                              = useRouter()
  const pathname                            = usePathname()

  /* ── scroll detection (RAF-throttled) ── */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); router.push("/search") }
      if (e.key === "Escape") { setMobileMenuOpen(false) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router])

  /* ── close mobile menu on route change ── */
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  return (
    <>
      {showAppModal && <AppComingSoonModal onClose={() => setShowAppModal(false)} />}

      {/* ── Mobile menu overlay ── */}
      <div
        className={cn(
          "fixed inset-0 z-[150] lg:hidden transition-all duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <nav
          className="absolute top-16 inset-x-3 rounded-2xl overflow-hidden p-2"
          style={{
            background: "oklch(0.09 0.025 258 / 0.97)",
            backdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid oklch(0.7 0.05 240 / 0.14)",
            boxShadow: "0 24px 64px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.06)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top shine line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]))
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
                )}
                style={isActive ? { background: "oklch(0.58 0.22 245 / 0.12)" } : {}}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}

          <div className="my-1 mx-3 h-px" style={{ background: "oklch(0.7 0.05 240 / 0.08)" }} />

          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200"
          >
            <Search className="h-4 w-4 shrink-0" />
            Search
          </Link>

          {/* Download App — mobile menu */}
          <a
            href="https://github.com/mc-shizzy/Apkhandy-/releases/download/3.0/HandyFlix.apk"
            download
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, oklch(0.5 0.2 245) 0%, oklch(0.42 0.2 265) 100%)",
              color: "white",
              boxShadow: "0 4px 16px oklch(0.5 0.2 250 / 0.25)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Get the App
          </a>
        </nav>
      </div>

      {/* ── Main top header ── */}
      <header
        className="fixed top-0 inset-x-0 z-[100] transition-all duration-300"
        style={{
          background: scrolled
            ? "oklch(0.07 0.025 260 / 0.92)"
            : "oklch(0.07 0.025 260 / 0.0)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid oklch(0.7 0.05 240 / 0.10)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px oklch(0 0 0 / 0.3)" : "none",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Left: Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-70 transition-opacity duration-300"
                  style={{ background: "oklch(0.58 0.22 245 / 0.5)" }}
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
              <div className="flex flex-col leading-none gap-[3px]">
                <span className="text-[15px] font-black tracking-tight leading-none">
                  <span className="text-primary">HANDY</span>
                  <span className="text-foreground">FLIX</span>
                </span>
                <span className="text-[9px] tracking-wide font-semibold leading-none"
                  style={{ color: "oklch(0.58 0.22 245 / 0.55)" }}>
                  by Andy Mrlit &amp; Infos Partage
                </span>
              </div>
            </Link>

            {/* ── Center: Nav links (desktop) ── */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]))
                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
                    )}
                    style={
                      isActive
                        ? {
                            background: "oklch(0.58 0.22 245 / 0.14)",
                            boxShadow: "0 0 20px oklch(0.58 0.22 245 / 0.15), inset 0 1px 0 oklch(0.58 0.22 245 / 0.12)",
                          }
                        : {}
                    }
                  >
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{ border: "1px solid oklch(0.58 0.22 245 / 0.22)" }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/70",
                      )}
                    />
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 inset-x-3 h-[2px] rounded-full"
                        style={{ background: "oklch(0.58 0.22 245 / 0.7)" }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2">

              {/* Search button — navigates to /search */}
              <Link
                href="/search"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all duration-200"
                aria-label="Search"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline text-sm">Search</span>
                <kbd
                  className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-muted-foreground/40"
                  style={{ border: "1px solid oklch(0.7 0.05 240 / 0.12)" }}
                >
                  ⌘K
                </kbd>
              </Link>

              {/* Download App CTA */}
              <a
                href="https://github.com/mc-shizzy/Apkhandy-/releases/download/3.0/HandyFlix.apk"
                download
                className="group relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-95 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.2 245) 0%, oklch(0.42 0.2 265) 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px oklch(0.5 0.2 250 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.12)",
                }}
                aria-label="Download Android App"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="hidden sm:inline">Get App</span>
                <span
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.1) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
              </a>

              {/* Hamburger — mobile */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Spacer so page content starts below the fixed header ── */}
      <div className="h-16" aria-hidden />
    </>
  )
}
