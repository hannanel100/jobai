import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                prefetch={true}
                className="text-2xl font-bold text-gray-900"
              >
                JobTracker AI
              </Link>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  prefetch={true}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/applications"
                  prefetch={true}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Applications
                </Link>
                <Link
                  href="/dashboard/resumes"
                  prefetch={true}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Resumes
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-500">
                Welcome, {session.user?.firstName || 'User'}
              </span>
              <form action={logout}>
                <Button variant="outline" type="submit" size="sm">
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
