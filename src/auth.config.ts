// src/auth.config.ts
// This file is separate from auth.ts to avoid importing bcrypt (which is server-only)
// into middleware or client-side components.
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [], // Providers are defined in auth.ts
  pages: {
    signIn: '/login',
    // error: '/auth/error', // Optional
  },  callbacks: {
    // authorized is used to protect routes via middleware
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl
      
      // DEVELOPMENT ONLY: Skip authorization for testing
      if (process.env.NODE_ENV === "development") {
        const userAgent = request.headers.get("user-agent") || ""
        const isVSCodeBrowser = userAgent.includes("Visual Studio Code") || 
                               userAgent.includes("vscode") ||
                               request.headers.get("sec-fetch-dest") === "document"
        
        // Skip auth for VS Code browser or when bypass query param is present
        if (isVSCodeBrowser || nextUrl.searchParams.has("bypass-auth")) {
          return true
        }
      }

      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') // Example protected route
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // If logged in and trying to access auth pages like /login or /register, redirect to dashboard
        // This needs to be more specific if you have other public pages
        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
      }
      return true
    },
  },
} satisfies NextAuthConfig;
