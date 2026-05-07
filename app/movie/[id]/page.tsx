import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { MovieDetail } from "@/components/movie-detail"
import { PremiumCarousel } from "@/components/premium-carousel"
import { fetchInfo, fetchContentVersions, fetchTrending } from "@/lib/api"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params
  const movie = await fetchInfo(id)

  if (!movie) {
    return {
      title: "Movie Not Found",
    }
  }

  const year = movie.releaseDate?.split("-")[0] || ""
  const BASE_URL = "https://freehandyflix.online"
  const pageUrl = `${BASE_URL}/movie/${id}`

  return {
    title: `Watch ${movie.title}${year ? ` (${year})` : ""} Online Free in HD`,
    description: `Watch ${movie.title}${year ? ` (${year})` : ""} online for free in HD on HANDYFLIX. ${movie.description?.slice(0, 140) || "Stream in HD quality."}... No subscription required.`,
    keywords: [
      movie.title,
      `watch ${movie.title} online free`,
      `${movie.title} full movie`,
      `${movie.title} streaming`,
      `${movie.title} HD`,
      `${movie.title} ${year}`,
      `stream ${movie.title} free`,
      ...movie.genre,
      ...movie.genre.map(g => `watch ${g} movies free`),
      "free movie streaming", "HANDYFLIX", "watch movies online free",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `Watch ${movie.title}${year ? ` (${year})` : ""} — HANDYFLIX Free Streaming`,
      description: movie.description?.slice(0, 200) || `Stream ${movie.title} in HD on HANDYFLIX. No subscription required.`,
      type: "video.movie",
      url: pageUrl,
      images: [
        {
          url: movie.backdrop || movie.poster,
          width: 1200,
          height: 630,
          alt: `${movie.title} — Watch on HANDYFLIX`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${movie.title}${year ? ` (${year})` : ""} — HANDYFLIX`,
      description: movie.description?.slice(0, 200) || `Stream ${movie.title} in HD. Free on HANDYFLIX.`,
      images: [movie.backdrop || movie.poster],
    },
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params

  const versions = await fetchContentVersions(id)

  if (!versions || versions.original.type !== "movie") {
    notFound()
  }

  const movie = versions.original

  const BASE_URL = "https://freehandyflix.online"
  const pageUrl = `${BASE_URL}/movie/${id}`
  const year = movie.releaseDate?.split("-")[0] || ""

  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": `${pageUrl}#movie`,
    name: movie.title,
    description: movie.description,
    image: [
      { "@type": "ImageObject", url: movie.poster, width: 500, height: 750 },
      { "@type": "ImageObject", url: movie.backdrop, width: 1280, height: 720 },
    ],
    thumbnailUrl: movie.poster,
    url: pageUrl,
    datePublished: movie.releaseDate,
    genre: movie.genre,
    inLanguage: "en",
    contentRating: "TV-14",
    duration: movie.duration ? `PT${movie.durationSeconds}S` : undefined,
    aggregateRating: movie.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: movie.rating,
          ratingCount: "5000",
          bestRating: "10",
          worstRating: "0",
        }
      : undefined,
    actor: movie.actors?.slice(0, 5).map((actor) => ({
      "@type": "Person",
      name: actor.name,
    })),
    countryOfOrigin: movie.country ? { "@type": "Country", name: movie.country } : undefined,
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
    .filter((item) => item.id !== movie.id && item.genre.some((g) => movie.genre.includes(g)))
    .slice(0, 15)

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }} />
      <MovieDetail movie={movie} frenchVersion={versions.french} />

      {similarContent.length > 0 && (
        <div className="py-8">
          <PremiumCarousel title="More Like This" items={similarContent} />
        </div>
      )}

      <Footer />
    </main>
  )
}
