"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ResumeUpload } from '@/components/resumes/resume-upload'
import { ResumeList } from '@/components/resumes/resume-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Resume } from '@prisma/client'

interface ResumesClientProps {
  resumes: Resume[]
}

export function ResumesClient({ resumes }: ResumesClientProps) {
  const [activeTab, setActiveTab] = useState("list")
  const router = useRouter()

  const handleUploadComplete = () => {
    // Switch to list tab and refresh the data
    setActiveTab("list")
    router.refresh()
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="list">My Resumes ({resumes.length})</TabsTrigger>
        <TabsTrigger value="upload">Upload New Resume</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="space-y-6">
        <ResumeList resumes={resumes} />
      </TabsContent>
      
      <TabsContent value="upload" className="space-y-6">
        <ResumeUpload onUploadComplete={handleUploadComplete} />
      </TabsContent>
    </Tabs>
  )
}
