import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "./route";

// Explicitly type the components to avoid type reference issues
type UploadButtonType = ReturnType<typeof generateUploadButton<OurFileRouter>>;
type UploadDropzoneType = ReturnType<typeof generateUploadDropzone<OurFileRouter>>;

export const UploadButton: UploadButtonType = generateUploadButton<OurFileRouter>();
export const UploadDropzone: UploadDropzoneType = generateUploadDropzone<OurFileRouter>();
