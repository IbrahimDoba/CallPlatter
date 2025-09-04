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
    const prompt = `Generate a professional call summary for ${call.business.name} (${call.business.phoneNumber || "Phone not provided"}). Customer: ${call.customerName || "Name not provided"}, Call Type: ${call.callType || "WEB"}, Duration: ${call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : "Unknown"}.

Conversation:
${conversationText}

Please create a comprehensive and well-organized call summary that captures all essential information from this conversation. The summary should include complete customer details such as their name, 
contact information, and any identifying information they provided during the call. 
Document the primary purpose of the call including the reason they contacted us and any specific 
products or services that were discussed. Cover all key discussion points that arose during the 
conversation including main topics covered, specific requests made by the customer, any concerns or
 issues they raised, and complaints if applicable. Detail any actions that were taken during the call 
 such as steps completed to assist the customer, information that was provided to them, and any 
 promises or commitments made by our team. Clearly outline the next steps that need to be taken 
 including any required follow-ups, pending actions that need completion, scheduled appointments, 
 or callbacks. Include additional relevant notes such as special instructions from the customer, 
 their preferences or requirements, and any other details that may be important for future reference.
 Please ensure that all customer-provided information is included in the summary regardless of 
 how minor it may seem, as even small details can be crucial for maintaining excellent customer 
 service and building strong relationships. Format the summary in clear, well-organized sections
  that make it easy to quickly find and reference specific information.`;

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
