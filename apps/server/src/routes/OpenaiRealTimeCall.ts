// routes/openaiRealtimeCall.ts
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { instructions } from "@/utils/instructions";
import twilio from "twilio";

const router: Router = Router();

const DEFAULT_VOICE = "alloy";
const DEFAULT_TEMPERATURE = 0.6;
const DEFAULT_SYSTEM_MESSAGE =
  "You are a helpful and bubbly AI assistant who loves to chat about anything the user is interested about and is prepared to offer them facts. You have a penchant for dad jokes, owl jokes, and rickrolling – subtly. Always stay positive, but work in a joke when appropriate.";

const LOG_EVENT_TYPES = [
  "error",
  "response.content.done",
  "rate_limits.updated",
  "response.done",
  "session.created",
  "session.updated",
];

// Interface for business configuration
interface BusinessConfig {
  businessId: string;
  businessName: string;
  voice: string;
  temperature: number;
  systemMessage: string;
  firstMessage?: string;
  goodbyeMessage?: string;
  enableServerVAD: boolean;
  turnDetection: string;
}

// Function to fetch business configuration by phone number
async function getBusinessConfig(
  phoneNumber: string
): Promise<BusinessConfig | null> {
  try {
    const business = await db.business.findFirst({
      where: { phoneNumber },
      include: { aiAgentConfig: true },
    });

    if (!business) {
      logger.info("No business found for phone number", { phoneNumber });
      return null;
    }

    let aiConfig = business.aiAgentConfig;
    console.log("aiConfig", aiConfig);
    if (!aiConfig) {
      aiConfig = await db.aIAgentConfig.create({
        data: {
          businessId: business.id,
          voice: DEFAULT_VOICE,
          responseModel: "gpt-4o-realtime-preview-2024-12-17",
          transcriptionModel: "whisper-1",
          systemPrompt: null,
          firstMessage: null,
          goodbyeMessage: null,
          temperature: DEFAULT_TEMPERATURE,
          enableServerVAD: true,
          turnDetection: "server_vad",
          askForName: true,
          askForPhone: true,
          askForCompany: false,
          askForEmail: true,
          askForAddress: false,
        },
      });
      logger.info("Created default AIAgentConfig for business", {
        businessId: business.id,
      });
    }

    const sessionInstructions = [...instructions];

    if (aiConfig.systemPrompt) {
      sessionInstructions.push(`\n\n${aiConfig.systemPrompt}`);
    }
    // BusinessMemory will be handled separately in the session update
    if (aiConfig.firstMessage) {
      sessionInstructions.push(
        `\n\nWhen the call starts, greet the caller with: "${aiConfig.firstMessage}"`
      );
    }
    if (aiConfig.goodbyeMessage) {
      sessionInstructions.push(
        `\n\nWhen ending the call, use this goodbye message: "${aiConfig.goodbyeMessage}"`
      );
    }

    // Add question collection instructions based on settings
    const questionsToAsk = [];
    if (aiConfig.askForName) questionsToAsk.push("name");
    if (aiConfig.askForPhone) questionsToAsk.push("phone number");
    if (aiConfig.askForEmail) questionsToAsk.push("email address");
    if (aiConfig.askForCompany) questionsToAsk.push("company name");
    if (aiConfig.askForAddress) questionsToAsk.push("address");

    if (questionsToAsk.length > 0) {
      sessionInstructions.push(
        `\n\nDuring the conversation, try to naturally collect the following information from the caller: ${questionsToAsk.join(", ")}. Ask for these details in a conversational way, not all at once.`
      );
    }

    return {
      businessId: business.id,
      businessName: business.name,
      voice: aiConfig.voice || DEFAULT_VOICE,
      temperature: aiConfig.temperature || DEFAULT_TEMPERATURE,
      systemMessage: sessionInstructions.join("\n"),
      firstMessage: aiConfig.firstMessage || undefined,
      goodbyeMessage: aiConfig.goodbyeMessage || undefined,
      enableServerVAD: aiConfig.enableServerVAD,
      turnDetection: aiConfig.turnDetection,
    };
  } catch (error) {
    logger.error("Error fetching business config", { phoneNumber, error });
    return null;
  }
}

// Function to fetch business memories
async function getBusinessMemories(businessId: string): Promise<string> {
  try {
    const memories = await db.businessMemory.findMany({
      where: {
        businessId: businessId,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (memories.length === 0) {
      return '';
    }

    const memoryContent = memories
      .map((memory: any) => `${memory.title}: ${memory.content}`)
      .join('\n');

    return `\n\nBusiness Context & Memory:\n${memoryContent}`;
  } catch (error) {
    logger.error("Error fetching business memories", { businessId, error });
    return '';
  }
}

// Function to fetch business configuration by ID (for WebSocket connections)
async function getBusinessConfigById(
  businessId: string
): Promise<BusinessConfig | null> {
  try {
    const business = await db.business.findUnique({
      where: { id: businessId },
      include: { aiAgentConfig: true },
    });

    if (!business) {
      logger.info("No business found for ID", { businessId });
      return null;
    }

    let aiConfig = business.aiAgentConfig;
    if (!aiConfig) {
      aiConfig = await db.aIAgentConfig.create({
        data: {
          businessId: business.id,
          voice: DEFAULT_VOICE,
          responseModel: "gpt-4o-realtime-preview-2024-12-17",
          transcriptionModel: "whisper-1",
          systemPrompt: null,
          firstMessage: null,
          goodbyeMessage: null,
          temperature: DEFAULT_TEMPERATURE,
          enableServerVAD: true,
          turnDetection: "server_vad",
          askForName: true,
          askForPhone: true,
          askForCompany: false,
          askForEmail: true,
          askForAddress: false,
        },
      });
      logger.info("Created default AIAgentConfig for business", {
        businessId: business.id,
      });
    }

    const sessionInstructions = [...instructions];

    if (aiConfig.systemPrompt) {
      sessionInstructions.push(`\n\n${aiConfig.systemPrompt}`);
    }
    // BusinessMemory will be handled separately in the session update
    if (aiConfig.firstMessage) {
      sessionInstructions.push(
        `\n\nWhen the call starts, greet the caller with: "${aiConfig.firstMessage}"`
      );
    }
    if (aiConfig.goodbyeMessage) {
      sessionInstructions.push(
        `\n\nWhen ending the call, use this goodbye message: "${aiConfig.goodbyeMessage}"`
      );
    }

    // Add question collection instructions based on settings
    const questionsToAsk = [];
    if (aiConfig.askForName) questionsToAsk.push("name");
    if (aiConfig.askForPhone) questionsToAsk.push("phone number");
    if (aiConfig.askForEmail) questionsToAsk.push("email address");
    if (aiConfig.askForCompany) questionsToAsk.push("company name");
    if (aiConfig.askForAddress) questionsToAsk.push("address");

    if (questionsToAsk.length > 0) {
      sessionInstructions.push(
        `\n\nDuring the conversation, try to naturally collect the following information from the caller: ${questionsToAsk.join(", ")}. Ask for these details in a conversational way, not all at once.`
      );
    }

    return {
      businessId: business.id,
      businessName: business.name,
      voice: aiConfig.voice || DEFAULT_VOICE,
      temperature: aiConfig.temperature || DEFAULT_TEMPERATURE,
      systemMessage: sessionInstructions.join("\n"),
      firstMessage: aiConfig.firstMessage || undefined,
      goodbyeMessage: aiConfig.goodbyeMessage || undefined,
      enableServerVAD: aiConfig.enableServerVAD,
      turnDetection: aiConfig.turnDetection,
    };
  } catch (error) {
    logger.error("Error fetching business config by ID", { businessId, error });
    return null;
  }
}

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

    const businessConfig = await getBusinessConfig(calledNumber);

    if (!businessConfig) {
      logger.warn("No business configuration found for number", {
        calledNumber,
      });
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
    const protocol =
      req.secure || req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
    const websocketUrl = `${protocol}://${host}/api/openai-realtime/media-stream`;

    // Log the constructed URL for debugging
    logger.info("Constructed WebSocket URL:", {
      host,
      protocol,
      businessId: businessConfig.businessId,
      websocketUrl,
    });
    // <Say voice="Google.en-US-Chirp3-HD-Aoede">Please wait while we connect your call to ${businessConfig.businessName}</Say>
    // <Pause length="1"/>
    // <Say voice="Google.en-US-Chirp3-HD-Aoede">O.K. you can start talking!</Say>
    // Pass businessId and caller info via Twilio's customParameters instead of URL query params
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

    let businessId: string | null = null;
    let businessName: string | null = null;
    let callerNumber: string | null = null;

    // Wait for the start event which contains customParameters
    const handleStartEvent = async (data: any) => {
      if (data.event === "start") {
        const customParameters = data.start?.customParameters || {};
        businessId = customParameters.businessId || null;
        businessName = customParameters.businessName || null;
        const twilioCallSid = customParameters.twilioCallSid || null;
        callerNumber = customParameters.callerNumber || null;

        logger.info("Extracted parameters from Twilio start event:", {
          businessId,
          businessName,
          twilioCallSid,
          callerNumber,
          customParameters,
          streamSid: data.start?.streamSid,
        });

        // Debug: Check if twilioCallSid is being passed correctly
        if (!twilioCallSid) {
          logger.warn("No twilioCallSid found in customParameters:", {
            customParameters,
          });
        }

        // Now fetch business configuration
        let businessConfig: BusinessConfig | null = null;
        if (businessId) {
          logger.info("Attempting to fetch business config for:", businessId);
          try {
            businessConfig = await getBusinessConfigById(businessId);
            logger.info("Business config fetch result:", {
              businessId,
              configFound: !!businessConfig,
              businessName: businessConfig?.businessName,
            });
          } catch (error) {
            logger.error("Error fetching business config:", {
              businessId,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
          }
        } else {
          logger.warn(
            "No businessId found in customParameters, using default configuration"
          );
        }

        // Use business config or defaults
        const voice = businessConfig?.voice || DEFAULT_VOICE;
        const temperature = businessConfig?.temperature || DEFAULT_TEMPERATURE;
        const systemMessage =
          businessConfig?.systemMessage || DEFAULT_SYSTEM_MESSAGE;
        const enableServerVAD = businessConfig?.enableServerVAD ?? true;
        const turnDetection = businessConfig?.turnDetection || "server_vad";

        logger.info("WebSocket connection initialized with config:", {
          businessId,
          businessName: businessConfig?.businessName,
          voice,
          temperature,
          enableServerVAD,
          turnDetection,
          systemMessageLength: systemMessage.length,
          businessConfigExists: !!businessConfig,
          businessConfigSystemMessage: businessConfig?.systemMessage
            ? "Present"
            : "Not present",
          businessConfigSystemMessageLength:
            businessConfig?.systemMessage?.length || 0,
          usingFallback: !businessConfig?.systemMessage,
        });

        // Store business config for session update (will be sent when session is created)
        logger.info("Business config ready for session update:", {
          businessId,
          businessName: businessConfig?.businessName,
          voice,
          temperature,
          enableServerVAD,
          turnDetection,
          systemMessageLength: systemMessage.length,
        });

        // Store business config for use in message handlers
        currentBusinessConfig = businessConfig;

        // Create call record with business context
        if (businessConfig) {
          await createCallRecord(
            businessConfig,
            twilioCallSid,
            callerNumber || undefined
          );

          // Start recording the call after a short delay to ensure call is established
          if (twilioCallSid) {
            setTimeout(async () => {
              await startCallRecording(twilioCallSid);
            }, 3000); // Wait 3 seconds for call to be fully established
          }
        }
      }
    };

    // Store the business config for use throughout the connection
    let currentBusinessConfig: BusinessConfig | null = null;

    // Connection state
    let streamSid: string | null = null;
    let latestMediaTimestamp = 0;
    let lastAssistantItem: string | null = null;
    let markQueue: string[] = [];
    let responseStartTimestampTwilio: number | null = null;

    // Call recording state
    let callId: string | null = null;
    let callStartTime: Date | null = null;

    // Create call record function
    const createCallRecord = async (
      businessConfig: BusinessConfig,
      twilioCallSid?: string,
      customerPhone?: string
    ) => {
      try {
        const call = await db.call.create({
          data: {
            businessId: businessConfig.businessId,
            callType: "PHONE",
            status: "IN_PROGRESS",
            customerPhone: customerPhone || "Unknown",
            twilioCallSid: twilioCallSid || null,
          },
        });
        callId = call.id;
        callStartTime = new Date();

        logger.info("Created call record:", {
          callId,
          businessId: businessConfig.businessId,
          businessName: businessConfig.businessName,
          twilioCallSid,
          customerPhone: customerPhone || "Unknown",
        });
        return call;
      } catch (error) {
        logger.error("Error creating call record", error);
        return null;
      }
    };

    // Start call recording function using Twilio API
    const startCallRecording = async (twilioCallSid: string) => {
      try {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Create a recording for the call
        const recording = await client.calls(twilioCallSid).recordings.create({
          // recordingChannels: "dual", // Records each party separately
          // recordingTrack: "both", // Records both inbound and outbound audio
          recordingStatusCallback: `${process.env.BASE_URL || "https://callplatterserver.onrender.com"}/api/webhooks/recording-status`,
          // recordingStatusCallbackEvent: ["in-progress", "completed"],
          // recordingStatusCallbackMethod: "POST"
        });

        logger.info("Started call recording via API:", {
          twilioCallSid,
          recordingSid: recording.sid,
          status: recording.status,
        });

        logger.info("Recording started successfully");

        return recording;
      } catch (error) {
        logger.error("Error starting call recording:", error);
        return null;
      }
    };

    // Function to finalize call record
    const finalizeCallRecord = async () => {
      if (!callId || !callStartTime) return;

      try {
        const duration = Math.floor(
          (Date.now() - callStartTime.getTime()) / 1000
        );

        await db.call.update({
          where: { id: callId },
          data: {
            status: "COMPLETED",
            duration: duration,
            summary: `Call with ${businessName || "business"} - Duration: ${duration}s`,
          },
        });

        logger.info("Finalized call record", {
          callId,
          duration,
        });
      } catch (error) {
        logger.error("Error finalizing call record", error);
      }
    };

    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) {
      logger.error("Missing OpenAI API key");
      ws.close();
      return;
    }

    logger.info("Using OpenAI API key:", {
      keyPrefix: OPENAI_API_KEY.substring(0, 7) + "...",
      keyLength: OPENAI_API_KEY.length,
    });

    const openAiWs = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      }
    );

    // Handle speech interruption
    const handleSpeechStartedEvent = () => {
      if (markQueue.length > 0 && responseStartTimestampTwilio !== null) {
        const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;

        if (lastAssistantItem) {
          const truncateEvent = {
            type: "conversation.item.truncate",
            item_id: lastAssistantItem,
            content_index: 0,
            audio_end_ms: elapsedTime,
          };
          openAiWs.send(JSON.stringify(truncateEvent));
        }

        ws.send(
          JSON.stringify({
            event: "clear",
            streamSid: streamSid,
          })
        );

        markQueue = [];
        lastAssistantItem = null;
        responseStartTimestampTwilio = null;
      }
    };

    // Send mark for response tracking
    const sendMark = () => {
      if (streamSid) {
        const markEvent = {
          event: "mark",
          streamSid: streamSid,
          mark: { name: "responsePart" },
        };
        ws.send(JSON.stringify(markEvent));
        markQueue.push("responsePart");
      }
    };

    // OpenAI WebSocket handlers
    openAiWs.on("open", () => {
      logger.info("Connected to OpenAI Realtime API");

      // Add a flag to track if session is configured
      let sessionConfigured = false;

      // Store reference for use in handleStartEvent
      (ws as any).openAiSessionConfigured = false;
      (ws as any).openAiWs = openAiWs;
    });

    openAiWs.on("message", (data) => {
      try {
        const response = JSON.parse(data.toString());

        // Check for errors
        if (response.type === "error") {
          logger.error("OpenAI ERROR:", response);
        }

        // Check session status
        if (
          response.type === "session.created" ||
          response.type === "session.updated"
        ) {
          logger.info("Session status:", response.type);

          // If session was just created, now send the session update with business config
          if (response.type === "session.created") {
            logger.info("Session created, updating with business config...");
            // Send session update immediately if we have business config
            if (currentBusinessConfig) {
              const voice = currentBusinessConfig.voice || DEFAULT_VOICE;
              const systemMessage =
                currentBusinessConfig.systemMessage || DEFAULT_SYSTEM_MESSAGE;
              const enableServerVAD =
                currentBusinessConfig.enableServerVAD ?? true;
              const turnDetection =
                currentBusinessConfig.turnDetection || "server_vad";

              // Fetch business memories and append to system message
              getBusinessMemories(currentBusinessConfig.businessId).then(businessMemories => {
                const fullSystemMessage = systemMessage + businessMemories;

                // Fix the session configuration - REMOVE "text" from output_modalities
                const sessionUpdate = {
                  type: "session.update",
                  session: {
                    type: "realtime",
                    output_modalities: ["audio"], // ← CRITICAL: Keep only audio for main session
                    audio: {
                      input: {
                        format: { type: "audio/pcmu" },
                        turn_detection: enableServerVAD
                          ? {
                              type: turnDetection,
                              threshold: 0.4,
                              prefix_padding_ms: 300,
                              silence_duration_ms: 800,
                            }
                          : null,
                      },
                      output: {
                        format: { type: "audio/pcmu" },
                        voice: voice,
                      },
                    },
                    instructions: fullSystemMessage,
                  },
                };

                openAiWs.send(JSON.stringify(sessionUpdate));
                logger.info("Session update sent (audio only)", {
                  voice,
                  turnDetection: enableServerVAD ? turnDetection : "disabled",
                });
              }).catch(error => {
                logger.error("Error fetching business memories for session update", error);
                // Fallback to system message without memories
                const sessionUpdate = {
                  type: "session.update",
                  session: {
                    type: "realtime",
                    output_modalities: ["audio"],
                    audio: {
                      input: {
                        format: { type: "audio/pcmu" },
                        turn_detection: enableServerVAD
                          ? {
                              type: turnDetection,
                              threshold: 0.4,
                              prefix_padding_ms: 300,
                              silence_duration_ms: 800,
                            }
                          : null,
                      },
                      output: {
                        format: { type: "audio/pcmu" },
                        voice: voice,
                      },
                    },
                    instructions: systemMessage,
                  },
                };
                openAiWs.send(JSON.stringify(sessionUpdate));
              });
            }
          }
        }

        // If session was updated, now send the first message
        if (
          response.type === "session.updated" &&
          currentBusinessConfig?.firstMessage
        ) {
          logger.info("Session updated, sending first message...");
          const firstMessage = currentBusinessConfig.firstMessage;
          
          setTimeout(() => {
            if (openAiWs.readyState === WebSocket.OPEN) {
              // Method 1: Add the first message as an assistant message
              const addFirstMessage = {
                type: "conversation.item.create",
                item: {
                  type: "message",
                  role: "assistant",
                  content: [
                    {
                      type: "text", // Changed from "output_text" to "text"
                      text: firstMessage,
                    },
                  ],
                },
              };
              openAiWs.send(JSON.stringify(addFirstMessage));
        
              // Then create a response to turn it into audio (without modalities parameter)
              const createResponse = {
                type: "response.create", // Removed the invalid response.modalities parameter
              };
              openAiWs.send(JSON.stringify(createResponse));
        
              logger.info("First message triggered:", { 
                firstMessage, 
                approach: "corrected_text_to_audio",
                messageLength: firstMessage.length 
              });
            }
          }, 500); // Keep the 1 second delay
        }

        if (LOG_EVENT_TYPES.includes(response.type)) {
          logger.info(`OpenAI event: ${response.type}`);
        }

        // Enhanced error logging
        if (response.type === "error") {
          logger.error("OpenAI Realtime API error:", {
            error: response.error,
            code: response.error?.code,
            message: response.error?.message,
            type: response.error?.type,
            param: response.error?.param,
            full_response: response,
          });
        }

        if (response.type === "response.output_audio.delta" && response.delta) {
          const audioDelta = {
            event: "media",
            streamSid: streamSid,
            media: { payload: response.delta },
          };
          ws.send(JSON.stringify(audioDelta));

          if (!responseStartTimestampTwilio) {
            responseStartTimestampTwilio = latestMediaTimestamp;
          }

          if (response.item_id) {
            lastAssistantItem = response.item_id;
          }

          sendMark();
        }

        if (response.type === "input_audio_buffer.speech_started") {
          handleSpeechStartedEvent();
        }
      } catch (error) {
        logger.error("Error processing OpenAI message:", error);
      }
    });

    // Handle Twilio messages
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.event) {
          case "start":
            // Handle start event to get businessId from customParameters
            await handleStartEvent(data);
            streamSid = data.start.streamSid;
            logger.info("Stream started:", {
              streamSid,
              customParameters: data.start.customParameters,
            });
            responseStartTimestampTwilio = null;
            latestMediaTimestamp = 0;
            break;
          case "media":
            latestMediaTimestamp = data.media.timestamp;
            if (openAiWs.readyState === WebSocket.OPEN) {
              const audioAppend = {
                type: "input_audio_buffer.append",
                audio: data.media.payload,
              };
              openAiWs.send(JSON.stringify(audioAppend));
            }
            break;
          case "mark":
            if (markQueue.length > 0) {
              markQueue.shift();
            }
            break;
          case "stop":
            logger.info("Stream stopped:", { streamSid });
            finalizeCallRecord();
            break;
        }
      } catch (error) {
        logger.error("Error parsing Twilio message:", error);
      }
    });

    // Cleanup on disconnect
    ws.on("close", () => {
      if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
      finalizeCallRecord();
      logger.info("Client disconnected");
    });

    openAiWs.on("close", (code, reason) => {
      logger.error("OpenAI WebSocket closed:", {
        code,
        reason: reason.toString(),
        timestamp: new Date().toISOString(),
      });
      finalizeCallRecord();
    });

    openAiWs.on("error", (error) => {
      logger.error("OpenAI WebSocket error:", error);
      logger.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      });
    });
  });

  return wss;
};

export default router;
