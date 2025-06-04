import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getApplication } from '@/actions/applications';
import { EditApplicationForm } from '@/components/applications/edit-application-form';

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Application</h2>
        <p className="text-muted-foreground">
          Update your job application details
        </p>
      </div>

      <EditApplicationForm application={result.application} />
    </div>
  );
}
