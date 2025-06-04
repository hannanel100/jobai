import pdf from 'pdf-parse-debugging-disabled';
import mammoth from 'mammoth';

export interface ParsedResumeContent {
  text: string;
  metadata?: {
    pages?: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

/**
 * Parse text content from a resume file buffer
 */
export async function parseResumeContent(
  buffer: Buffer,
  fileType: string
): Promise<ParsedResumeContent> {
  try {
    switch (fileType) {
      case 'application/pdf':
        return await parsePdf(buffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await parseDocx(buffer);

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Failed to parse resume content:', error);
    throw new Error('Failed to extract text from resume file');
  }
}

/**
 * Parse PDF file and extract text content
 */
async function parsePdf(buffer: Buffer): Promise<ParsedResumeContent> {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text.trim(),
      metadata: {
        pages: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate:
          data.info?.CreationDate && data.info.CreationDate !== null
            ? new Date(data.info.CreationDate)
            : undefined,
        modificationDate:
          data.info?.ModDate && data.info.ModDate !== null
            ? new Date(data.info.ModDate)
            : undefined,
      },
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Parse DOCX file and extract text content
 */
async function parseDocx(buffer: Buffer): Promise<ParsedResumeContent> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value.trim(),
      metadata: {
        // DOCX parsing doesn't provide as much metadata as PDF
        // We could potentially extract more info from the document properties
      },
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Clean and normalize extracted text content
 */
export function cleanResumeText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove multiple line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Trim whitespace
      .trim()
  );
}

/**
 * Validate that the extracted text seems reasonable for a resume
 */
export function validateResumeContent(text: string): boolean {
  // Basic validation - should have some reasonable length
  if (text.length < 50) {
    return false;
  }

  // Should contain some common resume keywords
  const resumeKeywords = [
    'experience',
    'education',
    'skills',
    'work',
    'employment',
    'university',
    'college',
    'degree',
    'job',
    'position',
    'email',
    'phone',
    'contact',
    'address',
    'linkedin',
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = resumeKeywords.filter(keyword =>
    lowerText.includes(keyword)
  );

  // Should contain at least 2 resume-related keywords
  return foundKeywords.length >= 2;
}
