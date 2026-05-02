import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import dbConnect from "@/lib/mongoose"
import WatchProgress from "@/lib/models/watch-progress"

const saveProgressSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(["movie", "series"]),
  contentTitle: z.string(),
  contentPoster: z.string().optional(),
  season: z.number().nullable().optional(),
  episode: z.number().nullable().optional(),
  episodeTitle: z.string().nullable().optional(),
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
})

// Get watch progress for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")
    const season = searchParams.get("season")
    const episode = searchParams.get("episode")
    const incomplete = searchParams.get("incomplete") === "true"
    const limit = parseInt(searchParams.get("limit") || "20")

    // If requesting specific content progress
    if (contentId) {
      const query: Record<string, any> = {
        userId: session.user.id,
        contentId,
      }
      if (season) query.season = parseInt(season)
      if (episode) query.episode = parseInt(episode)

      const progress = await WatchProgress.findOne(query)
      return NextResponse.json({ progress })
    }

    // Get all progress (for continue watching)
    const query: Record<string, any> = { userId: session.user.id }
    if (incomplete) {
      query.completed = false
      query.progressPercent = { $gte: 1 } // At least 1% watched
    }

    const progressList = await WatchProgress.find(query)
      .sort({ lastWatched: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ progress: progressList })
  } catch (error) {
    console.error("Get watch progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Save watch progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = saveProgressSchema.parse(body)

    // Only save progress if user watched at least 5 minutes (300 seconds)
    if (validated.progressSeconds < 300) {
      return NextResponse.json({ 
        success: true, 
        message: "Progress not saved (less than 5 minutes watched)" 
      })
    }

    await dbConnect()

    const progressPercent = validated.durationSeconds > 0
      ? Math.min(100, Math.round((validated.progressSeconds / validated.durationSeconds) * 100))
      : 0

    const completed = progressPercent >= 90

    const query: Record<string, any> = {
      userId: session.user.id,
      contentId: validated.contentId,
    }

    // For series, include season and episode in the query
    if (validated.contentType === "series") {
      query.season = validated.season
      query.episode = validated.episode
    }

    const update = {
      userId: session.user.id,
      contentId: validated.contentId,
      contentType: validated.contentType,
      contentTitle: validated.contentTitle,
      contentPoster: validated.contentPoster || "",
      season: validated.season || null,
      episode: validated.episode || null,
      episodeTitle: validated.episodeTitle || null,
      progressSeconds: validated.progressSeconds,
      durationSeconds: validated.durationSeconds,
      progressPercent,
      lastWatched: new Date(),
      completed,
    }

    await WatchProgress.findOneAndUpdate(query, update, { upsert: true, new: true })

    return NextResponse.json({ 
      success: true, 
      progressPercent,
      completed,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Save watch progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete watch progress (clear history)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")

    await dbConnect()

    if (contentId) {
      await WatchProgress.deleteMany({ userId: session.user.id, contentId })
    } else {
      await WatchProgress.deleteMany({ userId: session.user.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete watch progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
