import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { OnboardingClient } from "./onboarding-client"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Set up your HANDYFLIX profile with a name and avatar.",
}

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user has already completed onboarding
  const client = await clientPromise
  const db = client.db("handyflix")
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })

  if (user?.onboardingCompleted) {
    redirect("/")
  }

  return (
    <OnboardingClient
      userId={session.user.id}
      defaultName={session.user.name || ""}
      defaultImage={session.user.image || null}
    />
  )
}
