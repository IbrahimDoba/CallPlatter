// lib/uploadthing.ts - Fixed version with proper authentication

import { createUploadthing, type FileRouter } from "uploadthing/server";
import { logger } from "../utils/logger";
import crypto from "node:crypto";

// Polyfill for Node.js < 20
if (!globalThis.crypto) {
  (globalThis as any).crypto = crypto;
}

const f = createUploadthing();

// Your file router configuration
export const ourFileRouter: FileRouter = {
  audioUploader: f({ audio: { maxFileSize: "32MB" } })
    .middleware(async () => {
      // Add any middleware logic here
      return { userId: "system" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Audio upload completed", { 
        filename: file.name,
        url: file.url,
        size: file.size 
      });
      return { uploadedBy: metadata.userId };
    }),
};

export type OurFileRouter = typeof ourFileRouter;

// ✅ Method 1: Using UploadThing server SDK (RECOMMENDED)
export async function uploadWithUploadThingSDK(
  buffer: Buffer,
  filename: string,
  contentType = 'audio/wav'
): Promise<{ url: string; key: string }> {
  try {
    const { UTApi } = await import("uploadthing/server");
    
    const token = process.env.UPLOADTHING_SECRET;
    
    if (!token) {
      throw new Error("Missing UPLOADTHING_SECRET environment variable");
    }
    
    const utapi = new UTApi(); // UTApi should automatically pick up UPLOADTHING_SECRET
    
    logger.info("Uploading with UploadThing SDK", {
      filename,
      size: buffer.length,
      contentType
    });

    // Create Blob-like object for Node.js compatibility
    const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
    const file = Object.assign(blob, {
      name: filename,
      lastModified: Date.now()
    });
    
    logger.info("Created file object for upload", {
      filename: file.name,
      size: file.size,
      type: file.type
    });
    
    // Upload using SDK - pass single file, not array
    const response = await utapi.uploadFiles(file);
    
    logger.info("UploadThing SDK response", { 
      response: JSON.stringify(response, null, 2)
    });

    if (!response) {
      throw new Error("No response from UploadThing SDK");
    }

    // Handle single file response
    if (response.error) {
      logger.error("UploadThing SDK error", response.error);
      throw new Error(`UploadThing SDK error: ${JSON.stringify(response.error)}`);
    }

    if (!response.data) {
      logger.error("No data in UploadThing response", response);
      throw new Error(`No data in UploadThing response: ${JSON.stringify(response)}`);
    }

    logger.info("Successfully uploaded with UploadThing SDK", {
      filename,
      url: response.data.url,
      key: response.data.key,
      name: response.data.name,
      size: response.data.size
    });

    return { 
      url: response.data.url, 
      key: response.data.key || '' 
    };

  } catch (error) {
    logger.error("Error with UploadThing SDK", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      filename
    });
    throw error;
  }
}

// ✅ Method 2: Using UploadThing's presigned URL approach (FALLBACK)
export async function uploadFileToUploadThing(
  buffer: Buffer, 
  filename: string,
  contentType = 'audio/wav'
): Promise<{ url: string; key: string }> {
  try {
    logger.info("Uploading file to UploadThing via presigned URL", {
      filename,
      size: buffer.length,
      contentType
    });

    const { UTApi } = await import("uploadthing/server");
    const token = process.env.UPLOADTHING_SECRET;
    
    if (!token) {
      throw new Error("Missing UPLOADTHING_SECRET environment variable");
    }
    
    const utapi = new UTApi(); // UTApi should automatically pick up UPLOADTHING_SECRET
    
    // Create Blob-like object for Node.js compatibility
    const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
    const file = Object.assign(blob, {
      name: filename,
      lastModified: Date.now()
    });
    
    // Use the SDK method as fallback since direct API is more complex
    const response = await utapi.uploadFiles(file);
    
    if (response.error) {
      throw new Error(`UploadThing error: ${JSON.stringify(response.error)}`);
    }
    
    if (!response.data) {
      throw new Error(`No data in UploadThing response: ${JSON.stringify(response)}`);
    }

    logger.info("File uploaded successfully to UploadThing", {
      filename,
      uploadedUrl: response.data.url,
      key: response.data.key
    });

    return { url: response.data.url, key: response.data.key || '' };

  } catch (error) {
    logger.error("Failed to upload file to UploadThing", {
      error: error instanceof Error ? error.message : String(error),
      errorDetails: error instanceof Error ? error.stack : undefined,
      filename
    });
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ✅ Complete function to download from Twilio and upload to UploadThing
export async function downloadAndUploadRecording(
  recordingSid: string,
  filename: string
): Promise<{ url: string; key: string }> {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    logger.info("Starting recording download and upload process", {
      recordingSid,
      filename
    });

    // Step 1: Get recording details
    const recording = await client.recordings(recordingSid).fetch();
    
    logger.info("Fetched recording details", {
      recordingSid,
      duration: recording.duration,
      channels: recording.channels,
      fileFormat: recording.fileFormat || 'wav'
    });

    // Step 2: Download the recording file
    const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recordingSid}`;
    
    const authHeader = `Basic ${Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64')}`;

    logger.info("Downloading recording file", { baseUrl });

    const downloadResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'audio/wav, audio/mpeg, */*'
      }
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      logger.error("Failed to download recording", {
        status: downloadResponse.status,
        statusText: downloadResponse.statusText,
        error: errorText,
        recordingSid
      });
      throw new Error(`Failed to download recording: ${downloadResponse.status} ${downloadResponse.statusText}`);
    }

    const arrayBuffer = await downloadResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info("Recording downloaded successfully", {
      recordingSid,
      size: buffer.length,
      contentType: downloadResponse.headers.get('content-type')
    });

    // Step 3: Upload to UploadThing using SDK method (primary method)
    const result = await uploadWithUploadThingSDK(
      buffer,
      filename,
      downloadResponse.headers.get('content-type') || 'audio/wav'
    );

    logger.info("Recording processing completed successfully", {
      recordingSid,
      filename,
      uploadedUrl: result.url,
      fileSize: buffer.length
    });

    return result;

  } catch (error) {
    logger.error("Error in downloadAndUploadRecording", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      recordingSid,
      filename
    });
    throw error;
  }
}

// ✅ Legacy function for backward compatibility
export async function downloadAndUploadToUploadThing(
  url: string,
  filename: string,
  contentType?: string
): Promise<{ url: string; key: string }> {
  try {
    logger.info("Starting download and upload process", { url, filename });
    
    let response: Response;
    if (url.includes('api.twilio.com')) {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!twilioAccountSid || !twilioAuthToken) {
        throw new Error("Missing Twilio credentials");
      }
      
      const authHeader = `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`;
      
      logger.info("Downloading file from Twilio with authentication", { 
        url, 
        accountSid: twilioAccountSid.substring(0, 10) + "..." 
      });
      
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'audio/wav, audio/mpeg, */*'
        }
      });
    } else {
      response = await fetch(url);
    }
    
    if (!response.ok) {
      logger.error("Failed to download file", { 
        status: response.status, 
        statusText: response.statusText, 
        url,
        headers: Object.fromEntries(response.headers.entries()) 
      });
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    logger.info("File downloaded successfully", { 
      filename, 
      size: fileBuffer.length, 
      contentType: response.headers.get('content-type') || contentType 
    });
    
    return await uploadWithUploadThingSDK(
      fileBuffer, 
      filename, 
      response.headers.get('content-type') || contentType || 'audio/wav'
    );
    
  } catch (error) {
    logger.error("Failed to download and upload file", { 
      url, 
      filename, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}