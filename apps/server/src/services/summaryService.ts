// services/summaryService.ts
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { emailService } from "./emailService";

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

    const prompt = `You are analyzing a call transcript from "${businessContext.businessName}".

TRANSCRIPT:
${transcript}

Create a CONCISE summary following these rules:

SUMMARY (1-2 sentences max):
- Start with the customer's name if known
- State the main purpose/outcome
- Be direct and actionable
Examples:
✅ "Ibrahim booked a table for 2 at 10 PM tomorrow."
✅ "Sarah inquired about catering services for 50 people on June 15th."
❌ "The call was about Ibrahim placing a reservation..." (too wordy)

KEY POINTS (3-5 max, only if important):
- Only include actionable items, decisions, or critical info
- Skip obvious/redundant information
- Each point should add NEW information
Examples:
✅ "Requested window seating"
✅ "Mentioned dietary restrictions: vegetarian"
❌ "Reservation was confirmed" (obvious from summary)
❌ "Customer called to make reservation" (redundant)

CUSTOMER INFO:
- Extract ONLY if explicitly mentioned
- Leave fields empty if not stated
- Be accurate, don't guess

Return ONLY valid JSON:
{
  "summary": "Customer name did X",
  "keyPoints": ["Only important details"],
  "customerInfo": {
    "name": "Name if mentioned",
    "phone": "Phone if mentioned",
    "email": "Email if mentioned",
    "company": "Company if mentioned",
    "address": "Address if mentioned",
    "otherInfo": "Other relevant info"
  }
}`;

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
            content: 'You are an expert at creating ultra-concise, actionable call summaries. Be brief, direct, and skip redundant information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Lower for more consistent, factual output
        max_tokens: 800 // Reduced to encourage brevity
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("GPT API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`GPT API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    if (!content) {
      throw new Error("No content returned from GPT");
    }

    // Clean the content - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    logger.info("GPT response content", { 
      originalLength: content.length,
      cleanedLength: cleanedContent.length,
      tokensUsed,
      preview: cleanedContent.substring(0, 200) + '...'
    });

    // Parse the JSON response
    const summaryData = JSON.parse(cleanedContent);
    const processingTime = Date.now() - startTime;

    // Clean up empty values in customerInfo
    const cleanedCustomerInfo: CustomerInfo = {};
    if (summaryData.customerInfo) {
      Object.entries(summaryData.customerInfo).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'not mentioned' && value !== 'N/A') {
          cleanedCustomerInfo[key as keyof CustomerInfo] = value as string;
        }
      });
    }

    logger.info("Call summary generation completed", {
      businessName: businessContext.businessName,
      summaryLength: summaryData.summary?.length || 0,
      keyPointsCount: summaryData.keyPoints?.length || 0,
      customerInfoFields: Object.keys(cleanedCustomerInfo).length,
      tokensUsed,
      processingTime
    });

    return {
      summary: summaryData.summary || "Call completed",
      keyPoints: summaryData.keyPoints || [],
      customerInfo: cleanedCustomerInfo,
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
 * Format summary for database storage
 */
function formatSummaryForDatabase(summaryData: SummaryData): string {
  const parts: string[] = [];
  
  // Add main summary
  parts.push(summaryData.summary);
  
  // Add key points only if they exist and add value
  if (summaryData.keyPoints && summaryData.keyPoints.length > 0) {
    parts.push(`Additional details: ${summaryData.keyPoints.join('; ')}.`);
  }
  
  // Add customer info only if exists
  const customerDetails = Object.entries(summaryData.customerInfo)
    .filter(([_, value]) => value && value !== '')
    .map(([key, value]) => {
      // Format the key nicely
      const formattedKey = key === 'otherInfo' ? 'Notes' : 
                          key.charAt(0).toUpperCase() + key.slice(1);
      return `${formattedKey}: ${value}`;
    });
  
  if (customerDetails.length > 0) {
    parts.push(`Customer: ${customerDetails.join(', ')}.`);
  }
  
  return parts.join(' ');
}

/**
 * Save summary to database using existing Call.summary field
 */
export async function saveSummaryToDatabase(
  callId: string,
  summaryData: SummaryData
): Promise<void> {
  try {
    const formattedSummary = formatSummaryForDatabase(summaryData);

    // Update the existing call record with the comprehensive summary
    await db.call.update({
      where: { id: callId },
      data: {
        summary: formattedSummary,
        // Also update customer fields if we have the information
        ...(summaryData.customerInfo.name && { customerName: summaryData.customerInfo.name }),
        ...(summaryData.customerInfo.email && { customerEmail: summaryData.customerInfo.email }),
        ...(summaryData.customerInfo.address && { customerAddress: summaryData.customerInfo.address }),
      }
    });

    logger.info("Summary saved to database", {
      callId,
      summaryLength: formattedSummary.length,
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

    // Generate summary using GPT
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

    // Send email summary after summary is generated
    await sendCallSummaryEmail(callId, businessContext);

  } catch (error) {
    logger.error("Error in call summary process", {
      error: error instanceof Error ? error.message : String(error),
      callId,
      businessName: businessContext.businessName
    });
    throw error;
  }
}

/**
 * Send call summary email after summary is generated
 */
async function sendCallSummaryEmail(callId: string, businessContext: BusinessContext): Promise<void> {
  try {
    // Get the updated call record with summary and transcript
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        business: {
          include: { users: true }
        }
      }
    });

    if (!call || !call.business || call.business.users.length === 0) {
      logger.warn("No business or users found for email", { callId });
      return;
    }

    const callDate = call.createdAt.toLocaleDateString();
    const callTime = call.createdAt.toLocaleTimeString();
    const siteUrl = process.env.SITE_URL || "https://yourdomain.com";

    // Send email to all business users
    for (const user of call.business.users) {
      await emailService.sendCallSummaryEmail({
        businessName: businessContext.businessName,
        phoneNumber: call.customerPhone || "Unknown",
        callDate,
        callTime,
        summary: call.summary || "Call completed successfully",
        transcription: call.transcript || undefined,
        audioUrl: call.audioFileUrl || undefined,
        callId: callId,
        recipientEmail: user.email,
        siteUrl
      });
    }

    logger.info("📧 Call summary emails sent", {
      callId,
      businessId: businessContext.businessId,
      recipientCount: call.business.users.length
    });

  } catch (error) {
    logger.error("Error sending call summary email", {
      error: error instanceof Error ? error.message : String(error),
      callId,
      businessName: businessContext.businessName
    });
    // Don't throw - email failure shouldn't break the summary process
  }
}

// Export types for use in other files
export type { CustomerInfo, SummaryData, BusinessContext };