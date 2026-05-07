import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import dbConnect from "@/lib/mongoose"
import WatchProgress from "@/lib/models/watch-progress"
import UserList from "@/lib/models/user-list"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

function isAdmin(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && adminEmails.includes(email.toLowerCase())
}

// GET /api/admin/users — list all users with stats
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await dbConnect()
    const client = await clientPromise
    const db = client.db("handyflix")

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"))
    const search = searchParams.get("search") || ""
    const userId = searchParams.get("userId")

    // Single user detail
    if (userId) {
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
      )
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

      const [watchHistory, userList] = await Promise.all([
        WatchProgress.find({ userId }).sort({ lastWatched: -1 }).limit(50).lean(),
        UserList.findOne({ userId }).lean(),
      ])

      return NextResponse.json({
        user: { ...user, id: user._id.toString() },
        watchHistory,
        myList: userList?.contentIds || [],
      })
    }

    // All users
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      db
        .collection("users")
        .find(query, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(query),
    ])

    // Attach last-watched for each user
    const userIds = users.map((u) => u._id.toString())
    const lastWatchedDocs = await WatchProgress.find({ userId: { $in: userIds } })
      .sort({ lastWatched: -1 })
      .lean()

    const lastWatchedMap: Record<string, any> = {}
    for (const doc of lastWatchedDocs) {
      const uid = doc.userId.toString()
      if (!lastWatchedMap[uid]) lastWatchedMap[uid] = doc
    }

    const watchCountMap: Record<string, number> = {}
    const countAgg = await WatchProgress.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])
    for (const row of countAgg) watchCountMap[row._id] = row.count

    const listCountMap: Record<string, number> = {}
    const listDocs = await UserList.find({ userId: { $in: userIds } }).lean()
    for (const doc of listDocs) listCountMap[doc.userId.toString()] = doc.contentIds?.length || 0

    const enriched = users.map((u) => {
      const uid = u._id.toString()
      return {
        id: uid,
        name: u.name,
        email: u.email,
        image: u.image,
        accountStatus: u.accountStatus || "free",
        onboardingCompleted: !!u.onboardingCompleted,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastWatched: lastWatchedMap[uid]?.lastWatched || null,
        lastContent: lastWatchedMap[uid]?.contentTitle || null,
        watchCount: watchCountMap[uid] || 0,
        listCount: listCountMap[uid] || 0,
        loginProvider: u.emailVerified ? "google" : "credentials",
      }
    })

    return NextResponse.json({ users: enriched, total, page, limit })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("setStatus"), userId: z.string(), status: z.enum(["free", "premium", "banned"]) }),
  z.object({ action: z.literal("resetPassword"), userId: z.string(), newPassword: z.string().min(8) }),
  z.object({ action: z.literal("setOnboarding"), userId: z.string(), completed: z.boolean() }),
])

// PATCH /api/admin/users — update user
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = patchSchema.parse(body)

    const client = await clientPromise
    const db = client.db("handyflix")

    if (validated.action === "setStatus") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(validated.userId) },
        { $set: { accountStatus: validated.status, updatedAt: new Date() } }
      )
      return NextResponse.json({ success: true, message: `Status set to ${validated.status}` })
    }

    if (validated.action === "resetPassword") {
      const hashed = await bcrypt.hash(validated.newPassword, 12)
      await db.collection("users").updateOne(
        { _id: new ObjectId(validated.userId) },
        { $set: { password: hashed, updatedAt: new Date() } }
      )
      return NextResponse.json({ success: true, message: "Password reset" })
    }

    if (validated.action === "setOnboarding") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(validated.userId) },
        { $set: { onboardingCompleted: validated.completed, updatedAt: new Date() } }
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Admin patch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/users?userId=xxx — delete account + all data
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    await dbConnect()
    const client = await clientPromise
    const db = client.db("handyflix")

    await Promise.all([
      db.collection("users").deleteOne({ _id: new ObjectId(userId) }),
      db.collection("sessions").deleteMany({ userId }),
      db.collection("accounts").deleteMany({ userId }),
      WatchProgress.deleteMany({ userId }),
      UserList.deleteMany({ userId }),
    ])

    return NextResponse.json({ success: true, message: "Account and all data deleted" })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
