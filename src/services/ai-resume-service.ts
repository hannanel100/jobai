import { generateObject } from 'ai';
import { ai, AI_CONFIG } from '@/lib/ai';
import {
  resumeScoreSchema,
  jobMatchSchema,
  resumeOptimizationSchema,
  type ResumeScore,
  type JobMatch,
  type ResumeOptimization,
} from '@/schemas/ai';

export class AIResumeService {
  /**
   * Analyze a resume and provide a comprehensive score
   */
  static async analyzeResume(resumeText: string): Promise<ResumeScore> {
    const result = await generateObject({
      model: ai,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      schema: resumeScoreSchema,
      prompt: `
        You are an expert HR professional and resume reviewer. Analyze the following resume and provide a comprehensive evaluation.

        Resume Text:
        """
        ${resumeText}
        """

        Please evaluate this resume on the following criteria:
        1. Contact Information (0-10): Is all necessary contact info present and professional?
        2. Professional Summary (0-15): Quality, clarity, and relevance of the summary
        3. Work Experience (0-30): Relevance, detail, achievements, and career progression
        4. Skills (0-20): Completeness, relevance, and organization of skills
        5. Education (0-15): Educational background and relevance
        6. Formatting (0-10): Overall readability, structure, and professional appearance

        Also assess:
        - Key strengths that make this candidate stand out
        - Specific areas for improvement
        - Missing elements that should be included
        - ATS (Applicant Tracking System) compatibility

        Be specific and actionable in your feedback.
      `,
    });

    return result.object;
  }

  /**
   * Compare resume against a specific job description
   */
  static async matchJobDescription(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<JobMatch> {
    const result = await generateObject({
      model: ai,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      schema: jobMatchSchema,
      prompt: `
        You are an expert recruiter analyzing how well a resume matches a specific job opportunity.

        Job Details:
        - Position: ${jobTitle}
        - Company: ${company}
        
        Job Description:
        """
        ${jobDescription}
        """

        Resume Text:
        """
        ${resumeText}
        """

        Please analyze:
        1. Overall match score (0-100) based on how well the resume aligns with job requirements
        2. Keyword analysis - which keywords from the job description are present/missing
        3. Skills alignment - how well the candidate's skills match job requirements
        4. Experience alignment - how relevant is their work experience
        5. Specific recommendations to improve the match
        6. Tailoring tips for this specific role

        Be thorough and provide actionable insights.
      `,
    });

    return result.object;
  }

  /**
   * Generate optimization suggestions for a resume
   */
  static async optimizeResume(
    resumeText: string,
    targetIndustry?: string,
    targetRole?: string
  ): Promise<ResumeOptimization> {
    const industryContext = targetIndustry
      ? `Target Industry: ${targetIndustry}`
      : 'General optimization';

    const roleContext = targetRole
      ? `Target Role: ${targetRole}`
      : 'General role optimization';

    const result = await generateObject({
      model: ai,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      schema: resumeOptimizationSchema,
      prompt: `
        You are an expert resume writer. Optimize this resume with concise, actionable improvements.

        ${industryContext}
        ${roleContext}

        Resume Text:
        """
        ${resumeText}
        """

        Provide optimization suggestions focusing on:
        1. Enhanced summary (1-2 sentences max)
        2. Top 10-15 relevant skills only
        3. 3-5 key experience improvements (brief descriptions)
        4. 8-10 essential keywords for ATS
        5. 3-4 formatting tips
        6. 3-4 industry-specific tips

        Keep all suggestions concise and actionable. Prioritize quality over quantity.
      `,
    });

    return result.object;
  }

  /**
   * Quick resume health check
   */
  static async quickHealthCheck(resumeText: string): Promise<{
    score: number;
    topIssues: string[];
    quickWins: string[];
  }> {
    const result = await generateObject({
      model: ai,
      maxTokens: 500,
      temperature: AI_CONFIG.temperature,
      schema: resumeScoreSchema,
      prompt: `
        Perform a quick health check on this resume. Focus on the most critical issues and easy improvements.

        Resume Text:
        """
        ${resumeText}
        """

        Provide a brief assessment focusing on the overall score and the most important improvements.
      `,
    });

    return {
      score: result.object.overallScore,
      topIssues: result.object.improvements.slice(0, 3),
      quickWins: result.object.strengths.slice(0, 3),
    };
  }
  static async matchResumeToJob(
    resumeText: string,
    jobDescription: string
  ): Promise<JobMatch> {
    const result = await generateObject({
      model: ai,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      schema: jobMatchSchema,
      prompt: `
        You are an expert recruiter analyzing how well a resume matches a specific job opportunity.

        Job Description:
        """
        ${jobDescription}
        """

        Resume Text:
        """
        ${resumeText}
        """

        Please analyze:
        1. Overall match score (0-100) based on how well the resume aligns with job requirements
        2. Keyword analysis - which keywords from the job description are present/missing
        3. Skills alignment - how well the candidate's skills match job requirements
        4. Experience alignment - how relevant is their work experience
        5. Specific recommendations to improve the match
        6. Tailoring tips for this specific role

        Be thorough and provide actionable insights.
      `,
    });

    return result.object;
  }

  static async matchResumeToJobAdHoc(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<JobMatch> {
    const result = await generateObject({
      model: ai,
      maxTokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      schema: jobMatchSchema,
      prompt: `
        You are an expert recruiter analyzing how well a resume matches a specific job opportunity.

        Job Details:
        - Position: ${jobTitle}
        - Company: ${company}
        
        Job Description:
        """
        ${jobDescription}
        """

        Resume Text:
        """
        ${resumeText}
        """

        Please analyze:
        1. Overall match score (0-100) based on how well the resume aligns with job requirements
        2. Keyword analysis - which keywords from the job description are present/missing
        3. Skills alignment - how well the candidate's skills match job requirements
        4. Experience alignment - how relevant is their work experience
        5. Specific recommendations to improve the match
        6. Tailoring tips for this specific role

        Be thorough and provide actionable insights.
      `,
    });

    return result.object;
  }
}
