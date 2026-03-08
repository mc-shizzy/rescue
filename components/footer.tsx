import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Heart, Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 relative">
      {/* Top gradient border */}
      <div 
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.25 25 / 0.2), transparent)" }}
      />
      
      <div 
        className="relative"
        style={{
          background: "oklch(0.08 0.015 20 / 0.8)",
          backdropFilter: "blur(40px)",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 py-14">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl" 
                  style={{ background: "oklch(0.62 0.25 25 / 0.25)" }} 
                />
                <Image
                  src="/hf-logo.png"
                  alt="HANDYFLIX"
                  width={48}
                  height={48}
                  className="relative rounded-2xl opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">
                  <span className="text-primary">HANDY</span>
                  <span className="text-foreground">FLIX</span>
                </span>
                <p className="text-[12px] text-muted-foreground/60 mt-1">
                  Pour la communaute haitienne — Films & Series en Francais
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Twitter, label: "Twitter", href: "#" },
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Youtube, label: "YouTube", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="p-3 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                  style={{
                    background: "oklch(0.12 0.02 20 / 0.6)",
                    border: "1px solid oklch(0.62 0.25 25 / 0.08)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "oklch(0.62 0.25 25 / 0.15)"
                    e.currentTarget.style.borderColor = "oklch(0.62 0.25 25 / 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "oklch(0.12 0.02 20 / 0.6)"
                    e.currentTarget.style.borderColor = "oklch(0.62 0.25 25 / 0.08)"
                  }}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Minimal links row */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm mb-10">
            {[
              { label: "Home", href: "/" },
              { label: "Browse", href: "/#genres" },
              { label: "My List", href: "/my-list" },
              { label: "Search", href: "/search" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Contact", href: "mailto:contact@freehandyflix.online" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-2xl px-5 py-4 mb-10 text-[12px] text-muted-foreground/50 leading-relaxed"
            style={{
              background: "oklch(0.10 0.02 20 / 0.6)",
              border: "1px solid oklch(0.62 0.25 25 / 0.05)",
            }}
          >
            HANDYFLIX does not host or store any video files. All content is sourced through unofficial third-party APIs and publicly available embeds. We are not affiliated with any studio or broadcaster. Content is intended for the Haitian community and is primarily available in French and Haitian Creole.
          </div>

          {/* Divider */}
          <div 
            className="h-px mb-8" 
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.25 25 / 0.1), transparent)" }} 
          />

          {/* Credits */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Created with</span>
              <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">by</span>
              <span
                className="text-base font-bold bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.62 0.25 25), oklch(0.75 0.18 35), oklch(0.62 0.25 25))" }}
              >
                Andy Mrlit
              </span>
            </div>
            <span className="hidden sm:block text-muted-foreground/20">|</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">In collaboration with</span>
              <Sparkles className="h-4 w-4 text-primary/70" />
              <span
                className="text-base font-bold bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.55 0.18 30), oklch(0.70 0.15 40), oklch(0.55 0.18 30))" }}
              >
                Infos Partage
              </span>
            </div>
          </div>

          <p className="text-center text-[12px] text-muted-foreground/40">
            &copy; 2026 HANDYFLIX. All rights reserved. &mdash;{" "}
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
