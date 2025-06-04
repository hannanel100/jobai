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

  const filteredApplications = applications.filter(app => {
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
            placeholder="Search by company or position..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={value =>
            setStatusFilter(value as ApplicationStatus | 'all')
          }
        >
          <SelectTrigger className="w-full sm:w-48">
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
      <div className="text-sm text-muted-foreground">
        Showing {filteredApplications.length} of {applications.length}{' '}
        applications
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6">
        {filteredApplications.map(application => (
          <Card
            key={application.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">
                    {application.positionTitle}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {application.applicationDeadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
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
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>
                      {application.salaryMin && application.salaryMax
                        ? `${application.salaryMin.toLocaleString()} - ${application.salaryMax.toLocaleString()} ${application.currency}`
                        : application.salaryMin
                          ? `${application.salaryMin.toLocaleString()}+ ${application.currency}`
                          : `Up to ${application.salaryMax?.toLocaleString()} ${application.currency}`}
                    </span>
                  </div>
                )}

                {application.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a
                      href={application.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Company Website
                    </a>
                  </div>
                )}
              </div>
              {/* Resume Information */}
              {application.resume ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    Resume:{' '}
                    <span className="font-medium">
                      {application.resume.title}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-700">No resume selected</span>
                </div>
              )}
              {/* Notes */}
              {application.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
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
                </Select>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/applications/${application.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(application.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              {/* Metadata */}
              <div className="text-xs text-gray-400 pt-2 border-t">
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

        {filteredApplications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'No applications match your current filters.'
                  : 'No applications found.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
