import { getDevSession } from '@/lib/dev-auth';
import { getResumes } from '@/actions/resumes';
import { theme } from '@/lib/theme';
import { redirect } from 'next/navigation';
import { ResumesClient } from '@/components/resumes/resumes-client';

export default async function ResumesPage() {
  const session = await getDevSession();

  if (!session) {
    redirect('/auth/login');
  }
  const resumesResult = await getResumes();
  const resumes = resumesResult.success ? resumesResult.resumes! : [];

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
            Resume Management
          </h2>
          <p style={{ color: theme.secondary }}>
            Upload and manage your resumes for job applications
          </p>
        </div>
      </div>

      <ResumesClient resumes={resumes} />
    </div>
  );
}
