import { NextRequest, NextResponse } from "next/server"
import { validateProxyRequest } from "@/lib/proxy-guard"

const API_BASE_URL = "https://apiv3.freehandyflix.online/api"
const API_KEY = process.env.HANDYFLIX_API_KEY || ""

export async function GET(request: NextRequest) {
  const blocked = validateProxyRequest(request)
  if (blocked) return blocked

  const id = request.nextUrl.searchParams.get("id")
  const season = request.nextUrl.searchParams.get("season")
  const episode = request.nextUrl.searchParams.get("episode")

  if (!id) {
    return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 })
  }

  try {
    const params = new URLSearchParams()
    if (API_KEY) params.append("apikey", API_KEY)
    if (season) params.append("season", season)
    if (episode) params.append("episode", episode)

    const queryString = params.toString()
    const url = `${API_BASE_URL}/sources/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ""}`

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
