"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, Check, Loader2, ChevronRight, ChevronLeft, Play, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AVATAR_CATEGORIES } from "@/lib/avatar-options"

interface OnboardingClientProps {
  userId: string
  defaultName: string
  defaultImage: string | null
}

const STEPS = ["Your Name", "Choose Avatar"]

export function OnboardingClient({ userId, defaultName, defaultImage }: OnboardingClientProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(defaultName)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(defaultImage)
  const [activeCategory, setActiveCategory] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleComplete = async () => {
    if (!name.trim()) { setError("Please enter your name"); return }
    if (!selectedAvatar) { setError("Please choose an avatar"); return }
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image: selectedAvatar }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to complete setup")
      }
      await updateSession({ name: name.trim(), image: selectedAvatar, onboardingCompleted: true })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Cinematic background layers */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.45 0.25 260 / 0.18) 0%, transparent 70%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 40% 40% at 80% 80%, oklch(0.55 0.22 320 / 0.08) 0%, transparent 60%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 30% 30% at 10% 60%, oklch(0.5 0.2 200 / 0.07) 0%, transparent 60%)" }} className="absolute inset-0" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Logo */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <p className="text-xl font-black tracking-tight select-none">
          <span className="text-primary">HANDY</span><span className="text-white">FLIX</span>
        </p>
      </div>

      <div className="w-full max-w-xl mt-8">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                  i < step ? "bg-primary text-white scale-90" :
                  i === step ? "bg-primary text-white ring-4 ring-primary/25" :
                  "bg-white/10 text-muted-foreground"
                )}>
                  {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-semibold hidden sm:block transition-colors duration-300",
                  i === step ? "text-white" : "text-muted-foreground"
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px w-10 transition-all duration-500", i < step ? "bg-primary" : "bg-white/10")} />
              )}
            </div>
          ))}
        </div>

        {/* ─── STEP 0: Name ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
                style={{ background: "oklch(0.58 0.22 245 / 0.12)", border: "1px solid oklch(0.58 0.22 245 / 0.25)" }}>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide uppercase">Step 1 of 2</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 text-white">What should we call you?</h1>
              <p className="text-muted-foreground text-sm">This name will appear on your HANDYFLIX profile</p>
            </div>

            {/* Big name input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError("") }}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(1)}
                placeholder="Your display name…"
                maxLength={30}
                autoFocus
                className="w-full px-6 py-5 rounded-2xl text-xl font-semibold bg-white/[0.06] border border-white/10 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/20 text-white"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">
                {name.length}/30
              </span>
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            {/* Preview pill */}
            {name.trim() && (
              <div className="flex justify-center mb-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "oklch(0.58 0.22 245 / 0.10)", border: "1px solid oklch(0.58 0.22 245 / 0.20)" }}>
                  <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{name}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => { if (!name.trim()) { setError("Please enter your name"); return } setStep(1) }}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300",
                name.trim()
                  ? "bg-primary hover:bg-primary/90 text-white hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              )}
              style={{ boxShadow: name.trim() ? "0 8px 32px oklch(0.58 0.22 245 / 0.35)" : "none" }}>
              Continue <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ─── STEP 1: Avatar ───────────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
                style={{ background: "oklch(0.58 0.22 245 / 0.12)", border: "1px solid oklch(0.58 0.22 245 / 0.25)" }}>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide uppercase">Step 2 of 2</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 text-white">Pick your avatar</h1>
              <p className="text-muted-foreground text-sm">Choose the look that represents you</p>
            </div>

            {/* Live preview card */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative flex flex-col items-center gap-3">
                <div className={cn(
                  "relative w-24 h-24 rounded-2xl overflow-hidden transition-all duration-500",
                  selectedAvatar ? "ring-4 ring-primary/60 shadow-2xl" : "ring-2 ring-white/10"
                )}
                  style={{ boxShadow: selectedAvatar ? "0 0 40px oklch(0.58 0.22 245 / 0.4)" : undefined }}>
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt="Selected" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <User className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  {selectedAvatar && (
                    <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-white">{name || "Your Name"}</p>
                {!selectedAvatar && <p className="text-xs text-muted-foreground">No avatar selected</p>}
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
              {AVATAR_CATEGORIES.map((cat, i) => (
                <button key={i} onClick={() => setActiveCategory(i)}
                  className={cn(
                    "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap",
                    activeCategory === i
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white/[0.07] text-muted-foreground hover:bg-white/10 hover:text-white"
                  )}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Avatar grid */}
            <div className="grid grid-cols-4 gap-3 mb-5"
              style={{ background: "oklch(0.11 0.025 258 / 0.5)", borderRadius: "1rem", padding: "1rem", border: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
              {AVATAR_CATEGORIES[activeCategory].avatars.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden transition-all duration-200 group",
                    selectedAvatar === avatar
                      ? "ring-[3px] ring-primary ring-offset-2 ring-offset-[#0a0a0f] scale-105 shadow-xl"
                      : "ring-1 ring-white/10 hover:ring-white/30 hover:scale-105"
                  )}>
                  <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                  {selectedAvatar === avatar ? (
                    <div className="absolute inset-0 bg-primary/15 flex items-end justify-end p-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  )}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1.5 px-5 py-4 rounded-2xl font-semibold text-sm text-muted-foreground bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading || !selectedAvatar}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300",
                  !isLoading && selectedAvatar
                    ? "bg-primary hover:bg-primary/90 text-white hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                )}
                style={{ boxShadow: selectedAvatar ? "0 8px 32px oklch(0.58 0.22 245 / 0.35)" : "none" }}>
                {isLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Setting up…</>
                ) : (
                  <><Play className="h-4 w-4 fill-white" /> Start Watching</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
