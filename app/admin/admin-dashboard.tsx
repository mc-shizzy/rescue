"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import {
  Users, Search, Shield, Trash2, Lock, Crown, Ban, CheckCircle,
  Eye, X, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  Clock, Bookmark, Film, TrendingUp, UserCheck, UserX,
  MoreVertical, AlertTriangle, Key, Activity, LogOut, Home,
  ChevronDown, Star, Calendar, BarChart3, MonitorSmartphone, Wifi, WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  name: string
  email: string
  image: string | null
  accountStatus: "free" | "premium" | "banned"
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
  lastWatched: string | null
  lastContent: string | null
  watchCount: number
  listCount: number
  loginProvider: "google" | "credentials"
}

interface WatchEntry {
  contentId: string
  contentTitle: string
  contentPoster: string
  contentType: "movie" | "series"
  season: number | null
  episode: number | null
  progressPercent: number
  progressSeconds: number
  lastWatched: string
  completed: boolean
}

interface UserDetail {
  user: AdminUser & { [k: string]: any }
  watchHistory: WatchEntry[]
  myList: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return "—"
  try { return format(new Date(d), "MMM d, yyyy") } catch { return "—" }
}
function fmtAgo(d: string | null | undefined) {
  if (!d) return "—"
  try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return "—" }
}
function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_CONFIG = {
  free:    { label: "Free",    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: UserCheck },
  premium: { label: "Premium", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Crown },
  banned:  { label: "Banned",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: Ban },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: "oklch(0.12 0.03 255 / 0.7)", border: "1px solid oklch(0.7 0.05 240 / 0.12)" }}>
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10", color)} />
      <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3", color.replace("text-", "bg-").replace("400", "500/10"))}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: "free" | "premium" | "banned" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.free
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border", cfg.color, cfg.bg, cfg.border)}>
      <cfg.icon className="h-3 w-3" />{cfg.label}
    </span>
  )
}

function Avatar({ src, name, size = 8 }: { src?: string | null; name?: string; size?: number }) {
  const sz = `w-${size} h-${size}`
  if (src) return (
    <div className={cn(sz, "relative rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0")}>
      <Image src={src} alt={name || "avatar"} fill className="object-cover" unoptimized />
    </div>
  )
  return (
    <div className={cn(sz, "rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/20 shrink-0")}>
      <span className="text-primary font-bold text-xs">{(name?.[0] || "?").toUpperCase()}</span>
    </div>
  )
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────

function UserDrawer({ userId, onClose, onRefresh }: { userId: string; onClose: () => void; onRefresh: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "list">("overview")
  const [actionLoading, setActionLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPwForm, setShowPwForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`/api/admin/users?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const doAction = async (body: object, msg: string) => {
    setActionLoading(true)
    try {
      const r = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      showToast(msg)
      onRefresh()
      const fresh = await fetch(`/api/admin/users?userId=${userId}`).then(r => r.json())
      setDetail(fresh)
    } catch (e: any) {
      showToast(e.message || "Error", "err")
    } finally {
      setActionLoading(false)
    }
  }

  const doDelete = async () => {
    setActionLoading(true)
    try {
      const r = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      onRefresh()
      onClose()
    } catch (e: any) {
      showToast(e.message || "Error", "err")
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative ml-auto w-full max-w-xl h-full overflow-y-auto flex flex-col"
        style={{ background: "oklch(0.09 0.025 258)", borderLeft: "1px solid oklch(0.7 0.05 240 / 0.12)" }}
      >
        {/* Toast */}
        {toast && (
          <div className={cn(
            "fixed top-4 right-4 z-[300] px-4 py-3 rounded-xl text-sm font-semibold shadow-xl",
            toast.type === "ok" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>{toast.msg}</div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: "oklch(0.09 0.025 258 / 0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />Back
          </button>
          <span className="text-sm font-semibold">User Detail</span>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Failed to load</div>
        ) : (
          <div className="flex-1 p-6 space-y-5">
            {/* Profile card */}
            <div className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "oklch(0.12 0.03 255 / 0.6)", border: "1px solid oklch(0.7 0.05 240 / 0.12)" }}>
              <Avatar src={detail.user.image} name={detail.user.name} size={16} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{detail.user.name || "—"}</p>
                <p className="text-sm text-muted-foreground truncate">{detail.user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={detail.user.accountStatus} />
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border",
                    detail.user.loginProvider === "google"
                      ? "text-blue-300 bg-blue-500/10 border-blue-500/20"
                      : "text-purple-300 bg-purple-500/10 border-purple-500/20"
                  )}>
                    {detail.user.loginProvider === "google" ? "Google" : "Email"}
                  </span>
                  {detail.user.onboardingCompleted && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20">
                      Onboarded
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Film, label: "Watched", value: detail.watchHistory.length },
                { icon: Bookmark, label: "My List", value: detail.myList.length },
                { icon: CheckCircle, label: "Completed", value: detail.watchHistory.filter(w => w.completed).length },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "oklch(0.12 0.03 255 / 0.5)", border: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-black">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "oklch(0.12 0.03 255 / 0.5)" }}>
              {(["overview", "history", "list"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all",
                    activeTab === tab ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Info rows */}
                <div className="rounded-2xl overflow-hidden divide-y"
                  style={{ border: "1px solid oklch(0.7 0.05 240 / 0.12)", background: "oklch(0.12 0.03 255 / 0.5)" }}>
                  {[
                    { label: "User ID", value: detail.user.id },
                    { label: "Joined", value: fmtDate(detail.user.createdAt) },
                    { label: "Last active", value: fmtAgo(detail.user.lastWatched || detail.user.updatedAt) },
                    { label: "Last watched", value: detail.user.lastContent || "—" },
                    { label: "Provider", value: detail.user.loginProvider === "google" ? "Google OAuth" : "Email / Password" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between px-4 py-3 gap-4"
                      style={{ borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
                      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                      <span className="text-xs font-medium text-right break-all">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</p>

                  {/* Status buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {(["free", "premium", "banned"] as const).map((s) => {
                      const cfg = STATUS_CONFIG[s]
                      return (
                        <button key={s} disabled={actionLoading || detail.user.accountStatus === s}
                          onClick={() => doAction({ action: "setStatus", userId, status: s }, `Status set to ${s}`)}
                          className={cn("py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-40",
                            detail.user.accountStatus === s
                              ? cn(cfg.color, cfg.bg, cfg.border)
                              : "text-muted-foreground border-white/10 hover:border-white/20 hover:bg-white/5"
                          )}>
                          <cfg.icon className="h-3.5 w-3.5 mx-auto mb-0.5" />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Reset password */}
                  <button onClick={() => setShowPwForm(!showPwForm)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 hover:text-foreground transition-all">
                    <Key className="h-4 w-4" />Reset Password
                    <ChevronDown className={cn("h-3.5 w-3.5 ml-auto transition-transform", showPwForm && "rotate-180")} />
                  </button>
                  {showPwForm && (
                    <div className="flex gap-2">
                      <input type="password" placeholder="New password (min 8 chars)"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none" />
                      <button disabled={newPassword.length < 8 || actionLoading}
                        onClick={() => { doAction({ action: "resetPassword", userId, newPassword }, "Password reset"); setNewPassword(""); setShowPwForm(false) }}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-all">
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
                      </button>
                    </div>
                  )}

                  {/* Delete */}
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-4 w-4" />Delete Account & All Data
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <p className="text-sm font-semibold">This deletes everything permanently.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold border border-white/10 text-muted-foreground hover:bg-white/5 transition-all">
                          Cancel
                        </button>
                        <button onClick={doDelete} disabled={actionLoading}
                          className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition-all">
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Confirm Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-2">
                {detail.watchHistory.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">No watch history</div>
                ) : detail.watchHistory.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "oklch(0.12 0.03 255 / 0.5)", border: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
                    {w.contentPoster ? (
                      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 relative">
                        <Image src={w.contentPoster} alt={w.contentTitle} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Film className="h-4 w-4 text-primary/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{w.contentTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.contentType === "series" && w.season ? `S${w.season}E${w.episode} · ` : ""}
                        {fmtTime(w.progressSeconds)} · {w.progressPercent}%
                      </p>
                      <p className="text-xs text-muted-foreground/60">{fmtAgo(w.lastWatched)}</p>
                    </div>
                    {w.completed && (
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "list" && (
              <div className="space-y-2">
                {detail.myList.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">My list is empty</div>
                ) : (
                  <div className="rounded-2xl overflow-hidden divide-y"
                    style={{ border: "1px solid oklch(0.7 0.05 240 / 0.12)", background: "oklch(0.12 0.03 255 / 0.5)" }}>
                    {detail.myList.map((id, i) => (
                      <div key={id} className="flex items-center gap-3 px-4 py-3"
                        style={{ borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
                        <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground">{id}</span>
                        <span className="ml-auto text-xs text-muted-foreground/50">#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface SessionEntry {
  sessionToken: string
  userId: string | null
  userName: string
  userEmail: string | null
  userImage: string | null
  accountStatus: string
  expires: string
  isActive: boolean
  isCurrentAdmin: boolean
}

interface SessionsData {
  sessions: SessionEntry[]
  totalActive: number
  totalExpired: number
  uniqueActiveUsers: number
}

interface Props { adminName: string; adminImage: string | null }

export function AdminDashboard({ adminName, adminImage }: Props) {
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "free" | "premium" | "banned">("all")
  const [sessionsData, setSessionsData] = useState<SessionsData | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null)
  const [sessionToast, setSessionToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const LIMIT = 20

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (debouncedSearch) params.set("search", debouncedSearch)
      const r = await fetch(`/api/admin/users?${params}`)
      const d = await r.json()
      setUsers(d.users || [])
      setTotal(d.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page, debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filteredUsers = useMemo(() =>
    filterStatus === "all" ? users : users.filter(u => u.accountStatus === filterStatus),
    [users, filterStatus]
  )

  const stats = useMemo(() => ({
    total,
    premium: users.filter(u => u.accountStatus === "premium").length,
    banned: users.filter(u => u.accountStatus === "banned").length,
    active: users.filter(u => u.lastWatched && new Date(u.lastWatched) > new Date(Date.now() - 7 * 86400000)).length,
  }), [users, total])

  const totalPages = Math.ceil(total / LIMIT)

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const r = await fetch("/api/admin/sessions")
      const d = await r.json()
      setSessionsData(d)
    } catch {}
    finally { setSessionsLoading(false) }
  }, [])

  useEffect(() => {
    if (activeTab === "sessions") fetchSessions()
  }, [activeTab, fetchSessions])

  const revokeUserSessions = async (userId: string, userName: string) => {
    setRevokingUserId(userId)
    try {
      const r = await fetch(`/api/admin/sessions?userId=${userId}`, { method: "DELETE" })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSessionToast({ msg: `Sessions revoked for ${userName}`, type: "ok" })
      setTimeout(() => setSessionToast(null), 3000)
      fetchSessions()
    } catch (e: any) {
      setSessionToast({ msg: e.message || "Error", type: "err" })
      setTimeout(() => setSessionToast(null), 3000)
    } finally {
      setRevokingUserId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 z-50 hidden xl:flex flex-col"
        style={{ background: "oklch(0.09 0.025 258 / 0.98)", borderRight: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
        <div className="p-6 border-b" style={{ borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black"><span className="text-primary">HANDY</span>FLIX</p>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={adminImage} name={adminName} size={9} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{adminName}</p>
              <p className="text-xs text-primary">Super Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {([
            { icon: Users, label: "Users", tab: "users" },
            { icon: MonitorSmartphone, label: "Sessions", tab: "sessions" },
          ] as const).map(({ icon: Icon, label, tab }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === tab ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}>
              <Icon className={cn("h-4 w-4", activeTab === tab && "text-primary")} />
              {label}
              {activeTab === tab && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-1" style={{ borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Home className="h-4 w-4" />Back to Site
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="h-4 w-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="xl:ml-64 flex flex-col min-h-screen">
        {/* Session toast */}
        {sessionToast && (
          <div className={cn(
            "fixed top-4 right-4 z-[300] px-4 py-3 rounded-xl text-sm font-semibold shadow-xl",
            sessionToast.type === "ok" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>{sessionToast.msg}</div>
        )}

        {/* Top bar */}
        <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
          style={{ background: "oklch(0.09 0.025 258 / 0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.7 0.05 240 / 0.08)" }}>
          <div>
            <h1 className="text-xl font-black">{activeTab === "users" ? "User Management" : "Active Sessions"}</h1>
            <p className="text-xs text-muted-foreground">
              {activeTab === "users"
                ? `${total.toLocaleString()} total accounts`
                : sessionsData ? `${sessionsData.totalActive} active · ${sessionsData.uniqueActiveUsers} unique users` : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile tab switcher */}
            <div className="flex xl:hidden gap-1 p-1 rounded-xl" style={{ background: "oklch(0.12 0.03 255 / 0.5)" }}>
              {(["users", "sessions"] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                    activeTab === t ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  )}>{t}</button>
              ))}
            </div>
            <button onClick={activeTab === "users" ? fetchUsers : fetchSessions} disabled={loading || sessionsLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all disabled:opacity-50">
              <RefreshCw className={cn("h-4 w-4", (loading || sessionsLoading) && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6">

          {/* ── Sessions tab ─────────────────────────────────────────── */}
          {activeTab === "sessions" && (
            <>
              {/* Session stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Wifi}            label="Active Sessions"  value={sessionsData?.totalActive ?? "—"}       sub="valid tokens"        color="text-green-400" />
                <StatCard icon={Users}           label="Unique Users"     value={sessionsData?.uniqueActiveUsers ?? "—"} sub="currently logged in" color="text-blue-400" />
                <StatCard icon={WifiOff}         label="Expired Sessions" value={sessionsData?.totalExpired ?? "—"}      sub="stale tokens"        color="text-muted-foreground" />
              </div>

              {/* Sessions table */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.7 0.05 240 / 0.12)" }}>
                <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  style={{ background: "oklch(0.11 0.03 255 / 0.8)", borderBottom: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
                  <span className="w-10">User</span>
                  <span>Account</span>
                  <span className="w-24 text-center">Status</span>
                  <span className="w-32 text-center">Expires</span>
                  <span className="w-20 text-center">Action</span>
                </div>

                {sessionsLoading ? (
                  <div className="py-20 flex items-center justify-center" style={{ background: "oklch(0.10 0.025 258 / 0.5)" }}>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !sessionsData || sessionsData.sessions.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3" style={{ background: "oklch(0.10 0.025 258 / 0.5)" }}>
                    <MonitorSmartphone className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">No sessions found</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ background: "oklch(0.10 0.025 258 / 0.5)", borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
                    {sessionsData.sessions.map((s, i) => (
                      <div key={i}
                        className={cn(
                          "hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors",
                          s.isCurrentAdmin ? "bg-primary/5" : "hover:bg-white/[0.02]"
                        )}
                        style={{ borderColor: "oklch(0.7 0.05 240 / 0.06)" }}>
                        <Avatar src={s.userImage} name={s.userName} size={10} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{s.userName}</p>
                            {s.isCurrentAdmin && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">YOU</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{s.userEmail || "—"}</p>
                          <p className="text-xs text-muted-foreground/50 font-mono">token: {s.sessionToken}</p>
                        </div>
                        <div className="w-24 flex justify-center">
                          {s.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                              <Wifi className="h-3 w-3" />Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-muted-foreground bg-white/5 border border-white/10">
                              <WifiOff className="h-3 w-3" />Expired
                            </span>
                          )}
                        </div>
                        <div className="w-32 text-center">
                          <p className="text-xs font-medium">{fmtDate(s.expires)}</p>
                          <p className="text-xs text-muted-foreground/60">{fmtAgo(s.expires)}</p>
                        </div>
                        <div className="w-20 flex justify-center">
                          {s.userId && !s.isCurrentAdmin ? (
                            <button
                              disabled={revokingUserId === s.userId}
                              onClick={() => revokeUserSessions(s.userId!, s.userName)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 disabled:opacity-40 transition-all">
                              {revokingUserId === s.userId
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <LogOut className="h-3 w-3" />}
                              Revoke
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground/30">{s.isCurrentAdmin ? "—" : "—"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Mobile */}
                    {sessionsData.sessions.map((s, i) => (
                      <div key={`m-${i}`}
                        className={cn("sm:hidden p-4 flex items-center gap-3", s.isCurrentAdmin ? "bg-primary/5" : "")}
                        style={{ borderColor: "oklch(0.7 0.05 240 / 0.06)" }}>
                        <Avatar src={s.userImage} name={s.userName} size={10} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold truncate">{s.userName}</p>
                            {s.isCurrentAdmin && <span className="text-[10px] font-bold text-primary">YOU</span>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{s.userEmail || "—"}</p>
                          <p className="text-xs mt-0.5">{s.isActive
                            ? <span className="text-green-400">● Active</span>
                            : <span className="text-muted-foreground">● Expired</span>}
                          </p>
                        </div>
                        {s.userId && !s.isCurrentAdmin && (
                          <button
                            disabled={revokingUserId === s.userId}
                            onClick={() => revokeUserSessions(s.userId!, s.userName)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/5 disabled:opacity-40 transition-all">
                            {revokingUserId === s.userId ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Users tab ────────────────────────────────────────────── */}
          {activeTab === "users" && <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Users"    value={total}          sub="all time"             color="text-blue-400" />
            <StatCard icon={Crown}     label="Premium"        value={stats.premium}  sub="paid accounts"        color="text-yellow-400" />
            <StatCard icon={TrendingUp}label="Active (7d)"    value={stats.active}   sub="watched recently"     color="text-green-400" />
            <StatCard icon={Ban}       label="Banned"         value={stats.banned}   sub="restricted accounts"  color="text-red-400" />
          </div>

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(["all", "free", "premium", "banned"] as const).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-all",
                    filterStatus === s
                      ? s === "all" ? "bg-primary/20 text-primary border-primary/30"
                        : cn(STATUS_CONFIG[s]?.color, STATUS_CONFIG[s]?.bg, STATUS_CONFIG[s]?.border)
                      : "text-muted-foreground border-white/10 hover:bg-white/5"
                  )}>{s}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.7 0.05 240 / 0.12)" }}>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              style={{ background: "oklch(0.11 0.03 255 / 0.8)", borderBottom: "1px solid oklch(0.7 0.05 240 / 0.10)" }}>
              <span className="w-10">Avatar</span>
              <span>User</span>
              <span className="w-20 text-center">Status</span>
              <span className="w-16 text-center">Watched</span>
              <span className="w-16 text-center">List</span>
              <span className="w-8 text-center">Action</span>
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center" style={{ background: "oklch(0.10 0.025 258 / 0.5)" }}>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3" style={{ background: "oklch(0.10 0.025 258 / 0.5)" }}>
                <Users className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No users found</p>
              </div>
            ) : (
              <div className="divide-y" style={{ background: "oklch(0.10 0.025 258 / 0.5)", borderColor: "oklch(0.7 0.05 240 / 0.08)" }}>
                {filteredUsers.map((user) => (
                  <div key={user.id}
                    className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    onClick={() => setSelectedUserId(user.id)}
                    style={{ borderColor: "oklch(0.7 0.05 240 / 0.06)" }}>
                    <Avatar src={user.image} name={user.name} size={10} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground/50">Joined {fmtDate(user.createdAt)} · {user.loginProvider === "google" ? "Google" : "Email"}</p>
                    </div>
                    <div className="w-20 flex justify-center">
                      <StatusBadge status={user.accountStatus} />
                    </div>
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold">{user.watchCount}</p>
                      <p className="text-xs text-muted-foreground/60">items</p>
                    </div>
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold">{user.listCount}</p>
                      <p className="text-xs text-muted-foreground/60">saved</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id) }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {/* Mobile cards */}
                {filteredUsers.map((user) => (
                  <div key={`m-${user.id}`} className="sm:hidden p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setSelectedUserId(user.id)}
                    style={{ borderColor: "oklch(0.7 0.05 240 / 0.06)" }}>
                    <Avatar src={user.image} name={user.name} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <StatusBadge status={user.accountStatus} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                ))}
              </div>
            )}
          </div>

          </> }

          {/* Pagination */}
          {activeTab === "users" && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {total} users
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-all">
                  <ChevronLeft className="h-4 w-4" />Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={cn("w-9 h-9 rounded-xl text-sm font-bold transition-all",
                          page === p ? "bg-primary text-white" : "text-muted-foreground border border-white/10 hover:bg-white/5"
                        )}>{p}</button>
                    )
                  })}
                </div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 disabled:opacity-40 transition-all">
                  Next<ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User detail drawer */}
      {selectedUserId && (
        <UserDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  )
}
