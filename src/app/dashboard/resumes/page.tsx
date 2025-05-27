import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ResumesPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resume Management</h2>
          <p className="text-muted-foreground">
            Manage your resumes and get AI-powered optimization suggestions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/resumes/upload">
            Upload Resume
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>No Resumes Yet</CardTitle>
            <CardDescription>
              Upload your resume to get started with AI-powered optimization and tailored versions for each job application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/resumes/upload">
                Upload Your First Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
