// src/middleware.ts
import { NextRequest, NextResponse } from "next/server"

export default function middleware(request: NextRequest) {
  // DEVELOPMENT ONLY: Completely bypass auth for testing
  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV
  const bypassAuth = process.env.BYPASS_AUTH === "true"
  
  if (isDev && bypassAuth) {
    console.log("🚀 Development mode: Authentication bypass enabled for", request.nextUrl.pathname)
    return NextResponse.next()
  }
  
  // For production, implement normal auth logic
  // For now, we'll allow all requests to proceed
  return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
