// routes/openaiRealtimeCall.ts
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { instructions } from "@/utils/instructions";
import twilio from "twilio";
import { lookupCallerContext } from "../services/callLookupService";
import { getAccentInstructions } from "../utils/accentInstructions";

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
  accent?: string;
  temperature: number;
  systemMessage: string;
  firstMessage?: string;
  goodbyeMessage?: string;
  enableServerVAD: boolean;
  turnDetection: string;
  memoriesInjected?: boolean; // Track if memories have been injected to prevent duplicates
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

    // Add accent instructions if accent is specified - PUT THIS FIRST FOR MAXIMUM IMPACT
    if (aiConfig.accent) {
      const accentInstructions = getAccentInstructions(aiConfig.accent);
      // Insert accent instructions at the beginning for maximum impact
      sessionInstructions.unshift(accentInstructions);
      logger.info("Added accent instructions to session", {
        businessId: business.id,
        accent: aiConfig.accent,
        instructionsLength: accentInstructions.length
      });
    }

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

    // BusinessMemory will be handled separately in the session update
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

    const finalSystemMessage = sessionInstructions.join("\n");
    logger.info("Final system message constructed (getBusinessConfig)", {
      businessId: business.id,
      accent: aiConfig.accent,
      systemMessageLength: finalSystemMessage.length,
      hasAccentInstructions: finalSystemMessage.includes("Accent/Affect:")
    });

    return {
      businessId: business.id,
      businessName: business.name,
      voice: aiConfig.voice || DEFAULT_VOICE,
      accent: aiConfig.accent || undefined,
      temperature: aiConfig.temperature || DEFAULT_TEMPERATURE,
      systemMessage: finalSystemMessage,
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

// Function to fetch business memories and customer context
async function getBusinessMemories(businessId: string, callerPhoneNumber?: string): Promise<string> {
  try {
    const memories = await db.businessMemory.findMany({
      where: {
        businessId: businessId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    let memoryContent = "";
    if (memories.length > 0) {
      memoryContent = memories
        .map((memory: { title: string; content: string }) => `${memory.title}: ${memory.content}`)
        .join("\n");
    }

    // Add customer context if caller phone number is provided
    let customerContext = "";
    if (callerPhoneNumber) {
      try {
        logger.info("Looking up customer context for caller", { businessId, callerPhoneNumber });
        const callContext = await lookupCallerContext(businessId, callerPhoneNumber);
        
        if (callContext.isExistingCustomer && callContext.contextInstructions) {
          customerContext = `\n\n${callContext.contextInstructions}`;
          logger.info("Customer context found and added to instructions", {
            businessId,
            callerPhoneNumber,
            customerName: callContext.customer?.name,
          });
        } else {
          logger.info("No customer context found - new customer", { businessId, callerPhoneNumber });
        }
      } catch (error) {
        logger.error("Error looking up customer context", { businessId, callerPhoneNumber, error });
        // Continue without customer context if lookup fails
      }
    }

    const businessMemories = memoryContent ? `\n\nBusiness Context & Memory:\n${memoryContent}` : "";
    return businessMemories + customerContext;
  } catch (error) {
    logger.error("Error fetching business memories", { businessId, error });
    return "";
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

    // Add accent instructions if accent is specified - PUT THIS FIRST FOR MAXIMUM IMPACT
    if (aiConfig.accent) {
      const accentInstructions = getAccentInstructions(aiConfig.accent);
      // Insert accent instructions at the beginning for maximum impact
      sessionInstructions.unshift(accentInstructions);
      logger.info("Added accent instructions to session (getBusinessConfigById)", {
        businessId: business.id,
        accent: aiConfig.accent,
        instructionsLength: accentInstructions.length
      });
    }

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

    // BusinessMemory will be handled separately in the session update
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

    const finalSystemMessage = sessionInstructions.join("\n");
    logger.info("Final system message constructed", {
      businessId: business.id,
      accent: aiConfig.accent,
      systemMessageLength: finalSystemMessage.length,
      hasAccentInstructions: finalSystemMessage.includes("Accent/Affect:")
    });

    return {
      businessId: business.id,
      businessName: business.name,
      voice: aiConfig.voice || DEFAULT_VOICE,
      accent: aiConfig.accent || undefined,
      temperature: aiConfig.temperature || DEFAULT_TEMPERATURE,
      systemMessage: finalSystemMessage,
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

    // Use the improved WebSocket URL construction
    const { constructWebSocketUrl } = await import("../utils/helpers.js");
    const websocketUrl = constructWebSocketUrl(req);

    // Log the constructed URL for debugging
    logger.info("Constructed WebSocket URL:", {
      host: req.headers.host,
      forwardedHost: req.headers['x-forwarded-host'],
      forwardedProto: req.headers['x-forwarded-proto'],
      secure: req.secure,
      baseUrl: process.env.BASE_URL,
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
    const handleStartEvent = async (data: { event: string; start?: { customParameters?: Record<string, string>; streamSid?: string } }) => {
      if (data.event === "start") {
        const customParameters = data.start?.customParameters || {};
        businessId = customParameters.businessId || null;
        businessName = customParameters.businessName || null;
        const twilioCallSid = customParameters.twilioCallSid || null;
        callerNumber = customParameters.callerNumber || null;

        // Store the Twilio Call SID for later use (used in createCallRecord)

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

        // Configure session if not already configured and we have business config
        logger.info("Checking session configuration conditions:", {
          hasBusinessConfig: !!businessConfig,
          sessionConfigured,
          openAiWsReady: openAiWs.readyState === WebSocket.OPEN,
          openAiWsState: openAiWs.readyState
        });
        
        if (businessConfig && !sessionConfigured && openAiWs.readyState === WebSocket.OPEN) {
          logger.info("Starting session configuration in handleStartEvent");
          // Set sessionConfigured immediately to prevent race conditions with fallback
          sessionConfigured = true;
          const voice = businessConfig.voice || DEFAULT_VOICE;
          const systemMessage = businessConfig.systemMessage || DEFAULT_SYSTEM_MESSAGE;
          const enableServerVAD = businessConfig.enableServerVAD ?? true;
          const turnDetection = businessConfig.turnDetection || "server_vad";

          // For session configuration, don't include business memories if there's a first message
          // This prevents the AI from being confused by business context when delivering the first message
          const shouldIncludeMemories = !businessConfig.firstMessage;
          
          logger.info("Session configuration path decision:", {
            hasFirstMessage: !!businessConfig.firstMessage,
            shouldIncludeMemories,
            firstMessage: businessConfig.firstMessage
          });
          
          if (shouldIncludeMemories) {
            // Fetch business memories and customer context, then append to system message
            getBusinessMemories(businessConfig.businessId, callerNumber || undefined)
              .then((businessMemories) => {
                const fullSystemMessage = businessConfig.systemMessage + businessMemories;

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
                              threshold: 0.5,
                              prefix_padding_ms: 200,
                              silence_duration_ms: 1200,
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
                sessionConfigured = true;
                logger.info("Session configured after start event with business memories", {
                  voice,
                  turnDetection: enableServerVAD ? turnDetection : "disabled",
                });
              })
              .catch((error) => {
                logger.error("Error configuring session after start event", error);
                // Retry session configuration once after a short delay
                setTimeout(() => {
                  if (openAiWs.readyState === WebSocket.OPEN && !sessionConfigured) {
                    logger.info("Retrying session configuration after error");
                    const retrySessionUpdate = {
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
                    openAiWs.send(JSON.stringify(retrySessionUpdate));
                    sessionConfigured = true;
                    logger.info("Retry session configuration sent");
                  }
                }, 1000);
              });
          } else {
            // Check if this is an existing customer to determine the appropriate first message approach
            getBusinessMemories(businessConfig.businessId, callerNumber || undefined)
              .then((businessMemories) => {
                // Check if customer context is present (existing customer)
                const hasCustomerContext = businessMemories.includes("CUSTOMER CONTEXT:");
                
                let minimalInstructions: string;
                
                if (hasCustomerContext) {
                  // For existing customers, use customer context instructions for personalized greeting
                  const accentInstructions = businessConfig.accent ? getAccentInstructions(businessConfig.accent) : "";
                  minimalInstructions = [
                    accentInstructions, // Add accent instructions first
                    "You are a voice AI receptionist. Speak naturally and conversationally.",
                    "Keep responses brief (1-2 sentences) but don't sound robotic.",
                    "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
                    "IMPORTANT: When the call starts, follow the customer context instructions below to greet the caller personally. Do not use any other greeting or start collecting information until after you've delivered the personalized greeting.",
                    "",
                    businessMemories // This includes the customer context with personalized greeting instructions
                  ].filter(Boolean).join("\n");
                  
                  logger.info("Using personalized greeting for existing customer (start event)", {
                    businessId: businessConfig.businessId,
                    callerNumber: callerNumber || "Unknown"
                  });
                } else {
                  // For new customers, use the business first message
                  const accentInstructions = businessConfig.accent ? getAccentInstructions(businessConfig.accent) : "";
                  minimalInstructions = [
                    accentInstructions, // Add accent instructions first
                    "You are a voice AI receptionist. Speak naturally and conversationally.",
                    "Keep responses brief (1-2 sentences) but don't sound robotic.",
                    "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
                    `IMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${businessConfig.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
                  ].filter(Boolean).join("\n");
                  
                  logger.info("Using business first message for new customer (start event)", {
                    businessId: businessConfig.businessId,
                    callerNumber: callerNumber || "Unknown"
                  });
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
                              threshold: 0.5,
                              prefix_padding_ms: 200,
                              silence_duration_ms: 1200,
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
                sessionConfigured = true;
                logger.info("Session configured after start event with appropriate greeting instructions", {
                  voice,
                  turnDetection: enableServerVAD ? turnDetection : "disabled",
                  hasCustomerContext,
                  greetingType: hasCustomerContext ? "personalized" : "business_first_message"
                });
                
                // Trigger AI to start speaking immediately after session configuration
                triggerAI("start_event_with_first_message");
              })
              .catch((error) => {
                logger.error("Error determining greeting approach (s  tart event)", error);
                // Retry session configuration once after a short delay
                setTimeout(() => {
                  if (openAiWs.readyState === WebSocket.OPEN && !sessionConfigured) {
                    logger.info("Retrying session configuration after greeting approach error");
                    const minimalInstructions = [
                      "You are a voice AI receptionist. Speak naturally and conversationally.",
                      "Keep responses brief (1-2 sentences) but don't sound robotic.",
                      "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
                      `IMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${businessConfig.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
                    ].join("\n");

                    const retrySessionUpdate = {
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

                    openAiWs.send(JSON.stringify(retrySessionUpdate));
                    sessionConfigured = true;
                    logger.info("Retry session configuration sent (greeting approach)");
                    
                    // Trigger AI to start speaking for retry configuration
                    triggerAI("retry_configuration");
                  }
                }, 1000);
              });
          }
        } else {
          logger.warn("Session configuration skipped:", {
            hasBusinessConfig: !!businessConfig,
            sessionConfigured,
            openAiWsReady: openAiWs.readyState === WebSocket.OPEN,
            openAiWsState: openAiWs.readyState
          });
        }

        // Create call record with business context
        if (businessConfig) {
          await createCallRecord(
            businessConfig,
            twilioCallSid || undefined,
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
    let sessionConfigured = false;
    let aiTriggered = false; // Prevent multiple AI triggers

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

        // Only attempt truncation if we have a valid elapsed time and it's reasonable
        if (lastAssistantItem && elapsedTime > 0 && elapsedTime < 5000) { // Max 5 seconds
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

    // Centralized function to trigger AI (prevents overlaps)
    const triggerAI = (context: string) => {
      if (aiTriggered || !openAiWs || openAiWs.readyState !== WebSocket.OPEN) {
        logger.info("AI trigger skipped", { 
          context, 
          aiTriggered, 
          openAiWsReady: openAiWs?.readyState === WebSocket.OPEN 
        });
        return;
      }

      aiTriggered = true;
      
      // Only trigger AI if we have a first message or customer context
      // Don't trigger for business memories configuration
      if (context === "business_memories_configuration") {
        logger.info("Skipping AI trigger for business memories configuration", { context });
        return;
      }
      
      const conversationItem = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Start the call"
            }
          ]
        }
      };
      
      const responseCreate = {
        type: "response.create"
      };
      
      openAiWs.send(JSON.stringify(conversationItem));
      openAiWs.send(JSON.stringify(responseCreate));
      
      logger.info("AI triggered successfully", {
        context,
        businessId: currentBusinessConfig?.businessId
      });
    };

    // Function to configure session when OpenAI WebSocket becomes ready
    const configureSessionNow = () => {
      if (!currentBusinessConfig || sessionConfigured || openAiWs.readyState !== WebSocket.OPEN) {
        logger.info("Session configuration skipped - conditions not met", {
          hasBusinessConfig: !!currentBusinessConfig,
          sessionConfigured,
          openAiWsReady: openAiWs.readyState === WebSocket.OPEN
        });
        return;
      }

      logger.info("Configuring session now with business config (fallback)");
      // Set sessionConfigured immediately to prevent race conditions
      sessionConfigured = true;
      
      const voice = currentBusinessConfig.voice || DEFAULT_VOICE;
      const enableServerVAD = currentBusinessConfig.enableServerVAD ?? true;
      const turnDetection = currentBusinessConfig.turnDetection || "server_vad";

      const shouldIncludeMemories = !currentBusinessConfig.firstMessage;
      
      if (shouldIncludeMemories) {
        // Fetch business memories and customer context
        getBusinessMemories(currentBusinessConfig.businessId, callerNumber || undefined)
          .then((businessMemories) => {
            const fullSystemMessage = (currentBusinessConfig?.systemMessage || DEFAULT_SYSTEM_MESSAGE) + businessMemories;
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
                instructions: fullSystemMessage,
              },
            };
            openAiWs.send(JSON.stringify(sessionUpdate));
            logger.info("Session configured with business memories (fallback)");
            
            // Trigger AI to start speaking for business memories configuration
            triggerAI("business_memories_configuration");
          })
          .catch((error) => {
            logger.error("Error configuring session (fallback)", error);
          });
      } else {
        // Use first message approach
        getBusinessMemories(currentBusinessConfig.businessId, callerNumber || undefined)
          .then((businessMemories) => {
            const hasCustomerContext = businessMemories.includes("CUSTOMER CONTEXT:");
            
            let minimalInstructions: string;
            
            const accentInstructions = currentBusinessConfig?.accent ? getAccentInstructions(currentBusinessConfig.accent) : "";
            
            if (hasCustomerContext) {
              minimalInstructions = [
                accentInstructions, // Add accent instructions first
                "You are a voice AI receptionist. Speak naturally and conversationally.",
                "Keep responses brief (1-2 sentences) but don't sound robotic.",
                "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
                "IMPORTANT: When the call starts, follow the customer context instructions below to greet the caller personally. Do not use any other greeting or start collecting information until after you've delivered the personalized greeting.",
                "",
                businessMemories
              ].filter(Boolean).join("\n");
            } else {
              minimalInstructions = [
                accentInstructions, // Add accent instructions first
                "You are a voice AI receptionist. Speak naturally and conversationally.",
                "Keep responses brief (1-2 sentences) but don't sound robotic.",
                "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
                `IMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${currentBusinessConfig?.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
              ].filter(Boolean).join("\n");
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
            logger.info("Session configured with first message approach (fallback)");
            
            // Trigger AI to start speaking for fallback configuration
            triggerAI("fallback_configuration");
          })
          .catch((error) => {
            logger.error("Error configuring session (fallback)", error);
          });
      }
    };

    // OpenAI WebSocket handlers
    openAiWs.on("open", () => {
      logger.info("Connected to OpenAI Realtime API");

      // Store reference for use in handleStartEvent
      (ws as WebSocket & { openAiSessionConfigured?: boolean; openAiWs?: WebSocket }).openAiSessionConfigured = false;
      (ws as WebSocket & { openAiSessionConfigured?: boolean; openAiWs?: WebSocket }).openAiWs = openAiWs;
      
      // Only configure session if we have business config and session wasn't configured yet
      // This prevents overlap with handleStartEvent
      if (currentBusinessConfig && !sessionConfigured) {
        logger.info("OpenAI WebSocket ready - configuring session now (fallback)");
        configureSessionNow();
      } else {
        logger.info("OpenAI WebSocket connected - session configuration status:", {
          hasBusinessConfig: !!currentBusinessConfig,
          sessionConfigured,
          willConfigureInStartEvent: !sessionConfigured
        });
      }
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
        }

        // If session was updated and we have a first message, the AI should deliver it automatically
        // from the minimal instructions we provided. We may need to inject additional business memories after.
        if (
          response.type === "session.updated" &&
          currentBusinessConfig?.firstMessage &&
          !currentBusinessConfig.memoriesInjected // Only inject once
        ) {
          logger.info("Session updated, AI will deliver first message from instructions");

          // Mark that we're about to inject memories to prevent duplicate injections
          currentBusinessConfig.memoriesInjected = true;

          // After a delay, check if we need to inject additional business memories
          setTimeout(() => {
            if (openAiWs.readyState === WebSocket.OPEN && currentBusinessConfig) {
              const businessConfig = currentBusinessConfig; // Store reference to avoid null checks
              getBusinessMemories(businessConfig.businessId, callerNumber || undefined)
                .then((businessMemories) => {
                  // Check if customer context is present (existing customer)
                  const hasCustomerContext = businessMemories.includes("CUSTOMER CONTEXT:");
                  
                  if (hasCustomerContext) {
                    // For existing customers, memories are already included in initial instructions
                    // No need to inject additional memories
                    logger.info("Existing customer - memories already included in initial instructions", {
                      businessId: businessConfig.businessId,
                      callerNumber: callerNumber || "Unknown"
                    });
                    
                    // For existing customers, the AI should start speaking automatically
                    // based on the personalized instructions already configured
                    logger.info("AI should start speaking automatically with personalized greeting");
                  } else if (businessMemories) {
                    // For new customers, inject business memories for future responses
                    const sessionUpdate = {
                      type: "session.update",
                      session: {
                        type: "realtime",
                        output_modalities: ["audio"],
                        audio: {
                          input: {
                            format: { type: "audio/pcmu" },
                            turn_detection: businessConfig.enableServerVAD
                              ? {
                                  type: businessConfig.turnDetection,
                                  threshold: 0.4,
                                  prefix_padding_ms: 300,
                                  silence_duration_ms: 800,
                                }
                              : null,
                          },
                          output: {
                            format: { type: "audio/pcmu" },
                            voice: businessConfig.voice,
                          },
                        },
                        instructions: businessConfig.systemMessage + businessMemories,
                      },
                    };

                    openAiWs.send(JSON.stringify(sessionUpdate));
                    logger.info("Business memories injected once after first message for new customer", {
                      businessId: businessConfig.businessId,
                      memoriesLength: businessMemories.length,
                    });
                  }
                })
                .catch((error) => {
                  logger.error("Error checking business memories after first message", error);
                });
            }
          }, 1000); // Wait 1 second for first message to be delivered
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

          // Handle specific error types
          if (response.error?.code === "cannot_update_voice") {
            logger.warn("Voice update error - session may already be configured", {
              sessionConfigured,
              businessId: currentBusinessConfig?.businessId,
            });
          } else if (response.error?.code === "invalid_value" && 
                     response.error?.message?.includes("Audio content")) {
            logger.warn("Audio truncation error - skipping truncation", {
              message: response.error.message,
            });
          }
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
            // Handle start event to get businessId from customParameters
            await handleStartEvent(data);
            streamSid = data.start?.streamSid || null;
            logger.info("Stream started:", {
              streamSid,
              customParameters: data.start?.customParameters,
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
