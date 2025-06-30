import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { getApplications } from '@/actions/applications';
import {
  getUserAnalyses,
  getRateLimitStatus,
  getAIAnalytics,
  getAIRecommendationEffectiveness,
} from '@/actions/ai';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ServerAIInsightsDashboard } from '@/components/ai/server-ai-insights-dashboard';
import { theme } from '@/lib/theme';
import { redirect } from 'next/navigation';
import { ApplicationStatus } from '@prisma/client';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch all data in parallel for better performance
  const [
    applicationsResult,
    analysesResult,
    rateLimitResult,
    analyticsResult,
    recommendationEffectivenessResult,
  ] = await Promise.all([
    getApplications(),
    getUserAnalyses(),
    getRateLimitStatus(),
    getAIAnalytics(),
    getAIRecommendationEffectiveness(),
  ]);

  const applications = applicationsResult.success
    ? applicationsResult.applications
    : [];
  const analyses = analysesResult.success ? analysesResult.analyses : [];
  const analytics = analyticsResult.success ? analyticsResult.analytics : null;
  const recommendationEffectiveness = recommendationEffectivenessResult.success
    ? recommendationEffectivenessResult.effectiveness
    : null;
  // Rate limit data for AI insights component
  // const rateLimit = rateLimitResult;
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
      {/* Header section with blue accent background */}
      <div
        className="p-6 rounded-lg flex justify-between items-center"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.accent}08 100%)`,
          border: `1px solid ${theme.accent}20`,
        }}
      >
        <div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: theme.primary }}
          >
            Dashboard
          </h2>
          <p style={{ color: theme.secondary }}>
            Welcome back, {session.user?.firstName || 'User'}! Here&apos;s your
            job search overview.
          </p>
        </div>
        <form action={logout}>
          <Button
            variant="outline"
            type="submit"
            style={{
              borderColor: theme.accent,
              color: theme.accent,
            }}
            className="hover:opacity-80 transition-opacity"
          >
            Sign out
          </Button>
        </form>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderLeft: `4px solid ${theme.primary}`,
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: theme.primary }}
            >
              {totalApplications}
            </div>
            <p className="text-xs" style={{ color: theme.secondary }}>
              {totalApplications === 0
                ? 'No applications yet'
                : 'Applications submitted'}
            </p>
          </CardContent>
        </Card>
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderLeft: `4px solid ${theme.accent}`,
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: theme.accent }}>
              {inProgressApplications}
            </div>
            <p className="text-xs" style={{ color: theme.secondary }}>
              Applications in progress
            </p>
          </CardContent>
        </Card>
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderLeft: `4px solid ${theme.secondary}`,
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              Interviews Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: theme.secondary }}
            >
              {interviewsScheduled}
            </div>
            <p className="text-xs" style={{ color: theme.secondary }}>
              Upcoming interviews
            </p>
          </CardContent>
        </Card>
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderLeft: `4px solid ${theme.neutral}`,
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              style={{ color: theme.neutral }}
            >
              {totalApplications > 0 ? `${successRate}%` : '-'}
            </div>
            <p className="text-xs" style={{ color: theme.secondary }}>
              {totalApplications > 0 ? 'Offer conversion rate' : 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>
      {totalApplications === 0 ? (
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderTop: `4px solid ${theme.primary}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: theme.primary }}>
              Getting Started
            </CardTitle>
            <CardDescription style={{ color: theme.secondary }}>
              Start tracking your job applications with JobTracker AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Next Steps:
              </h4>
              <ul
                className="text-sm space-y-1"
                style={{ color: theme.secondary }}
              >
                <li>• Add your first job application</li>
                <li>• Upload your resume for AI optimization</li>
                <li>• Set up job alerts and tracking</li>
                <li>• Connect with recruiters</li>
              </ul>
            </div>
            <Button
              asChild
              className="text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              <Link href="/dashboard/applications/new" prefetch={true}>
                Add Your First Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            style={{
              backgroundColor: 'white',
              border: `1px solid ${theme.accent}30`,
              borderTop: `4px solid ${theme.accent}`,
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.primary }}>
                Recent Applications
              </CardTitle>
              <CardDescription style={{ color: theme.secondary }}>
                Your latest job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: theme.primary }}
                      >
                        {app.positionTitle}
                      </p>
                      <p className="text-sm" style={{ color: theme.secondary }}>
                        {app.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm capitalize font-medium"
                        style={{ color: theme.accent }}
                      >
                        {app.status.toLowerCase().replace('_', ' ')}
                      </p>
                      <p className="text-xs" style={{ color: theme.secondary }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 hover:opacity-80 transition-opacity"
                asChild
                style={{
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                <Link href="/dashboard/applications" prefetch={true}>
                  View All Applications
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundColor: 'white',
              border: `1px solid ${theme.accent}30`,
              borderTop: `4px solid ${theme.secondary}`,
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.primary }}>
                Quick Actions
              </CardTitle>
              <CardDescription style={{ color: theme.secondary }}>
                Common tasks to help you stay organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full text-white hover:opacity-90 transition-opacity"
                asChild
                style={{ backgroundColor: theme.primary }}
              >
                <Link href="/dashboard/applications/new" prefetch={true}>
                  Add New Application
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full hover:opacity-80 transition-opacity"
                asChild
                style={{
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                <Link href="/dashboard/resumes" prefetch={true}>
                  Manage Resumes
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full hover:opacity-80 transition-opacity"
                asChild
                style={{
                  borderColor: theme.secondary,
                  color: theme.secondary,
                }}
              >
                <Link href="/dashboard/applications" prefetch={true}>
                  View All Applications
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* AI Insights Section */}
      <ServerAIInsightsDashboard
        analyses={analyses || []}
        analytics={analytics}
        recommendationEffectiveness={recommendationEffectiveness}
        rateLimit={
          rateLimitResult.success && rateLimitResult.rateLimit
            ? rateLimitResult.rateLimit
            : null
        }
      />
    </div>
  );
}
