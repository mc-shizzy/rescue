import { NextResponse } from "next/server"
import { initializeIndexes } from "@/lib/mongodb"

// Run this endpoint once after deployment to set up database indexes
// GET /api/admin/setup
export async function GET() {
  // In production, you might want to protect this with a secret key
  const setupKey = process.env.ADMIN_SETUP_KEY
  
  if (setupKey && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Setup endpoint disabled in production without proper authorization" },
      { status: 403 }
    )
  }

  try {
    await initializeIndexes()
    return NextResponse.json({
      success: true,
      message: "Database indexes created successfully",
      indexes: [
        "rateLimits: TTL index on lastAttempt (5 min expiry)",
        "rateLimits: unique compound index on ip + type",
        "watchprogresses: TTL index on lastWatched (14 day expiry)",
      ],
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { error: "Failed to create indexes", details: String(error) },
      { status: 500 }
    )
  }
}
