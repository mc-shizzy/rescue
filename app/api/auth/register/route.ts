import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }
  
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return true
  }
  
  record.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = registerSchema.parse(body)

    const client = await clientPromise
    const db = client.db("handyflix")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: validated.email.toLowerCase(),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (12 rounds for security)
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Create new user
    const result = await db.collection("users").insertOne({
      name: validated.name,
      email: validated.email.toLowerCase(),
      emailVerified: null,
      password: hashedPassword,
      image: null,
      accountStatus: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
