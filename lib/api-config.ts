// API Configuration - Change this URL when the backend domain changes
export const API_BASE_URL = "https://site--apitest--5xclgh8w8skl.code.run/api"

// API Endpoints
export const API_ENDPOINTS = {
  trending: `${API_BASE_URL}/trending`,
  homepage: `${API_BASE_URL}/homepage`,
  search: (query: string) => `${API_BASE_URL}/search/${encodeURIComponent(query)}`,
  info: (id: string | number) => `${API_BASE_URL}/info/${id}`,
  sources: (id: string | number, season?: number, episode?: number) => {
    let url = `${API_BASE_URL}/sources/${id}`
    const params = new URLSearchParams()
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
