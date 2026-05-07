import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import bcrypt from "bcryptjs"
import clientPromise from "./mongodb"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const authConfig: NextAuthConfig = {
  adapter: MongoDBAdapter(clientPromise),
  trustHost: true, // Required for deployments behind proxies (Koyeb, Vercel, etc.)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const client = await clientPromise
          const db = client.db("handyflix")
          const user = await db.collection("users").findOne({ email: email.toLowerCase() })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            accountStatus: user.accountStatus || "free",
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth sign-ins (Google), check if user needs onboarding
      if (account?.provider === "google" && user.id) {
        const client = await clientPromise
        const db = client.db("handyflix")
        const { ObjectId } = await import("mongodb")
        const dbUser = await db.collection("users").findOne({ 
          $or: [
            { _id: new ObjectId(user.id) },
            { email: user.email }
          ]
        })
        
        // If user hasn't completed onboarding, we'll let them sign in
        // and the middleware will redirect them to onboarding
        if (dbUser && !dbUser.onboardingCompleted) {
          // Mark as needing onboarding (token will include this info)
          (user as any).needsOnboarding = true
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id
        token.accountStatus = (user as any).accountStatus || "free"
        token.needsOnboarding = (user as any).needsOnboarding || false
      }
      
      // Re-check onboarding status from DB on every sign-in for Google users
      if (account?.provider === "google" && token.id) {
        try {
          const client = await clientPromise
          const db = client.db("handyflix")
          const { ObjectId } = await import("mongodb")
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(token.id as string) })
          if (dbUser) {
            token.needsOnboarding = !dbUser.onboardingCompleted
            token.name = dbUser.name || token.name
            token.picture = dbUser.image || token.picture
          }
        } catch {}
      }
      
      // Handle session update (e.g., after profile change or onboarding)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        if (session.image) token.picture = session.image
        if (session.onboardingCompleted) {
          token.needsOnboarding = false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.accountStatus = (token.accountStatus as string) || "free"
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If the URL is already an absolute URL within this app, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      return baseUrl
    },
  },
  events: {
    async createUser({ user }) {
      // Set default account status for new users
      const client = await clientPromise
      const db = client.db("handyflix")
      await db.collection("users").updateOne(
        { email: user.email },
        { 
          $set: { 
            accountStatus: "free",
            createdAt: new Date(),
            updatedAt: new Date(),
          } 
        }
      )
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    accountStatus?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      accountStatus: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    accountStatus?: string
    needsOnboarding?: boolean
  }
}
