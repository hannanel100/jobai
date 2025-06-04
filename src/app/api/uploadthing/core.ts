import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/auth';
import {
  parseResumeContent,
  cleanResumeText,
  validateResumeContent,
} from '@/lib/resume-parser';

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    'application/pdf': { maxFileSize: '4MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
    'application/msword': { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      let parsedContent: {
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
      } | null = null;
      let parseError: string | null = null;

      try {
        // Fetch the uploaded file
        const response = await fetch(file.ufsUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch uploaded file: ${response.statusText}`
          );
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        // Parse the resume content
        const parsed = await parseResumeContent(buffer, file.type);
        const cleanedText = cleanResumeText(parsed.text);

        // Validate the content
        if (!validateResumeContent(cleanedText)) {
          console.warn(
            'Resume content validation failed - content may not be a valid resume'
          );
        }
        // Ensure all data is JSON serializable
        parsedContent = {
          text: cleanedText,
          metadata: {
            pages: parsed.metadata?.pages || undefined,
            title: parsed.metadata?.title || undefined,
            author: parsed.metadata?.author || undefined,
            subject: parsed.metadata?.subject || undefined,
            creator: parsed.metadata?.creator || undefined,
            producer: parsed.metadata?.producer || undefined,
            creationDate:
              parsed.metadata?.creationDate &&
              !isNaN(parsed.metadata.creationDate.getTime())
                ? parsed.metadata.creationDate.toISOString()
                : undefined,
            modificationDate:
              parsed.metadata?.modificationDate &&
              !isNaN(parsed.metadata.modificationDate.getTime())
                ? parsed.metadata.modificationDate.toISOString()
                : undefined,
          },
          wordCount: cleanedText.split(/\s+/).length,
          extractedAt: new Date().toISOString(),
        };
      } catch (error) {
        parseError =
          error instanceof Error ? error.message : 'Unknown parsing error';

        // Don't throw - we'll still save the file info even if parsing fails
        // The user can manually add content later
      }

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        parsedContent,
        parseError,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
