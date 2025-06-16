import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { theme } from '@/lib/theme';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MobileNav } from '@/components/layout/mobile-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <header
        className="shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}05 0%, ${theme.accent}05 100%)`,
          borderBottom: `1px solid ${theme.neutral}20`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center space-x-2"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  JT
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: theme.primary }}
                >
                  JobTracker AI
                </span>
              </Link>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-all duration-200"
                  style={{
                    color: theme.secondary,
                    backgroundColor: `${theme.primary}05`,
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/applications"
                  prefetch={true}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-all duration-200"
                  style={{
                    color: theme.secondary,
                    backgroundColor: `${theme.accent}05`,
                  }}
                >
                  Applications
                </Link>
                <Link
                  href="/dashboard/resumes"
                  prefetch={true}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-all duration-200"
                  style={{
                    color: theme.secondary,
                    backgroundColor: `${theme.secondary}05`,
                  }}
                >
                  Resumes
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className="hidden sm:block text-sm"
                style={{ color: theme.secondary }}
              >
                Welcome, {session.user?.firstName || 'User'}
              </span>
              <form action={logout}>
                <Button
                  variant="outline"
                  type="submit"
                  size="sm"
                  style={{
                    borderColor: theme.accent,
                    color: theme.accent,
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  Sign out
                </Button>
              </form>
              {/* Mobile Navigation Toggle */}
              <MobileNav />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
