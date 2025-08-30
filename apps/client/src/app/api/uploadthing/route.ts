import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// This is a simple auth function - you might want to replace this with your actual auth logic
const auth = () => ({ id: "1" });

// Define your file router with explicit type
export const fileRouter: FileRouter = {
  audioUploader: f({ audio: { maxFileSize: "32MB" } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} as const;

// Using 'any' type for simplicity
export type OurFileRouter = any;

export const { GET, POST } = createRouteHandler({
  router: fileRouter as any,
});

// Add a DELETE endpoint for file deletion
export async function DELETE(request: Request) {
  const { fileKey } = await request.json();
  const utapi = new UTApi();
  
  try {
    await utapi.deleteFiles(fileKey);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to delete file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
