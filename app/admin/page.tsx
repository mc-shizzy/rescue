import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminDashboard } from "./admin-dashboard"

export const metadata = { title: "Admin Dashboard | HANDYFLIX" }

function isAdmin(email: string | null | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && adminEmails.includes(email.toLowerCase())
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user || !isAdmin(session.user.email)) {
    redirect("/")
  }

  return <AdminDashboard adminName={session.user.name || "Admin"} adminImage={session.user.image || null} />
}
