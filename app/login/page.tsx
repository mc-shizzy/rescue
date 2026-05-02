import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/auth"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your HANDYFLIX account to access your watchlist, continue watching, and more.",
}

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="glass-pill p-1.5 rounded-lg group-hover:border-primary/30 transition-all">
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </div>
            <Image
              src="/hf-logo.png"
              alt="HANDYFLIX"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-base font-black">
              <span className="text-primary">HANDY</span>
              <span className="text-foreground">FLIX</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        <LoginForm callbackUrl={callbackUrl || "/"} />
      </div>

      {/* Decorative gradient */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, oklch(0.58 0.22 245 / 0.08) 0%, transparent 60%)",
        }}
      />
    </main>
  )
}
