import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import dbConnect from "@/lib/mongoose"
import UserList from "@/lib/models/user-list"

const toggleSchema = z.object({
  contentId: z.string(),
  action: z.enum(["add", "remove", "toggle"]),
})

// Get user's list
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userList = await UserList.findOne({ userId: session.user.id })
    const contentIds = userList?.contentIds || []

    return NextResponse.json({ contentIds })
  } catch (error) {
    console.error("Get user list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add/remove from list
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, action } = toggleSchema.parse(body)

    await dbConnect()

    let userList = await UserList.findOne({ userId: session.user.id })

    if (!userList) {
      userList = new UserList({ userId: session.user.id, contentIds: [] })
    }

    const isInList = userList.contentIds.includes(contentId)
    let newState: boolean

    if (action === "toggle") {
      if (isInList) {
        userList.contentIds = userList.contentIds.filter((id: string) => id !== contentId)
        newState = false
      } else {
        userList.contentIds.push(contentId)
        newState = true
      }
    } else if (action === "add") {
      if (!isInList) {
        userList.contentIds.push(contentId)
      }
      newState = true
    } else {
      userList.contentIds = userList.contentIds.filter((id: string) => id !== contentId)
      newState = false
    }

    await userList.save()

    return NextResponse.json({
      success: true,
      isInList: newState,
      contentIds: userList.contentIds,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Toggle list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Check if content is in list
export async function HEAD(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")

    if (!contentId) {
      return new NextResponse(null, { status: 400 })
    }

    await dbConnect()

    const userList = await UserList.findOne({ userId: session.user.id })
    const isInList = userList?.contentIds.includes(contentId) || false

    return new NextResponse(null, {
      status: 200,
      headers: { "X-In-List": isInList.toString() },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
