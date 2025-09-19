"use server";

import { db } from "@repo/db";
import { UTApi } from "uploadthing/server";

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

// Customer record interface for structured data
interface SimpleCustomerRecord {
  id: string;
  name: string;
  phoneNumber: string;
  content: string; // Everything else goes here
  metadata: {
    fileName: string;
    importId: string;
    businessId: string;
    rowIndex: number;
  };
}

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
  
  // If it already starts with +, keep it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Handle US numbers (10 digits or 11 digits starting with 1)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Handle Nigerian numbers (13 digits starting with 234)
  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return `+${cleaned}`;
  }
  
  // Handle other international numbers - add + if it looks like a country code
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// Helper function to extract text from different file types using buffer
async function extractTextFromBuffer(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
  switch (fileType) {
    case 'text/plain':
      return buffer.toString('utf-8');
    
    case 'application/pdf': {
      const PdfParse = (await import('pdf-parse')).default;
      const pdfData = await PdfParse(buffer);
      return pdfData.text;
    }
    
    case 'text/csv':
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      try {
        console.log(`Reading Excel/CSV file from buffer: ${fileName}`);
        
        const workbook = XLSX.read(buffer, { type: 'buffer' });
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
        
        // Debug: Show a sample of the extracted text
        console.log("Sample of extracted text (first 500 chars):", csvText.substring(0, 500));
        console.log("Sample of extracted text (last 500 chars):", csvText.substring(Math.max(0, csvText.length - 500)));
        
        return csvText;
      } catch (error) {
        console.error(`Error reading Excel/CSV file ${fileName}:`, error);
        throw new Error(`Failed to read Excel/CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}


// Helper function to parse CSV rows (handles quoted fields)
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Smart extraction functions for customer data
function extractName(row: string[], headers: string[]): string {
  // Look for name-related columns
  const nameColumns = ['name', 'customer', 'full name', 'client', 'contact'];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toLowerCase() || '';
    if (nameColumns.some(col => header.includes(col))) {
      return row[i]?.trim() || '';
    }
  }
  
  // Fallback: first column that looks like a name (has spaces, letters)
  for (let i = 0; i < row.length; i++) {
    const value = row[i]?.trim() || '';
    if (value.length > 2 && /^[a-zA-Z\s]+$/.test(value) && value.includes(' ')) {
      return value;
    }
  }
  
  return row[0]?.trim() || 'Unknown Customer';
}

function extractPhoneNumber(row: string[], headers: string[]): string {
  // Look for phone-related columns
  const phoneColumns = ['phone', 'mobile', 'tel', 'number', 'contact'];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toLowerCase() || '';
    if (phoneColumns.some(col => header.includes(col))) {
      const phone = row[i]?.trim() || '';
      if (phone) return normalizePhoneNumber(phone);
    }
  }
  
  // Fallback: find any field that looks like a phone number
  for (const value of row) {
    const phoneNumbers = extractPhoneNumbers(value || '');
    if (phoneNumbers.length > 0) {
      return normalizePhoneNumber(phoneNumbers[0] || '');
    }
  }
  
  return '';
}

function createContentFromRow(row: string[], headers: string[], nameIndex: number, phoneIndex: number): string {
  const contentPairs: string[] = [];
  
  for (let i = 0; i < headers.length; i++) {
    // Skip name and phone columns since they're stored separately
    if (i === nameIndex || i === phoneIndex) continue;
    
    const header = headers[i]?.trim();
    const value = row[i]?.trim();
    
    if (header && value && value !== '') {
      contentPairs.push(`${header}: ${value}`);
    }
  }
  
  return contentPairs.join('\n');
}

// Main parsing function for customer records
function parseSimpleCustomerData(csvText: string, importId: string, fileName: string, businessId: string): SimpleCustomerRecord[] {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = parseCSVRow(lines[0] || '').map(h => h.trim());
  console.log(`Processing CSV with columns: ${headers.join(', ')}`);
  
  const customers: SimpleCustomerRecord[] = [];
  
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const row = parseCSVRow(lines[rowIndex] || '');
    
    if (row.length === 0 || row.every(cell => !cell?.trim())) {
      continue; // Skip empty rows
    }
    
    // Extract the three key pieces
    const name = extractName(row, headers);
    const phoneNumber = extractPhoneNumber(row, headers);
    
    // Find which columns we used for name and phone
    const nameIndex = headers.findIndex(h => 
      ['name', 'customer', 'full name', 'client'].some(col => 
        h.toLowerCase().includes(col)
      )
    );
    const phoneIndex = headers.findIndex(h => 
      ['phone', 'mobile', 'tel', 'number'].some(col => 
        h.toLowerCase().includes(col)
      )
    );
    
    // Create content from remaining columns
    const content = createContentFromRow(row, headers, nameIndex, phoneIndex);
    
    const customer: SimpleCustomerRecord = {
      id: `customer-${importId}-${rowIndex}`,
      name,
      phoneNumber,
      content,
      metadata: {
        fileName,
        importId,
        businessId,
        rowIndex
      }
    };
    
    console.log(`Processed: ${name} (${phoneNumber}) - ${content.length} chars of data`);
    customers.push(customer);
  }
  
  console.log(`Successfully parsed ${customers.length} customer records`);
  return customers;
}

// Create searchable text for embeddings
function createSearchableText(customer: SimpleCustomerRecord): string {
  return `Customer: ${customer.name}
Phone: ${customer.phoneNumber}

${customer.content}

This is customer ${customer.name} who can be reached at ${customer.phoneNumber}. ${customer.content}`;
}

// Helper function to generate embeddings via server API with batching
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const batchSize = 50; // Process in smaller batches to avoid token limits
    const allEmbeddings: number[][] = [];
    
    console.log(`Generating embeddings for ${texts.length} chunks in batches of ${batchSize}`);
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} chunks)`);
      
      const response = await fetch(`${serverUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: batch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, errorText);
        throw new Error(`Failed to generate embeddings for batch ${Math.floor(i / batchSize) + 1}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Batch ${Math.floor(i / batchSize) + 1} embeddings received: ${data.embeddings.length} vectors, first vector dimensions: ${data.embeddings[0]?.length}`);
      allEmbeddings.push(...data.embeddings);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Successfully generated ${allEmbeddings.length} embeddings`);
    return allEmbeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Fallback to placeholder vectors (1024 dimensions for text-embedding-ada-002)
    return texts.map(() => new Array(1024).fill(0).map(() => Math.random() - 0.5));
  }
}

export async function uploadCRMImportWithUploadThing(formData: FormData): Promise<CRMImportUploadResult> {
  try {
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;

    if (!file || !businessId) {
      return { ok: false, error: "Missing file or businessId" };
    }

    console.log(`Uploading CRM file: ${file.name} (${file.size} bytes, type: ${file.type})`);

    // Create import record first
    const importRecord = await db.cRMImport.create({
      data: {
        businessId,
        fileName: file.name,
        status: 'PENDING',
        pineconeNamespace: `business-${businessId}-${Date.now()}`,
      },
    });

    // Upload to UploadThing
    const utapi = new UTApi();
    const uploadResult = await utapi.uploadFiles(file);
    
    if (uploadResult.error) {
      throw new Error(`UploadThing error: ${JSON.stringify(uploadResult.error)}`);
    }

    if (!uploadResult.data) {
      throw new Error('No data returned from UploadThing');
    }

    console.log(`File uploaded to UploadThing: ${uploadResult.data.url}`);

    // Process file asynchronously
    processImportFromUploadThing(importRecord.id, uploadResult.data.url, file.name, file.type, businessId).catch(error => {
      console.error("Async processing error:", error);
    });

    return { ok: true, importId: importRecord.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { ok: false, error: "Failed to upload document" };
  }
}

// Updated processing function using customer record parsing
async function processImportFromUploadThing(importId: string, fileUrl: string, fileName: string, fileType: string, businessId: string) {
  try {
    await db.cRMImport.update({
      where: { id: importId },
      data: { status: 'PROCESSING' },
    });

    console.log(`Processing simple CRM data from: ${fileUrl}`);

    // Download and extract text
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const textContent = await extractTextFromBuffer(buffer, fileType, fileName);
    
    if (!textContent?.trim()) {
      throw new Error("No text content could be extracted from the file");
    }

    console.log(`Extracted ${textContent.length} characters from file`);

    // Parse into structured customer records
    const customers = parseSimpleCustomerData(textContent, importId, fileName, businessId);
    
    if (customers.length === 0) {
      throw new Error("No customer records could be parsed from the file");
    }

    // Create searchable text for each customer
    const searchableTexts = customers.map(customer => createSearchableText(customer));
    
    // Generate embeddings
    const embeddings = await generateEmbeddings(searchableTexts);
    
    // Prepare for Pinecone storage
    const vectorRecords = customers.map((customer, index) => ({
      id: customer.id,
      content: searchableTexts[index], // Full searchable text
      metadata: {
        ...customer.metadata,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        originalContent: customer.content,
      },
    }));

    // Store in Pinecone
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const batchSize = 50;
    
    console.log(`Storing ${vectorRecords.length} customer records in Pinecone`);
    
    for (let i = 0; i < vectorRecords.length; i += batchSize) {
      const batchRecords = vectorRecords.slice(i, i + batchSize);
      const batchEmbeddings = embeddings.slice(i, i + batchSize);
      
      const pineconeResponse = await fetch(`${serverUrl}/api/pinecone/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          importId,
          chunks: batchRecords,
          embeddings: batchEmbeddings,
        }),
      });

      if (!pineconeResponse.ok) {
        const errorText = await pineconeResponse.text();
        throw new Error(`Failed to store batch in Pinecone: ${errorText}`);
      }
    }
    
    // Update import status
    await db.cRMImport.update({
      where: { id: importId },
      data: {
        status: 'COMPLETED',
        recordsProcessed: customers.length,
        phoneNumbersFound: customers.filter(c => c.phoneNumber).length,
      },
    });

    console.log(`Successfully processed ${customers.length} customer records`);

  } catch (error) {
    console.error("Processing error:", error);
    
    await db.cRMImport.update({
      where: { id: importId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
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

    return { ok: true };
  } catch (error) {
    console.error("Delete import error:", error);
    return { ok: false, error: "Failed to delete import" };
  }
}
