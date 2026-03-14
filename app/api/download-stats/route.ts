import { NextResponse } from "next/server"

export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/mc-shizzy/Apkhandy-/releases/tags/V2.0",
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ downloads: 0 }, { status: 200 })
    }

    const data = await res.json()
    
    // Sum up downloads from all assets
    const totalDownloads = data.assets?.reduce(
      (sum: number, asset: { download_count: number }) => sum + asset.download_count,
      0
    ) ?? 0

    return NextResponse.json({ downloads: totalDownloads })
  } catch {
    return NextResponse.json({ downloads: 0 }, { status: 200 })
  }
}
