'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResumeContentViewer } from '@/components/resumes/resume-content-viewer'
import { AIAnalysisControls } from '@/components/ai/ai-analysis-controls'
import { AnalysisHistory } from '@/components/ai/analysis-history'
import { useDeleteResume } from '@/hooks/use-resumes'
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  FileText, 
  Calendar,
  Building2,
  Users,
  Star,
  StarOff,
  Brain,
  History
} from 'lucide-react'

interface Resume {
  id: string
  title: string
  fileName: string | null
  fileUrl: string | null
  fileSize: number | null
  fileType: string | null
  content: any
  isBase: boolean
  createdAt: Date
  updatedAt: Date
  applications: Array<{
    id: string
    companyName: string
    positionTitle: string
    status: string
    createdAt: Date
  }>
}

interface ResumeDetailClientProps {
  resume: Resume
}

export function ResumeDetailClient({ resume }: ResumeDetailClientProps) {
  const router = useRouter()
  const deleteResume = useDeleteResume()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("content")

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = () => {
    deleteResume.mutate(resume.id, {
      onSuccess: () => {
        router.push('/dashboard/resumes')
      }
    })
  }
  const handleContentUpdated = () => {
    // Refresh the page to get updated content
    router.refresh()
  }

  const handleAnalysisComplete = () => {
    // Trigger refresh of analysis history
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{resume.title}</h1>
          <p className="text-gray-600 mt-1">
            Resume details, AI analysis, and content management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar - Resume info and actions */}
        <div className="space-y-6">
          {/* Resume overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <div className="flex items-center gap-2">
                  {resume.isBase ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Base Template
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <StarOff className="h-3 w-3" />
                      Regular Resume
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">File</span>
                <span className="text-sm text-gray-600">
                  {resume.fileName || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Size</span>
                <span className="text-sm text-gray-600">
                  {formatFileSize(resume.fileSize)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Type</span>
                <span className="text-sm text-gray-600">
                  {resume.fileType?.includes("pdf") ? "PDF" : "DOCX"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Created</span>
                <span className="text-sm text-gray-600">
                  {formatDate(resume.createdAt)}
                </span>
              </div>

              {resume.updatedAt && resume.updatedAt !== resume.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Updated</span>
                  <span className="text-sm text-gray-600">
                    {formatDate(resume.updatedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume.fileUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDownload(resume.fileUrl!, resume.fileName || "resume")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Original File
                </Button>
              )}
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteResume.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteResume.isPending ? 'Deleting...' : 'Delete Resume'}
              </Button>

              {showDeleteConfirm && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure you want to delete this resume? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteResume.isPending}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications using this resume */}
          {resume.applications && resume.applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Applications ({resume.applications.length})
                </CardTitle>
                <CardDescription>
                  Job applications using this resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resume.applications.slice(0, 5).map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{application.positionTitle}</p>
                        <p className="text-xs text-gray-600">{application.companyName}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {application.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  {resume.applications.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{resume.applications.length - 5} more applications
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}        </div>

        {/* Main content area with tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              <ResumeContentViewer 
                resume={resume} 
                onContentUpdated={handleContentUpdated}
              />
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-6">
              <AIAnalysisControls
                resumeId={resume.id}
                onAnalysisComplete={handleAnalysisComplete}
                disabled={!resume.content}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <AnalysisHistory
                resumeId={resume.id}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
