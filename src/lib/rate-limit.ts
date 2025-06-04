// src/lib/rate-limit.ts
import { db } from './db';

const DAILY_AI_ANALYSIS_LIMIT = 3;

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  resetsAt: Date;
}

/**
 * Check if user has exceeded their daily AI analysis limit
 * @param userId - The user ID to check
 * @returns Rate limit status
 */
export async function checkAIAnalysisRateLimit(
  userId: string
): Promise<RateLimitResult> {
  // Skip rate limiting in development
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.BYPASS_RATE_LIMIT === 'true'
  ) {
    return {
      allowed: true,
      count: 0,
      limit: DAILY_AI_ANALYSIS_LIMIT,
      resetsAt: getEndOfDay(),
    };
  }

  const startOfDay = getStartOfDay();
  const endOfDay = getEndOfDay();

  // Count today's analyses for this user
  const todayCount = await db.resumeAnalysis.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  return {
    allowed: todayCount < DAILY_AI_ANALYSIS_LIMIT,
    count: todayCount,
    limit: DAILY_AI_ANALYSIS_LIMIT,
    resetsAt: endOfDay,
  };
}

/**
 * Get remaining AI analyses for today
 * @param userId - The user ID to check
 * @returns Remaining count and reset time
 */
export async function getRemainingAIAnalyses(userId: string): Promise<{
  remaining: number;
  resetsAt: Date;
  limit: number;
}> {
  const rateLimit = await checkAIAnalysisRateLimit(userId);

  return {
    remaining: Math.max(0, rateLimit.limit - rateLimit.count),
    resetsAt: rateLimit.resetsAt,
    limit: rateLimit.limit,
  };
}

/**
 * Get start of current day (00:00:00)
 */
function getStartOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Get end of current day (23:59:59.999)
 */
function getEndOfDay(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
}

/**
 * Format time until reset in a human-readable way
 * @param resetsAt - The reset time
 * @returns Formatted string like "5 hours" or "23 minutes"
 */
export function formatTimeUntilReset(resetsAt: Date): string {
  const now = new Date();
  const diffMs = resetsAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'now';
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  return 'less than a minute';
}

/**
 * Create a rate limit error message
 * @param rateLimit - The rate limit result
 * @returns Formatted error message
 */
export function createRateLimitErrorMessage(
  rateLimit: RateLimitResult
): string {
  const timeUntilReset = formatTimeUntilReset(rateLimit.resetsAt);

  return (
    `Daily AI analysis limit reached (${rateLimit.count}/${rateLimit.limit}). ` +
    `Your limit will reset in ${timeUntilReset}. ` +
    `Upgrade your plan for higher limits.`
  );
}
