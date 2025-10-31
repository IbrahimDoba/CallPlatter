import { index, getBusinessNamespace, isPineconeAvailable } from "../config/pinecone";
import { EmbeddingsService } from "./embeddingsService";

export interface VectorChunk {
  id: string;
  content: string;
  metadata: {
    businessId: string;
    importId?: string;
    fileName?: string;
    phoneNumbers?: string[];
    chunkIndex: number;
    chunkSize: number;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, unknown>;
}

export async function storeChunks(
  businessId: string,
  importId: string,
  chunks: VectorChunk[],
  embeddings: number[][]
): Promise<void> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Skipping vector storage.");
    return;
  }

  // Use business namespace so vectors can be found during searches
  const namespace = getBusinessNamespace(businessId);

  // Validate embeddings
  if (embeddings.length !== chunks.length) {
    throw new Error(`Mismatch: ${chunks.length} chunks but ${embeddings.length} embeddings`);
  }
  
  const vectors = chunks.map((chunk, index) => {
    const embedding = embeddings[index];
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error(`Invalid embedding at index ${index}: ${typeof embedding}`);
    }
    if (embedding.length !== 1024) {
      console.warn(`Embedding at index ${index} has ${embedding.length} dimensions, expected 1024`);
    }
    
    return {
      id: chunk.id,
      values: embedding,
      metadata: {
        ...chunk.metadata,
        content: chunk.content, // Store the actual content
        importId, // Keep importId in metadata for tracking
      },
    };
  });

  try {
    console.log("Attempting to store", vectors.length, "vectors in namespace:", namespace);
    console.log("Vector IDs:", vectors.map(v => v.id).join(', '));
    console.log("First vector metadata:", JSON.stringify(vectors[0]?.metadata, null, 2));
    console.log("First vector content length:", vectors[0]?.metadata?.content?.length || 0);
    console.log("First vector content preview:", (vectors[0]?.metadata?.content as string)?.substring(0, 200) || 'EMPTY');
    
    await index.namespace(namespace).upsert(vectors);
    console.log(
      "Successfully stored", vectors.length, "vectors in namespace:", namespace
    );
  } catch (error) {
    console.error("Error storing vectors in Pinecone:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as Record<string, unknown>)?.code,
      status: (error as Record<string, unknown>)?.status,
      response: (error as Record<string, unknown>)?.response
    });
    throw error;
  }
}

/**
 * Normalize phone number for consistent searching
 */
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

/**
 * Generate multiple phone number formats for searching
 */
function generatePhoneNumberVariants(phone: string): string[] {
  const normalized = normalizePhoneNumber(phone);
  const variants = [normalized];
  
  // Add variants without country code
  if (normalized.startsWith('+1')) {
    variants.push(normalized.slice(2)); // Remove +1
  } else if (normalized.startsWith('+234')) {
    variants.push(normalized.slice(4)); // Remove +234
  }
  
  // Add variants with different formatting
  const digits = normalized.replace(/\D/g, '');
  
  // US numbers
  if (digits.length === 11 && digits.startsWith('1')) {
    variants.push(digits.slice(1)); // Remove leading 1
  }
  
  // Nigerian numbers
  if (digits.length === 13 && digits.startsWith('234')) {
    variants.push(digits.slice(3)); // Remove leading 234
  }
  
  // Add original format
  variants.push(phone);
  
  // Add formatted versions
  if (digits.length === 13 && digits.startsWith('234')) {
    // Format as 234-XXX-XXX-XXXX
    const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9)}`;
    variants.push(formatted);
  }
  
  return [...new Set(variants)]; // Remove duplicates
}

/**
 * Search for customer context by phone number with exact matching first
 * Prioritizes exact phone number matches for accuracy and privacy
 */
export async function searchByPhoneNumber(
  businessId: string,
  phoneNumber: string,
  topK = 3 // Reduced for more relevant results
): Promise<SearchResult[]> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Returning empty search results.");
    return [];
  }

  const namespace = getBusinessNamespace(businessId);
  
  try {
    // Generate phone number variants for exact matching
    const phoneVariants = generatePhoneNumberVariants(phoneNumber);
    console.log("Searching for phone number variants:", phoneVariants);
    
    // Step 1: Try exact phone number matching using metadata filters
    for (const variant of phoneVariants) {
      try {
        const exactMatches = await index.namespace(namespace).query({
          vector: new Array(1024).fill(0), // Dummy vector for metadata-only search
          filter: {
            phoneNumber: { $in: [variant] } // Updated to match new customer record structure
          },
          topK: 5,
          includeMetadata: true,
        });
        
        if (exactMatches.matches.length > 0) {
          console.log("Found", exactMatches.matches.length, "exact matches for phone:", variant);
          return exactMatches.matches.map(match => ({
            id: match.id,
            score: 1.0, // Perfect match
            content: (match.metadata?.content as string) || "",
            metadata: match.metadata || {},
          }));
        }
      } catch (filterError) {
        console.log("Filter search failed for", variant, ", trying next variant:", filterError);
      }
    }
    
    // Step 2: If no exact matches, fall back to semantic search but filter results
    console.log("No exact matches found, trying semantic search with filtering");
    const embeddings = await EmbeddingsService.generateEmbeddings([phoneNumber]);
    const results = await index.namespace(namespace).query({
      vector: embeddings[0] || [],
      topK: topK * 3, // Get more initially to filter
      includeMetadata: true,
    });
    
    // Filter results that actually contain the phone number in the content
    const relevantResults = results.matches.filter(match => {
      const content = (match.metadata?.content as string) || "";
      return phoneVariants.some(variant => content.includes(variant));
    }).slice(0, topK);
    
    console.log("Found", relevantResults.length, "relevant results after content filtering");
    
    return relevantResults.map(match => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || "",
      metadata: match.metadata || {},
    }));
    
  } catch (error) {
    console.error("Error searching for customer:", error);
    throw error;
  }
}

/**
 * Search for customer context by text similarity
 */
export async function searchByText(
  businessId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<SearchResult[]> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Returning empty search results.");
    return [];
  }

  const namespace = getBusinessNamespace(businessId);

  try {
    const results = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || "", // Check both locations
      metadata: match.metadata || {},
    }));
  } catch (error) {
    console.error("Error searching Pinecone by text:", error);
    throw error;
  }
}

/**
 * Comprehensive customer search with privacy protection
 * This is the main function that should be used by the AI receptionist
 */
export async function searchCustomerInfo(
  businessId: string,
  phoneNumber: string,
  topK = 3 // Reduced to fewer, more relevant results
): Promise<SearchResult[]> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Returning empty search results.");
    return [];
  }

  const namespace = getBusinessNamespace(businessId);
  
  try {
    // Generate phone number variants for exact matching
    const phoneVariants = generatePhoneNumberVariants(phoneNumber);
    console.log("[Customer Search] Searching for phone number variants:", phoneVariants);
    
    // Step 1: Try exact phone number matching using metadata filters
    for (const variant of phoneVariants) {
      try {
        const exactMatches = await index.namespace(namespace).query({
          vector: new Array(1024).fill(0), // Dummy vector for metadata-only search
          filter: {
            phoneNumber: { $in: [variant] } // Updated to match new customer record structure
          },
          topK: 5,
          includeMetadata: true,
        });
        
        if (exactMatches.matches.length > 0) {
          console.log("[Customer Search] Found", exactMatches.matches.length, "exact matches for phone:", variant);
          return exactMatches.matches.map(match => ({
            id: match.id,
            score: 1.0, // Perfect match
            content: (match.metadata?.content as string) || "",
            metadata: match.metadata || {},
          }));
        }
      } catch (filterError) {
        console.log("[Customer Search] Filter search failed for", variant, ", trying next variant:", filterError);
      }
    }
    
    // Step 2: If no exact matches, fall back to semantic search but filter results
    console.log("[Customer Search] No exact matches found, trying semantic search with filtering");
    const embeddings = await EmbeddingsService.generateEmbeddings([phoneNumber]);
    const results = await index.namespace(namespace).query({
      vector: embeddings[0] || [],
      topK: topK * 3, // Get more initially to filter
      includeMetadata: true,
    });
    
    // Filter results that actually contain the phone number in the content
    const relevantResults = results.matches.filter(match => {
      const content = (match.metadata?.content as string) || "";
      return phoneVariants.some(variant => content.includes(variant));
    }).slice(0, topK);
    
    console.log("[Customer Search] Found", relevantResults.length, "relevant results after content filtering");
    
    return relevantResults.map(match => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || "",
      metadata: match.metadata || {},
    }));
    
  } catch (error) {
    console.error("[Customer Search] Error searching for customer:", error);
    throw error;
  }
}

/**
 * Delete all vectors for a specific import
 */
export async function deleteImportVectors(
  businessId: string,
  importId: string
): Promise<void> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Skipping vector deletion.");
    return;
  }

  const namespace = getBusinessNamespace(businessId);

  try {
    // Delete vectors by importId metadata filter
    await index.namespace(namespace).deleteMany({
      filter: { importId: { $eq: importId } },
    });
    console.log(
      `Deleted vectors for import ${importId} in namespace: ${namespace}`
    );
  } catch (error) {
    console.error("Error deleting vectors from Pinecone:", error);
    throw error;
  }
}

/**
 * Get vector statistics for a business
 */
export async function getVectorStats(businessId: string): Promise<{
  totalVectors: number;
  namespaces: string[];
}> {
  if (!isPineconeAvailable() || !index) {
    console.warn("Pinecone is not available. Returning empty stats.");
    return {
      totalVectors: 0,
      namespaces: [],
    };
  }

  try {
    const stats = await index.describeIndexStats();
    const businessNamespace = getBusinessNamespace(businessId);

    return {
      totalVectors: stats.totalRecordCount || 0,
      namespaces: Object.keys(stats.namespaces || {}).filter((ns) =>
        ns.startsWith(businessNamespace)
      ),
    };
  } catch (error) {
    console.error("Error getting vector stats:", error);
    throw error;
  }
}
