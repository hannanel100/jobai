import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/application-form';
import { theme } from '@/lib/theme';

export default async function NewApplicationPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
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
            Add New Application
          </h2>
          <p style={{ color: theme.secondary }}>Track a new job application</p>
        </div>
      </div>

      <ApplicationForm />
    </div>
  );
}
