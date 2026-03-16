import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Heart, Sparkles, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06]">
      <div className="glass-card">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-12 py-10">

          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
                <Image
                  src="/hf-logo.png"
                  alt="HANDYFLIX"
                  width={40}
                  height={40}
                  className="relative rounded-xl opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight">
                  <span className="text-primary">HANDY</span>
                  <span className="text-foreground">FLIX</span>
                </span>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Pour la communaute haitienne — Films & Series en Francais
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {[
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Twitter, label: "Twitter", href: "#" },
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Youtube, label: "YouTube", href: "#" },
                { Icon: MessageCircle, label: "WhatsApp Community", href: "https://whatsapp.com/channel/0029Vb7KseUKGGGOTKZv1A0G", isWhatsApp: true },
              ].map(({ Icon, label, href, isWhatsApp }) => (
                <a
                  key={label}
                  href={href}
                  target={isWhatsApp ? "_blank" : undefined}
                  rel={isWhatsApp ? "noopener noreferrer" : undefined}
                  className="glass p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                  aria-label={label}
                  style={isWhatsApp ? { color: "oklch(0.7 0.18 155 / 0.9)" } : {}}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Minimal links row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs mb-8">
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
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-xl px-4 py-3 mb-8 text-[11px] text-muted-foreground/60 leading-relaxed"
            style={{
              background: "oklch(0.12 0.025 255 / 0.5)",
              border: "1px solid oklch(0.7 0.05 240 / 0.07)",
            }}
          >
            HANDYFLIX does not host or store any video files. All content is sourced through unofficial third-party APIs and publicly available embeds. We are not affiliated with any studio or broadcaster. Content is intended for the Haitian community and is primarily available in French and Haitian Creole.
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-6" />

          {/* Credits */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Created with</span>
              <Heart className="h-3 w-3 text-primary fill-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">by</span>
              <span
                className="text-sm font-semibold bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.58 0.22 245), oklch(0.75 0.18 210), oklch(0.58 0.22 245))" }}
              >
                Andy Mrlit
              </span>
            </div>
            <span className="hidden sm:block text-muted-foreground/20">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">In collaboration with</span>
              <Sparkles className="h-3 w-3 text-primary/70" />
              <span
                className="text-sm font-semibold bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
                style={{ backgroundImage: "linear-gradient(90deg, oklch(0.65 0.18 210), oklch(0.75 0.15 240), oklch(0.65 0.18 210))" }}
              >
                Infos Partage
              </span>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/50">
            &copy; 2026 HANDYFLIX. All rights reserved. &mdash;{" "}
            <Link href="/terms" className="hover:text-muted-foreground transition-colors">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
