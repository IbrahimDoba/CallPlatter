import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Get the index (your actual Pinecone index)
const index = pc.index(process.env.PINECONE_INDEX_NAME || 'callplatter');

export { pc, index };

// Helper function to get business-specific namespace
export function getBusinessNamespace(businessId: string): string {
  return `business-${businessId}`;
}

// Helper function to get import-specific namespace
export function getImportNamespace(businessId: string, importId: string): string {
  return `business-${businessId}-import-${importId}`;
}
