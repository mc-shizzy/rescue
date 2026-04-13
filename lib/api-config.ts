// API Configuration - Change this URL when the backend domain changes
export const API_BASE_URL = "https://apiv3.freehandyflix.online/api"

// Server-only API key (never exposed to the browser)
const API_KEY = process.env.HANDYFLIX_API_KEY || ""

// Helper to append the API key to any URL (server-side only)
function withKey(url: string): string {
  if (!API_KEY) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}apikey=${API_KEY}`
}

// Whether we are running on the server
const isServer = typeof window === "undefined"

// API Endpoints — client-side calls go through /api/proxy/ (key stays on server)
export const API_ENDPOINTS = {
  trending: isServer
    ? withKey(`${API_BASE_URL}/trending`)
    : `/api/proxy/trending`,

  homepage: isServer
    ? withKey(`${API_BASE_URL}/homepage`)
    : `/api/proxy/homepage`,

  search: (query: string) =>
    isServer
      ? withKey(`${API_BASE_URL}/search/${encodeURIComponent(query)}`)
      : `/api/proxy/search?q=${encodeURIComponent(query)}`,

  info: (id: string | number) =>
    isServer
      ? withKey(`${API_BASE_URL}/info/${id}`)
      : `/api/proxy/info?id=${encodeURIComponent(String(id))}`,

  sources: (id: string | number, season?: number, episode?: number) => {
    if (isServer) {
      let url = `${API_BASE_URL}/sources/${id}`
      const params = new URLSearchParams()
      if (API_KEY) {
        params.append('apikey', API_KEY)
      }
      if (season !== undefined && season > 0) {
        params.append('season', String(season))
      }
      if (episode !== undefined && episode > 0) {
        params.append('episode', String(episode))
      }
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
      return url
    }

    // Client-side: proxy route
    const params = new URLSearchParams()
    params.append('id', String(id))
    if (season !== undefined && season > 0) {
      params.append('season', String(season))
    }
    if (episode !== undefined && episode > 0) {
      params.append('episode', String(episode))
    }
    return `/api/proxy/sources?${params.toString()}`
  },
}
