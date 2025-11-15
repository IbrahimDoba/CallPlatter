import { Router } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { downloadAndUploadRecording } from "../lib/uploadthing";
import { transcribeCall } from "../services/transcriptionService";
import crypto from "crypto";
import twilio from "twilio";

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

// Security middleware for webhook verification (generic)
const verifyWebhookSignature = (secret: string, signature: string, body: string): boolean => {
  if (!secret || !signature) {
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');
    
    // Strip possible "sha256=" prefix from signature
    const signatureHex = signature.replace(/^sha256=/, '');
    
    // Convert to buffers for comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signatureHex, 'hex');
    
    // Lengths must match for timingSafeEqual
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    // If signature format is invalid (e.g., not hex), return false
    logger.warn("Error verifying webhook signature:", {
      error: error instanceof Error ? error.message : String(error),
      signatureLength: signature?.length
    });
    return false;
  }
};

// Twilio-specific signature verification
const verifyTwilioSignature = (authToken: string, signature: string, url: string, params: Record<string, string>): boolean => {
  if (!authToken || !signature) {
    return false;
  }
  
  try {
    // Use Twilio's official validateRequest method
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (error) {
    logger.error("Error verifying Twilio signature:", {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};

// IP whitelist for webhook sources (add your trusted IPs)
const ALLOWED_WEBHOOK_IPS = [
  '127.0.0.1',
  '::1',
  // Add Twilio IPs, Africa's Talking IPs, etc.
  // You can get these from their documentation
];

const checkIPWhitelist = (req: any): boolean => {
  // Always allow - signature verification is the primary security
  // IP whitelisting is optional and can be added later if needed
  return true;
};

// Rate limiting for webhooks (5 requests per minute per IP)
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (req: any): boolean => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;
  
  const current = webhookRateLimit.get(clientIP);
  
  if (!current || now > current.resetTime) {
    webhookRateLimit.set(clientIP, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

// POST /api/webhooks/appointments
router.post("/appointments", async (req, res) => {
  try {
    // Security checks
    if (!checkIPWhitelist(req)) {
      logger.warn("Webhook request from unauthorized IP", { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized IP address" 
      });
    }

    if (!checkRateLimit(req)) {
      logger.warn("Webhook rate limit exceeded", { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(429).json({ 
        success: false, 
        error: "Rate limit exceeded" 
      });
    }

    // Verify webhook signature if secret is provided
    const webhookSecret = process.env.APPOINTMENTS_WEBHOOK_SECRET;
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (webhookSecret && signature) {
      const bodyString = JSON.stringify(req.body);
      if (!verifyWebhookSignature(webhookSecret, signature, bodyString)) {
        logger.warn("Invalid webhook signature", { 
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ 
          success: false, 
          error: "Invalid signature" 
        });
      }
    }
    
    const body = req.body;
    
    logger.info("Webhook received:", { 
      body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Process the webhook data
    const { event, data } = body;

    if (!event || !data) {
      return res.status(400).json({
        success: false,
        error: "Missing event or data in payload"
      });
    }

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
router.get("/appointments", async (_req, res) => {
  // Webhook verification endpoint
  return res.json({ 
    message: "Webhook endpoint is active",
    status: "healthy"
  });
});

// POST /api/webhooks/recording-status
router.post("/recording-status", async (req, res) => {
  try {
    // Security checks
    if (!checkIPWhitelist(req)) {
      logger.warn("Recording webhook request from unauthorized IP", { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized IP address" 
      });
    }

    if (!checkRateLimit(req)) {
      logger.warn("Recording webhook rate limit exceeded", { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(429).json({ 
        success: false, 
        error: "Rate limit exceeded" 
      });
    }

    // Verify Twilio webhook signature using official Twilio method
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = req.headers['x-twilio-signature'] as string;
    
    if (twilioAuthToken && signature) {
      // Construct the full webhook URL
      // Express with trust proxy handles X-Forwarded-Proto and X-Forwarded-Host automatically
      const protocol = req.protocol;
      const host = req.get('host');
      const url = `${protocol}://${host}${req.originalUrl}`;
      
      // Verify using Twilio's official method
      const isValid = verifyTwilioSignature(twilioAuthToken, signature, url, req.body);
      
      if (!isValid) {
        logger.warn("Invalid Twilio webhook signature", { 
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url,
          protocol,
          host
        });
        return res.status(401).json({ 
          success: false, 
          error: "Invalid Twilio signature" 
        });
      }
      
      logger.debug("Twilio webhook signature verified successfully", { url });
    } else if (twilioAuthToken && !signature) {
      // Auth token is configured but signature is missing - suspicious
      logger.warn("Twilio auth token configured but signature missing from request", {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        success: false, 
        error: "Missing Twilio signature" 
      });
    }

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
