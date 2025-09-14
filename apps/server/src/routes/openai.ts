import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { validateSession, SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";
import OpenAI from "openai";

const router: Router = Router();

// Lazy initialization of OpenAI client
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    logger.error("OpenAI API key is not set");
    throw new Error("OpenAI API key is not configured");
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const generateSummarySchema = z.object({
  callId: z.string().min(1, "Call ID is required"),
});

// Apply session validation to all routes
router.use(validateSession);

// POST /api/openai/generate-summary
router.post("/generate-summary", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }

    const { callId } = generateSummarySchema.parse(req.body);

    // Fetch the call with its logs
    const call = await db.call.findUnique({
      where: { 
        id: callId,
        businessId: req.user.businessId // Ensure user can only access their business calls
      },
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
      return res.status(404).json({ 
        success: false, 
        error: "Call not found" 
      });
    }

    // Check if summary already exists
    if (call.summary && call.summary.trim().length > 0) {
      return res.json({
        success: true,
        summary: call.summary,
        callId: call.id,
      });
    }

    // Check if we have logs to summarize
    if (!call.logs || call.logs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "No call logs found to summarize" 
      });
    }

    // Format the conversation for OpenAI
    const conversationText = call.logs
      .map((log: any) => `${log.sender.toUpperCase()}: ${log.message}`)
      .join("\n\n");

    // Create the prompt for summary generation
    const prompt = `Generate a professional call summary for ${call.business.name} (${call.business.phoneNumber || "Phone not provided"}). Customer: ${call.customerName || "Name not provided"}, Call Type: ${call.callType || "WEB"}, Duration: ${call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : "Unknown"}.

Conversation:
${conversationText}

Create a comprehensive call summary that captures all essential information including customer details (name, contact info, identifying information), the call purpose and products/services discussed, key discussion points and requests, any concerns or complaints raised, actions taken and information provided, next steps and follow-ups needed, and any special instructions or preferences. Format the summary in clear, organized sections for easy reference.`;

    // Generate summary using OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate summary from OpenAI",
      });
    }

    // Update the call record with the generated summary
    const updatedCall = await db.call.update({
      where: { id: callId },
      data: { summary },
    });

    logger.info("Generated call summary", {
      callId,
      businessId: req.user.businessId,
      userId: req.user.id,
      summaryLength: summary.length
    });

    return res.json({
      success: true,
      summary: updatedCall.summary || summary,
      callId: updatedCall.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error generating call summary:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return res.status(500).json({ 
          success: false, 
          error: "OpenAI API key not configured" 
        });
      }
      if (error.message.includes("quota")) {
        return res.status(429).json({ 
          success: false, 
          error: "OpenAI API quota exceeded" 
        });
      }
      if (error.message.includes("rate limit")) {
        return res.status(429).json({ 
          success: false, 
          error: "OpenAI API rate limit exceeded" 
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
