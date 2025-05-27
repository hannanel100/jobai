import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            JobTracker AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The intelligent job application tracking system that helps you land your dream job faster with AI-powered insights and automation.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/register">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Smart Tracking</h3>
            <p className="text-gray-600">
              Track all your job applications in one place with automated status updates and reminders.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">AI Resume Optimization</h3>
            <p className="text-gray-600">
              Get AI-powered suggestions to optimize your resume for each job application.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Recruiter Network</h3>
            <p className="text-gray-600">
              Connect with recruiters and get discovered for opportunities that match your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
