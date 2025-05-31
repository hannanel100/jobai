import { notFound } from 'next/navigation'
import { getResume } from '@/actions/resumes'
import { ResumeDetailClient } from '@/components/resumes/resume-detail-client'

interface ResumeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const { id } = await params
  
  const result = await getResume(id)
  
  if (!result.success || !result.resume) {
    notFound()
  }

  return <ResumeDetailClient resume={result.resume} />
}
