import { Router } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { downloadAndUploadRecording } from "../lib/uploadthing";
import { transcribeCall } from "../services/transcriptionService";

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

export default router;
