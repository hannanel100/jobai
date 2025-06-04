'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadButton } from '@/lib/uploadthing';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createResume } from '@/actions/resumes';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [title, setTitle] = useState('');
  const [isBase, setIsBase] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const handleUploadComplete = async (
    res: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
      serverData?: {
        uploadedBy: string;
        url: string;
        name: string;
        size: number;
        type: string;
        parsedContent?: {
          text: string;
          metadata?: Record<string, unknown>;
          wordCount: number;
          extractedAt: string;
        } | null;
        parseError?: string | null;
      };
    }>
  ) => {
    if (!res || res.length === 0) {
      return;
    }

    const file = res[0];

    // Extract the parsed content from serverData
    const parsedContent = file.serverData?.parsedContent;
    const parseError = file.serverData?.parseError;

    try {
      setIsUploading(true); // Show feedback about parsing results
      if (parseError) {
        toast.warning(
          'Resume uploaded but text extraction failed. You can manually add content later.'
        );
      } else if (parsedContent) {
        toast.success(
          `Resume uploaded and parsed! Extracted ${parsedContent.wordCount} words.`
        );
      }
      const result = await createResume({
        title: title || file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension if no title
        fileName: file.name,
        fileUrl: file.url, // Use file.url instead of file.ufsUrl
        fileSize: file.size,
        fileType: file.type,
        content: parsedContent || null, // Use extracted parsedContent
        isBase,
      });

      if (result.success) {
        if (!parseError) {
          toast.success('Resume uploaded and content extracted successfully!');
        }
        setTitle('');
        setIsBase(false);
        onUploadComplete?.();
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to upload resume');
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };
  const handleUploadError = (uploadError: Error) => {
    console.error('Upload error:', uploadError);
    toast.error('Failed to upload file. Please try again.');
    setIsUploading(false);
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>
          Upload your resume in PDF or DOCX format (max 4MB). Text content will
          be automatically extracted for AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Resume Title</Label>
          <Input
            id="title"
            placeholder="e.g., Software Engineer Resume, Marketing Manager CV"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="isBase"
            type="checkbox"
            checked={isBase}
            onChange={e => setIsBase(e.target.checked)}
            disabled={isUploading}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isBase" className="text-sm font-medium">
            Use as base resume template
          </Label>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <UploadButton
            endpoint="resumeUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <div className="text-center text-sm text-gray-600">
            Processing upload and extracting content...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
