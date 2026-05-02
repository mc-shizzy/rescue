"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "./mongodb"
import { signIn } from "./auth"
import { AuthError } from "next-auth"

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export type RegisterResult = {
  success: boolean
  error?: string
}

export type LoginResult = {
  success: boolean
  error?: string
}

export type ChangePasswordResult = {
  success: boolean
  error?: string
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    const validated = registerSchema.parse({ name, email, password })

    const client = await clientPromise
    const db = client.db("handyflix")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: validated.email.toLowerCase(),
    })

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
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
      return { success: false, error: "Failed to create account" }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Registration error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" }
        default:
          return { success: false, error: "Something went wrong" }
      }
    }
    throw error
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  try {
    const validated = changePasswordSchema.parse({ currentPassword, newPassword })

    const client = await clientPromise
    const db = client.db("handyflix")
    const { ObjectId } = await import("mongodb")

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    if (!user.password) {
      return { success: false, error: "This account uses social login. Password cannot be changed." }
    }

    const isCurrentPasswordValid = await bcrypt.compare(validated.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    const hashedNewPassword = await bcrypt.hash(validated.newPassword, 12)

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date(),
        } 
      }
    )

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Change password error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise
    const db = client.db("handyflix")
    const { ObjectId } = await import("mongodb")

    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (data.name) updateData.name = data.name
    if (data.image) updateData.image = data.image

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
