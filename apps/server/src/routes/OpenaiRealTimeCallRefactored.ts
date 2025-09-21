// routes/openaiRealtimeCall.ts - Refactored version
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { BusinessConfigService, BusinessConfig } from "../services/call/BusinessConfigService";
import { CallStateService } from "../services/call/CallStateService";
import { CallRecordingService } from "../services/call/CallRecordingService";
import { SessionConfigService } from "../services/call/SessionConfigService";
import { WebSocketConnectionService } from "../services/call/WebSocketConnectionService";

const router: Router = Router();

// Route for Twilio to handle incoming calls
router.all("/incoming-call", async (req: Request, res: Response) => {
  try {
    const calledNumber = req.body?.Called || req.query?.Called;
    const callerNumber = req.body?.From || req.query?.From;
    const twilioCallSid = req.body?.CallSid || req.query?.CallSid;

    if (!calledNumber) {
      logger.error("No called number found in Twilio request");
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say>Sorry, we could not process your call. Please try again later.</Say>
                    <Hangup/>
                </Response>`);
    }

    const businessConfigService = new BusinessConfigService();
    const businessConfig = await businessConfigService.getConfigByPhone(calledNumber);

    if (!businessConfig) {
      logger.warn("No business configuration found for number", { calledNumber });
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say>Sorry, this number is not configured for our service.</Say>
                    <Hangup/>
                </Response>`);
    }

    logger.info("Incoming call for business", {
      calledNumber,
      callerNumber,
      businessId: businessConfig.businessId,
      businessName: businessConfig.businessName,
      voice: businessConfig.voice,
      temperature: businessConfig.temperature,
    });

    // Use the base WebSocket URL without query parameters
    const host = req.headers.host;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
    const websocketUrl = `${protocol}://${host}/api/openai-realtime/media-stream`;

    logger.info("Constructed WebSocket URL:", {
      host,
      protocol,
      businessId: businessConfig.businessId,
      websocketUrl,
    });

    // Pass businessId and caller info via Twilio's customParameters
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Connect>
                    <Stream url="${websocketUrl}">
                        <Parameter name="businessId" value="${businessConfig.businessId}" />
                        <Parameter name="businessName" value="${businessConfig.businessName}" />
                        <Parameter name="twilioCallSid" value="${twilioCallSid}" />
                        <Parameter name="callerNumber" value="${callerNumber || "Unknown"}" />
                    </Stream>
                </Connect>
            </Response>`;

    logger.info("Sending TwiML response with custom parameters:", {
      businessId: businessConfig.businessId,
      businessName: businessConfig.businessName,
      websocketUrl,
      twimlLength: twimlResponse.length,
    });

    res.type("text/xml").send(twimlResponse);
  } catch (error) {
    logger.error("Error handling incoming call", error);
    res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>Sorry, we encountered an error processing your call.</Say>
                <Hangup/>
            </Response>`);
  }
});

// Setup WebSocket server for media stream
export const setupOpenAIRealtimeWebSocket = (server: Server) => {
  const wss = new WebSocket.Server({
    server,
    path: "/api/openai-realtime/media-stream",
  });

  wss.on("connection", async (ws: WebSocket, req) => {
    logger.info("OpenAI Realtime client connected", {
      url: req.url,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        "user-agent": req.headers["user-agent"],
      },
      method: req.method,
    });

    // Initialize services
    const stateService = new CallStateService();
    const businessConfigService = new BusinessConfigService();
    const recordingService = new CallRecordingService();
    const sessionConfigService = new SessionConfigService();
    const connectionService = new WebSocketConnectionService(
      stateService,
      recordingService,
      sessionConfigService
    );

    // Setup Twilio connection
    connectionService.setupTwilioConnection(ws);

    // Handle Twilio messages
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString()) as {
          event: string;
          start?: { streamSid?: string; customParameters?: Record<string, string> };
          media?: { timestamp: number; payload: string };
          streamSid?: string;
        };

        switch (data.event) {
          case "start":
            await handleStartEvent(data, stateService, businessConfigService, recordingService, connectionService);
            break;
          case "media":
            await connectionService.handleTwilioMessage(message);
            break;
          case "mark":
            // Handled by MessageHandlers
            break;
          case "stop":
            await handleStopEvent(stateService, recordingService);
            break;
        }
      } catch (error) {
        logger.error("Error parsing Twilio message:", error);
      }
    });

    // Cleanup on disconnect
    ws.on("close", () => {
      connectionService.closeConnections();
      handleStopEvent(stateService, recordingService);
      logger.info("Client disconnected");
    });
  });

  return wss;
};

/**
 * Handle start event from Twilio
 */
async function handleStartEvent(
  data: any,
  stateService: CallStateService,
  businessConfigService: BusinessConfigService,
  recordingService: CallRecordingService,
  connectionService: WebSocketConnectionService
): Promise<void> {
  const customParameters = data.start?.customParameters || {};
  const businessId = customParameters.businessId || null;
  const businessName = customParameters.businessName || null;
  const twilioCallSid = customParameters.twilioCallSid || null;
  const callerNumber = customParameters.callerNumber || null;

  stateService.updateState({
    businessId,
    businessName,
    callerNumber,
    streamSid: data.start?.streamSid || null,
  });

  logger.info("Extracted parameters from Twilio start event:", {
    businessId,
    businessName,
    twilioCallSid,
    callerNumber,
    customParameters,
    streamSid: data.start?.streamSid,
  });

  if (!businessId) {
    logger.warn("No businessId found in customParameters");
    return;
  }

  try {
    // Fetch business configuration
    const businessConfig = await businessConfigService.getConfigById(businessId);
    if (!businessConfig) {
      logger.error("Failed to fetch business configuration", { businessId });
      return;
    }

    logger.info("Business config fetch result:", {
      businessId,
      configFound: !!businessConfig,
      businessName: businessConfig.businessName,
    });

    // Initialize OpenAI connection
    await connectionService.initializeOpenAIConnection(businessConfig, callerNumber);

    // Create call record
    const callId = await recordingService.createCallRecord(
      businessConfig,
      twilioCallSid || undefined,
      callerNumber || undefined
    );

    if (callId) {
      stateService.set("callId", callId);
      stateService.set("callStartTime", new Date());

      // Schedule call recording
      if (twilioCallSid) {
        recordingService.scheduleRecordingStart(twilioCallSid);
      }
    }

  } catch (error) {
    logger.error("Error handling start event", error);
  }
}

/**
 * Handle stop event from Twilio
 */
async function handleStopEvent(
  stateService: CallStateService,
  recordingService: CallRecordingService
): Promise<void> {
  const state = stateService.getState();
  
  if (state.callId && state.callStartTime && state.businessName) {
    await recordingService.finalizeCallRecord(
      state.callId,
      state.businessName,
      state.callStartTime
    );
  }
}

export default router;
