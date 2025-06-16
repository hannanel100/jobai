'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { updateResume } from '@/actions/resumes';
import { toast } from 'sonner';
// Removed theme import - using CSS variables instead
import {
  FileText,
  Edit,
  Save,
  X,
  Info,
  Eye,
  EyeOff,
  Calendar,
  Hash,
} from 'lucide-react';

interface ResumeContentViewerProps {
  resume: {
    id: string;
    title: string;
    fileName: string | null;
    content: ParsedContent | null;
    createdAt: Date;
  };
  onContentUpdated?: () => void;
}

interface ParsedContent {
  text: string;
  metadata?: {
    pages?: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  wordCount: number;
  extractedAt: string;
}

export function ResumeContentViewer({
  resume,
  onContentUpdated,
}: ResumeContentViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const parsedContent = resume.content as ParsedContent | null;

  const handleEdit = () => {
    setEditedContent(parsedContent?.text || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedContent.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updatedContent = {
        text: editedContent.trim(),
        metadata: parsedContent?.metadata,
        wordCount: editedContent.trim().split(/\s+/).length,
        extractedAt: parsedContent?.extractedAt || new Date().toISOString(),
        lastEditedAt: new Date().toISOString(),
      };

      const result = await updateResume(resume.id, { content: updatedContent });

      if (result.success) {
        toast.success('Resume content updated successfully!');
        setIsEditing(false);
        onContentUpdated?.();
      } else {
        toast.error(result.error || 'Failed to update resume content');
      }
    } catch (error) {
      console.error('Failed to update resume content:', error);
      toast.error('Failed to update resume content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent('');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (!parsedContent) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No content extracted
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              The resume content could not be automatically extracted. You can
              manually add content by editing this resume.
            </p>
            <Button
              onClick={handleEdit}
              className="mt-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Add Content Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Content
              </CardTitle>
              <CardDescription>
                Extracted text from {resume.fileName || 'your resume'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
                className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
              >
                {showMetadata ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showMetadata ? 'Hide' : 'Show'} Details
              </Button>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  size="sm"
                  className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content stats */}
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {parsedContent.wordCount} words
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Extracted {formatDate(parsedContent.extractedAt)}
            </Badge>
            {parsedContent.metadata?.pages && (
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {parsedContent.metadata.pages} pages
              </Badge>
            )}
          </div>

          {/* Metadata section */}
          {showMetadata && parsedContent.metadata && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Document Metadata
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {parsedContent.metadata.title && (
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <span className="ml-2 text-gray-600">
                      {parsedContent.metadata.title}
                    </span>
                  </div>
                )}
                {parsedContent.metadata.author && (
                  <div>
                    <span className="font-medium text-gray-700">Author:</span>
                    <span className="ml-2 text-gray-600">
                      {parsedContent.metadata.author}
                    </span>
                  </div>
                )}
                {parsedContent.metadata.subject && (
                  <div>
                    <span className="font-medium text-gray-700">Subject:</span>
                    <span className="ml-2 text-gray-600">
                      {parsedContent.metadata.subject}
                    </span>
                  </div>
                )}
                {parsedContent.metadata.creator && (
                  <div>
                    <span className="font-medium text-gray-700">Creator:</span>
                    <span className="ml-2 text-gray-600">
                      {parsedContent.metadata.creator}
                    </span>
                  </div>
                )}
                {parsedContent.metadata.creationDate && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {formatDate(parsedContent.metadata.creationDate)}
                    </span>
                  </div>
                )}
                {parsedContent.metadata.modificationDate && (
                  <div>
                    <span className="font-medium text-gray-700">Modified:</span>
                    <span className="ml-2 text-gray-600">
                      {formatDate(parsedContent.metadata.modificationDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content display/edit */}
      <Card>
        <CardHeader>
          <CardTitle>Text Content</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Edit the extracted content below. This will be used for AI analysis and job matching.'
              : 'This is the text content extracted from your resume. You can edit it to ensure accuracy before AI analysis.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                placeholder="Enter your resume content here..."
                className="min-h-[400px] font-mono text-sm"
                disabled={isSaving}
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {editedContent.trim().split(/\s+/).length} words
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-[var(--theme-neutral)] text-[var(--theme-secondary)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !editedContent.trim()}
                    className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {parsedContent.text}
                </pre>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Content ready for AI analysis</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Make changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
