import { Pinecone } from '@pinecone-database/pinecone';
import type { Index } from '@pinecone-database/pinecone';

// Initialize Pinecone client only if API key is provided
let pc: Pinecone | null = null;
let index: Index | null = null;

if (process.env.PINECONE_API_KEY) {
  try {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    // Get the index (your actual Pinecone index)
    index = pc.index(process.env.PINECONE_INDEX_NAME || 'callplatter');
  } catch (error) {
    console.warn('Failed to initialize Pinecone:', error);
  }
} else {
  console.warn('PINECONE_API_KEY not set. Pinecone features will be disabled.');
}

export { pc, index };

// Helper function to check if Pinecone is available
export function isPineconeAvailable(): boolean {
  return index !== null;
}

// Helper function to get business-specific namespace
export function getBusinessNamespace(businessId: string): string {
  return `business-${businessId}`;
}

// Helper function to get import-specific namespace
export function getImportNamespace(businessId: string, importId: string): string {
  return `business-${businessId}-import-${importId}`;
}
