import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeriesDetail } from "@/components/series-detail"
import { Footer } from "@/components/footer"
import { PremiumCarousel } from "@/components/premium-carousel"
import { fetchInfo, fetchContentVersions, fetchTrending } from "@/lib/api"

export const runtime = 'edge';

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

  return {
    title: `Watch ${series.title} Online Free - All ${seasonCount} Seasons in HD`,
    description: `Watch ${series.title} all ${seasonCount} seasons online for free on HANDYFLIX. ${series.description?.slice(0, 150) || "Stream in HD quality."}...`,
    keywords: [
      series.title,
      `${series.title} streaming`,
      `watch ${series.title} online`,
      `${series.title} free`,
      `${series.title} all seasons`,
      `${series.title} HD`,
      ...series.genre,
      "TV series",
      "streaming",
      "HANDYFLIX",
    ],
    openGraph: {
      title: `Watch ${series.title} - HANDYFLIX`,
      description: series.description || `Stream ${series.title} all seasons in HD on HANDYFLIX`,
      type: "video.tv_show",
      images: [
        {
          url: series.backdrop || series.poster,
          width: 1200,
          height: 630,
          alt: series.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${series.title} - HANDYFLIX`,
      description: series.description?.slice(0, 200) || `Stream ${series.title} in HD`,
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

  const seriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: seriesData.title,
    description: seriesData.description,
    image: seriesData.poster,
    datePublished: seriesData.releaseDate,
    genre: seriesData.genre,
    numberOfSeasons: seriesData.seasons?.length || 0,
    aggregateRating: seriesData.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: seriesData.rating,
          bestRating: "10",
          worstRating: "0",
        }
      : undefined,
    actor: seriesData.actors?.map((actor) => ({
      "@type": "Person",
      name: actor.name,
    })),
    potentialAction: {
      "@type": "WatchAction",
      target: `https://freehandyflix.online/series/${id}`,
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
