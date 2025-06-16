import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getApplication } from '@/actions/applications';
import { EditApplicationForm } from '@/components/applications/edit-application-form';
import { theme } from '@/lib/theme';

interface EditApplicationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const result = await getApplication(id);

  if (!result.success || !result.application) {
    redirect('/dashboard/applications');
  }

  return (
    <div className="space-y-8">
      {/* Header section with blue accent background */}
      <div
        className="p-6 rounded-lg"
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
            Edit Application
          </h2>
          <p style={{ color: theme.secondary }}>
            Update your job application details
          </p>
        </div>
      </div>

      <EditApplicationForm application={result.application} />
    </div>
  );
}
