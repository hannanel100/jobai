import { getDevSession } from '@/lib/dev-auth'
import { getResumes } from '@/actions/resumes'
import { redirect } from 'next/navigation'
import { ResumesClient } from '@/components/resumes/resumes-client'

export default async function ResumesPage() {
  const session = await getDevSession()

  if (!session) {
    redirect('/auth/login')
  }
  const resumesResult = await getResumes()
  const resumes = resumesResult.success ? resumesResult.resumes! : []

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resume Management</h2>
          <p className="text-muted-foreground">
            Upload and manage your resumes for job applications
          </p>
        </div>
      </div>

      <ResumesClient resumes={resumes} />
    </div>
  )
}
