import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ApplicationsPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Applications</h2>
          <p className="text-muted-foreground">
            Track and manage all your job applications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/applications/new">
            Add Application
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>No Applications Yet</CardTitle>
            <CardDescription>
              You haven&apos;t added any job applications yet. Get started by adding your first application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/applications/new">
                Add Your First Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
