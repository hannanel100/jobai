'use server';

import { auth } from '@/auth';
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
    let analysis;
    try {
      analysis = await AIResumeService.analyzeResume(resumeText);
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      if (aiError instanceof Error && aiError.message.includes('JSON')) {
        return {
          success: false,
          error:
            'The analysis response was too detailed and got truncated. Please try again.',
        };
      }
      return {
        success: false,
        error: 'Failed to analyze resume. Please try again.',
      };
    }

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
    let matchAnalysis;
    try {
      matchAnalysis = await AIResumeService.matchJobDescription(
        resumeText,
        application.jobDescription || '',
        application.positionTitle,
        application.companyName
      );
    } catch (aiError) {
      console.error('AI job matching error:', aiError);
      if (aiError instanceof Error && aiError.message.includes('JSON')) {
        return {
          success: false,
          error:
            'The job matching response was too detailed and got truncated. Please try again.',
        };
      }
      return {
        success: false,
        error: 'Failed to analyze job match. Please try again.',
      };
    }

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
    let matchAnalysis;
    try {
      matchAnalysis = await AIResumeService.matchJobDescription(
        resumeText,
        validatedData.jobDescription,
        validatedData.jobTitle || 'Not specified',
        validatedData.companyName || 'Not specified'
      );
    } catch (aiError) {
      console.error('AI job matching error:', aiError);
      if (aiError instanceof Error && aiError.message.includes('JSON')) {
        return {
          success: false,
          error:
            'The job matching response was too detailed and got truncated. Please try again.',
        };
      }
      return {
        success: false,
        error: 'Failed to analyze job match. Please try again.',
      };
    } // Store the analysis result
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
    let optimization;
    try {
      optimization = await AIResumeService.optimizeResume(
        resumeText,
        validatedData.targetIndustry,
        validatedData.targetRole
      );
    } catch (aiError) {
      console.error('AI optimization error:', aiError);
      // Check if it's a JSON parsing error (response too long)
      if (aiError instanceof Error && aiError.message.includes('JSON')) {
        return {
          success: false,
          error:
            'The optimization response was too detailed and got truncated. Please try again or contact support if the issue persists.',
        };
      }
      return {
        success: false,
        error: 'Failed to generate optimization suggestions. Please try again.',
      };
    }

    // Store the analysis result with proper optimization data structure
    const suggestions: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
    }> = [];

    // Map optimized sections to suggestions
    if (optimization.optimizedSections?.summary) {
      suggestions.push({
        category: 'summary',
        priority: 'high',
        title: 'Professional Summary Enhancement',
        description: optimization.optimizedSections.summary,
      });
    }

    // Map experience improvements
    if (optimization.optimizedSections?.experienceImprovements?.length) {
      optimization.optimizedSections.experienceImprovements.forEach(
        (improvement, index) => {
          if (improvement?.improvedText && improvement?.reasoning) {
            suggestions.push({
              category: 'experience',
              priority: index < 2 ? 'high' : 'medium',
              title: 'Experience Section Improvement',
              description: `${improvement.improvedText} (${improvement.reasoning})`,
            });
          }
        }
      );
    }

    // Map keyword suggestions
    if (optimization.keywordOptimization?.keywordPlacement?.length > 0) {
      optimization.keywordOptimization.keywordPlacement.forEach(
        (placement, index) => {
          suggestions.push({
            category: 'keywords',
            priority: index < 3 ? 'high' : 'medium',
            title: `Add Keyword: ${placement.keyword}`,
            description: `${placement.context} (Suggested section: ${placement.suggestedSection})`,
          });
        }
      );
    }

    // Map formatting tips
    if (optimization.formattingTips?.length > 0) {
      optimization.formattingTips.forEach((tip, index) => {
        suggestions.push({
          category: 'formatting',
          priority: 'medium',
          title: `Formatting Improvement ${index + 1}`,
          description: tip,
        });
      });
    }

    // Map industry-specific tips
    if (optimization.industrySpecificTips?.length > 0) {
      optimization.industrySpecificTips.forEach((tip, index) => {
        suggestions.push({
          category: 'industry',
          priority: index < 2 ? 'high' : 'low',
          title: `Industry-Specific Tip ${index + 1}`,
          description: tip,
        });
      });
    }

    // Fallback: If no suggestions were created from the structured data,
    // create general suggestions from any available data
    if (suggestions.length === 0) {
      // Try to extract any available optimization data as suggestions
      if (optimization.keywordOptimization?.suggestedKeywords?.length > 0) {
        optimization.keywordOptimization.suggestedKeywords
          .slice(0, 5)
          .forEach((keyword, index) => {
            suggestions.push({
              category: 'keywords',
              priority: index < 3 ? 'high' : 'medium',
              title: `Add Keyword: ${keyword}`,
              description: `Consider adding "${keyword}" to relevant sections of your resume for better keyword optimization.`,
            });
          });
      }

      // If still no suggestions, create at least one general suggestion
      if (suggestions.length === 0) {
        suggestions.push({
          category: 'general',
          priority: 'medium',
          title: 'Resume Optimization',
          description:
            'Your resume has been analyzed. Consider reviewing your professional summary, experience descriptions, and skills section for potential improvements.',
        });
      }
    }

    const analysisRecord = await db.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: session.user.id,
        type: 'OPTIMIZATION',
        score: undefined, // Optimization doesn't have a numeric score
        sections: undefined,
        keywords: {
          found: optimization.optimizedSections?.skills || [],
          missing: [],
          suggestions:
            optimization.keywordOptimization?.suggestedKeywords || [],
        },
        suggestions,
        metadata: {
          targetIndustry: validatedData.targetIndustry,
          targetRole: validatedData.targetRole,
          optimizedSections: optimization.optimizedSections,
          keywordOptimization: optimization.keywordOptimization,
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
    const session = await auth();

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
    const session = await auth();

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

/**
 * Get comprehensive AI analytics and insights for the dashboard
 */
export async function getAIAnalytics() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.setMonth(monthAgo.getMonth() - 1));

    // Fetch all analyses with application data for correlation
    const [analyses, applications] = await Promise.all([
      db.resumeAnalysis.findMany({
        where: { userId },
        include: {
          resume: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.application.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          positionTitle: true,
          companyName: true,
        },
      }),
    ]);

    // Basic analytics
    const totalAnalyses = analyses.length;
    const todayAnalyses = analyses.filter(
      a => new Date(a.createdAt) >= today
    ).length;
    const weekAnalyses = analyses.filter(
      a => new Date(a.createdAt) >= weekAgo
    ).length;
    const monthAnalyses = analyses.filter(
      a => new Date(a.createdAt) >= monthAgo
    ).length;

    // Score analytics (only for scored analyses)
    const scoredAnalyses = analyses.filter(
      a => a.score !== null && a.score !== undefined
    );
    const averageScore =
      scoredAnalyses.length > 0
        ? Math.round(
            scoredAnalyses.reduce((sum, a) => sum + (a.score || 0), 0) /
              scoredAnalyses.length
          )
        : 0;
    const topScore =
      scoredAnalyses.length > 0
        ? Math.max(...scoredAnalyses.map(a => a.score || 0))
        : 0;

    // Weekly trend data (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAnalyses = analyses.filter(a => {
        const analysisDate = new Date(a.createdAt);
        return analysisDate >= date && analysisDate < nextDate;
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        analyses: dayAnalyses.length,
        avgScore:
          dayAnalyses.filter(a => a.score).length > 0
            ? Math.round(
                dayAnalyses
                  .filter(a => a.score)
                  .reduce((sum, a) => sum + (a.score || 0), 0) /
                  dayAnalyses.filter(a => a.score).length
              )
            : 0,
      });
    }

    // Analysis type distribution
    const typeDistribution = analyses.reduce(
      (acc, analysis) => {
        const type = analysis.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Score improvement tracking (comparing recent vs older analyses)
    const recentAnalyses = scoredAnalyses.filter(
      a => new Date(a.createdAt) >= weekAgo
    );
    const olderAnalyses = scoredAnalyses.filter(
      a => new Date(a.createdAt) < weekAgo
    );

    const recentAvgScore =
      recentAnalyses.length > 0
        ? Math.round(
            recentAnalyses.reduce((sum, a) => sum + (a.score || 0), 0) /
              recentAnalyses.length
          )
        : 0;
    const olderAvgScore =
      olderAnalyses.length > 0
        ? Math.round(
            olderAnalyses.reduce((sum, a) => sum + (a.score || 0), 0) /
              olderAnalyses.length
          )
        : 0;

    const scoreImprovement = recentAvgScore - olderAvgScore;

    // Application success correlation
    const successfulApplications = applications.filter(
      a => a.status === 'OFFER_RECEIVED'
    ).length;
    const totalApplications = applications.length;
    const successRate =
      totalApplications > 0
        ? Math.round((successfulApplications / totalApplications) * 100)
        : 0;

    // AI usage patterns
    const analysisFrequency = {
      daily: todayAnalyses,
      weekly: weekAnalyses,
      monthly: monthAnalyses,
    };

    // Recent high-performing analyses
    const topPerformingAnalyses = scoredAnalyses
      .filter(a => a.score && a.score >= 80)
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        resumeId: a.resumeId,
        resumeTitle: a.resume?.title || 'Untitled Resume',
        type: a.type as string,
        score: a.score as number,
        createdAt: a.createdAt,
      }));

    return {
      success: true,
      analytics: {
        overview: {
          totalAnalyses,
          averageScore,
          topScore,
          scoreImprovement,
          successRate,
        },
        usage: {
          today: todayAnalyses,
          week: weekAnalyses,
          month: monthAnalyses,
          frequency: analysisFrequency,
        },
        trends: {
          weekly: weeklyTrend,
          typeDistribution,
        },
        performance: {
          topPerformingAnalyses,
          recentAvgScore,
          olderAvgScore,
        },
        correlations: {
          totalApplications,
          successfulApplications,
          successRate,
        },
      },
    };
  } catch (error) {
    console.error('Failed to get AI analytics:', error);
    return {
      success: false,
      error: 'Failed to get AI analytics',
    };
  }
}

/**
 * Get AI recommendation effectiveness tracking
 */
export async function getAIRecommendationEffectiveness() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Get analyses with suggestions
    const analysesWithSuggestions = await db.resumeAnalysis.findMany({
      where: {
        userId,
        suggestions: {
          not: undefined,
        },
      },
      include: {
        resume: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate suggestion effectiveness metrics
    const totalSuggestions = analysesWithSuggestions.reduce(
      (total, analysis) => {
        const suggestions = analysis.suggestions as Array<{
          category?: string;
          priority?: string;
          title?: string;
          description?: string;
        }>;
        return total + (suggestions?.length || 0);
      },
      0
    );

    // Categorize suggestions by type and priority
    const suggestionsByCategory: Record<string, number> = {};
    const suggestionsByPriority = { high: 0, medium: 0, low: 0 };

    analysesWithSuggestions.forEach(analysis => {
      const suggestions = analysis.suggestions as Array<{
        category?: string;
        priority?: string;
        title?: string;
        description?: string;
      }>;
      if (suggestions) {
        suggestions.forEach(suggestion => {
          // Count by category
          const category = suggestion.category || 'general';
          suggestionsByCategory[category] =
            (suggestionsByCategory[category] || 0) + 1;

          // Count by priority
          const priority = suggestion.priority || 'medium';
          if (priority in suggestionsByPriority) {
            suggestionsByPriority[
              priority as keyof typeof suggestionsByPriority
            ]++;
          }
        });
      }
    });

    // Recent suggestions with high impact potential
    const recentHighImpactSuggestions = analysesWithSuggestions
      .slice(0, 10)
      .flatMap(analysis => {
        const suggestions = analysis.suggestions as Array<{
          category?: string;
          priority?: string;
          title?: string;
          description?: string;
        }>;
        return (suggestions || [])
          .filter(s => s.priority === 'high')
          .map(s => ({
            category: s.category || 'general',
            priority: s.priority || 'high',
            title: s.title || 'Untitled Suggestion',
            description: s.description || 'No description available',
            analysisId: analysis.id,
            resumeTitle: analysis.resume?.title || 'Untitled Resume',
            createdAt: analysis.createdAt,
          }));
      })
      .slice(0, 5);

    return {
      success: true,
      effectiveness: {
        totalSuggestions,
        suggestionsByCategory,
        suggestionsByPriority,
        recentHighImpactSuggestions,
        analysesWithSuggestions: analysesWithSuggestions.length,
      },
    };
  } catch (error) {
    console.error('Failed to get AI recommendation effectiveness:', error);
    return {
      success: false,
      error: 'Failed to get recommendation effectiveness data',
    };
  }
}
