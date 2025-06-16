'use client';

import { useState } from 'react';
import { Application, ApplicationStatus } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  useUpdateApplicationStatus,
  useDeleteApplication,
} from '@/hooks/use-applications';
import { format } from 'date-fns';
import {
  Search,
  Calendar,
  DollarSign,
  ExternalLink,
  Trash2,
  Edit,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

type ApplicationWithResume = Application & {
  resume?: {
    id: string;
    title: string;
  } | null;
};

interface ApplicationsListProps {
  applications: ApplicationWithResume[];
}

const statusColors = {
  [ApplicationStatus.SAVED]: 'bg-gray-100 text-gray-800',
  [ApplicationStatus.RESUME_PREPARED]: 'bg-blue-100 text-blue-800',
  [ApplicationStatus.APPLIED]: 'bg-yellow-100 text-yellow-800',
  [ApplicationStatus.APPLICATION_ACKNOWLEDGED]: 'bg-purple-100 text-purple-800',
  [ApplicationStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 text-orange-800',
  [ApplicationStatus.INTERVIEW_COMPLETED]: 'bg-indigo-100 text-indigo-800',
  [ApplicationStatus.OFFER_RECEIVED]: 'bg-green-100 text-green-800',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
  [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  [ApplicationStatus.SAVED]: 'Saved',
  [ApplicationStatus.RESUME_PREPARED]: 'Resume Prepared',
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.APPLICATION_ACKNOWLEDGED]: 'Acknowledged',
  [ApplicationStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [ApplicationStatus.INTERVIEW_COMPLETED]: 'Interview Completed',
  [ApplicationStatus.OFFER_RECEIVED]: 'Offer Received',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
};

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    'all'
  );

  // React Query mutations
  const updateStatusMutation = useUpdateApplicationStatus();
  const deleteApplicationMutation = useDeleteApplication();

  // Sort applications by updatedAt descending
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredApplications = sortedApplications.filter(app => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.positionTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    updateStatusMutation.mutate({ id: applicationId, status: newStatus });
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    deleteApplicationMutation.mutate(applicationId);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>{' '}
        <Select
          value={statusFilter}
          onValueChange={value =>
            setStatusFilter(value as ApplicationStatus | 'all')
          }
        >
          <SelectTrigger
            className="w-full sm:w-48"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([status, label]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-[var(--theme-text-secondary)]">
        Showing {filteredApplications.length} of {applications.length}{' '}
        applications
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6">
        {filteredApplications.map(application => (
          <Card
            key={application.id}
            className="hover:shadow-md transition-shadow bg-white border border-[var(--theme-accent)]30 border-l-4 border-l-[var(--theme-accent)]"
            role="article"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-[var(--theme-primary)]">
                    {application.positionTitle}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-[var(--theme-text-secondary)]">
                    {application.companyName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {' '}
              {/* Application Details */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 text-sm text-[var(--theme-text-secondary)]">
                {application.applicationDeadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--theme-neutral)]" />
                    <span>
                      Deadline:{' '}
                      {format(
                        new Date(application.applicationDeadline),
                        'MMM d, yyyy'
                      )}
                    </span>
                  </div>
                )}

                {(application.salaryMin || application.salaryMax) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[var(--theme-neutral)]" />
                    <span>
                      {application.salaryMin && (
                        <span>${application.salaryMin.toLocaleString()}</span>
                      )}
                      {application.salaryMin && application.salaryMax && (
                        <span> - </span>
                      )}
                      {application.salaryMax && (
                        <span>${application.salaryMax.toLocaleString()}</span>
                      )}
                      {!application.salaryMin && !application.salaryMax && (
                        <span>Salary not specified</span>
                      )}
                    </span>
                  </div>
                )}

                {application.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-[var(--theme-neutral)]" />
                    <a
                      href={`${application.companyWebsite}/jobs/${application.id.split('-')[1] || '1'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[var(--theme-accent)]"
                      aria-label="View job posting"
                    >
                      View job posting
                    </a>
                  </div>
                )}
              </div>
              {/* Resume Information */}
              {application.resume ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-[var(--theme-accent)]" />
                  <span className="text-[var(--theme-accent)]">
                    <Link
                      href={`/dashboard/resumes/${application.resume.id}`}
                      className="hover:underline text-[var(--theme-accent)]"
                    >
                      {application.resume.title}
                    </Link>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-[var(--theme-neutral)]" />
                  <span className="text-[var(--theme-text-secondary)]">
                    No resume attached
                  </span>
                </div>
              )}
              {/* Notes */}
              {application.notes && (
                <div className="text-sm p-3 rounded-md text-[var(--theme-text-secondary)] bg-[var(--theme-surface)]">
                  {application.notes}
                </div>
              )}
              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {' '}
                <Select
                  value={application.status}
                  onValueChange={value =>
                    handleStatusChange(
                      application.id,
                      value as ApplicationStatus
                    )
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <SelectItem key={status} value={status}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>{' '}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-all duration-200"
                >
                  <Link href={`/dashboard/applications/${application.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(application.id)}
                  className="border-[var(--theme-neutral)] text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              {/* Metadata */}
              <div className="text-xs pt-2 border-t text-[var(--theme-neutral)] border-[var(--theme-neutral)]20">
                Created:{' '}
                {format(new Date(application.createdAt), 'MMM d, yyyy')}
                {application.appliedDate && (
                  <span className="ml-4">
                    Applied:{' '}
                    {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApplications.length === 0 && applications.length === 0 && (
          <Card className="bg-white border border-[var(--theme-accent)]30 border-t-4 border-t-[var(--theme-primary)]">
            <CardContent className="text-center py-12">
              <p className="text-lg text-[var(--theme-text-secondary)]">
                No applications yet
              </p>
              <p className="text-sm mt-2 text-[var(--theme-text-secondary)]">
                Start tracking your job applications by adding your first
                application.
              </p>
            </CardContent>
          </Card>
        )}

        {filteredApplications.length === 0 && applications.length > 0 && (
          <Card className="bg-white border border-[var(--theme-accent)]30 border-t-4 border-t-[var(--theme-secondary)]">
            <CardContent className="text-center py-12">
              <p className="text-lg text-[var(--theme-text-secondary)]">
                No applications found
              </p>
              <p className="text-sm mt-2 text-[var(--theme-text-secondary)]">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-4 border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-all duration-200"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
