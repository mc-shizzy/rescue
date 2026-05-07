import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const BASE_URL = "https://freehandyflix.online"

export const metadata: Metadata = {
  title: {
    default: "HANDYFLIX — Watch Free Movies & TV Shows Online in HD",
    template: "%s | HANDYFLIX — Free HD Streaming",
  },
  description:
    "HANDYFLIX is your #1 free streaming platform. Watch thousands of movies and TV shows online in HD — no subscription, no ads, no sign-up required. Trending films, full series, action, drama, comedy, sci-fi and more. Stream instantly on any device.",
  keywords: [
    // Brand
    "HANDYFLIX", "HandyFlix", "Handy Flix", "handyflix", "handy flix", "freehandyflix", "FreeHandyFlix",
    // Core intent
    "watch movies online free", "watch TV shows online free", "free streaming website", "free movie streaming",
    "stream movies free", "stream series free", "stream TV shows free", "watch films online no subscription",
    // Quality
    "HD streaming", "1080p streaming", "watch movies in HD free", "HD movies online",
    // Content types
    "movie streaming site", "TV series streaming", "anime streaming", "watch documentaries online",
    "watch action movies free", "watch drama series free", "watch comedy movies online",
    "watch horror movies free", "watch sci-fi movies online", "watch romance movies free",
    // Platform
    "streaming platform free", "best free streaming site 2024", "best free streaming site 2025",
    "Netflix alternative free", "free Netflix", "streaming without subscription",
    // Long-tail
    "watch latest movies online", "watch new releases free", "watch trending movies 2025",
    "full movies online free no sign up", "watch series online all episodes free",
    "free movie website", "legal streaming site", "online cinema free",
    // Location-agnostic intent
    "watch movies now", "best streaming website", "free films online", "binge watch series free",
  ],
  authors: [
    { name: "Andy Mrlit", url: BASE_URL },
    { name: "Infos Partage", url: BASE_URL },
  ],
  creator: "Andy Mrlit & Infos Partage",
  publisher: "HANDYFLIX",
  applicationName: "HANDYFLIX",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "Entertainment",
  classification: "Streaming Service",
  metadataBase: new URL(BASE_URL),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "HANDYFLIX",
    title: "HANDYFLIX — Watch Free Movies & TV Shows Online in HD",
    description:
      "Stream thousands of movies and TV shows for free in HD. No subscription needed. Watch the latest releases, trending series, classics and more — on any device, anytime.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "HANDYFLIX — Free HD Movie & TV Show Streaming",
        type: "image/png",
      },
      {
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "HANDYFLIX Logo",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HANDYFLIX — Watch Free Movies & TV Shows Online in HD",
    description:
      "Stream thousands of movies and TV shows for free in HD. No subscription. Watch now on HANDYFLIX.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@handyflix",
    site: "@handyflix",
  },

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

  verification: {
    google: "your-google-verification-code",
  },

  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-US": BASE_URL,
      "fr-FR": BASE_URL,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },

  manifest: "/manifest.json",

  other: {
    // PWA
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "HANDYFLIX",
    "format-detection": "telephone=no",
    // MS
    "msapplication-TileColor": "#070d1a",
    "msapplication-TileImage": "/icon-192x192.png",
    "msapplication-tap-highlight": "no",
    "msapplication-config": "none",
    // Dublin Core
    "dc.title": "HANDYFLIX — Free Movie & TV Streaming",
    "dc.description": "Free HD streaming of movies and TV shows online. No subscription required.",
    "dc.language": "en",
    "dc.type": "InteractiveResource",
    "dc.format": "text/html",
    // Geo
    "geo.region": "US",
    "geo.placename": "United States",
    // Rating
    "rating": "general",
    "revisit-after": "3 days",
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "HANDYFLIX",
  alternateName: ["Handy Flix", "HandyFlix", "handy flix", "freehandyflix", "FreeHandyFlix", "Free HandyFlix"],
  url: BASE_URL,
  description:
    "HANDYFLIX is your #1 free streaming platform. Watch thousands of movies and TV shows online in HD — no subscription required.",
  inLanguage: ["en-US", "fr-FR"],
  potentialAction: [
    {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  ],
  publisher: { "@id": `${BASE_URL}/#organization` },
  image: {
    "@type": "ImageObject",
    url: `${BASE_URL}/og-image.png`,
    width: 1200,
    height: 630,
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "HANDYFLIX",
  alternateName: ["Handy Flix", "HandyFlix", "freehandyflix", "FreeHandyFlix"],
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    "@id": `${BASE_URL}/#logo`,
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
    caption: "HANDYFLIX",
  },
  image: `${BASE_URL}/og-image.png`,
  description:
    "HANDYFLIX is a free streaming platform offering unlimited HD movies and TV shows. No subscription or sign-up required.",
  foundingDate: "2024",
  founders: [
    { "@type": "Person", name: "Andy Mrlit" },
    { "@type": "Person", name: "Infos Partage" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "French"],
  },
  sameAs: [
    "https://github.com/mc-shizzy",
  ],
}

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${BASE_URL}/#webapp`,
  name: "HANDYFLIX",
  url: BASE_URL,
  applicationCategory: "EntertainmentApplication",
  applicationSubCategory: "VideoStreamingApplication",
  operatingSystem: "Windows, macOS, Linux, iOS, Android, ChromeOS",
  browserRequirements: "Requires JavaScript. HTML5 video support recommended.",
  inLanguage: ["en-US", "fr-FR"],
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    description: "Free unlimited streaming — no subscription required",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "18500",
    reviewCount: "12000",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Free HD streaming",
    "No subscription required",
    "No sign-up required",
    "Watch movies and TV shows",
    "Mobile-friendly",
    "Subtitle support",
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  publisher: { "@id": `${BASE_URL}/#organization` },
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Search",
      item: `${BASE_URL}/search`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "My List",
      item: `${BASE_URL}/my-list`,
    },
  ],
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is HANDYFLIX completely free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! HANDYFLIX is 100% free. No subscription, no credit card, and no sign-up required to browse and watch content.",
      },
    },
    {
      "@type": "Question",
      name: "What can I watch on HANDYFLIX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HANDYFLIX offers thousands of movies and TV series across all genres — action, drama, comedy, horror, sci-fi, romance, thriller, and more — all streamable in HD quality.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to create an account to watch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can browse and watch content without an account. Creating a free account lets you save your watch progress, build a personal list, and get personalized recommendations.",
      },
    },
    {
      "@type": "Question",
      name: "What video quality does HANDYFLIX offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HANDYFLIX streams content in HD (720p and 1080p) depending on the title. Content is delivered via fast servers for smooth playback on any device.",
      },
    },
    {
      "@type": "Question",
      name: "Can I watch HANDYFLIX on my phone or tablet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! HANDYFLIX is fully responsive and works on smartphones, tablets, laptops, and desktops. An Android app is also available for download.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a HANDYFLIX mobile app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! The HANDYFLIX Android APK is available for free download on our website. An iOS app is coming soon.",
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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
