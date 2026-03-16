import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Heart, Sparkles } from "lucide-react"

// Official WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

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
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="glass p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              {/* WhatsApp with official logo */}
              <a
                href="https://whatsapp.com/channel/0029Vb7KseUKGGGOTKZv1A0G"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-2.5 rounded-full hover:border-primary/30 transition-all duration-200 hover:scale-110"
                aria-label="WhatsApp Community"
                style={{ color: "#25D366" }}
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
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
