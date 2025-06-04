'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Star,
  Target,
  TrendingUp,
  Brain,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getResumeAnalyses } from '@/actions/ai';
import { ResumeAnalysis, AnalysisType } from '@prisma/client';
import { ResumeAnalysisCard } from './resume-analysis-card';
import { toast } from 'sonner';

interface AnalysisHistoryProps {
  resumeId: string;
  refreshTrigger?: number;
}

type AnalysisWithData = ResumeAnalysis & {
  sections?: {
    skills?: number;
    experience?: number;
    education?: number;
    format?: number;
    keywords?: number;
    ats_compatibility?: number;
  };
  suggestions?: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }>;
  keywords?: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
};

export function AnalysisHistory({
  resumeId,
  refreshTrigger,
}: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<AnalysisWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisWithData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchAnalyses = useCallback(async () => {
    try {
      const result = await getResumeAnalyses(resumeId);

      if (result.success && result.analyses) {
        // Parse the JSON data from the analyses
        const parsedAnalyses = result.analyses.map(analysis => ({
          ...analysis,
          sections: analysis.sections
            ? typeof analysis.sections === 'string'
              ? JSON.parse(analysis.sections)
              : analysis.sections
            : undefined,
          suggestions: analysis.suggestions
            ? typeof analysis.suggestions === 'string'
              ? JSON.parse(analysis.suggestions)
              : analysis.suggestions
            : undefined,
          keywords: analysis.keywords
            ? typeof analysis.keywords === 'string'
              ? JSON.parse(analysis.keywords)
              : analysis.keywords
            : undefined,
        }));

        setAnalyses(parsedAnalyses);

        // Auto-select the most recent analysis if none selected
        if (!selectedAnalysis && parsedAnalyses.length > 0) {
          setSelectedAnalysis(parsedAnalyses[0]);
        }
      } else {
        toast.error(result.error || 'Failed to load analysis history');
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [resumeId, selectedAnalysis]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyses();
  };
  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses, refreshTrigger]);

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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours =
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(date));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-500">Loading analysis history...</span>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <CardDescription>
            AI analysis results will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Analysis Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Run your first AI analysis to see insights about your resume
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
              <span>• Resume scoring</span>
              <span>• Job matching</span>
              <span>• Optimization tips</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Analysis List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Analysis History</CardTitle>
                <CardDescription>
                  {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1 p-6 pt-0">
              {analyses.map((analysis, index) => (
                <div key={analysis.id}>
                  <button
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors hover:bg-gray-50 ${
                      selectedAnalysis?.id === analysis.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAnalysisIcon(analysis.type)}
                        <span className="font-medium text-sm">
                          {getAnalysisTitle(analysis.type)}
                        </span>
                      </div>{' '}
                      {analysis.score !== null &&
                        analysis.score !== undefined && (
                          <span
                            className={`text-sm font-medium ${getScoreColor(analysis.score)}`}
                          >
                            {Math.round(analysis.score)}%
                          </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      <ChevronRight className="h-3 w-3" />
                    </div>

                    {analysis.jobDescription && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Job Match
                        </Badge>
                      </div>
                    )}
                  </button>

                  {index < analyses.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Analysis Detail */}
      <div className="lg:col-span-3">
        {selectedAnalysis ? (
          <ResumeAnalysisCard
            analysis={selectedAnalysis}
            onOptimize={() => {
              // This will be handled by the parent component
            }}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Analysis
                </h3>
                <p className="text-gray-500">
                  Choose an analysis from the list to view detailed results
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
