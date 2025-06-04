'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  Star,
  Target,
  TrendingUp,
  Loader2,
  Sparkles,
  FileText,
  Zap
} from 'lucide-react'
import { analyzeResume, matchResumeToJobAdHoc, optimizeResume } from '@/actions/ai'
import { toast } from 'sonner'

interface AIAnalysisControlsProps {
  resumeId: string
  applicationId?: string
  onAnalysisComplete?: () => void
  disabled?: boolean
}
export function AIAnalysisControls({
  resumeId,
  applicationId,
  onAnalysisComplete,
  disabled = false
}: AIAnalysisControlsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [showJobInput, setShowJobInput] = useState(false)

  const handleComprehensiveAnalysis = async () => {
    if (disabled) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeResume({ resumeId })

      if (result.success) {
        toast.success('Resume analysis completed successfully!')
        onAnalysisComplete?.()
      } else {
        toast.error(result.error || 'Failed to analyze resume')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze resume')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const handleJobMatching = async () => {
      if (disabled) return

      if (!jobDescription.trim()) {
        toast.error('Please enter a job description')
        return
      }

      setIsMatching(true)
      try {
        const result = await matchResumeToJobAdHoc({ 
          resumeId, 
          jobDescription: jobDescription.trim(),
          jobTitle: undefined, // Could be added as an optional field later
          companyName: undefined // Could be added as an optional field later
        })
        if (result.success) {
          toast.success('Job matching analysis completed!')
          setJobDescription('')
          setShowJobInput(false)
          onAnalysisComplete?.()
        } else {
          toast.error(result.error || 'Failed to match resume to job')
        }
      } catch (error) {
        console.error('Job matching error:', error)
        toast.error('Failed to match resume to job')
      } finally {
        setIsMatching(false)
      }
    }

    const handleOptimization = async () => {
      if (disabled) return

      setIsOptimizing(true)
      try {
        const result = await optimizeResume({ resumeId })

        if (result.success) {
          toast.success('Optimization suggestions generated!')
          onAnalysisComplete?.()
        } else {
          toast.error(result.error || 'Failed to generate optimization suggestions')
        }
      } catch (error) {
        console.error('Optimization error:', error)
        toast.error('Failed to generate optimization suggestions')
      } finally {
        setIsOptimizing(false)
      }
    }

    const isAnyAnalysisRunning = isAnalyzing || isMatching || isOptimizing

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Resume Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered insights to improve your resume's effectiveness
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Analysis Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Comprehensive Score */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-sm">Comprehensive Score</span>
              </div>
              <p className="text-xs text-gray-600">
                Get an overall score and detailed breakdown of your resume's strengths and weaknesses.
              </p>
              <Button
                onClick={handleComprehensiveAnalysis}
                disabled={disabled || isAnyAnalysisRunning}
                className="w-full"
                size="sm"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>

            {/* Job Matching */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Job Matching</span>
              </div>
              <p className="text-xs text-gray-600">
                Compare your resume against a specific job description to see how well you match.
              </p>
              <Button
                onClick={() => setShowJobInput(!showJobInput)}
                disabled={disabled || isAnyAnalysisRunning}
                variant={showJobInput ? "secondary" : "default"}
                className="w-full"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                {showJobInput ? 'Hide Job Input' : 'Match to Job'}
              </Button>
            </div>

            {/* Optimization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Optimization</span>
              </div>
              <p className="text-xs text-gray-600">
                Get specific suggestions to improve your resume's ATS compatibility and impact.
              </p>
              <Button
                onClick={handleOptimization}
                disabled={disabled || isAnyAnalysisRunning}
                className="w-full"
                size="sm"
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {isOptimizing ? 'Optimizing...' : 'Optimize Resume'}
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
                </div>

                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={disabled || isAnyAnalysisRunning}
                  className="min-h-[120px] resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {jobDescription.length > 0 && (
                      <span>{jobDescription.length} characters • {jobDescription.trim().split(/\s+/).length} words</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setJobDescription('')
                        setShowJobInput(false)
                      }}
                      disabled={isAnyAnalysisRunning}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJobMatching}
                      disabled={disabled || isAnyAnalysisRunning || !jobDescription.trim()}
                      size="sm"
                    >
                      {isMatching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {isMatching ? 'Analyzing...' : 'Run Analysis'}
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
                  Our AI analyzes your resume content, structure, and keywords to provide actionable insights.
                  Each analysis is tailored to help you improve your chances of landing interviews.
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
    )
  }
