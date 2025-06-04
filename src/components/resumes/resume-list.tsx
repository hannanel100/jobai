'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';

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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No resumes uploaded
            </h3>
            <p className="mt-2 text-sm text-gray-500">
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
        <Card key={resume.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{resume.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(resume.createdAt)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {resume.isBase && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Base Template
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {resume.fileName || 'Unknown file'}
                </div>
                <div>{formatFileSize(resume.fileSize)}</div>
                {resume.fileType && (
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {resume.fileType.includes('pdf') ? 'PDF' : 'DOCX'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
