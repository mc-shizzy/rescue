import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(30, "Name too long"),
  image: z.string().url("Invalid avatar URL"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = onboardingSchema.parse(body)

    const client = await clientPromise
    const db = client.db("handyflix")

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          name: validated.name,
          image: validated.image,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Profile setup complete",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
