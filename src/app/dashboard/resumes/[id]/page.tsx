import { notFound } from 'next/navigation';
import { getResume } from '@/actions/resumes';
import { ResumeDetailClient } from '@/components/resumes/resume-detail-client';

interface ResumeDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ResumeContent {
  text: string;
  metadata?: Record<string, unknown>;
  wordCount: number;
  extractedAt: string;
}

interface DatabaseResume {
  id: string;
  title: string;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  fileType: string | null;
  content: unknown;
  isBase: boolean;
  createdAt: Date;
  updatedAt: Date;
  applications: Array<{
    id: string;
    companyName: string;
    positionTitle: string;
    status: string;
    createdAt: Date;
  }>;
}

// Transform the database resume to match the expected interface
function transformResumeForClient(resume: DatabaseResume) {
  return {
    ...resume,
    content: resume.content as ResumeContent | null,
  };
}

export default async function ResumeDetailPage({
  params,
}: ResumeDetailPageProps) {
  const { id } = await params;

  const result = await getResume(id);

  if (!result.success || !result.resume) {
    notFound();
  }

  const transformedResume = transformResumeForClient(
    result.resume as DatabaseResume
  );

  return <ResumeDetailClient resume={transformedResume} />;
}
