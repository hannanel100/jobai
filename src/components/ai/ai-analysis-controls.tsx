'use client';

import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
// Removed theme import - using CSS variables instead
import {
  Brain,
  Star,
  Target,
  TrendingUp,
  Loader2,
  Sparkles,
  FileText,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  analyzeResume,
  matchResumeToJobAdHoc,
  optimizeResume,
  getRateLimitStatus,
} from '@/actions/ai';
import { toast } from 'sonner';

interface AIAnalysisControlsProps {
  resumeId: string;
  applicationId?: string;
  onAnalysisComplete?: () => void;
  disabled?: boolean;
}
export function AIAnalysisControls({
  resumeId,
  onAnalysisComplete,
  disabled = false,
}: AIAnalysisControlsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobInput, setShowJobInput] = useState(false);
  const [rateLimit, setRateLimit] = useState<{
    count: number;
    limit: number;
    remaining: number;
    resetsAt: string;
  } | null>(null);
  const [loadingRateLimit, setLoadingRateLimit] = useState(true);

  // Load rate limit status on component mount
  useEffect(() => {
    loadRateLimitStatus();
  }, []);
  const loadRateLimitStatus = async () => {
    try {
      const result = await getRateLimitStatus();
      if (result.success && result.rateLimit) {
        setRateLimit(result.rateLimit);
      }
    } catch (error) {
      console.error('Failed to load rate limit status:', error);
    } finally {
      setLoadingRateLimit(false);
    }
  };

  const isRateLimited = Boolean(rateLimit && rateLimit.remaining <= 0);

  const formatTimeUntilReset = (resetsAt: string) => {
    const resetTime = new Date(resetsAt);
    const now = new Date();
    const diffMs = resetTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'now';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  const handleComprehensiveAnalysis = async () => {
    if (disabled || isRateLimited) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeResume({ resumeId });

      if (result.success) {
        toast.success('Resume analysis completed successfully!');
        await loadRateLimitStatus(); // Refresh rate limit status
        onAnalysisComplete?.();
      } else {
        if (result.rateLimited) {
          toast.error(
            'Daily analysis limit reached. Please try again tomorrow.'
          );
          await loadRateLimitStatus(); // Refresh rate limit status
        } else {
          toast.error(result.error || 'Failed to analyze resume');
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleJobMatching = async () => {
    if (disabled || isRateLimited) return;

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsMatching(true);
    try {
      const result = await matchResumeToJobAdHoc({
        resumeId,
        jobDescription: jobDescription.trim(),
        jobTitle: undefined, // Could be added as an optional field later
        companyName: undefined, // Could be added as an optional field later
      });
      if (result.success) {
        toast.success('Job matching analysis completed!');
        setJobDescription('');
        setShowJobInput(false);
        await loadRateLimitStatus(); // Refresh rate limit status
        onAnalysisComplete?.();
      } else {
        if (result.rateLimited) {
          toast.error(
            'Daily analysis limit reached. Please try again tomorrow.'
          );
          await loadRateLimitStatus(); // Refresh rate limit status
        } else {
          toast.error(result.error || 'Failed to match resume to job');
        }
      }
    } catch (error) {
      console.error('Job matching error:', error);
      toast.error('Failed to match resume to job');
    } finally {
      setIsMatching(false);
    }
  };

  const handleOptimization = async () => {
    if (disabled || isRateLimited) return;

    setIsOptimizing(true);
    try {
      const result = await optimizeResume({ resumeId });

      if (result.success) {
        toast.success('Optimization suggestions generated!');
        await loadRateLimitStatus(); // Refresh rate limit status
        onAnalysisComplete?.();
      } else {
        if (result.rateLimited) {
          toast.error(
            'Daily analysis limit reached. Please try again tomorrow.'
          );
          await loadRateLimitStatus(); // Refresh rate limit status
        } else {
          toast.error(
            result.error || 'Failed to generate optimization suggestions'
          );
        }
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to generate optimization suggestions');
    } finally {
      setIsOptimizing(false);
    }
  };

  const isAnyAnalysisRunning = isAnalyzing || isMatching || isOptimizing;

  return (
    <Card className="w-full">
      {' '}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Resume Analysis
        </CardTitle>{' '}
        <CardDescription>
          Get AI-powered insights to improve your resume&apos;s effectiveness
        </CardDescription>
        {/* Rate Limit Display */}
        {!loadingRateLimit && rateLimit && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                Daily Usage: {rateLimit.count}/{rateLimit.limit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isRateLimited ? (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Limit Reached
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {rateLimit.remaining} remaining
                </Badge>
              )}
              {isRateLimited && (
                <span className="text-xs text-gray-500">
                  Resets in {formatTimeUntilReset(rateLimit.resetsAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Analysis Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Comprehensive Score */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-sm">
                Comprehensive Score
              </span>{' '}
            </div>
            <p className="text-xs text-gray-600">
              Get an overall score and detailed breakdown of your resume&apos;s
              strengths and weaknesses.
            </p>{' '}
            <Button
              onClick={handleComprehensiveAnalysis}
              disabled={disabled || isAnyAnalysisRunning || isRateLimited}
              className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isRateLimited ? (
                <AlertTriangle className="h-4 w-4 mr-2" />
              ) : (
                <Star className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing
                ? 'Analyzing...'
                : isRateLimited
                  ? 'Limit Reached'
                  : 'Analyze Resume'}
            </Button>
          </div>

          {/* Job Matching */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Job Matching</span>
            </div>
            <p className="text-xs text-gray-600">
              Compare your resume against a specific job description to see how
              well you match.
            </p>{' '}
            <Button
              onClick={() => setShowJobInput(!showJobInput)}
              disabled={disabled || isAnyAnalysisRunning || isRateLimited}
              variant={showJobInput ? 'secondary' : 'default'}
              className={`w-full text-white transition-colors duration-200 ${
                showJobInput
                  ? 'bg-[var(--theme-secondary)] hover:bg-[var(--theme-accent)]'
                  : 'bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)]'
              }`}
              size="sm"
            >
              {isRateLimited ? (
                <AlertTriangle className="h-4 w-4 mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              {isRateLimited
                ? 'Limit Reached'
                : showJobInput
                  ? 'Hide Job Input'
                  : 'Match to Job'}
            </Button>
          </div>

          {/* Optimization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Optimization</span>{' '}
            </div>
            <p className="text-xs text-gray-600">
              Get specific suggestions to improve your resume&apos;s ATS
              compatibility and impact.
            </p>{' '}
            <Button
              onClick={handleOptimization}
              disabled={disabled || isAnyAnalysisRunning || isRateLimited}
              className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
              size="sm"
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isRateLimited ? (
                <AlertTriangle className="h-4 w-4 mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isOptimizing
                ? 'Optimizing...'
                : isRateLimited
                  ? 'Limit Reached'
                  : 'Optimize Resume'}
            </Button>
          </div>
        </div>

        {/* Job Description Input */}
        {showJobInput && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Job Description</span>
                <Badge variant="secondary" className="text-xs">
                  AI Analysis
                </Badge>
              </div>{' '}
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                disabled={disabled || isAnyAnalysisRunning || isRateLimited}
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {jobDescription.length > 0 && (
                    <span>
                      {jobDescription.length} characters •{' '}
                      {jobDescription.trim().split(/\s+/).length} words
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setJobDescription('');
                      setShowJobInput(false);
                    }}
                    disabled={isAnyAnalysisRunning}
                    className="border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </Button>{' '}
                  <Button
                    onClick={handleJobMatching}
                    disabled={
                      disabled ||
                      isAnyAnalysisRunning ||
                      !jobDescription.trim() ||
                      isRateLimited
                    }
                    size="sm"
                    className="bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white transition-colors duration-200"
                  >
                    {isMatching ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isRateLimited ? (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {isMatching
                      ? 'Analyzing...'
                      : isRateLimited
                        ? 'Limit Reached'
                        : 'Run Analysis'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI Analysis Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 text-sm">
                AI-Powered Resume Intelligence
              </h4>
              <p className="text-xs text-blue-700">
                Our AI analyzes your resume content, structure, and keywords to
                provide actionable insights. Each analysis is tailored to help
                you improve your chances of landing interviews.
              </p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span>• ATS Optimization</span>
                <span>• Keyword Analysis</span>
                <span>• Content Scoring</span>
                <span>• Industry Insights</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
