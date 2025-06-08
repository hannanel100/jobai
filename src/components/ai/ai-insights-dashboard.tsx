'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Star,
  Target,
  TrendingUp,
  FileText,
  Clock,
  Zap,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { getRateLimitStatus } from '@/actions/ai';
import { ResumeAnalysis, AnalysisType } from '@prisma/client';
import Link from 'next/link';

interface AIInsightsDashboardProps {
  userId: string;
}

interface AnalysisWithData extends ResumeAnalysis {
  resume?: {
    id: string;
    title: string;
  };
}

export function AIInsightsDashboard({ userId }: AIInsightsDashboardProps) {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rateLimit, setRateLimit] = useState<{
    count: number;
    limit: number;
    remaining: number;
    resetsAt: string;
  } | null>(null);

  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    topScore: 0,
    analysesToday: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both analyses and rate limit status
        const [analysesResult, rateLimitResult] = await Promise.all([
          (async () => {
            const { getUserAnalyses } = await import('@/actions/ai');
            return getUserAnalyses();
          })(),
          getRateLimitStatus(),
        ]);

        // Process analyses
        if (analysesResult.success && analysesResult.analyses) {
          setRecentAnalyses(analysesResult.analyses);

          // Filter analyses that have actual scores for average calculation
          // (Optimization analyses don't have scores since they provide qualitative suggestions)
          const scoredAnalyses = analysesResult.analyses.filter(
            a => a.score !== null && a.score !== undefined
          );

          setStats({
            totalAnalyses: analysesResult.analyses.length,
            averageScore:
              scoredAnalyses.length > 0
                ? Math.round(
                    scoredAnalyses.reduce((sum, a) => sum + a.score!, 0) /
                      scoredAnalyses.length
                  )
                : 0,
            topScore: Math.max(
              ...analysesResult.analyses.map(a => a.score || 0),
              0
            ),
            analysesToday: analysesResult.analyses.filter(a => {
              const today = new Date();
              const analysisDate = new Date(a.createdAt);
              return analysisDate.toDateString() === today.toDateString();
            }).length,
          });
        } else {
          console.error('Failed to fetch analyses:', analysesResult.error);
          setRecentAnalyses([]);
          setStats({
            totalAnalyses: 0,
            averageScore: 0,
            topScore: 0,
            analysesToday: 0,
          });
        } // Process rate limit
        if (rateLimitResult.success && rateLimitResult.rateLimit) {
          setRateLimit(rateLimitResult.rateLimit);
        }
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        setRecentAnalyses([]);
        setStats({
          totalAnalyses: 0,
          averageScore: 0,
          topScore: 0,
          analysesToday: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getAnalysisIcon = (type: AnalysisType) => {
    switch (type) {
      case 'COMPREHENSIVE_SCORE':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'JOB_MATCH':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'OPTIMIZATION':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const getAnalysisTitle = (type: AnalysisType) => {
    switch (type) {
      case 'COMPREHENSIVE_SCORE':
        return 'Resume Score';
      case 'JOB_MATCH':
        return 'Job Match';
      case 'OPTIMIZATION':
        return 'Optimization';
      default:
        return 'Analysis';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours =
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-500">Loading AI insights...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Analyses
                </p>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}
                >
                  {stats.averageScore}/100
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Score</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(stats.topScore)}`}
                >
                  {stats.topScore}/100
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>{' '}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold">{stats.analysesToday}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Status */}
      {rateLimit && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    AI Analysis Usage
                  </p>
                  <p className="text-xs text-gray-500">
                    {rateLimit.count} of {rateLimit.limit} analyses used today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {rateLimit.remaining > 0 ? (
                    <span className="text-green-600">
                      {rateLimit.remaining} remaining
                    </span>
                  ) : (
                    <span className="text-red-600">Limit reached</span>
                  )}
                </p>
                {rateLimit.remaining === 0 && (
                  <p className="text-xs text-gray-500">
                    Resets {rateLimit.resetsAt}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Progress
                value={(rateLimit.count / rateLimit.limit) * 100}
                className="w-full h-2"
              />
            </div>
            {rateLimit.remaining === 0 && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>Daily limit reached. Rate limit resets at midnight.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses or Empty State */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                AI Resume Insights
              </CardTitle>
              <CardDescription>
                Recent AI analysis results and recommendations
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/resumes">
                <FileText className="h-4 w-4 mr-2" />
                Manage Resumes
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Analysis Ready
              </h3>
              <p className="text-gray-500 mb-6">
                Upload a resume and run AI analysis to get personalized
                insights, scores, and optimization suggestions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">Resume Scoring</h4>
                  <p className="text-xs text-gray-600">
                    Get comprehensive scores for skills, experience, and ATS
                    compatibility
                  </p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">Job Matching</h4>
                  <p className="text-xs text-gray-600">
                    Analyze how well your resume matches specific job
                    descriptions
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />{' '}
                  <h4 className="font-medium text-sm mb-1">Optimization</h4>
                  <p className="text-xs text-gray-600">
                    Get AI-powered suggestions to improve your resume&apos;s
                    impact
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/dashboard/resumes">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/applications/new">
                    Add Job Application
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.slice(0, 5).map(analysis => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getAnalysisIcon(analysis.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {getAnalysisTitle(analysis.type)}
                      </p>{' '}
                      <p className="text-xs text-gray-500">
                        Score:{' '}
                        {analysis.score
                          ? `${Math.round(analysis.score)}%`
                          : 'N/A'}{' '}
                        • {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {analysis.score && (
                      <div className="text-right">
                        <p
                          className={`font-semibold ${getScoreColor(analysis.score)}`}
                        >
                          {Math.round(analysis.score)}/100
                        </p>
                        <Progress value={analysis.score} className="w-16 h-1" />
                      </div>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/resumes/${analysis.resumeId}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {recentAnalyses.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/resumes">
                      View All Analyses
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
