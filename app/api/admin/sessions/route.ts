import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

function isAdmin(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && adminEmails.includes(email.toLowerCase())
}

// GET /api/admin/sessions — list all active sessions with user info
export async function GET() {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("handyflix")

    // Fetch all sessions sorted by most recent
    const sessions = await db
      .collection("sessions")
      .find({})
      .sort({ expires: -1 })
      .limit(200)
      .toArray()

    // Collect unique userIds
    const userIds = [...new Set(
      sessions
        .map((s) => s.userId?.toString())
        .filter(Boolean)
    )]

    // Fetch user info for all session holders
    const users = userIds.length > 0
      ? await db.collection("users")
          .find(
            { _id: { $in: userIds.map((id) => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
            { projection: { name: 1, email: 1, image: 1, accountStatus: 1 } }
          )
          .toArray()
      : []

    const userMap: Record<string, any> = {}
    for (const u of users) userMap[u._id.toString()] = u

    const now = new Date()
    const enriched = sessions.map((s) => {
      const uid = s.userId?.toString()
      const user = uid ? userMap[uid] : null
      const expires = new Date(s.expires)
      const isActive = expires > now
      return {
        sessionToken: s.sessionToken ? (s.sessionToken as string).slice(0, 8) + "…" : "—",
        userId: uid || null,
        userName: user?.name || "Unknown",
        userEmail: user?.email || null,
        userImage: user?.image || null,
        accountStatus: user?.accountStatus || "free",
        expires: s.expires,
        isActive,
        isCurrentAdmin: uid === session.user.id,
      }
    })

    const active = enriched.filter((s) => s.isActive)
    const expired = enriched.filter((s) => !s.isActive)

    return NextResponse.json({
      sessions: enriched,
      totalActive: active.length,
      totalExpired: expired.length,
      uniqueActiveUsers: new Set(active.map((s) => s.userId).filter(Boolean)).size,
    })
  } catch (error) {
    console.error("Admin sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/sessions?userId=xxx — revoke all sessions for a user
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const client = await clientPromise
    const db = client.db("handyflix")

    const result = await db.collection("sessions").deleteMany({ userId })

    return NextResponse.json({
      success: true,
      message: `Revoked ${result.deletedCount} session(s)`,
    })
  } catch (error) {
    console.error("Revoke sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
