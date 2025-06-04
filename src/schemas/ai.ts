import { z } from 'zod';

// Resume scoring schema
export const resumeScoreSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Overall resume score out of 100'),
  sections: z.object({
    contactInfo: z
      .number()
      .min(0)
      .max(10)
      .describe('Contact information completeness (0-10)'),
    summary: z
      .number()
      .min(0)
      .max(15)
      .describe('Professional summary quality (0-15)'),
    experience: z
      .number()
      .min(0)
      .max(30)
      .describe('Work experience relevance and quality (0-30)'),
    skills: z
      .number()
      .min(0)
      .max(20)
      .describe('Skills section completeness and relevance (0-20)'),
    education: z
      .number()
      .min(0)
      .max(15)
      .describe('Education section quality (0-15)'),
    formatting: z
      .number()
      .min(0)
      .max(10)
      .describe('Overall formatting and readability (0-10)'),
  }),
  strengths: z
    .array(z.string())
    .describe('Key strengths identified in the resume'),
  improvements: z.array(z.string()).describe('Specific areas for improvement'),
  missingElements: z
    .array(z.string())
    .describe('Important elements missing from the resume'),
  atsCompatibility: z.object({
    score: z.number().min(0).max(100).describe('ATS compatibility score'),
    issues: z.array(z.string()).describe('ATS compatibility issues found'),
    recommendations: z
      .array(z.string())
      .describe('ATS improvement recommendations'),
  }),
});

// Job matching schema
export const jobMatchSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('How well the resume matches the job (0-100)'),
  keywordMatches: z.object({
    matched: z
      .array(z.string())
      .describe('Keywords from job description found in resume'),
    missing: z
      .array(z.string())
      .describe('Important keywords missing from resume'),
    score: z.number().min(0).max(100).describe('Keyword match percentage'),
  }),
  skillAlignment: z.object({
    matchedSkills: z
      .array(z.string())
      .describe('Skills that match job requirements'),
    missingSkills: z
      .array(z.string())
      .describe('Required skills not mentioned in resume'),
    score: z.number().min(0).max(100).describe('Skills alignment score'),
  }),
  experienceAlignment: z.object({
    relevantExperience: z
      .array(z.string())
      .describe('Work experience relevant to the job'),
    experienceGaps: z
      .array(z.string())
      .describe('Experience gaps or misalignments'),
    score: z.number().min(0).max(100).describe('Experience relevance score'),
  }),
  recommendations: z
    .array(z.string())
    .describe('Specific recommendations to improve job match'),
  tailoringTips: z
    .array(z.string())
    .describe('Tips for tailoring resume to this specific job'),
});

// Resume optimization schema
export const resumeOptimizationSchema = z.object({
  optimizedSections: z.object({
    summary: z.string().optional().describe('Improved professional summary'),
    skills: z.array(z.string()).optional().describe('Optimized skills list'),
    experienceImprovements: z
      .array(
        z.object({
          originalText: z.string().describe('Original experience description'),
          improvedText: z.string().describe('Improved experience description'),
          reasoning: z.string().describe('Why this improvement was made'),
        })
      )
      .optional()
      .describe('Experience section improvements'),
  }),
  keywordOptimization: z.object({
    suggestedKeywords: z
      .array(z.string())
      .describe('Keywords to add for better visibility'),
    keywordPlacement: z
      .array(
        z.object({
          keyword: z.string(),
          suggestedSection: z.string(),
          context: z
            .string()
            .describe('How to naturally incorporate this keyword'),
        })
      )
      .describe('Specific keyword placement suggestions'),
  }),
  formattingTips: z
    .array(z.string())
    .describe('Formatting and structure improvements'),
  industrySpecificTips: z
    .array(z.string())
    .describe('Industry-specific optimization tips'),
});

export type ResumeScore = z.infer<typeof resumeScoreSchema>;
export type JobMatch = z.infer<typeof jobMatchSchema>;
export type ResumeOptimization = z.infer<typeof resumeOptimizationSchema>;
