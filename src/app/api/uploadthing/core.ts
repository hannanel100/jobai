import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    "application/pdf": { maxFileSize: "4MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
      maxFileSize: "4MB", 
      maxFileCount: 1 
    },
    "application/msword": { maxFileSize: "4MB", maxFileCount: 1 }
  })    .middleware(async () => {
      console.log("UploadThing middleware called");
      
      const session = await auth();
      console.log("Session:", session);
      
      if (!session?.user?.id) {
        console.log("No session or user ID found");
        throw new UploadThingError("Unauthorized");
      }
      
      console.log("User authenticated:", session.user.id);
      return { userId: session.user.id };
    })    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      console.log("File name:", file.name);
      console.log("File size:", file.size);
      
      return { 
        uploadedBy: metadata.userId,
        url: file.url, // Use the current property name
        name: file.name,
        size: file.size
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
