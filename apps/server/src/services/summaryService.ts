// services/summaryService.ts
import { logger } from "../utils/logger";
import { db } from "@repo/db";

interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  address?: string;
  otherInfo?: string;
}

interface SummaryData {
  summary: string;
  keyPoints: string[];
  customerInfo: CustomerInfo;
  tokensUsed: number;
  processingTime: number;
}

interface BusinessContext {
  businessId: string;
  businessName: string;
  systemMessage: string;
  firstMessage?: string;
  goodbyeMessage?: string;
  questionsToAsk: string[];
}

/**
 * Generate call summary using GPT-3.5
 */
export async function generateCallSummary(
  transcript: string,
  businessContext: BusinessContext
): Promise<SummaryData> {
  try {
    const startTime = Date.now();
    logger.info("Starting call summary generation", {
      businessName: businessContext.businessName,
      transcriptLength: transcript.length
    });

    const prompt = `You are analyzing a call transcript from a business called "${businessContext.businessName}".

BUSINESS CONTEXT:
- Business Name: ${businessContext.businessName}
- AI Instructions: ${businessContext.systemMessage.substring(0, 500)}...
- AI Asks For: ${businessContext.questionsToAsk.join(', ')}

CALL TRANSCRIPT:
${transcript}

TASK:
Create a comprehensive summary of this call. Extract all important information including:

1. MAIN SUMMARY (2-3 sentences): Brief overview of what the call was about
2. KEY POINTS (bullet points): Important topics discussed, decisions made, or actions taken
3. CUSTOMER INFORMATION: Any customer details collected (name, phone, email, company, address, etc.)

Return ONLY a JSON object with this exact format:
{
  "summary": "Brief 2-3 sentence summary of the call",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "customerInfo": {
    "name": "Customer name if mentioned",
    "phone": "Phone number if mentioned", 
    "email": "Email if mentioned",
    "company": "Company name if mentioned",
    "address": "Address if mentioned",
    "otherInfo": "Any other relevant customer information"
  }
}

Rules:
- Be concise but comprehensive
- Extract ALL customer information mentioned
- Focus on actionable items and important details
- Return ONLY the JSON object, no other text`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing call transcripts and creating comprehensive summaries with customer information extraction.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("GPT-3.5 API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`GPT-3.5 API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    if (!content) {
      throw new Error("No content returned from GPT-3.5");
    }

    // Clean the content - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    logger.info("GPT-3.5 response content", { 
      originalLength: content.length,
      cleanedLength: cleanedContent.length,
      tokensUsed,
      preview: cleanedContent.substring(0, 200) + '...'
    });

    // Parse the JSON response
    const summaryData = JSON.parse(cleanedContent);
    const processingTime = Date.now() - startTime;

    logger.info("Call summary generation completed", {
      businessName: businessContext.businessName,
      summaryLength: summaryData.summary?.length || 0,
      keyPointsCount: summaryData.keyPoints?.length || 0,
      customerInfoFields: Object.keys(summaryData.customerInfo || {}).length,
      tokensUsed,
      processingTime
    });

    return {
      summary: summaryData.summary || "No summary generated",
      keyPoints: summaryData.keyPoints || [],
      customerInfo: summaryData.customerInfo || {},
      tokensUsed,
      processingTime
    };

  } catch (error) {
    logger.error("Error in call summary generation", {
      error: error instanceof Error ? error.message : String(error),
      businessName: businessContext.businessName
    });
    throw error;
  }
}

/**
 * Save summary to database using existing Call.summary field
 */
export async function saveSummaryToDatabase(
  callId: string,
  summaryData: SummaryData
): Promise<void> {
  try {
    // Create a comprehensive summary that includes all information
    const comprehensiveSummary = `${summaryData.summary} Key points discussed: ${summaryData.keyPoints.join(', ')}. Customer information: ${Object.entries(summaryData.customerInfo)
      .filter(([_, value]) => value && value !== '')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(', ')}.`;

    // Update the existing call record with the comprehensive summary
    await db.call.update({
      where: { id: callId },
      data: {
        summary: comprehensiveSummary,
        // Also update customer fields if we have the information (excluding phone to preserve original Twilio number)
        ...(summaryData.customerInfo.name && { customerName: summaryData.customerInfo.name }),
        ...(summaryData.customerInfo.email && { customerEmail: summaryData.customerInfo.email }),
        ...(summaryData.customerInfo.address && { customerAddress: summaryData.customerInfo.address }),
      }
    });

    logger.info("Summary saved to database", {
      callId,
      summaryLength: comprehensiveSummary.length,
      keyPointsCount: summaryData.keyPoints.length,
      customerInfoFields: Object.keys(summaryData.customerInfo).length,
      tokensUsed: summaryData.tokensUsed,
      processingTime: summaryData.processingTime
    });

  } catch (error) {
    logger.error("Error saving summary to database", {
      error: error instanceof Error ? error.message : String(error),
      callId
    });
    throw error;
  }
}

/**
 * Main summary function - orchestrates the entire summary process
 */
export async function summarizeCall(
  callId: string,
  transcript: string,
  businessContext: BusinessContext
): Promise<void> {
  try {
    logger.info("Starting call summary process", { 
      callId,
      businessName: businessContext.businessName,
      transcriptLength: transcript.length
    });

    // Generate summary using GPT-3.5
    const summaryData = await generateCallSummary(transcript, businessContext);

    // Save summary to database
    await saveSummaryToDatabase(callId, summaryData);

    logger.info("Call summary process completed successfully", {
      callId,
      businessName: businessContext.businessName,
      summaryLength: summaryData.summary.length,
      keyPointsCount: summaryData.keyPoints.length,
      tokensUsed: summaryData.tokensUsed,
      processingTime: summaryData.processingTime
    });

  } catch (error) {
    logger.error("Error in call summary process", {
      error: error instanceof Error ? error.message : String(error),
      callId,
      businessName: businessContext.businessName
    });
    throw error;
  }
}

// Export types for use in other files
export type { CustomerInfo, SummaryData, BusinessContext };
