'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteResume } from '@/actions/resumes';
// Removed theme import - using CSS variables instead
import { toast } from 'sonner';
import { FileText, Download, Trash2, Calendar, Eye } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  fileType: string | null;
  isBase: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    applications: number;
  };
  applications: Array<{
    id: string;
    companyName: string;
    positionTitle: string;
    status: string;
    createdAt: Date;
  }>;
}

interface ResumeListProps {
  resumes: Resume[];
  onResumeDeleted?: () => void;
}

export function ResumeList({ resumes, onResumeDeleted }: ResumeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      setDeletingId(id);
      const result = await deleteResume(id);

      if (result.success) {
        toast.success('Resume deleted successfully');
        onResumeDeleted?.();
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete resume');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownload = (fileUrl: string, _fileName: string) => {
    window.open(fileUrl, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (resumes.length === 0) {
    return (
      <Card className="bg-white border-[var(--theme-accent)]/30 border-t-4 border-t-[var(--theme-primary)]">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-[var(--theme-primary)]">
              No resumes uploaded
            </h3>
            <p className="mt-2 text-sm text-[var(--theme-secondary)]">
              Upload your first resume to get started with job applications.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map(resume => (
        <Card
          key={resume.id}
          className="hover:shadow-md transition-shadow bg-white border-[var(--theme-accent)]/30 border-l-4 border-l-[var(--theme-accent)]"
        >
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl leading-6 break-words flex-1 text-[var(--theme-primary)]">
                    {resume.title}
                  </CardTitle>
                  {resume.isBase && (
                    <Badge
                      variant="secondary"
                      className="whitespace-nowrap text-xs flex-shrink-0 bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]"
                    >
                      Base Template
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm text-[var(--theme-secondary)]">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDate(resume.createdAt)}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* File info section */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-sm break-all">
                    {resume.fileName || 'Unknown file'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 ml-6">
                  <span>{formatFileSize(resume.fileSize)}</span>
                  {resume.fileType && (
                    <span className="px-2 py-0.5 bg-white rounded border text-xs font-medium">
                      {resume.fileType.includes('pdf') ? 'PDF' : 'DOCX'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions section */}
              <div className="space-y-3">
                {/* Primary action */}
                <Button
                  asChild
                  className="w-full h-11 text-base font-medium bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
                >
                  <Link
                    href={`/dashboard/resumes/${resume.id}`}
                    prefetch={true}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>

                {/* Secondary actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resume.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(
                          resume.fileUrl!,
                          resume.fileName || 'resume'
                        )
                      }
                      className="h-10 text-sm border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                    className="h-10 text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
