import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { MovieDetail } from "@/components/movie-detail"
import { PremiumCarousel } from "@/components/premium-carousel"
import { fetchInfo, fetchContentVersions, fetchTrending } from "@/lib/api"

export const runtime = 'edge';

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

  return {
    title: `Watch ${movie.title} Online Free - Stream in HD`,
    description: `Watch ${movie.title} (${movie.releaseDate?.split("-")[0] || ""}) online for free on HANDYFLIX. ${movie.description?.slice(0, 150) || "Stream in HD quality."}...`,
    keywords: [
      movie.title,
      `${movie.title} streaming`,
      `watch ${movie.title} online`,
      `${movie.title} free`,
      `${movie.title} HD`,
      ...movie.genre,
      "streaming",
      "HANDYFLIX",
    ],
    openGraph: {
      title: `Watch ${movie.title} - HANDYFLIX`,
      description: movie.description || `Stream ${movie.title} in HD on HANDYFLIX`,
      type: "video.movie",
      images: [
        {
          url: movie.backdrop || movie.poster,
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${movie.title} - HANDYFLIX`,
      description: movie.description?.slice(0, 200) || `Stream ${movie.title} in HD`,
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

  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.description,
    image: movie.poster,
    datePublished: movie.releaseDate,
    genre: movie.genre,
    aggregateRating: movie.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: movie.rating,
          bestRating: "10",
          worstRating: "0",
        }
      : undefined,
    actor: movie.actors?.map((actor) => ({
      "@type": "Person",
      name: actor.name,
    })),
    potentialAction: {
      "@type": "WatchAction",
      target: `https://freehandyflix.online/movie/${id}`,
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
