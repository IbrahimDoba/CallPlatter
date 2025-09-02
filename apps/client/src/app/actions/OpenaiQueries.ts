"use server";

import { db } from "@repo/db";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateSummaryResult {
  success: boolean;
  summary?: string;
  error?: string;
  callId?: string;
}

export async function generateCallSummary(
  callId: string
): Promise<GenerateSummaryResult> {
  try {
    // Validate callId
    if (!callId) {
      return { success: false, error: "Call ID is required" };
    }

    // Fetch the call with its logs
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        logs: {
          orderBy: { timestamp: "asc" },
        },
        business: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!call) {
      return { success: false, error: "Call not found" };
    }

    // Check if summary already exists
    if (call.summary && call.summary.trim().length > 0) {
      return {
        success: true,
        summary: call.summary,
        callId: call.id,
      };
    }

    // Check if we have logs to summarize
    if (!call.logs || call.logs.length === 0) {
      return { success: false, error: "No call logs found to summarize" };
    }

    // Format the conversation for OpenAI
    const conversationText = call.logs
      .map((log) => `${log.sender.toUpperCase()}: ${log.message}`)
      .join("\n\n");

    // Create the prompt for summary generation
    const prompt = `You are an AI assistant that creates detailed, professional summaries of customer service calls for business records.

BUSINESS DETAILS:
- Business Name: ${call.business.name}
- Business Phone: ${call.business.phoneNumber || 'Not provided'}

CUSTOMER INFORMATION:
- Customer Name: ${call.customerName || 'Not provided'}
- Call Type: ${call.callType || 'WEB'}
- Call Duration: ${call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : "Unknown"}

CONVERSATION LOGS:
${conversationText}

Please generate a comprehensive summary that includes:

1. CUSTOMER DETAILS:
   - Full name (if mentioned)
   - Contact information (phone, email, address if provided)
   - Any other identifying information

2. CALL PURPOSE:
   - Primary reason for the call
   - Specific products/services inquired about

3. KEY POINTS DISCUSSED:
   - Main topics covered
   - Customer's specific requests or concerns
   - Any issues or complaints raised

4. ACTIONS TAKEN:
   - Steps taken during the call
   - Information provided to the customer
   - Any promises made

5. NEXT STEPS:
   - Follow-up required (if any)
   - Pending actions
   - Any scheduled callbacks or appointments

6. ADDITIONAL NOTES:
   - Special instructions
   - Customer preferences
   - Any other relevant details

Format the summary in clear, well-organized sections. Include all customer-provided details, even if they seem minor, as they might be important for future reference.`;

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cost-effective model for summaries
      messages: [
        {
          role: "system",
          content:
            "You are a professional call center supervisor who writes clear, concise call summaries for business records. Always maintain a professional tone and focus on actionable information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more consistent summaries
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return {
        success: false,
        error: "Failed to generate summary from OpenAI",
      };
    }

    // Update the call record with the generated summary
    const updatedCall = await db.call.update({
      where: { id: callId },
      data: { summary },
    });

    return {
      success: true,
      summary: updatedCall.summary || summary,
      callId: updatedCall.id,
    };
  } catch (error) {
    console.error("Error generating call summary:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return { success: false, error: "OpenAI API key not configured" };
      }
      if (error.message.includes("quota")) {
        return { success: false, error: "OpenAI API quota exceeded" };
      }
      if (error.message.includes("rate limit")) {
        return { success: false, error: "OpenAI API rate limit exceeded" };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
