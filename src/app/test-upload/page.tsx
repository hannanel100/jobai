'use client';

import { UploadButton, UploadDropzone } from '@/lib/uploadthing';

export default function TestUpload() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2>Test UploadThing Integration</h2>

      <div className="border p-4 rounded">
        <h3>Upload Button Test:</h3>
        <UploadButton
          endpoint="resumeUploader"
          onClientUploadComplete={res => {
            console.log('Files: ', res);
            alert('Upload Completed');
          }}
          onUploadError={(error: Error) => {
            console.error('Error: ', error);
            alert(`ERROR! ${error.message}`);
          }}
          onUploadBegin={() => {
            console.log('Upload begin');
          }}
        />
      </div>

      <div className="border p-4 rounded w-full max-w-md">
        <h3>Upload Dropzone Test:</h3>
        <UploadDropzone
          endpoint="resumeUploader"
          onClientUploadComplete={res => {
            console.log('Files: ', res);
            alert('Upload Completed');
          }}
          onUploadError={(error: Error) => {
            console.error('Error: ', error);
            alert(`ERROR! ${error.message}`);
          }}
          onUploadBegin={() => {
            console.log('Upload begin');
          }}
        />
      </div>
    </div>
  );
}
