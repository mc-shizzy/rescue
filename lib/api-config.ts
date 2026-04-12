// API Configuration - Change this URL when the backend domain changes
export const API_BASE_URL = "https://apiv3.freehandyflix.online/api"
export const API_KEY = process.env.NEXT_PUBLIC_HANDYFLIX_API_KEY || ""

// Helper to append the API key to any URL
function withKey(url: string): string {
  if (!API_KEY) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}apikey=${API_KEY}`
}

// API Endpoints
export const API_ENDPOINTS = {
  trending: withKey(`${API_BASE_URL}/trending`),
  homepage: withKey(`${API_BASE_URL}/homepage`),
  search: (query: string) => withKey(`${API_BASE_URL}/search/${encodeURIComponent(query)}`),
  info: (id: string | number) => withKey(`${API_BASE_URL}/info/${id}`),
  sources: (id: string | number, season?: number, episode?: number) => {
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
  },
}
