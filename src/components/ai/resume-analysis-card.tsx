'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  TrendingUp, 
  Clock, 
  Target,
  Brain,
  FileCheck,
  Users,
  Briefcase
} from 'lucide-react'
import { ResumeAnalysis, AnalysisType } from '@prisma/client'

interface ResumeAnalysisCardProps {
  analysis: ResumeAnalysis & {
    sections?: {
      skills?: number
      experience?: number
      education?: number
      format?: number
      keywords?: number
      ats_compatibility?: number
    }
    suggestions?: Array<{
      category: string
      priority: 'high' | 'medium' | 'low'
      title: string
      description: string
    }>
    keywords?: {
      found: string[]
      missing: string[]
      suggestions: string[]
    }
  }
  onOptimize?: () => void
}

export function ResumeAnalysisCard({ analysis, onOptimize }: ResumeAnalysisCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getAnalysisIcon = (type: AnalysisType) => {
    switch (type) {
      case 'COMPREHENSIVE_SCORE':
        return <Star className="h-5 w-5" />
      case 'JOB_MATCH':
        return <Target className="h-5 w-5" />
      case 'OPTIMIZATION':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getAnalysisTitle = (type: AnalysisType) => {
    switch (type) {
      case 'COMPREHENSIVE_SCORE':
        return 'Resume Score Analysis'
      case 'JOB_MATCH':
        return 'Job Match Analysis'
      case 'OPTIMIZATION':
        return 'Optimization Suggestions'
      default:
        return 'AI Analysis'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAnalysisIcon(analysis.type)}
            <div>
              <CardTitle className="text-lg">{getAnalysisTitle(analysis.type)}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatDate(analysis.createdAt)}
              </CardDescription>
            </div>
          </div>          {analysis.score !== null && analysis.score !== undefined && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {Math.round(analysis.score)}/100
              </div>
              <div className="text-sm text-gray-500">
                {getScoreLabel(analysis.score)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">        {/* Overall Score Progress */}
        {analysis.score !== null && analysis.score !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Score</span>
              <span className={getScoreColor(analysis.score)}>
                {Math.round(analysis.score)}%
              </span>
            </div>
            <Progress value={analysis.score} className="h-2" />
          </div>
        )}

        {/* Section Breakdown */}
        {analysis.sections && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Section Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analysis.sections).map(([section, score]) => (
                <div key={section} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {section.replace('_', ' ')}
                    </span>
                    <span className={getScoreColor(score as number)}>
                      {Math.round(score as number)}%
                    </span>
                  </div>
                  <Progress value={score as number} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Analysis */}
        {analysis.keywords && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Keywords Analysis
            </h4>
            
            {analysis.keywords.found && analysis.keywords.found.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Found Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.found.slice(0, 10).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {analysis.keywords.found.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{analysis.keywords.found.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {analysis.keywords.missing && analysis.keywords.missing.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Missing Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.missing.slice(0, 8).map((keyword) => (
                    <Badge key={keyword} variant="destructive" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {analysis.keywords.missing.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{analysis.keywords.missing.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Description Context */}
        {analysis.jobDescription && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Context
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {analysis.jobDescription}
            </p>
          </div>
        )}        {/* Suggestions */}
        {analysis.suggestions && Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improvement Suggestions
            </h4>
            <div className="space-y-3">
              {(analysis.suggestions as Array<{
                category: string
                priority: 'high' | 'medium' | 'low'
                title: string
                description: string
              }>).slice(0, 5).map((suggestion, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(suggestion.priority)}
                    >
                      {suggestion.priority}
                    </Badge>
                    <span className="font-medium text-sm">{suggestion.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              ))}              {(analysis.suggestions as Array<any>).length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{(analysis.suggestions as Array<any>).length - 5} more suggestions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onOptimize && analysis.type !== 'OPTIMIZATION' && (
          <div className="pt-4 border-t">
            <Button onClick={onOptimize} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Get Optimization Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
