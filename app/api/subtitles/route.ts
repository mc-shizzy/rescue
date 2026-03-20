import { NextRequest, NextResponse } from "next/server"

function srtToVtt(srt: string): string {
  let vtt = "WEBVTT\n\n"
  const normalized = srt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()
  const blocks = normalized.split(/\n\n+/)

  for (const block of blocks) {
    const lines = block.split("\n")
    if (lines.length < 2) continue

    let timecodeLineIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timecodeLineIndex = i
        break
      }
    }

    if (timecodeLineIndex === -1) continue

    const timecode = lines[timecodeLineIndex].replace(/,/g, ".")
    const textLines = lines.slice(timecodeLineIndex + 1).join("\n")

    if (textLines.trim()) {
      vtt += timecode + " line:85%\n" + textLines + "\n\n"
    }
  }

  return vtt
}

const ALLOWED_HOSTS = [
  "apii.freehandyflix.online",
  "cacdn.hakunaymatata.com",
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  try {
    const parsed = new URL(url)
    const isAllowed = ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith("." + host)
    )
    if (!isAllowed) {
      return new NextResponse("Forbidden host", { status: 403 })
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!res.ok) {
      return new NextResponse("Failed to fetch subtitle", { status: res.status })
    }

    const srtText = await res.text()
    const vttText = srtToVtt(srtText)

    return new NextResponse(vttText, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return new NextResponse("Error processing subtitle", { status: 500 })
  }
}
