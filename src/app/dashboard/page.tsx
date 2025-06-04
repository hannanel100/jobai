import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { getApplications } from '@/actions/applications';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIInsightsDashboard } from '@/components/ai/ai-insights-dashboard';
import { redirect } from 'next/navigation';
import { ApplicationStatus } from '@prisma/client';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const result = await getApplications();
  const applications = result.success ? result.applications : [];
  // Calculate statistics
  const totalApplications = applications.length;
  const inProgressApplications = applications.filter(
    app =>
      app.status === ApplicationStatus.APPLIED ||
      app.status === ApplicationStatus.APPLICATION_ACKNOWLEDGED ||
      app.status === ApplicationStatus.INTERVIEW_SCHEDULED
  ).length;
  const interviewsScheduled = applications.filter(
    app => app.status === ApplicationStatus.INTERVIEW_SCHEDULED
  ).length;
  const offersReceived = applications.filter(
    app => app.status === ApplicationStatus.OFFER_RECEIVED
  ).length;
  const successRate =
    totalApplications > 0
      ? Math.round((offersReceived / totalApplications) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>{' '}
          <p className="text-muted-foreground">
            Welcome back, {session.user?.firstName || 'User'}! Here&apos;s your
            job search overview.
          </p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {totalApplications === 0
                ? 'No applications yet'
                : 'Applications submitted'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interviews Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsScheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalApplications > 0 ? `${successRate}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalApplications > 0 ? 'Offer conversion rate' : 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {totalApplications === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Start tracking your job applications with JobTracker AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add your first job application</li>
                <li>• Upload your resume for AI optimization</li>
                <li>• Set up job alerts and tracking</li>
                <li>• Connect with recruiters</li>
              </ul>
            </div>
            <Button asChild>
              <Link href="/dashboard/applications/new">
                Add Your First Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{app.positionTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">
                        {app.status.toLowerCase().replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/applications">
                  View All Applications
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to help you stay organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/dashboard/applications/new">
                  Add New Application
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/resumes">Manage Resumes</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/applications">
                  View All Applications
                </Link>
              </Button>{' '}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Section */}
      <AIInsightsDashboard userId={session.user.id} />
    </div>
  );
}
