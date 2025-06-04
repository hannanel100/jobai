'use server';

import { getDevSession } from '@/lib/dev-auth';
import { db } from '@/lib/db';
import { AIResumeService } from '@/services/ai-resume-service';
import {
  checkAIAnalysisRateLimit,
  createRateLimitErrorMessage,
} from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Interface for resume content structure
interface ResumeContent {
  text: string;
  metadata?: Record<string, unknown>;
  wordCount?: number;
  extractedAt?: string;
}

// Schema for AI analysis requests
const analyzeResumeSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
});

const matchJobSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  applicationId: z.string().min(1, 'Application ID is required'),
});

const matchJobAdHocSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobDescription: z.string().min(1, 'Job description is required'),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
});

const optimizeResumeSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  targetIndustry: z.string().optional(),
  targetRole: z.string().optional(),
});

export async function analyzeResume(data: z.infer<typeof analyzeResumeSchema>) {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check rate limit before processing
    const rateLimit = await checkAIAnalysisRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: createRateLimitErrorMessage(rateLimit),
        rateLimited: true,
        rateLimit,
      };
    }

    const validatedData = analyzeResumeSchema.parse(data);

    // Get the resume with content
    const resume = await db.resume.findFirst({
      where: {
        id: validatedData.resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }
    if (
      !resume.content ||
      typeof resume.content !== 'object' ||
      !('text' in resume.content)
    ) {
      return {
        success: false,
        error: 'Resume content not available for analysis',
      };
    }

    interface ResumeContent {
      text: string;
      metadata?: Record<string, unknown>;
      wordCount?: number;
      extractedAt?: string;
    }

    const resumeContent = resume.content as unknown as ResumeContent;
    const resumeText = resumeContent.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Resume text is too short for meaningful analysis',
      };
    } // Perform AI analysis
    const analysis = await AIResumeService.analyzeResume(resumeText);

    // Store the analysis result
    const analysisRecord = await db.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: session.user.id,
        type: 'COMPREHENSIVE_SCORE',
        score: analysis.overallScore,
        sections: analysis.sections,
        keywords: {
          found: analysis.atsCompatibility?.issues || [],
          missing: analysis.missingElements || [],
          suggestions: analysis.improvements || [],
        },
        suggestions:
          analysis.improvements?.map((improvement: string, index: number) => ({
            category: 'improvement',
            priority:
              index < 3 ? 'high' : ('medium' as 'high' | 'medium' | 'low'),
            title: `Improvement ${index + 1}`,
            description: improvement,
          })) || [],
        metadata: {
          strengths: analysis.strengths,
          missingElements: analysis.missingElements,
          atsCompatibility: analysis.atsCompatibility,
        },
      },
    });

    revalidatePath(`/dashboard/resumes/${resume.id}`);

    return {
      success: true,
      analysis,
      analysisId: analysisRecord.id,
    };
  } catch (error) {
    console.error('Failed to analyze resume:', error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Failed to analyze resume',
    };
  }
}

export async function matchResumeToJob(data: z.infer<typeof matchJobSchema>) {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check rate limit before processing
    const rateLimit = await checkAIAnalysisRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: createRateLimitErrorMessage(rateLimit),
        rateLimited: true,
        rateLimit,
      };
    }

    const validatedData = matchJobSchema.parse(data);

    // Get resume and application data
    const [resume, application] = await Promise.all([
      db.resume.findFirst({
        where: {
          id: validatedData.resumeId,
          userId: session.user.id,
        },
      }),
      db.application.findFirst({
        where: {
          id: validatedData.applicationId,
          userId: session.user.id,
        },
      }),
    ]);

    if (!resume || !application) {
      return { success: false, error: 'Resume or application not found' };
    }

    if (
      !resume.content ||
      typeof resume.content !== 'object' ||
      !('text' in resume.content)
    ) {
      return {
        success: false,
        error: 'Resume content not available for analysis',
      };
    }

    const resumeContent = resume.content as unknown as ResumeContent;
    const resumeText = resumeContent.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return { success: false, error: 'Resume text is too short for analysis' };
    } // Perform job matching analysis
    const matchAnalysis = await AIResumeService.matchJobDescription(
      resumeText,
      application.jobDescription || '',
      application.positionTitle,
      application.companyName
    );

    // Store the analysis result
    const analysisRecord = await db.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: session.user.id,
        type: 'JOB_MATCH',
        jobDescription: application.jobDescription,
        score: matchAnalysis.matchScore,
        sections: undefined, // Job match doesn't have section scores
        keywords: {
          found: matchAnalysis.keywordMatches?.matched || [],
          missing: matchAnalysis.keywordMatches?.missing || [],
          suggestions: matchAnalysis.tailoringTips || [],
        },
        suggestions:
          matchAnalysis.recommendations?.map((rec: string, index: number) => ({
            category: 'job_match',
            priority:
              index < 3 ? 'high' : ('medium' as 'high' | 'medium' | 'low'),
            title: `Recommendation ${index + 1}`,
            description: rec,
          })) || [],
        metadata: {
          applicationId: application.id,
          positionTitle: application.positionTitle,
          companyName: application.companyName,
          skillAlignment: matchAnalysis.skillAlignment,
          experienceAlignment: matchAnalysis.experienceAlignment,
        },
      },
    });

    revalidatePath(`/dashboard/resumes/${resume.id}`);
    revalidatePath(`/dashboard/applications/${application.id}`);

    return {
      success: true,
      analysis: matchAnalysis,
      analysisId: analysisRecord.id,
    };
  } catch (error) {
    console.error('Failed to match resume to job:', error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Failed to analyze job match',
    };
  }
}

export async function matchResumeToJobAdHoc(
  data: z.infer<typeof matchJobAdHocSchema>
) {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check rate limit before processing
    const rateLimit = await checkAIAnalysisRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: createRateLimitErrorMessage(rateLimit),
        rateLimited: true,
        rateLimit,
      };
    }

    const validatedData = matchJobAdHocSchema.parse(data);

    // Get the resume with content
    const resume = await db.resume.findFirst({
      where: {
        id: validatedData.resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }
    if (
      !resume.content ||
      typeof resume.content !== 'object' ||
      !('text' in resume.content)
    ) {
      return {
        success: false,
        error: 'Resume content not available for analysis',
      };
    }

    const resumeContent = resume.content as unknown as ResumeContent;
    const resumeText = resumeContent.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return { success: false, error: 'Resume text is too short for analysis' };
    } // Perform job matching analysis
    const matchAnalysis = await AIResumeService.matchJobDescription(
      resumeText,
      validatedData.jobDescription,
      validatedData.jobTitle || 'Not specified',
      validatedData.companyName || 'Not specified'
    ); // Store the analysis result
    const analysisRecord = await db.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: session.user.id,
        type: 'JOB_MATCH',
        jobDescription: validatedData.jobDescription,
        score: matchAnalysis.matchScore,
        sections: undefined, // Job match doesn't have section scores
        keywords: {
          found: matchAnalysis.keywordMatches?.matched || [],
          missing: matchAnalysis.keywordMatches?.missing || [],
          suggestions: matchAnalysis.tailoringTips || [],
        },
        suggestions:
          matchAnalysis.recommendations?.map((rec: string, index: number) => ({
            category: 'job_match_adhoc',
            priority:
              index < 3 ? 'high' : ('medium' as 'high' | 'medium' | 'low'),
            title: `Recommendation ${index + 1}`,
            description: rec,
          })) || [],
        metadata: {
          skillAlignment: matchAnalysis.skillAlignment,
          experienceAlignment: matchAnalysis.experienceAlignment,
        },
      },
    });

    revalidatePath(`/dashboard/resumes/${resume.id}`);

    return {
      success: true,
      analysis: matchAnalysis,
      analysisId: analysisRecord.id,
    };
  } catch (error) {
    console.error('Failed to match resume to job ad-hoc:', error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Failed to analyze job match',
    };
  }
}

export async function optimizeResume(
  data: z.infer<typeof optimizeResumeSchema>
) {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check rate limit before processing
    const rateLimit = await checkAIAnalysisRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: createRateLimitErrorMessage(rateLimit),
        rateLimited: true,
        rateLimit,
      };
    }

    const validatedData = optimizeResumeSchema.parse(data);

    // Get the resume with content
    const resume = await db.resume.findFirst({
      where: {
        id: validatedData.resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }
    if (
      !resume.content ||
      typeof resume.content !== 'object' ||
      !('text' in resume.content)
    ) {
      return {
        success: false,
        error: 'Resume content not available for optimization',
      };
    }

    const resumeContent = resume.content as unknown as ResumeContent;
    const resumeText = resumeContent.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Resume text is too short for optimization',
      };
    } // Perform optimization analysis
    const optimization = await AIResumeService.optimizeResume(
      resumeText,
      validatedData.targetIndustry,
      validatedData.targetRole
    );

    // Store the analysis result
    const analysisRecord = await db.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: session.user.id,
        type: 'OPTIMIZATION',
        score: undefined, // Optimization doesn't have a numeric score
        sections: undefined,
        keywords: undefined,
        suggestions: Array.isArray(optimization)
          ? optimization.map(
              (
                opt: string | { title?: string; description?: string },
                index: number
              ) => ({
                category: 'optimization',
                priority:
                  index < 3 ? 'high' : ('medium' as 'high' | 'medium' | 'low'),
                title:
                  typeof opt === 'object' && opt.title
                    ? opt.title
                    : `Optimization ${index + 1}`,
                description:
                  typeof opt === 'object' && opt.description
                    ? opt.description
                    : opt.toString(),
              })
            )
          : [],
        metadata: {
          targetIndustry: validatedData.targetIndustry,
          targetRole: validatedData.targetRole,
        },
      },
    });

    revalidatePath(`/dashboard/resumes/${resume.id}`);

    return {
      success: true,
      optimization,
      analysisId: analysisRecord.id,
    };
  } catch (error) {
    console.error('Failed to optimize resume:', error);
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Failed to optimize resume',
    };
  }
}

export async function getResumeAnalyses(resumeId: string) {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify resume ownership
    const resume = await db.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }
    const analyses = await db.resumeAnalysis.findMany({
      where: {
        resumeId: resumeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, analyses };
  } catch (error) {
    console.error('Failed to get resume analyses:', error);
    return {
      success: false,
      error: 'Failed to get analyses',
    };
  }
}

/**
 * Get all AI analyses for the current user across all resumes
 */
export async function getUserAnalyses() {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const analyses = await db.resumeAnalysis.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to most recent 20 analyses
    });

    return { success: true, analyses };
  } catch (error) {
    console.error('Failed to get user analyses:', error);
    return {
      success: false,
      error: 'Failed to get analyses',
    };
  }
}

export async function getRateLimitStatus() {
  try {
    const session = await getDevSession();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const rateLimit = await checkAIAnalysisRateLimit(session.user.id);

    return {
      success: true,
      rateLimit: {
        allowed: rateLimit.allowed,
        count: rateLimit.count,
        limit: rateLimit.limit,
        remaining: rateLimit.limit - rateLimit.count,
        resetsAt: rateLimit.resetsAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return {
      success: false,
      error: 'Failed to get rate limit status',
    };
  }
}
