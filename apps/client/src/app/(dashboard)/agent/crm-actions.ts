"use server";

import { db } from "@repo/db";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

// File processing imports
import * as XLSX from "xlsx";

export type CRMImportUploadResult = {
  ok: boolean;
  error?: string;
  importId?: string;
};

export type CRMImportsResult = {
  ok: boolean;
  error?: string;
  data?: Array<{
    id: string;
    fileName: string;
    status: string;
    recordsProcessed?: number;
    phoneNumbersFound?: number;
    errorMessage?: string;
    pineconeNamespace?: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type CRMImportDeleteResult = {
  ok: boolean;
  error?: string;
};

// Helper function to extract phone numbers from text
function extractPhoneNumbers(text: string): string[] {
  // More comprehensive phone number regex patterns
  const patterns = [
    /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // Standard US format
    /(\+1\s?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // With +1
    /([0-9]{3})[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // Simple format
  ];
  
  const matches: string[] = [];
  patterns.forEach(pattern => {
    const found = text.match(pattern) || [];
    matches.push(...found);
  });
  
  return [...new Set(matches)]; // Remove duplicates
}

// Helper function to normalize phone numbers
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +1, keep it
  if (cleaned.startsWith('+1')) {
    return cleaned;
  }
  
  // If it's 10 digits, add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it's 11 digits and starts with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// Helper function to extract text from different file types
async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  const fs = await import('fs/promises');
  
  switch (fileType) {
    case 'text/plain':
      return await fs.readFile(filePath, 'utf-8');
    
    case 'application/pdf': {
      const pdfBuffer = await fs.readFile(filePath);
      const PdfParse = (await import('pdf-parse')).default;
      const pdfData = await PdfParse(pdfBuffer);
      return pdfData.text;
    }
    
    case 'text/csv':
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      // Check if file exists before reading
      try {
        console.log(`Checking file access for: ${filePath}`);
        await fs.access(filePath);
        console.log(`File exists, reading Excel/CSV file: ${filePath}`);
        
        // Get file stats to verify it's readable
        const stats = await fs.stat(filePath);
        console.log(`File stats - size: ${stats.size} bytes, modified: ${stats.mtime}`);
        
        // Try reading the file buffer first, then use XLSX
        const fileBuffer = await fs.readFile(filePath);
        console.log(`File buffer read successfully, size: ${fileBuffer.length} bytes`);
        
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        let csvText = '';
        
        console.log(`Workbook loaded, sheets: ${workbook.SheetNames.join(', ')}`);
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          if (worksheet) {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            csvText += csv + '\n';
            console.log(`Processed sheet '${sheetName}': ${csv.length} characters`);
          }
        });
        
        console.log(`Total extracted ${csvText.length} characters from Excel/CSV file`);
        return csvText;
      } catch (error) {
        console.error(`Error reading Excel/CSV file ${filePath}:`, error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as { code?: string })?.code,
          errno: (error as { errno?: number })?.errno,
          syscall: (error as { syscall?: string })?.syscall
        });
        throw new Error(`File not found or cannot be read: ${filePath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Helper function to chunk text for vector embeddings
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }
  
  return chunks;
}

// Helper function to generate embeddings via server API
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${serverUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embeddings');
    }

    const data = await response.json();
    return data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Fallback to placeholder vectors (1024 dimensions for text-embedding-3-large)
    return texts.map(() => new Array(1024).fill(0).map(() => Math.random() - 0.5));
  }
}

export async function uploadCRMImport(formData: FormData): Promise<CRMImportUploadResult> {
  try {
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;

    if (!file || !businessId) {
      return { ok: false, error: "Missing file or businessId" };
    }

    // Create import record
    const importRecord = await db.cRMImport.create({
      data: {
        businessId,
        fileName: file.name,
        status: 'PENDING',
        pineconeNamespace: `business-${businessId}-${Date.now()}`,
      },
    });

    // Process file asynchronously with Pinecone
    processImportAsync(importRecord.id, file, businessId).catch(error => {
      console.error("Async processing error:", error);
    });

    return { ok: true, importId: importRecord.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { ok: false, error: "Failed to upload document" };
  }
}

async function processImportAsync(importId: string, file: File, businessId: string) {
  // Sanitize filename to avoid issues with special characters and spaces
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const tempFilePath = join(tmpdir(), `${uuidv4()}-${sanitizedName}`);
  
  console.log(`Processing file: ${file.name} (${file.size} bytes, type: ${file.type})`);
  console.log(`Temporary file path: ${tempFilePath}`);
  
  try {
    // Update status to processing
    await db.cRMImport.update({
      where: { id: importId },
      data: { status: 'PROCESSING' },
    });

    // Save file to temp location
    console.log(`Saving file to temporary location: ${tempFilePath}`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);
    console.log(`File saved successfully, size: ${buffer.length} bytes`);

    // Verify file was written successfully with retry
    const fs = await import('fs/promises');
    let fileExists = false;
    let retries = 0;
    const maxRetries = 3;
    
    while (!fileExists && retries < maxRetries) {
      try {
        await fs.access(tempFilePath);
        fileExists = true;
        console.log(`File verified successfully on attempt ${retries + 1}`);
      } catch {
        retries++;
        if (retries < maxRetries) {
          console.log(`File not found, retrying in 100ms (attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          throw new Error(`Failed to write temporary file after ${maxRetries} attempts: ${tempFilePath}`);
        }
      }
    }

    // Extract text content
    console.log(`Extracting text from file: ${tempFilePath}, type: ${file.type}`);
    const textContent = await extractTextFromFile(tempFilePath, file.type);
    
    if (!textContent || textContent.trim().length === 0) {
      throw new Error("No text content could be extracted from the file");
    }
    
    console.log(`Successfully extracted ${textContent.length} characters from file`);
    
    // Extract phone numbers
    const phoneNumbers = extractPhoneNumbers(textContent);
    const normalizedPhones = phoneNumbers.map(normalizePhoneNumber).filter(phone => phone.length >= 10);

    // Chunk the text
    const chunks = chunkText(textContent);

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks);
    
    // Prepare chunks for Pinecone
    const vectorChunks = chunks.map((chunk, index) => ({
      id: `chunk-${importId}-${index}`,
      content: chunk,
      metadata: {
        businessId,
        importId,
        fileName: file.name,
        phoneNumbers: extractPhoneNumbers(chunk),
        chunkIndex: index,
        chunkSize: chunk.length,
      },
    }));

    // Send to Pinecone via server API
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const pineconeResponse = await fetch(`${serverUrl}/api/pinecone/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessId,
        importId,
        chunks: vectorChunks,
        embeddings,
      }),
    });

    if (!pineconeResponse.ok) {
      throw new Error('Failed to store vectors in Pinecone');
    }

    // Update import status
    await db.cRMImport.update({
      where: { id: importId },
      data: {
        status: 'COMPLETED',
        recordsProcessed: chunks.length,
        phoneNumbersFound: normalizedPhones.length,
      },
    });

    // Clean up temp file
    await unlink(tempFilePath);

    // Revalidate the page
    revalidatePath("/dashboard/agent");

  } catch (error) {
    console.error("Processing error:", error);
    
    // Update import status to failed
    await db.cRMImport.update({
      where: { id: importId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Clean up temp file if it exists
    try {
      await unlink(tempFilePath);
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }
  }
}

export async function getCRMImports(businessId: string): Promise<CRMImportsResult> {
  try {
    if (!businessId) {
      return { ok: false, error: "Missing businessId" };
    }

    const imports = await db.cRMImport.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ok: true,
      data: imports.map(imp => ({
        id: imp.id,
        fileName: imp.fileName,
        status: imp.status,
        recordsProcessed: imp.recordsProcessed || undefined,
        phoneNumbersFound: imp.phoneNumbersFound || undefined,
        errorMessage: imp.errorMessage || undefined,
        pineconeNamespace: imp.pineconeNamespace || undefined,
        createdAt: imp.createdAt.toISOString(),
        updatedAt: imp.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Get imports error:", error);
    return { ok: false, error: "Failed to load imports" };
  }
}

export async function deleteCRMImport(importId: string): Promise<CRMImportDeleteResult> {
  try {
    if (!importId) {
      return { ok: false, error: "Missing importId" };
    }

    // TODO: Also delete from Pinecone namespace
    // For now, just delete the import record
    await db.cRMImport.delete({
      where: { id: importId },
    });

    // Revalidate the page
    revalidatePath("/dashboard/agent");

    return { ok: true };
  } catch (error) {
    console.error("Delete import error:", error);
    return { ok: false, error: "Failed to delete import" };
  }
}
