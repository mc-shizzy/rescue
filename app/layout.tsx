import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "HANDYFLIX - Stream Movies & TV Shows Online Free | Best Streaming Website",
    template: "%s | HANDYFLIX",
  },
  description:
    "HANDYFLIX is the best free streaming website to watch unlimited movies and TV shows online. Stream HD content anytime, anywhere. No subscription required. Watch the latest releases, trending series, and classic films.",
  keywords: [
    "HandyFlix",
    "Handy Flix",
    "handy flix",
    "handyflix",
    "HANDYFLIX",
    "streaming website",
    "free streaming",
    "watch movies online",
    "watch TV shows online",
    "free movies",
    "HD streaming",
    "movie streaming site",
    "TV series streaming",
    "watch films online",
    "streaming platform",
    "online movies free",
    "best streaming site",
    "watch series online",
    "stream movies free",
    "movie website",
  ],
  authors: [{ name: "HANDYFLIX" }],
  creator: "HANDYFLIX",
  publisher: "HANDYFLIX",
  applicationName: "HANDYFLIX",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "Entertainment",
  classification: "Streaming Service",
  metadataBase: new URL("https://freehandyflix.online"),

  // Open Graph for social sharing - using absolute URLs
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://freehandyflix.online",
    siteName: "HANDYFLIX",
    title: "HANDYFLIX - Stream Movies & TV Shows Online Free",
    description:
      "Watch unlimited movies and TV shows online for free. HANDYFLIX offers HD streaming of the latest releases, trending series, and classic films. No subscription required.",
    images: [
      {
        url: "https://freehandyflix.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "HANDYFLIX - Free Movie & TV Show Streaming",
        type: "image/png",
      },
      {
        url: "https://freehandyflix.online/logo.png",
        width: 512,
        height: 512,
        alt: "HANDYFLIX Logo",
        type: "image/png",
      },
    ],
  },

  // Twitter Card - using absolute URLs
  twitter: {
    card: "summary_large_image",
    title: "HANDYFLIX - Stream Movies & TV Shows Online Free",
    description: "Watch unlimited movies and TV shows online for free. HD streaming, no subscription required.",
    images: ["https://freehandyflix.online/og-image.png"],
    creator: "@handyflix",
    site: "@handyflix",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your actual verification codes)
  verification: {
    google: "your-google-verification-code",
  },

  // Alternate languages
  alternates: {
    canonical: "https://freehandyflix.online",
    languages: {
      "en-US": "https://freehandyflix.online",
    },
  },

  // Icons - updated paths
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // Additional meta
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "HANDYFLIX",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#e50914",
    "msapplication-tap-highlight": "no",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HANDYFLIX",
  alternateName: ["Handy Flix", "HandyFlix", "handy flix", "handyflix", "FreeHandyFlix", "Free HandyFlix"],
  url: "https://freehandyflix.online",
  description: "Stream unlimited movies and TV shows online for free. HD quality, no subscription required.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://freehandyflix.online/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "HANDYFLIX",
    logo: {
      "@type": "ImageObject",
      url: "https://freehandyflix.online/logo.png",
      width: 512,
      height: 512,
    },
  },
  image: "https://freehandyflix.online/og-image.png",
  sameAs: [],
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HANDYFLIX",
  alternateName: ["Handy Flix", "HandyFlix", "handy flix", "FreeHandyFlix", "Free HandyFlix", "freehandyflix"],
  url: "https://freehandyflix.online",
  logo: "https://freehandyflix.online/logo.png",
  image: "https://freehandyflix.online/og-image.png",
  description: "HANDYFLIX is a free streaming platform offering movies and TV shows in HD quality.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
}

const videoStreamingJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HANDYFLIX",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  image: "https://freehandyflix.online/og-image.png",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "15000",
    bestRating: "5",
    worstRating: "1",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoStreamingJsonLd) }} />
      </head>
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {/* Adsterra Social Bar */}
        <script async src="https://wayanatomyunavailable.com/7b/df/c9/7bdfc9c3bd15887176bd1cee393e65a4.js" />
        <Analytics />
      </body>
    </html>
  )
}
