import { NextRequest, NextResponse } from "next/server"
import { validateProxyRequest } from "@/lib/proxy-guard"

const API_BASE_URL = "https://apiv3.freehandyflix.online/api"
const API_KEY = process.env.HANDYFLIX_API_KEY || ""

export async function GET(request: NextRequest) {
  const blocked = validateProxyRequest(request)
  if (blocked) return blocked

  const query = request.nextUrl.searchParams.get("q")

  if (!query) {
    return NextResponse.json({ status: "error", message: "Missing query" }, { status: 400 })
  }

  try {
    let url = `${API_BASE_URL}/search/${encodeURIComponent(query)}`
    if (API_KEY) {
      url += `?apikey=${API_KEY}`
    }

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      return NextResponse.json({ status: "error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
