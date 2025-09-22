// routes/openaiRealtimeCall.ts
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { instructions } from "@/utils/instructions";
import twilio from "twilio";
import { lookupCallerContext } from "../services/callLookupService";

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
  memoriesInjected?: boolean;
}

// Interface for enhanced context (loaded asynchronously)
interface EnhancedContext {
  businessMemories: string;
  customerContext?: string;
  isExistingCustomer: boolean;
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

    if (aiConfig.firstMessage) {
      sessionInstructions.push(
        `\n\nIMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${aiConfig.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
      );
    }
    if (aiConfig.goodbyeMessage) {
      sessionInstructions.push(
        `\n\nWhen ending the call, use this goodbye message: "${aiConfig.goodbyeMessage}"`
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

// Function to fetch business memories and customer context (async)
async function getEnhancedContext(businessId: string, callerPhoneNumber?: string): Promise<EnhancedContext> {
  try {
    // Run both queries in parallel for speed
    const [memories, callContext] = await Promise.all([
      db.businessMemory.findMany({
        where: {
          businessId: businessId,
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      callerPhoneNumber ? lookupCallerContext(businessId, callerPhoneNumber).catch((error) => {
        logger.error("Error looking up customer context", { businessId, callerPhoneNumber, error });
        return { isExistingCustomer: false, contextInstructions: null, customer: null };
      }) : Promise.resolve({ isExistingCustomer: false, contextInstructions: null, customer: null })
    ]);

    let memoryContent = "";
    if (memories.length > 0) {
      memoryContent = memories
        .map((memory: { title: string; content: string }) => `${memory.title}: ${memory.content}`)
        .join("\n");
    }

    const businessMemories = memoryContent ? `\n\nBusiness Context & Memory:\n${memoryContent}` : "";
    const customerContext = (callContext.isExistingCustomer && callContext.contextInstructions) 
      ? `\n\n${callContext.contextInstructions}` 
      : "";

    logger.info("Enhanced context loaded", {
      businessId,
      callerPhoneNumber: callerPhoneNumber || "Unknown",
      isExistingCustomer: callContext.isExistingCustomer,
      hasBusinessMemories: memoryContent.length > 0,
      hasCustomerContext: customerContext.length > 0,
    });

    return {
      businessMemories: businessMemories + customerContext,
      customerContext: callContext.contextInstructions || undefined,
      isExistingCustomer: callContext.isExistingCustomer
    };
  } catch (error) {
    logger.error("Error fetching enhanced context", { businessId, error });
    return {
      businessMemories: "",
      isExistingCustomer: false
    };
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

    if (aiConfig.firstMessage) {
      sessionInstructions.push(
        `\n\nIMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${aiConfig.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
      );
    }
    if (aiConfig.goodbyeMessage) {
      sessionInstructions.push(
        `\n\nWhen ending the call, use this goodbye message: "${aiConfig.goodbyeMessage}"`
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

    const { constructWebSocketUrl } = await import("../utils/helpers.js");
    const websocketUrl = constructWebSocketUrl(req);

    logger.info("Constructed WebSocket URL:", {
      host: req.headers.host,
      forwardedHost: req.headers['x-forwarded-host'],
      forwardedProto: req.headers['x-forwarded-proto'],
      secure: req.secure,
      baseUrl: process.env.BASE_URL,
      businessId: businessConfig.businessId,
      websocketUrl,
    });

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

    // Connection state
    let streamSid: string | null = null;
    let latestMediaTimestamp = 0;
    let lastAssistantItem: string | null = null;
    let markQueue: string[] = [];
    let responseStartTimestampTwilio: number | null = null;
    let sessionConfigured = false;
    let enhancedContextLoaded = false;

    // Business context
    let businessId: string | null = null;
    let businessName: string | null = null;
    let callerNumber: string | null = null;
    let currentBusinessConfig: BusinessConfig | null = null;

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

        const recording = await client.calls(twilioCallSid).recordings.create({
          recordingStatusCallback: `${process.env.BASE_URL || "https://callplatterserver.onrender.com"}/api/webhooks/recording-status`,
        });

        logger.info("Started call recording via API:", {
          twilioCallSid,
          recordingSid: recording.sid,
          status: recording.status,
        });

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

        if (lastAssistantItem && elapsedTime > 0 && elapsedTime < 5000) {
          const truncateEvent = {
            type: "conversation.item.truncate",
            item_id: lastAssistantItem,
            content_index: 0,
            audio_end_ms: elapsedTime,
          };
          
          try {
            openAiWs.send(JSON.stringify(truncateEvent));
            logger.info("Sent truncate event", { 
              item_id: lastAssistantItem, 
              elapsedTime 
            });
          } catch (error) {
            logger.error("Error sending truncate event", error);
          }
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

    // Configure initial session immediately when OpenAI WebSocket is ready
    const configureInitialSession = async () => {
      if (sessionConfigured || !currentBusinessConfig || openAiWs.readyState !== WebSocket.OPEN) {
        return;
      }

      sessionConfigured = true;
      
      const voice = currentBusinessConfig.voice || DEFAULT_VOICE;
      const enableServerVAD = currentBusinessConfig.enableServerVAD ?? true;
      const turnDetection = currentBusinessConfig.turnDetection || "server_vad";

      // Create minimal instructions for immediate response
      // Include business name since we already have it without DB delay
      let minimalInstructions;
      
      if (currentBusinessConfig.firstMessage) {
        minimalInstructions = [
          "You are a voice AI receptionist. Speak naturally and conversationally.",
          "Keep responses brief (1-2 sentences) but don't sound robotic.",
          "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
          `IMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${currentBusinessConfig.firstMessage}". Do not use any other greeting.`
        ].join("\n");
      } else {
        // Fallback greeting with business name
        minimalInstructions = [
          "You are a voice AI receptionist. Speak naturally and conversationally.",
          "Keep responses brief (1-2 sentences) but don't sound robotic.",
          "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
          `IMPORTANT: When the call starts, greet the caller by saying "Hello, thank you for calling ${currentBusinessConfig.businessName}. How can I help you today?"`
        ].join("\n");
      }

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
          instructions: minimalInstructions,
        },
      };

      openAiWs.send(JSON.stringify(sessionUpdate));
      logger.info("Initial session configured immediately", {
        businessId: currentBusinessConfig.businessId,
        businessName: currentBusinessConfig.businessName,
        voice,
        hasFirstMessage: !!currentBusinessConfig.firstMessage,
        instructionsLength: minimalInstructions.length,
      });

      // Load enhanced context asynchronously after initial session is configured
      if (!enhancedContextLoaded) {
        enhancedContextLoaded = true;
        loadEnhancedContextAsync();
      }
    };

    // Load enhanced context and update session asynchronously
    const loadEnhancedContextAsync = async () => {
      if (!currentBusinessConfig) return;

      try {
        logger.info("Loading enhanced context asynchronously", {
          businessId: currentBusinessConfig.businessId,
          callerNumber: callerNumber || "Unknown",
        });

        const enhancedContext = await getEnhancedContext(
          currentBusinessConfig.businessId, 
          callerNumber || undefined
        );

        // Update session with full instructions including business context
        if (openAiWs.readyState === WebSocket.OPEN && enhancedContext.businessMemories) {
          const fullInstructions = currentBusinessConfig.systemMessage + enhancedContext.businessMemories;

          const sessionUpdate = {
            type: "session.update",
            session: {
              type: "realtime",
              output_modalities: ["audio"],
              audio: {
                input: {
                  format: { type: "audio/pcmu" },
                  turn_detection: currentBusinessConfig.enableServerVAD
                    ? {
                        type: currentBusinessConfig.turnDetection,
                        threshold: 0.4,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 800,
                      }
                    : null,
                },
                output: {
                  format: { type: "audio/pcmu" },
                  voice: currentBusinessConfig.voice,
                },
              },
              instructions: fullInstructions,
            },
          };

          openAiWs.send(JSON.stringify(sessionUpdate));
          logger.info("Enhanced context injected asynchronously", {
            businessId: currentBusinessConfig.businessId,
            isExistingCustomer: enhancedContext.isExistingCustomer,
            businessMemoriesLength: enhancedContext.businessMemories.length,
            fullInstructionsLength: fullInstructions.length,
          });
        }
      } catch (error) {
        logger.error("Error loading enhanced context asynchronously", {
          businessId: currentBusinessConfig?.businessId,
          error,
        });
      }
    };

    // Handle Twilio start event to extract business parameters
    const handleStartEvent = async (data: { event: string; start?: { customParameters?: Record<string, string>; streamSid?: string } }) => {
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
          streamSid: data.start?.streamSid,
        });

        // Fetch business configuration quickly (single DB query)
        if (businessId) {
          try {
            currentBusinessConfig = await getBusinessConfigById(businessId);
            logger.info("Business config loaded for immediate session setup:", {
              businessId,
              configFound: !!currentBusinessConfig,
              businessName: currentBusinessConfig?.businessName,
            });

            // Configure session immediately if OpenAI WebSocket is ready
            if (openAiWs.readyState === WebSocket.OPEN) {
              await configureInitialSession();
            }

            // Create call record and start recording
            if (currentBusinessConfig) {
              await createCallRecord(
                currentBusinessConfig,
                twilioCallSid || undefined,
                callerNumber || undefined
              );

              if (twilioCallSid) {
                setTimeout(async () => {
                  await startCallRecording(twilioCallSid);
                }, 3000);
              }
            }
          } catch (error) {
            logger.error("Error fetching business config in start event:", {
              businessId,
              error,
            });
          }
        }
      }
    };

    // OpenAI WebSocket handlers
    openAiWs.on("open", async () => {
      logger.info("Connected to OpenAI Realtime API");
      
      // Configure session immediately if we have business config
      if (currentBusinessConfig && !sessionConfigured) {
        await configureInitialSession();
      }
    });

    openAiWs.on("message", (data) => {
      try {
        const response = JSON.parse(data.toString());

        if (response.type === "error") {
          logger.error("OpenAI ERROR:", response);
        }

        if (response.type === "session.created" || response.type === "session.updated") {
          logger.info("Session status:", response.type);
        }

        if (LOG_EVENT_TYPES.includes(response.type)) {
          logger.info(`OpenAI event: ${response.type}`);
        }

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
        const data = JSON.parse(message.toString()) as { event: string; start?: { streamSid?: string; customParameters?: Record<string, string> }; media?: { timestamp: number; payload: string }; streamSid?: string };

        switch (data.event) {
          case "start":
            await handleStartEvent(data);
            streamSid = data.start?.streamSid || null;
            logger.info("Stream started:", {
              streamSid,
            });
            responseStartTimestampTwilio = null;
            latestMediaTimestamp = 0;
            break;
          case "media":
            if (data.media) {
              latestMediaTimestamp = data.media.timestamp;
              if (openAiWs.readyState === WebSocket.OPEN) {
                const audioAppend = {
                  type: "input_audio_buffer.append",
                  audio: data.media.payload,
                };
                openAiWs.send(JSON.stringify(audioAppend));
              }
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
        code: (error as Error & { code?: string }).code,
      });
    });
  });

  return wss;
};

export default router;