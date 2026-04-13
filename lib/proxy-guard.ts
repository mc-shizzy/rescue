import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "https://freehandyflix.online",
  "https://www.freehandyflix.online",
  "https://rescue.josephharrysonmarc.workers.dev",
  // Catch-all for any *.workers.dev subdomain
  /^https:\/\/.*\.workers\.dev$/,
]

/**
 * Validates that the request came from our own site.
 * Returns a 403 response if it didn't, or null if the request is allowed.
 */
export function validateProxyRequest(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  // Server-side fetch (same origin, no origin/referer header) — allow
  if (!origin && !referer) return null

  const checkUrl = origin || referer || ""

  const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === "string") {
      return checkUrl.startsWith(allowed)
    }
    return allowed.test(checkUrl)
  })

  if (!isAllowed) {
    return NextResponse.json(
      { status: "error", message: "Forbidden" },
      { status: 403 }
    )
  }

  return null
}
