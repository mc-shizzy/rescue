import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Routes that require authentication
const protectedRoutes = ["/profile", "/my-list"]
const protectedApiRoutes = ["/api/user"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Return 401 for unauthenticated API requests
  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match protected routes
    "/profile/:path*",
    "/my-list/:path*",
    "/login",
    "/register",
    // Match protected API routes
    "/api/user/:path*",
  ],
}
