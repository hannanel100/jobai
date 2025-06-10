// src/middleware.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth(req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  // DEVELOPMENT ONLY: Allow bypass for testing
  const isDev = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.BYPASS_AUTH === 'true';

  if (isDev && bypassAuth) {
    console.log(
      '🚀 Development mode: Authentication bypass enabled for',
      nextUrl.pathname
    );
    return NextResponse.next();
  }

  // Check if accessing protected routes
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnAuth =
    nextUrl.pathname.startsWith('/auth/') ||
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register');

  // Redirect to login if trying to access protected route without auth
  if (isOnDashboard && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access auth pages while logged in
  if (isOnAuth && isLoggedIn) {
    const dashboardUrl = new URL('/dashboard', nextUrl);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
