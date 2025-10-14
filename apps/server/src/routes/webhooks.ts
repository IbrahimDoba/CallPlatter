import { Router } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { downloadAndUploadRecording } from "../lib/uploadthing";
import { transcribeCall } from "../services/transcriptionService";

// Map to track active calls by conversation ID
const activeCallsByConversation = new Map<string, {
  callId: string;
  twilioCallSid: string;
  businessId: string;
}>();

// Function to register active calls (called from elevenLabsAgent.ts)
export const registerActiveCall = (streamSid: string, callId: string, twilioCallSid: string, businessId: string) => {
  activeCallsByConversation.set(streamSid, {
    callId,
    twilioCallSid,
    businessId
  });
  console.log("📝 Registered active call in webhooks", { streamSid, callId, twilioCallSid });
};

// Function to unregister active calls (called from elevenLabsAgent.ts)
export const unregisterActiveCall = (streamSid: string) => {
  activeCallsByConversation.delete(streamSid);
  console.log("🗑️ Removed from active calls in webhooks", { streamSid });
};

const router: Router = Router();

// POST /api/webhooks/appointments
router.post("/appointments", async (req, res) => {
  try {
    const body = req.body;
    
    // Verify webhook signature (in production, you'd verify the webhook signature)
    // const signature = req.headers['x-webhook-signature'];
    
    logger.info("Webhook received:", { body });

    // Process the webhook data
    const { event, data } = body;

    switch (event) {
      case 'appointment.created':
        // Handle new appointment
        logger.info("New appointment created:", { data });
        break;
      
      case 'appointment.updated':
        // Handle appointment update
        logger.info("Appointment updated:", { data });
        break;
      
      case 'call.received':
        // Handle new call
        logger.info("New call received:", { data });
        break;
      
      default:
        logger.info("Unknown event type:", { event });
    }

    return res.json({ 
      success: true,
      message: "Webhook processed successfully" 
    });
  } catch (error) {
    logger.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing webhook" 
    });
  }
});

// GET /api/webhooks/appointments
router.get("/appointments", async (req, res) => {
  // Webhook verification endpoint
  return res.json({ 
    message: "Webhook endpoint is active",
    status: "healthy"
  });
});

// POST /api/webhooks/recording-status
router.post("/recording-status", async (req, res) => {
  try {
    // Add this debug logging at the very beginning
    console.log("🎵 RECORDING WEBHOOK HIT! Raw body:", req.body);
    console.log("🎵 Headers:", req.headers);
    
    const { CallSid, RecordingSid, RecordingStatus, RecordingUrl, RecordingDuration } = req.body;
    
    logger.info("Recording status webhook received:", {
      CallSid,
      RecordingSid,
      RecordingStatus,
      RecordingUrl,
      RecordingDuration
    });

    if (RecordingStatus === "completed" && RecordingUrl) {
      // Find the call record by Twilio CallSid
      logger.info("Looking for call record with CallSid:", { CallSid });
      
      const call = await db.call.findFirst({
        where: { 
          twilioCallSid: CallSid
        }
      });

      logger.info("Call record search result:", { 
        found: !!call, 
        callId: call?.id,
        storedCallSid: call?.twilioCallSid 
      });

      if (call) {
        try {
          // Generate a proper filename
          const timestamp = Date.now();
          const filename = `call-recording-${CallSid}-${timestamp}.wav`;
          
          logger.info("Processing completed recording", {
            CallSid,
            RecordingSid,
            filename
          });

          // ✅ Use the new download and upload function
          const result = await downloadAndUploadRecording(
            RecordingSid,
            filename
          );

          // Update call record with UploadThing URL
          await db.call.update({
            where: { id: call.id },
            data: {
              audioFileUrl: result.url,
              duration: RecordingDuration ? Number.parseInt(RecordingDuration) : null,
            }
          });

          logger.info("Successfully processed and uploaded recording", {
            CallSid,
            RecordingSid,
            uploadedUrl: result.url,
            filename
          });

          // Trigger transcription after recording is processed
          try {
            logger.info("Starting transcription for call", { callId: call.id });
            // Run transcription in background (don't await to avoid blocking webhook response)
            transcribeCall(call.id).catch(error => {
              logger.error("Background transcription failed", {
                callId: call.id,
                error: error instanceof Error ? error.message : String(error)
              });
            });
          } catch (transcriptionError) {
            logger.error("Error starting transcription", {
              callId: call.id,
              error: transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError)
            });
          }

          logger.info("Recording processed successfully");
        } catch (error) {
          logger.error("Error processing recording:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            CallSid,
            RecordingSid
          });
          
          // Still update the call record with basic info even if upload failed
          await db.call.update({
            where: { id: call.id },
            data: {
              audioFileUrl: RecordingUrl, // Fallback to Twilio URL
              duration: RecordingDuration ? Number.parseInt(RecordingDuration) : null,
            }
          }); 
        }
      } else {
        logger.warn("No call record found for recording:", { CallSid, RecordingSid });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    logger.error("Error processing recording status webhook:", error);
    res.status(500).send("Error");
  }
});

// POST /api/webhooks/transcribe-call - Manual transcription trigger
router.post("/transcribe-call", async (req, res) => {
  try {
    const { callId } = req.body;
    
    if (!callId) {
      return res.status(400).json({ error: "callId is required" });
    }

    logger.info("Manual transcription requested", { callId });
    
    // Run transcription in background
    transcribeCall(callId).catch(error => {
      logger.error("Manual transcription failed", {
        callId,
        error: error instanceof Error ? error.message : String(error)
      });
    });

    res.status(200).json({ 
      message: "Transcription started", 
      callId 
    });
  } catch (error) {
    logger.error("Error starting manual transcription:", error);
    res.status(500).json({ error: "Failed to start transcription" });
  }
});

// POST /api/webhooks/recording-complete
router.post("/recording-complete", async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingDuration } = req.body;
    
    logger.info("Recording complete webhook received:", {
      CallSid,
      RecordingUrl,
      RecordingDuration
    });

    // This webhook is called when the recording is complete
    // The actual processing happens in recording-status webhook
    res.status(200).send("OK");
  } catch (error) {
    logger.error("Error processing recording complete webhook:", error);
    res.status(500).send("Error");
  }
});

// POST /api/webhooks/end-call - ElevenLabs AI agent end call webhook
router.post("/end-call", async (req, res) => {
  try {
    const { reason, summary } = req.body;
    
    console.log("🔚 END-CALL WEBHOOK HIT! Raw body:", req.body);
    console.log("🔚 Headers:", req.headers);
    logger.info("🔚 End call tool triggered", { reason, summary });

    // Try multiple methods to find the call context
    let callId: string | undefined;
    let twilioCallSid: string | undefined;
    let businessId: string | undefined;

    // Method 1: Check if conversation_id is in headers (ElevenLabs sends this)
    const conversationId = req.headers['x-conversation-id'] as string;
    if (conversationId) {
      const callContext = activeCallsByConversation.get(conversationId);
      if (callContext) {
        callId = callContext.callId;
        twilioCallSid = callContext.twilioCallSid;
        businessId = callContext.businessId;
        logger.info("✅ Found call context from conversation ID", { conversationId, callId, twilioCallSid });
      }
    }

    // Method 2: Check all active calls if Method 1 failed
    if (!twilioCallSid) {
      // Get the most recent active call (fallback for single-call scenarios)
      const recentCall = await db.call.findFirst({
        where: { 
          status: "IN_PROGRESS",
          twilioCallSid: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (recentCall) {
        callId = recentCall.id;
        twilioCallSid = recentCall.twilioCallSid || undefined;
        businessId = recentCall.businessId;
        logger.info("✅ Found call from recent in-progress calls", { callId, twilioCallSid });
      }
    }

    // Method 3: Try to find from Twilio header if available
    if (!twilioCallSid) {
      twilioCallSid = req.headers['x-twilio-call-sid'] as string;
      if (twilioCallSid) {
        const call = await db.call.findFirst({
          where: { twilioCallSid }
        });
        if (call) {
          callId = call.id;
          businessId = call.businessId;
          logger.info("✅ Found call from Twilio header", { callId, twilioCallSid });
        }
      }
    }

    // End the call via Twilio API
    if (twilioCallSid) {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        
        if (accountSid && authToken) {
          const twilio = require('twilio');
          const client = twilio(accountSid, authToken);
          
          await client.calls(twilioCallSid).update({
            status: 'completed'
          });
          
          logger.info("✅ Call ended via Twilio API", { twilioCallSid, reason });
        } else {
          logger.error("❌ Missing Twilio credentials");
        }
      } catch (error) {
        logger.error("❌ Error ending call via Twilio:", error);
      }
    } else {
      logger.warn("⚠️ No Twilio Call SID found to end call");
    }

    // Update call record
    if (callId) {
      try {
        const duration = await db.call.findUnique({
          where: { id: callId },
          select: { createdAt: true }
        });

        const durationSeconds = duration 
          ? Math.floor((Date.now() - duration.createdAt.getTime()) / 1000)
          : 0;

        await db.call.update({
          where: { id: callId },
          data: {
            status: "COMPLETED",
            duration: durationSeconds,
            summary: summary || `Call ended: ${reason}`
          }
        });
        
        logger.info("✅ Call record updated", { callId, reason, duration: durationSeconds });

        // Track billing
        try {
          const { BillingService } = await import('../services/billingService.js');
          const billingService = new BillingService();
          await billingService.trackCallUsage(callId, durationSeconds);
          logger.info("✅ Billing tracked", { callId, duration: durationSeconds });
        } catch (billingError) {
          logger.error("❌ Billing tracking failed:", billingError);
        }
      } catch (error) {
        logger.error("❌ Error updating call record:", error);
      }
    } else {
      logger.warn("⚠️ No call ID found to update");
    }

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
      reason,
      summary,
      callId,
      twilioCallSid
    });
  } catch (error) {
    logger.error("❌ Error in end-call endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error ending call",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
