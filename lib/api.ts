import { API_ENDPOINTS } from "./api-config"

// ===========================================
// API Response Types (based on actual API responses)
// ===========================================

export interface APICover {
  url: string
  width?: number
  height?: number
  blurHash?: string
}

export interface APIActor {
  name: string
  character?: string
  image?: string
  profilePath?: string
}

export interface APIStar {
  staffId: string
  staffType: number
  name: string
  character: string
  avatarUrl: string
  detailPath: string
}

export interface APIVideoAddress {
  videoId: string
  definition: string
  url: string
  duration: number
  width: number
  height: number
  size: number
  fps: number
  bitrate: number
  type: number
}

export interface APITrailer {
  videoAddress: APIVideoAddress
  cover: APICover
}

export interface APIResolution {
  resolution: number
  epNum: number
}

export interface APIResourceSeason {
  se: number
  maxEp: number
  allEp: string
  resolutions: APIResolution[]
}

export interface APIResource {
  seasons: APIResourceSeason[]
  source: string
  uploadBy: string
}

// Sources API Types
export interface APIDownloadSource {
  id: string
  url: string
  resolution: number
  size: string
}

export interface APICaption {
  id: string
  lan: string
  lanName: string
  url: string
  size: string
  delay: number
}

export interface APIProcessedSource {
  id: string
  quality: number
  url: string
  size: string
  format: string
}

export interface APIProcessedSubtitle {
  id: string
  languageCode: string
  languageName: string
  url: string
  size?: string
  delay?: number
  format: string
}

export interface APISourcesResponse {
  status: string
  data: {
    downloads: APIDownloadSource[]
    captions: APICaption[]
    processedSources: APIProcessedSource[]
    processedSubtitles?: APIProcessedSubtitle[]
    limited?: boolean
    limitedCode?: string
    freeNum?: number
    hasResource?: boolean
  }
}

// Normalized Sources Type
export interface NormalizedSources {
  videos: { quality: string; src: string; downloadUrl?: string; size: string }[]
  subtitles: { id: string; label: string; language: string; src: string }[]
  hasResource: boolean
}

export interface APIEpisode {
  episodeNumber: number
  title: string
  duration: number
  description?: string
}

export interface APISeason {
  seasonNumber: number
  episodes: APIEpisode[]
}

export interface APISubject {
  subjectId: string
  subjectType: number // 1 = movie, 2 = series
  title: string
  description: string
  releaseDate: string
  duration: number // in seconds
  genre: string // comma-separated
  cover: APICover
  backdrop?: APICover
  rating?: number
  imdbRatingValue?: string // IMDB rating as string
  cast?: APIActor[]
  seasons?: APISeason[]
  trailer?: string | APITrailer // Can be string (URL) or object with videoAddress
  subtitles?: string // comma-separated list of available subtitles
  countryName?: string
  hasResource?: boolean
}

export interface APITrendingResponse {
  status: string
  data: {
    subjectList: APISubject[]
  }
}

export interface APISearchResponse {
  status: string
  data: {
    items: APISubject[]
    pager: {
      hasMore: boolean
      page: string
      nextPage?: string
      perPage?: number
      totalCount: number
    }
  }
}

export interface APIInfoResponse {
  status: string
  data: {
    subject: APISubject
    stars?: APIStar[]
    resource?: APIResource
  }
}

export interface APIHomeListItem {
  type: string
  position: number
  title: string
  subjects: APISubject[]
  banner: any
  opId?: string
  url?: string
}

export interface APIHomepageResponse {
  status: string
  data: {
    topPickList: APISubject[]
    homeList: APIHomeListItem[]
    operatingList: APIHomeListItem[]
    platformList: {
      name: string
      uploadBy: string
    }[]
    banner: APISubject[] | null
    url?: string
    referer?: string
    allPlatform?: any[]
    live?: any
    shareParam?: any
  }
}

// ===========================================
// Normalized App Types (used throughout the app)
// ===========================================

export interface NormalizedContent {
  id: string
  type: "movie" | "series"
  title: string
  description: string
  releaseDate: string
  duration: string
  durationSeconds: number
  genre: string[]
  poster: string
  backdrop: string
  rating: number
  actors: { name: string; character: string; image: string }[]
  trailer: string
  trailerVideo?: string // Direct video URL for trailer
  subtitles?: string[] // Available subtitle languages
  country?: string
  hasResource?: boolean
  resource?: {
    seasons: {
      seasonNumber: number
      maxEpisodes: number
      resolutions: number[]
    }[]
    source: string
  }
  seasons?: {
    seasonNumber: number
    episodes: {
      episodeNumber: number
      title: string
      duration: string
      durationSeconds: number
    }[]
  }[]
}

// ===========================================
// Helper Functions
// ===========================================

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "N/A"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Default rating when none is provided
const DEFAULT_RATING = 8.0

function normalizeSubject(subject: APISubject): NormalizedContent {
  // Handle trailer - can be string URL or object with videoAddress
  let trailerUrl = ""
  let trailerVideoUrl = ""
  if (subject.trailer) {
    if (typeof subject.trailer === "string") {
      trailerUrl = subject.trailer
    } else if (subject.trailer.videoAddress?.url) {
      trailerVideoUrl = subject.trailer.videoAddress.url
      // Create a placeholder YouTube URL for embed fallback
      trailerUrl = ""
    }
  }

  // Parse rating - can be number or string (imdbRatingValue)
  let rating = DEFAULT_RATING
  if (subject.rating) {
    rating = subject.rating
  } else if (subject.imdbRatingValue) {
    rating = parseFloat(subject.imdbRatingValue) || DEFAULT_RATING
  }

  return {
    id: subject.subjectId,
    type: subject.subjectType === 2 ? "series" : "movie",
    title: subject.title || "Untitled",
    description: subject.description || "No description available.",
    releaseDate: subject.releaseDate || "",
    duration: formatDuration(subject.duration),
    durationSeconds: subject.duration || 0,
    genre: subject.genre ? subject.genre.split(",").map((g) => g.trim()) : [],
    poster: subject.cover?.url || "/abstract-movie-poster.png",
    backdrop: subject.backdrop?.url || subject.cover?.url || "/movie-backdrop.png",
    rating,
    actors: (subject.cast || []).slice(0, 10).map((actor) => ({
      name: actor.name || "Unknown",
      character: actor.character || "",
      image: actor.image || actor.profilePath || "/actor-portrait.png",
    })),
    trailer: trailerUrl,
    trailerVideo: trailerVideoUrl || undefined,
    subtitles: subject.subtitles ? subject.subtitles.split(",").map((s) => s.trim()) : undefined,
    country: subject.countryName,
    hasResource: subject.hasResource,
    seasons: subject.seasons?.map((season) => ({
      seasonNumber: season.seasonNumber,
      episodes: season.episodes.map((ep) => ({
        episodeNumber: ep.episodeNumber,
        title: ep.title || `Episode ${ep.episodeNumber}`,
        duration: formatDuration(ep.duration),
        durationSeconds: ep.duration || 0,
      })),
    })),
  }
}

// Normalize subject with additional info data (stars, resource)
function normalizeSubjectWithInfo(
  subject: APISubject,
  stars?: APIStar[],
  resource?: APIResource
): NormalizedContent {
  const base = normalizeSubject(subject)

  // Use stars data for actors if available (more detailed than subject.cast)
  if (stars && stars.length > 0) {
    base.actors = stars.slice(0, 10).map((star) => ({
      name: star.name || "Unknown",
      character: star.character || "",
      image: star.avatarUrl || "/actor-portrait.png",
    }))
  }

  // Add resource info for playback
  if (resource && resource.seasons && resource.seasons.length > 0) {
    base.resource = {
      seasons: resource.seasons.map((s) => ({
        seasonNumber: s.se,
        maxEpisodes: s.maxEp,
        resolutions: s.resolutions.map((r) => r.resolution),
      })),
      source: resource.source,
    }

    // Populate seasons with episodes from resource data (for series UI display)
    // Only overwrite if base.seasons is empty or doesn't have episode data
    // The resource provides season number and max episode count
    const hasExistingSeasons = base.seasons && base.seasons.length > 0 && 
      base.seasons.some(s => s.episodes && s.episodes.length > 0)
    
    if (!hasExistingSeasons) {
      base.seasons = resource.seasons.map((s) => ({
        seasonNumber: s.se,
        episodes: Array.from({ length: s.maxEp }, (_, i) => ({
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
          duration: formatDuration(0),
          durationSeconds: 0,
        })),
      }))
    }
  }

  return base
}

// ===========================================
// API Functions
// ===========================================

export async function fetchTrending(): Promise<NormalizedContent[]> {
  try {
    const res = await fetch(API_ENDPOINTS.trending, {
      cache: 'force-cache',
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: APITrendingResponse = await res.json()

    if (json.status === "success" && json.data?.subjectList) {
      return json.data.subjectList.map(normalizeSubject)
    }
    return []
  } catch (error) {
    console.error("Trending fetch error:", error)
    return []
  }
}

// Search for French dubbed version of content
async function fetchFrenchVersion(
  originalTitle: string,
  subjectType: number
): Promise<APISubject | null> {
  try {
    const cleanTitle = originalTitle.replace(/\s*\[[^\]]*\]\s*/g, '').trim()
    const frenchTitle = `${cleanTitle} [Version française]`
    
    // Search for French version - cached for 1 hour to reduce API calls
    const res = await fetch(API_ENDPOINTS.search(frenchTitle), {
      cache: 'force-cache',
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    const json: APISearchResponse = await res.json()

    if (json.status === "success" && json.data?.items && json.data.items.length > 0) {
      // Find exact match with French version tag
      const frenchContent = json.data.items.find(item => 
        item.title.toLowerCase().includes('[version française]') && 
        item.hasResource === true &&
        item.subjectType === subjectType
      )
      
      if (frenchContent) {
        console.log(`[v0] French version found for: ${originalTitle}`)
        return frenchContent
      }
    }
    
    console.log(`[v0] No French version available for: ${originalTitle}, using original`)
    return null
  } catch (error) {
    console.error("French version search error:", error)
    return null
  }
}

export async function fetchSearch(query: string): Promise<NormalizedContent[]> {
  try {
    const res = await fetch(API_ENDPOINTS.search(query), {
      cache: 'force-cache',
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: APISearchResponse = await res.json()

    if (json.status === "success" && json.data?.items) {
      return json.data.items.map(normalizeSubject)
    }
    return []
  } catch (error) {
    console.error("Search fetch error:", error)
    return []
  }
}

export async function fetchInfo(id: string): Promise<NormalizedContent | null> {
  try {
    const res = await fetch(API_ENDPOINTS.info(id), {
      cache: 'force-cache',
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: APIInfoResponse = await res.json()

    if (json.status === "success" && json.data?.subject) {
      return normalizeSubjectWithInfo(json.data.subject, json.data.stars, json.data.resource)
    }
    return null
  } catch (error) {
    console.error("Info fetch error:", error)
    return null
  }
}

export interface ContentVersions {
  original: NormalizedContent
  french: NormalizedContent | null
}

export async function fetchContentVersions(id: string): Promise<ContentVersions | null> {
  const content = await fetchInfo(id)
  if (!content) return null

  if (content.title.toLowerCase().includes('[version française]')) {
    const cleanTitle = content.title.replace(/\s*\[[^\]]*\]\s*/g, '').trim()
    try {
      const res = await fetch(API_ENDPOINTS.search(cleanTitle), {
        cache: 'force-cache',
        headers: { Accept: "application/json" },
      })
      if (res.ok) {
        const json: APISearchResponse = await res.json()
        if (json.status === "success" && json.data?.items) {
          const subjectType = content.type === "series" ? 2 : 1
          const originalSubject = json.data.items.find(item => {
            if (item.title.toLowerCase().includes('[version française]')) return false
            if (!item.hasResource || item.subjectType !== subjectType) return false
            const itemClean = item.title.replace(/\s*\[[^\]]*\]\s*/g, '').trim().toLowerCase()
            return itemClean === cleanTitle.toLowerCase()
          })
          if (originalSubject) {
            const originalContent = await fetchInfo(originalSubject.subjectId)
            if (originalContent) return { original: originalContent, french: content }
          }
        }
      }
    } catch {}
    return { original: content, french: null }
  }

  const frenchSubject = await fetchFrenchVersion(content.title, content.type === "series" ? 2 : 1)
  if (!frenchSubject) return { original: content, french: null }

  const frenchContent = await fetchInfo(frenchSubject.subjectId)
  return { original: content, french: frenchContent }
}

export async function fetchHomepage(): Promise<{
  topPicks: NormalizedContent[]
  categories: { title: string; items: NormalizedContent[] }[]
  platforms: string[]
}> {
  try {
    const res = await fetch(API_ENDPOINTS.homepage, {
      cache: 'force-cache',
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: APIHomepageResponse = await res.json()

    const apiData = json.data

    console.log("[v0] homeList length:", apiData?.homeList?.length || 0)
    console.log("[v0] operatingList length:", apiData?.operatingList?.length || 0)
    console.log("[v0] topPickList length:", apiData?.topPickList?.length || 0)

    if (json.status === "success" && apiData) {
      const topPicks = (apiData.topPickList || []).map(normalizeSubject)

      // Use operatingList if homeList is empty, as the API now returns categories there
      const categorySource =
        apiData.homeList && apiData.homeList.length > 0 ? apiData.homeList : apiData.operatingList || []

      // Filter to only include categories with content (subjects array with items)
      const categories = categorySource
        .filter((cat) => cat.subjects && cat.subjects.length > 0)
        .map((cat) => ({
          title: cat.title,
          items: cat.subjects.map(normalizeSubject),
        }))

      const platforms = (apiData.platformList || []).map((p) => p.name)

      console.log("[v0] Processed categories count:", categories.length)
      categories.forEach((cat, idx) => {
        console.log(`[v0] Category ${idx}: "${cat.title}" with ${cat.items.length} items`)
      })

      return { topPicks, categories, platforms }
    }
    return { topPicks: [], categories: [], platforms: [] }
  } catch (error) {
    console.error("Homepage fetch error:", error)
    return { topPicks: [], categories: [], platforms: [] }
  }
}

export async function fetchSources(
  id: string,
  season?: number,
  episode?: number
): Promise<NormalizedSources> {
  try {
    const res = await fetch(API_ENDPOINTS.sources(id, season, episode), {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: APISourcesResponse = await res.json()

    if (json.status === "success" && json.data) {
      const videos = (json.data.processedSources || json.data.downloads || [])
        .sort((a, b) => {
          const resA = "quality" in a ? a.quality : a.resolution
          const resB = "quality" in b ? b.quality : b.resolution
          return resB - resA // Sort by highest resolution first
        })
        .map((source) => {
          const resolution = "quality" in source ? source.quality : source.resolution
          // V3 API provides a single `url` field for both streaming and download
          // Ensure HTTPS to avoid mixed content issues
          const sourceUrl = source.url
          const streamUrl = sourceUrl.startsWith("http://")
            ? sourceUrl.replace(/^http:\/\//i, "https://")
            : sourceUrl
          
          // For downloads, proxy through our local endpoint
          const downloadUrl = `/api/download?url=${encodeURIComponent(sourceUrl)}`
          
          return {
            quality: `${resolution}p`,
            src: streamUrl,
            downloadUrl: downloadUrl,
            size: source.size,
          }
        })

      const processedSubs = json.data.processedSubtitles || []
      const subtitles = processedSubs.length > 0
        ? processedSubs.map((sub) => ({
            id: sub.id,
            label: sub.languageName,
            language: sub.languageCode,
            src: `/api/subtitles?url=${encodeURIComponent(sub.url)}`,
          }))
        : (json.data.captions || []).map((caption) => ({
            id: caption.id,
            label: caption.lanName,
            language: caption.lan,
            src: `/api/subtitles?url=${encodeURIComponent(caption.url)}`,
          }))

      return {
        videos,
        subtitles,
        hasResource: json.data.hasResource ?? false,
      }
    }
    return { videos: [], subtitles: [], hasResource: false }
  } catch (error) {
    console.error("Sources fetch error:", error)
    return { videos: [], subtitles: [], hasResource: false }
  }
}
