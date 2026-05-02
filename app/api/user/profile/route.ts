import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional(),
})

const changePasswordSchema = z.object({
  action: z.literal("changePassword"),
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("handyflix")
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      accountStatus: user.accountStatus || "free",
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Check if this is a password change request
    if (body.action === "changePassword") {
      const validated = changePasswordSchema.parse(body)

      const client = await clientPromise
      const db = client.db("handyflix")
      const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "This account uses social login. Password cannot be changed." },
          { status: 400 }
        )
      }

      const isCurrentPasswordValid = await bcrypt.compare(validated.currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      const hashedNewPassword = await bcrypt.hash(validated.newPassword, 12)

      await db.collection("users").updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { password: hashedNewPassword, updatedAt: new Date() } }
      )

      return NextResponse.json({ success: true, message: "Password changed successfully" })
    }

    // Regular profile update
    const validated = updateProfileSchema.parse(body)
    const updateData: Record<string, any> = { updatedAt: new Date() }

    if (validated.name) updateData.name = validated.name
    if (validated.image) updateData.image = validated.image

    const client = await clientPromise
    const db = client.db("handyflix")

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    )

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
