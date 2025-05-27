// src/middleware.ts
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

// Note: This is a basic middleware setup. 
// You'll likely want to expand on this to protect specific routes.
export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Example: Redirect to login if trying to access a protected route and not logged in
  // const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") // Define your protected routes
  // if (isProtectedRoute && !isLoggedIn) {
  //   return Response.redirect(new URL("/login", nextUrl))
  // }

  // Allow request to proceed
  return
})

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
