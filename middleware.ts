import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that require authentication
const protectedRoutes = ["/profile", "/my-list"]
const protectedApiRoutes = ["/api/user"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Detect if running over HTTPS (check forwarded proto for proxied environments)
  const forwardedProto = req.headers.get("x-forwarded-proto")
  const isSecure = forwardedProto === "https" || req.nextUrl.protocol === "https:"
  
  // Get the token using Edge-compatible JWT verification
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isSecure, // Use secure cookie name (__Secure-) when on HTTPS
  })
  const isLoggedIn = !!token

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))
  const isOnboardingPage = pathname === "/onboarding"

  // Allow access to onboarding page for logged-in users
  if (isOnboardingPage && isLoggedIn) {
    return NextResponse.next()
  }

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
    // Check if user needs onboarding (needsOnboarding flag in token)
    if (token.needsOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin))
    }
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match protected routes
    "/profile/:path*",
    "/my-list/:path*",
    "/login",
    "/register",
    "/onboarding",
    // Match protected API routes
    "/api/user/:path*",
  ],
}