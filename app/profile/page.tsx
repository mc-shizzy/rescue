import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProfileClient } from "./profile-client"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your HANDYFLIX profile, change password, and view account settings.",
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile")
  }

  return <ProfileClient user={session.user} />
}
