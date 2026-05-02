"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Check, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AVATAR_OPTIONS } from "@/lib/avatar-options"

interface OnboardingClientProps {
  userId: string
  defaultName: string
  defaultImage: string | null
}

export function OnboardingClient({ userId, defaultName, defaultImage }: OnboardingClientProps) {
  const router = useRouter()
  const [name, setName] = useState(defaultName)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(defaultImage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleComplete = async () => {
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    if (!selectedAvatar) {
      setError("Please choose an avatar")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: selectedAvatar,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to complete setup")
      }

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, oklch(0.58 0.22 245 / 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "oklch(0.58 0.22 245 / 0.12)",
              border: "1px solid oklch(0.58 0.22 245 / 0.25)",
            }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Welcome to HANDYFLIX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Complete Your Profile</h1>
          <p className="text-muted-foreground">Choose a name and pick your avatar</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl text-sm text-red-400 text-center"
            style={{ background: "oklch(0.5 0.2 25 / 0.1)", border: "1px solid oklch(0.5 0.2 25 / 0.3)" }}
          >
            {error}
          </div>
        )}

        {/* Name Input */}
        <div
          className="p-6 rounded-2xl mb-6"
          style={{
            background: "oklch(0.12 0.03 255 / 0.6)",
            border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          }}
        >
          <label className="block text-sm font-semibold mb-3">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl text-base bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <p className="text-xs text-muted-foreground mt-2">This is how you&apos;ll appear on HANDYFLIX</p>
        </div>

        {/* Avatar Selection */}
        <div
          className="p-6 rounded-2xl mb-8"
          style={{
            background: "oklch(0.12 0.03 255 / 0.6)",
            border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          }}
        >
          <label className="block text-sm font-semibold mb-4">Choose Your Avatar</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {AVATAR_OPTIONS.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:scale-105",
                  selectedAvatar === avatar
                    ? "ring-3 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "ring-1 ring-white/10 hover:ring-white/30"
                )}
              >
                {/* Using img for SVG URLs from DiceBear */}
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.58 0.22 245)" }}
                    >
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview and Submit */}
        <div
          className="p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6"
          style={{
            background: "oklch(0.12 0.03 255 / 0.6)",
            border: "1px solid oklch(0.7 0.05 240 / 0.12)",
          }}
        >
          {/* Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-primary/30"
              style={{ boxShadow: "0 4px 20px oklch(0 0 0 / 0.3)" }}
            >
              {selectedAvatar ? (
                <img src={selectedAvatar} alt="Selected avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary/40" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-lg">{name || "Your Name"}</p>
              <p className="text-xs text-muted-foreground">Preview</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleComplete}
            disabled={isLoading || !name.trim() || !selectedAvatar}
            className={cn(
              "flex-1 sm:flex-none sm:ml-auto py-3 px-8 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
              isLoading || !name.trim() || !selectedAvatar
                ? "bg-primary/30 cursor-not-allowed text-white/50"
                : "bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] text-white"
            )}
            style={{
              boxShadow: name.trim() && selectedAvatar ? "0 4px 24px oklch(0.58 0.22 245 / 0.4)" : "none",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Start Watching"
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
