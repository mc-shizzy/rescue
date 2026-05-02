"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  User, Mail, Shield, Crown, ChevronLeft, Lock, Eye, EyeOff,
  LogOut, Check, Loader2, Camera, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AVATAR_OPTIONS } from "@/lib/avatar-options"

interface ProfileClientProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    accountStatus: string
  }
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(user.image)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (!isPasswordValid) {
      setPasswordError("Please meet all password requirements")
      return
    }

    setIsChangingPassword(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password")
      } else {
        setPasswordSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setPasswordError("An error occurred. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAvatarSelect = async (avatarUrl: string) => {
    setIsUpdatingAvatar(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: avatarUrl }),
      })

      if (res.ok) {
        setSelectedAvatar(avatarUrl)
        setShowAvatarPicker(false)
        router.refresh()
      }
    } catch {
      console.error("Failed to update avatar")
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div
          className="relative p-6 sm:p-8 rounded-3xl mb-8"
          style={{
            background: "oklch(0.12 0.03 255 / 0.6)",
            border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-primary/20"
                style={{ boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)" }}
              >
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black mb-2">{user.name || "User"}</h1>
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mb-4">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>

              {/* Status Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: user.accountStatus === "premium"
                    ? "linear-gradient(135deg, oklch(0.6 0.2 50 / 0.2), oklch(0.5 0.2 30 / 0.2))"
                    : "oklch(0.16 0.03 255 / 0.8)",
                  border: user.accountStatus === "premium"
                    ? "1px solid oklch(0.6 0.2 50 / 0.4)"
                    : "1px solid oklch(0.7 0.05 240 / 0.15)",
                }}
              >
                <Crown
                  className={cn(
                    "h-5 w-5",
                    user.accountStatus === "premium" ? "text-yellow-400" : "text-muted-foreground/50"
                  )}
                />
                <span className={cn(
                  "font-bold uppercase tracking-wider text-sm",
                  user.accountStatus === "premium" ? "text-yellow-400" : "text-muted-foreground"
                )}>
                  {user.accountStatus === "premium" ? "Premium" : "Free"} Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setShowAvatarPicker(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-md p-6 rounded-3xl"
              style={{
                background: "oklch(0.12 0.03 255 / 0.98)",
                border: "1px solid oklch(0.7 0.05 240 / 0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Choose Avatar</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => handleAvatarSelect(avatar)}
                    disabled={isUpdatingAvatar}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden ring-2 transition-all hover:scale-105",
                      selectedAvatar === avatar ? "ring-primary" : "ring-transparent hover:ring-primary/50"
                    )}
                  >
                    <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {isUpdatingAvatar && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Section */}
        <div
          className="p-6 sm:p-8 rounded-3xl mb-8"
          style={{
            background: "oklch(0.12 0.03 255 / 0.6)",
            border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.58 0.22 245 / 0.15)", border: "1px solid oklch(0.58 0.22 245 / 0.25)" }}
            >
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">Security</h2>
              <p className="text-xs text-muted-foreground">Change your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {passwordError && (
              <div
                className="p-3 rounded-xl text-sm text-red-400 flex items-center gap-2"
                style={{ background: "oklch(0.5 0.2 25 / 0.1)", border: "1px solid oklch(0.5 0.2 25 / 0.3)" }}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                className="p-3 rounded-xl text-sm text-green-400 flex items-center gap-2"
                style={{ background: "oklch(0.5 0.2 140 / 0.1)", border: "1px solid oklch(0.5 0.2 140 / 0.3)" }}
              >
                <Check className="h-4 w-4 flex-shrink-0" />
                Password changed successfully!
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-white/[0.03] grid grid-cols-2 gap-2 text-xs">
                  <div className={cn("flex items-center gap-1.5", hasMinLength ? "text-green-500" : "text-muted-foreground/50")}>
                    {hasMinLength ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                    8+ characters
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasUppercase ? "text-green-500" : "text-muted-foreground/50")}>
                    {hasUppercase ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                    Uppercase
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasLowercase ? "text-green-500" : "text-muted-foreground/50")}>
                    {hasLowercase ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                    Lowercase
                  </div>
                  <div className={cn("flex items-center gap-1.5", hasNumber ? "text-green-500" : "text-muted-foreground/50")}>
                    {hasNumber ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                    Number
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white/5 border focus:outline-none focus:ring-2 transition-all",
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                        : "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/10 focus:border-primary/50 focus:ring-primary/20"
                  )}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid || isChangingPassword || !currentPassword}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
                isPasswordValid && currentPassword && !isChangingPassword
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-primary/30 cursor-not-allowed"
              )}
              style={{ color: "white" }}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div
          className="p-6 sm:p-8 rounded-3xl"
          style={{
            background: "oklch(0.5 0.15 25 / 0.08)",
            border: "1px solid oklch(0.5 0.15 25 / 0.2)",
          }}
        >
          <h2 className="font-bold text-red-400 mb-4">Sign Out</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
            style={{ border: "1px solid oklch(0.5 0.15 25 / 0.3)" }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
