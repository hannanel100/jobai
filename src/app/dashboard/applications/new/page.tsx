import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/application-form';

export default async function NewApplicationPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Add New Application
        </h2>
        <p className="text-muted-foreground">Track a new job application</p>
      </div>

      <ApplicationForm />
    </div>
  );
}
