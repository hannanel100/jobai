"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createResume } from "@/actions/resumes";
import { toast } from "sonner";

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [title, setTitle] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();  
    const handleUploadComplete = async (res: Array<{ name: string; url: string; size: number }>) => {
    console.log("Upload complete called with:", res);
    if (!res || res.length === 0) {
      console.log("No files in response");
      return;
    }
    const file = res[0];
    console.log("Processing file:", file);
    try {
      setIsUploading(true);
      const result = await createResume({
        title: title || file.name.replace(/\.[^/.]+$/, ""), // Use filename without extension if no title
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size,
        fileType: file.name.endsWith('.pdf') ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        isBase,
      });

      if (result.success) {
        toast.success("Resume uploaded successfully!");
        setTitle("");
        setIsBase(false);
        onUploadComplete?.();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast.error("Failed to upload file. Please try again.");
    setIsUploading(false);
  };
  const handleUploadBegin = () => {
    console.log("CLIENT: Upload starting...");
    setIsUploading(true);
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>
          Upload your resume in PDF or DOCX format (max 4MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Resume Title</Label>
          <Input
            id="title"
            placeholder="e.g., Software Engineer Resume, Marketing Manager CV"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="isBase"
            type="checkbox"
            checked={isBase}
            onChange={(e) => setIsBase(e.target.checked)}
            disabled={isUploading}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isBase" className="text-sm font-medium">
            Use as base resume template
          </Label>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <UploadButton
            endpoint="resumeUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <div className="text-center text-sm text-gray-600">
            Processing upload...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
