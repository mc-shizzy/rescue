"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { User, Settings, Bookmark, LogOut, Crown, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) return null

  const userImage = session.user.image
  const userName = session.user.name || "User"
  const userEmail = session.user.email
  const accountStatus = session.user.accountStatus || "free"

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 hover:bg-white/[0.07]"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
          {userImage ? (
            <Image src={userImage} alt={userName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
          style={{
            background: "oklch(0.11 0.025 255 / 0.98)",
            backdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid oklch(0.7 0.05 240 / 0.15)",
            boxShadow: "0 20px 60px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.08)",
          }}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                {userImage ? (
                  <Image src={userImage} alt={userName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
            {/* Status Badge */}
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: accountStatus === "premium"
                  ? "linear-gradient(135deg, oklch(0.6 0.2 50 / 0.2), oklch(0.5 0.2 30 / 0.2))"
                  : "oklch(0.16 0.03 255 / 0.6)",
                border: accountStatus === "premium"
                  ? "1px solid oklch(0.6 0.2 50 / 0.4)"
                  : "1px solid oklch(0.7 0.05 240 / 0.1)",
              }}
            >
              <Crown
                className={cn(
                  "h-4 w-4",
                  accountStatus === "premium" ? "text-yellow-400" : "text-muted-foreground/50"
                )}
              />
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                accountStatus === "premium" ? "text-yellow-400" : "text-muted-foreground"
              )}>
                {accountStatus === "premium" ? "Premium" : "Free"} Account
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </Link>
            <Link
              href="/my-list"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              <Bookmark className="h-4 w-4" />
              My List
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-white/[0.08]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
