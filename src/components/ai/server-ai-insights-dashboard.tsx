'use client';

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
  FileText,
  Zap,
  ChevronRight,
  AlertTriangle,
  Target,
  TrendingUp,
  PieChart,
  BarChart,
} from 'lucide-react';
import { ResumeAnalysis, AnalysisType } from '@prisma/client';
import Link from 'next/link';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface AnalysisWithData extends ResumeAnalysis {
  resume?: {
    id: string;
    title: string;
  };
}

interface AIAnalytics {
  overview: {
    totalAnalyses: number;
    averageScore: number;
    topScore: number;
    scoreImprovement: number;
    successRate: number;
  };
  usage: {
    today: number;
    week: number;
    month: number;
    frequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  trends: {
    weekly: Array<{
      date: string;
      analyses: number;
      avgScore: number;
    }>;
    typeDistribution: Record<string, number>;
  };
  performance: {
    topPerformingAnalyses: Array<{
      id: string;
      resumeId: string;
      resumeTitle: string;
      type: string;
      score: number;
      createdAt: Date;
    }>;
    recentAvgScore: number;
    olderAvgScore: number;
  };
  correlations: {
    totalApplications: number;
    successfulApplications: number;
    successRate: number;
  };
}

interface RecommendationEffectiveness {
  totalSuggestions: number;
  suggestionsByCategory: Record<string, number>;
  suggestionsByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  recentHighImpactSuggestions: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    analysisId: string;
    resumeTitle: string;
    createdAt: Date;
  }>;
  analysesWithSuggestions: number;
}

interface ServerAIInsightsDashboardProps {
  analyses: AnalysisWithData[];
  analytics?: AIAnalytics | null;
  recommendationEffectiveness?: RecommendationEffectiveness | null;
  rateLimit: {
    count: number;
    limit: number;
    remaining: number;
    resetsAt: string;
  } | null;
}

export function ServerAIInsightsDashboard({
  analyses,
  analytics,
  recommendationEffectiveness,
  rateLimit,
}: ServerAIInsightsDashboardProps) {
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

  // Calculate stats from server-side data (fallback if analytics not available)
  const scoredAnalyses = analyses.filter(
    a => a.score !== null && a.score !== undefined
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const analysesToday = analyses.filter(
    a => new Date(a.createdAt) >= today
  ).length;

  const stats = {
    totalAnalyses: analyses.length,
    averageScore:
      scoredAnalyses.length > 0
        ? Math.round(
            scoredAnalyses.reduce((sum, a) => sum + (a.score || 0), 0) /
              scoredAnalyses.length
          )
        : 0,
    topScore:
      scoredAnalyses.length > 0
        ? Math.max(...scoredAnalyses.map(a => a.score || 0))
        : 0,
    analysesToday,
  };

  const analysisTypeDistribution = analyses.reduce(
    (acc, analysis) => {
      const type = getAnalysisTitle(analysis.type);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recentScoresData = scoredAnalyses
    .slice(0, 5)
    .map(a => ({
      name: a.resume?.title || 'Resume',
      score: a.score,
      date: new Date(a.createdAt).toLocaleDateString(),
    }))
    .reverse();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

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

  return (
    <div className="space-y-6">
      {/* Enhanced AI Stats Overview with Analytics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Analyses
                </p>
                <p className="text-2xl font-bold">
                  {analytics?.overview.totalAnalyses || stats.totalAnalyses}
                </p>
                {analytics && (
                  <p className="text-xs text-gray-500">
                    {analytics.usage.today} today • {analytics.usage.week} this
                    week
                  </p>
                )}
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
                  className={`text-2xl font-bold ${getScoreColor(analytics?.overview.averageScore || stats.averageScore)}`}
                >
                  {analytics?.overview.averageScore || stats.averageScore}/100
                </p>
                {analytics && analytics.overview.scoreImprovement !== 0 && (
                  <p
                    className={`text-xs ${analytics.overview.scoreImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {analytics.overview.scoreImprovement > 0 ? '+' : ''}
                    {analytics.overview.scoreImprovement} from last period
                  </p>
                )}
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
                  className={`text-2xl font-bold ${getScoreColor(analytics?.overview.topScore || stats.topScore)}`}
                >
                  {analytics?.overview.topScore || stats.topScore}/100
                </p>
                {analytics && (
                  <p className="text-xs text-gray-500">
                    {analytics.performance.topPerformingAnalyses.length}{' '}
                    high-performing
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.correlations.successRate || 0}%
                </p>
                {analytics && (
                  <p className="text-xs text-gray-500">
                    {analytics.correlations.successfulApplications} of{' '}
                    {analytics.correlations.totalApplications} apps
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Trends */}
      {analytics && analytics.trends.weekly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              AI Usage Trends (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Daily analysis activity and average scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={analytics.trends.weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={value => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'analyses'
                      ? `${value} analyses`
                      : `${value}% avg score`,
                    name === 'analyses' ? 'Analyses' : 'Avg Score',
                  ]}
                />
                <Bar dataKey="analyses" fill="#8884d8" name="analyses" />
                <Bar dataKey="avgScore" fill="#82ca9d" name="avgScore" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendation Effectiveness */}
      {recommendationEffectiveness && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Recommendation Impact
              </CardTitle>
              <CardDescription>
                AI suggestion effectiveness and priority distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {recommendationEffectiveness.suggestionsByPriority.high}
                  </p>
                  <p className="text-xs text-gray-600">High Priority</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {recommendationEffectiveness.suggestionsByPriority.medium}
                  </p>
                  <p className="text-xs text-gray-600">Medium Priority</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-500">
                    {recommendationEffectiveness.suggestionsByPriority.low}
                  </p>
                  <p className="text-xs text-gray-600">Low Priority</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Recent High-Impact Suggestions:
                </p>
                <div className="space-y-2">
                  {recommendationEffectiveness.recentHighImpactSuggestions
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="text-xs bg-red-50 p-2 rounded"
                      >
                        <p className="font-medium text-red-800">
                          {suggestion.title}
                        </p>
                        <p className="text-red-600 truncate">
                          {suggestion.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Suggestion Categories
              </CardTitle>
              <CardDescription>
                Breakdown of AI suggestions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(
                      recommendationEffectiveness.suggestionsByCategory
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {Object.entries(
                      recommendationEffectiveness.suggestionsByCategory
                    ).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

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

      {analyses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Score Performance Trends
              </CardTitle>
              <CardDescription>
                Resume score improvements over recent analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={recentScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip
                    formatter={value => [`${value}/100`, 'Score']}
                    labelFormatter={label => `Resume: ${label}`}
                  />
                  <Bar dataKey="score" fill="#10b981" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-500" />
                Analysis Summary & Insights
              </CardTitle>
              <CardDescription>
                Performance metrics from recent resume analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalAnalyses}
                    </p>
                    <p className="text-xs text-gray-600">Total Analyses</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.averageScore}/100
                    </p>
                    <p className="text-xs text-gray-600">Average Score</p>
                  </div>
                </div>
                {analytics && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Analysis Types:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(
                        analytics.trends.typeDistribution ||
                          analysisTypeDistribution
                      ).map(([type, count]) => (
                        <div
                          key={type}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
            >
              <Link href="/dashboard/resumes">
                <FileText className="h-4 w-4 mr-2" />
                Manage Resumes
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Analysis Ready
              </h3>
              <p className="text-gray-500 mb-6">
                Upload a resume and run AI analysis to get personalized
                insights, scores, and optimization suggestions.
              </p>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
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
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1">Optimization</h4>
                  <p className="text-xs text-gray-600">
                    Get AI-powered suggestions to improve your resume&apos;s
                    impact
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="text-white hover:opacity-90 transition-opacity bg-[var(--theme-primary)]"
                >
                  <Link href="/dashboard/resumes">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="hover:opacity-80 transition-opacity border-[var(--theme-accent)] text-[var(--theme-accent)]"
                >
                  <Link href="/dashboard/applications/new">
                    Add Job Application
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.slice(0, 5).map(analysis => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getAnalysisIcon(analysis.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {getAnalysisTitle(analysis.type)}
                      </p>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-colors duration-200"
                    >
                      <Link href={`/dashboard/resumes/${analysis.resumeId}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {analyses.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
                  >
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
