import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeriesDetail } from "@/components/series-detail"
import { Footer } from "@/components/footer"
import { PremiumCarousel } from "@/components/premium-carousel"
import { fetchInfo, fetchContentVersions, fetchTrending } from "@/lib/api"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const series = await fetchInfo(id)

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  const seasonCount = series.seasons?.length || 0

  const year = series.releaseDate?.split("-")[0] || ""
  const BASE_URL = "https://freehandyflix.online"
  const pageUrl = `${BASE_URL}/series/${id}`
  const seasonLabel = seasonCount > 1 ? `All ${seasonCount} Seasons` : seasonCount === 1 ? "Season 1" : ""

  return {
    title: `Watch ${series.title}${year ? ` (${year})` : ""} Online Free${seasonLabel ? ` — ${seasonLabel}` : ""} in HD`,
    description: `Watch ${series.title}${seasonLabel ? ` — ${seasonLabel}` : ""} online for free in HD on HANDYFLIX. ${series.description?.slice(0, 130) || "Stream in HD quality."}... No subscription required.`,
    keywords: [
      series.title,
      `watch ${series.title} online free`,
      `${series.title} all seasons`,
      `${series.title} full series`,
      `${series.title} streaming`,
      `${series.title} HD`,
      `${series.title} ${year}`,
      `stream ${series.title} free`,
      ...series.genre,
      ...series.genre.map(g => `watch ${g} series free`),
      "TV series streaming", "HANDYFLIX", "watch series online free",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `Watch ${series.title}${year ? ` (${year})` : ""} — HANDYFLIX Free Streaming`,
      description: series.description?.slice(0, 200) || `Stream ${series.title} all seasons in HD on HANDYFLIX. No subscription required.`,
      type: "video.tv_show",
      url: pageUrl,
      images: [
        {
          url: series.backdrop || series.poster,
          width: 1200,
          height: 630,
          alt: `${series.title} — Watch Free on HANDYFLIX`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${series.title}${year ? ` (${year})` : ""} — HANDYFLIX`,
      description: series.description?.slice(0, 200) || `Stream ${series.title} all seasons in HD. Free on HANDYFLIX.`,
      images: [series.backdrop || series.poster],
    },
  }
}

export default async function SeriesPage({ params }: PageProps) {
  const { id } = await params

  const versions = await fetchContentVersions(id)

  if (!versions || versions.original.type !== "series") {
    notFound()
  }

  const seriesData = versions.original

  const BASE_URL = "https://freehandyflix.online"
  const pageUrl = `${BASE_URL}/series/${id}`
  const totalEpisodes = seriesData.seasons?.reduce((sum, s) => sum + (s.episodes?.length || 0), 0) || 0

  const seriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "@id": `${pageUrl}#tvseries`,
    name: seriesData.title,
    description: seriesData.description,
    image: [
      { "@type": "ImageObject", url: seriesData.poster, width: 500, height: 750 },
      { "@type": "ImageObject", url: seriesData.backdrop, width: 1280, height: 720 },
    ],
    thumbnailUrl: seriesData.poster,
    url: pageUrl,
    datePublished: seriesData.releaseDate,
    genre: seriesData.genre,
    inLanguage: "en",
    contentRating: "TV-14",
    numberOfSeasons: seriesData.seasons?.length || 0,
    numberOfEpisodes: totalEpisodes || undefined,
    aggregateRating: seriesData.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: seriesData.rating,
          ratingCount: "5000",
          bestRating: "10",
          worstRating: "0",
        }
      : undefined,
    actor: seriesData.actors?.slice(0, 5).map((actor) => ({
      "@type": "Person",
      name: actor.name,
    })),
    containsSeason: seriesData.seasons?.map((season) => ({
      "@type": "TVSeason",
      seasonNumber: season.seasonNumber,
      numberOfEpisodes: season.episodes?.length || 0,
      url: `${pageUrl}?season=${season.seasonNumber}`,
    })),
    countryOfOrigin: seriesData.country ? { "@type": "Country", name: seriesData.country } : undefined,
    potentialAction: [
      {
        "@type": "WatchAction",
        target: [
          { "@type": "EntryPoint", urlTemplate: pageUrl },
        ],
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "HANDYFLIX",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
    },
  }

  const allContent = await fetchTrending()
  const similarContent = allContent
    .filter((item) => item.id !== seriesData.id && item.genre.some((g) => seriesData.genre.includes(g)))
    .slice(0, 15)

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }} />
      <SeriesDetail series={seriesData} frenchVersion={versions.french} />

      {similarContent.length > 0 && (
        <div className="py-8">
          <PremiumCarousel title="More Like This" items={similarContent} />
        </div>
      )}

      <Footer />
    </main>
  )
}
