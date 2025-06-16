import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { theme } from '@/lib/theme';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getApplications } from '@/actions/applications';
import { ApplicationsList } from '@/components/applications/applications-list';

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const result = await getApplications();
  const applications = result.success ? result.applications : [];

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
            Job Applications
          </h2>
          <p style={{ color: theme.secondary }}>
            Track and manage all your job applications
          </p>
        </div>
        <Button
          asChild
          className="text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary }}
        >
          <Link href="/dashboard/applications/new" prefetch={true}>
            Add Application
          </Link>
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card
          style={{
            backgroundColor: 'white',
            border: `1px solid ${theme.accent}30`,
            borderTop: `4px solid ${theme.primary}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: theme.primary }}>
              No Applications Yet
            </CardTitle>
            <CardDescription style={{ color: theme.secondary }}>
              You haven&apos;t added any job applications yet. Get started by
              adding your first application.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
        <ApplicationsList applications={applications} />
      )}
    </div>
  );
}
