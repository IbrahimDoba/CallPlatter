// routes/elevenLabsAgent.ts
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import {
  buildBasePromptSections,
  buildSystemPrompt,
  type PromptSections,
} from "@/utils/instructions";
import { registerActiveCall, unregisterActiveCall } from "./webhooks";
import { subscriptionValidationService } from "../services/subscriptionValidationService";

const router: Router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// Helper to get signed WebSocket URL
async function getSignedUrl(agentId: string): Promise<string> {
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/convai/conversation/get_signed_url?agent_id=${agentId}`,
    {
      method: "GET",
      headers: { "xi-api-key": ELEVENLABS_API_KEY || "" },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get signed URL: ${response.statusText}`);
  }

  const data = await response.json();
  return data.signed_url;
}

// Build system message from ElevenLabs agent config with business memories
// Uses structured 6 building blocks approach (Personality, Environment, Tone, Goal, Guardrails, Tools)
function buildSystemMessage(
  elevenLabsAgent: any,
  businessMemories: any[]
): string {
  // Get base prompt sections following ElevenLabs prompting guide structure
  const baseSections = buildBasePromptSections();

  // Customize sections based on business configuration
  const customSections: Partial<PromptSections> = {};

  // Add business memory context to Environment section
  if (businessMemories && businessMemories.length > 0) {
    const businessKnowledge = `\n\n## Business Knowledge Base
You have access to the following important information about this business:

${businessMemories.map((memory) => `• ${memory.title}: ${memory.content}`).join("\n")}

Use this information to answer customer questions accurately. If asked about something in your knowledge base, provide the information confidently.`;

    customSections.environment = baseSections.environment + businessKnowledge;
  }

  // Add custom system prompt if provided (can override or extend any section)
  const additionalContent: string[] = [];

  if (elevenLabsAgent?.systemPrompt) {
    additionalContent.push(
      `\n\n## Additional Instructions\n${elevenLabsAgent.systemPrompt}`
    );
  }

  // Add customer information collection to Goal section
  const questionsToAsk = [];
  if (elevenLabsAgent?.askForName) questionsToAsk.push("name");
  if (elevenLabsAgent?.askForPhone) questionsToAsk.push("phone number");
  if (elevenLabsAgent?.askForCompany) questionsToAsk.push("company name");
  if (elevenLabsAgent?.askForAddress) questionsToAsk.push("address");

  if (questionsToAsk.length > 0) {
    const infoCollectionNote = `\n\n**Customer Information Collection:** Collect customer information (${questionsToAsk.join(", ")}) ONLY AFTER you have gathered all the necessary business information (date, time, quantity, service details, etc.). Focus on their request first, then get their contact details at the end.`;

    // Update Goal section with customer info collection
    customSections.goal = baseSections.goal + infoCollectionNote;

    // Add caller ID instructions for phone number collection
    if (elevenLabsAgent?.askForPhone) {
      customSections.goal += `\n\n**Phone Number Collection:** Use caller ID when available. Ask "Is this the best number to reach you at?" instead of "What's your phone number?". This is more natural and saves time.`;
    }
  }

  // Add first message and goodbye message instructions
  if (elevenLabsAgent?.firstMessage) {
    additionalContent.push(
      `\n\n## First Message\nWhen the call starts, greet the caller with: "${elevenLabsAgent.firstMessage}"`
    );
  }

  if (elevenLabsAgent?.goodbyeMessage) {
    // Update Tools section to include specific goodbye message
    // CRITICAL: Must use exact string matching for ElevenLabs tests
    customSections.tools = baseSections.tools.replace(
      'Say your goodbye message (e.g., "Thank you for calling, have a great day!")',
      `Say this exact phrase with no changes: ${elevenLabsAgent.goodbyeMessage}`
    );

    // Also add a CRITICAL reminder about exact matching
    customSections.tools += `\n\n**CRITICAL: Your goodbye message must be exactly "${elevenLabsAgent.goodbyeMessage}" - include all punctuation exactly as shown.**`;
  }

  // Merge custom sections with base sections
  const finalSections: PromptSections = {
    personality: customSections.personality || baseSections.personality,
    environment: customSections.environment || baseSections.environment,
    tone: customSections.tone || baseSections.tone,
    goal: customSections.goal || baseSections.goal,
    guardrails: customSections.guardrails || baseSections.guardrails,
    tools: customSections.tools || baseSections.tools,
  };

  // Build the complete system prompt
  return buildSystemPrompt(finalSections, additionalContent);
}

// Get or create business config with business memories
async function getBusinessConfig(phoneNumber: string) {
  const business = await db.business.findFirst({
    where: { phoneNumber },
    include: {
      elevenLabsAgent: true, // Include ElevenLabs agent to get all configuration
      businessMemories: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!business) return null;

  const elevenLabsAgent = business.elevenLabsAgent;

  // Get the voiceId from ElevenLabsAgent, fallback to "alloy" if not set
  const voiceId = elevenLabsAgent?.voiceId || "alloy";

  logger.info("🎤 Voice configuration", {
    businessId: business.id,
    elevenLabsVoiceId: elevenLabsAgent?.voiceId,
    finalVoiceId: voiceId,
    hasElevenLabsAgent: !!elevenLabsAgent,
  });

  return {
    businessId: business.id,
    businessName: business.name,
    temperature: elevenLabsAgent?.temperature || 0.7,
    systemMessage: buildSystemMessage(
      elevenLabsAgent,
      business.businessMemories
    ),
    firstMessage:
      elevenLabsAgent?.firstMessage || "Hello! How can I assist you today?",
    voiceId: voiceId, // Use the correct voiceId from ElevenLabsAgent
    transferEnabled: elevenLabsAgent?.transferEnabled || false,
    transferPhoneNumber: elevenLabsAgent?.transferPhoneNumber || null,
  };
}

// Generate a hash of the configuration to detect changes
function generateConfigHash(
  systemMessage: string,
  firstMessage: string,
  temperature: number,
  transferEnabled?: boolean,
  transferPhoneNumber?: string | null
): string {
  const crypto = require("crypto");
  const configString = `${systemMessage}|${firstMessage}|${temperature}|${transferEnabled}|${transferPhoneNumber || ""}`;
  return crypto.createHash("md5").update(configString).digest("hex");
}

// Build ONLY user-created webhook tools from database
// Built-in tools (end_call, transfer) are added separately to avoid conflicts
async function buildUserTools(businessId: string): Promise<any[]> {
  const tools: any[] = [];

  try {
    const userTools = await db.tool.findMany({
      where: {
        businessId,
        isActive: true,
      },
    });

    // Add each user tool to the tools array
    for (const tool of userTools) {
      // The config field contains the full ElevenLabs tool configuration
      const toolConfig = tool.config as any;
      tools.push(toolConfig);
    }

    logger.info(`Built user tools array`, {
      businessId,
      userTools: userTools.length,
    });
  } catch (error) {
    logger.error("Error fetching user tools", { businessId, error });
  }

  return tools;
}

// Build built-in tools separately for better control
// These work independently of user tools
function buildBuiltInTools(transferEnabled: boolean): any[] {
  const tools: any[] = [];

  // CRITICAL: end_call tool with explicit instructions
  tools.push({
    type: "client",
    name: "end_call",
    description:
      "IMMEDIATELY end the phone call after saying your goodbye message. You MUST call this tool in these situations: 1) After you say goodbye to the customer, 2) Customer says goodbye/bye/thank you and hangs up, 3) Conversation is complete and all questions answered, 4) Customer explicitly asks to end the call. DO NOT wait for customer response after calling this tool - the call will end automatically.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    expects_response: true,
  });

  // Transfer tool (if enabled)
  if (transferEnabled) {
    tools.push({
      type: "client",
      name: "transfer_to_human",
      description:
        "Transfer call to a human agent when the caller requests to speak with a human, has a complex issue, or is frustrated",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      expects_response: true,
    });
  }

  logger.info(`Built-in tools created`, {
    count: tools.length,
    tools: tools.map((t) => t.name),
  });

  return tools;
}

// Update existing agent's full conversation configuration
async function updateAgentFullConfig(
  agentId: string,
  systemMessage: string,
  firstMessage: string,
  temperature: number,
  voiceId: string,
  transferEnabled: boolean,
  transferPhoneNumber: string | null,
  businessId: string,
  lastConfigHash?: string,
  forceUpdate = false
): Promise<boolean> {
  try {
    const currentHash = generateConfigHash(
      systemMessage,
      firstMessage,
      temperature,
      transferEnabled,
      transferPhoneNumber
    );

    // Skip update if config hasn't changed (unless forced)
    if (!forceUpdate && lastConfigHash && lastConfigHash === currentHash) {
      logger.info("Agent config unchanged, skipping update", { agentId });
      return true;
    }

    logger.info("🔄 Updating full agent configuration", {
      agentId,
      voiceId,
      businessId,
      transferEnabled,
      forceUpdate,
    });

    // Build tools: built-in tools FIRST, then user tools
    // This ensures built-in tools always work, even if user tools fail to load
    const builtInTools = buildBuiltInTools(transferEnabled);
    const userTools = await buildUserTools(businessId);
    const tools = [...builtInTools, ...userTools];

    logger.info("🛠️ Tools built for agent update", {
      agentId,
      builtInToolCount: builtInTools.length,
      userToolCount: userTools.length,
      totalToolCount: tools.length,
      toolNames: tools.map((t: any) => t.name),
      hasEndCallTool: tools.some((t: any) => t.name === "end_call"),
    });

    // CRITICAL DEBUG: Log the actual end_call tool configuration
    const endCallTool = tools.find((t: any) => t.name === "end_call");
    if (endCallTool) {
      logger.info("🔍 DEBUG: end_call tool configuration", {
        name: endCallTool.name,
        type: endCallTool.type,
        descriptionLength: endCallTool.description?.length || 0,
        descriptionPreview: endCallTool.description?.substring(0, 100) || "NO DESCRIPTION",
        expects_response: endCallTool.expects_response,
      });
    } else {
      logger.error("❌ CRITICAL: end_call tool NOT FOUND in tools array!");
    }

    const promptConfig: any = {
      prompt: systemMessage,
      llm: "gpt-4o-mini",
      temperature: temperature,
      max_tokens: 150,
      tools,
    };

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/convai/agents/${agentId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "xi-api-key": ELEVENLABS_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_config: {
            turn: {
              mode: "turn",
              turn_timeout: 10, // Increased from 1 to 10 seconds - gives user more time to respond
              silence_end_call_timeout: -1, // Don't end call on silence
            },
            asr: {
              quality: "high",
              provider: "elevenlabs",
              user_input_audio_format: "ulaw_8000",
              no_speech_threshold: 0.3, // Increased to 0.4 (40%) - faster detection that user stopped speaking
            },
            tts: {
              voice_id: voiceId,
              model_id: "eleven_flash_v2",
              agent_output_audio_format: "ulaw_8000",
              optimize_streaming_latency: 1, // Reduced to 2 for faster response streaming
              stability: 0.5,
              similarity_boost: 0.5,
              speed: 1.0,
            },
            agent: {
              first_message: firstMessage,
              language: "en",
              prompt: promptConfig,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to update agent full configuration", {
        agentId,
        status: response.status,
        error: errorText,
      });
      return false;
    }

    // Update the hash in database
    const agent = await db.elevenLabsAgent.findFirst({ where: { agentId } });
    if (agent) {
      await db.elevenLabsAgent.update({
        where: { id: agent.id },
        data: {
          configHash: currentHash,
          voiceId: voiceId,
          updatedAt: new Date(),
        },
      });
    }

    logger.info("✅ Updated full agent configuration", {
      agentId,
      newHash: currentHash,
      voiceId,
    });
    return true;
  } catch (error) {
    logger.error("❌ Error updating agent full configuration", {
      agentId,
      error,
    });
    return false;
  }
}

// Update agent's voice
async function updateAgentVoice(
  agentId: string,
  voiceId: string
): Promise<boolean> {
  try {
    logger.info("🔄 Starting voice update", { agentId, voiceId });

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/convai/agents/${agentId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "xi-api-key": ELEVENLABS_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_config: {
            tts: {
              voice_id: voiceId,
              // Keep other TTS settings the same
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to update agent voice", {
        agentId,
        status: response.status,
        error: errorText,
      });
      return false;
    }

    logger.info("✅ ElevenLabs API voice update successful", {
      agentId,
      voiceId,
    });

    // Update voice in database
    const agent = await db.elevenLabsAgent.findFirst({ where: { agentId } });
    if (agent) {
      await db.elevenLabsAgent.update({
        where: { id: agent.id },
        data: {
          voiceId: voiceId,
          updatedAt: new Date(),
        },
      });
      logger.info("✅ Database voice update successful", { agentId, voiceId });
    } else {
      logger.warn("Agent not found in database for voice update", { agentId });
    }

    logger.info("✅ Updated agent voice successfully", { agentId, voiceId });
    return true;
  } catch (error) {
    logger.error("❌ Error updating agent voice", { agentId, voiceId, error });
    return false;
  }
}

// Create or get ElevenLabs agent
async function getOrCreateAgent(businessConfig: any): Promise<string | null> {
  logger.info("🚀 getOrCreateAgent called", {
    businessId: businessConfig.businessId,
    businessName: businessConfig.businessName,
    hasApiKey: !!ELEVENLABS_API_KEY,
  });

  if (!ELEVENLABS_API_KEY) {
    logger.error("Missing ElevenLabs API key");
    return null;
  }

  // Check for existing agent
  logger.info("🔍 Checking for existing agent", {
    businessId: businessConfig.businessId,
  });

  const existingAgent = await db.elevenLabsAgent.findFirst({
    where: { businessId: businessConfig.businessId },
  });

  if (existingAgent) {
    logger.info("🔍 Using existing agent - FORCING UPDATE", {
      agentId: existingAgent.agentId,
      currentVoiceId: existingAgent.voiceId,
      newVoiceId: businessConfig.voiceId,
      voiceChanged: existingAgent.voiceId !== businessConfig.voiceId,
      businessId: businessConfig.businessId,
    });

    // Update full configuration including turn, asr, tts, and agent settings
    // This ensures all the new timing and sensitivity settings are applied
    // Force update to ensure built_in_tools configuration is applied to existing agents
    try {
      const fullConfigUpdateResult = await updateAgentFullConfig(
        existingAgent.agentId,
        businessConfig.systemMessage,
        businessConfig.firstMessage,
        businessConfig.temperature,
        businessConfig.voiceId || existingAgent.voiceId,
        businessConfig.transferEnabled,
        businessConfig.transferPhoneNumber,
        businessConfig.businessId, // FIXED: Pass businessId correctly
        existingAgent.configHash || undefined,
        true // CRITICAL: Force update to apply built_in_tools changes
      );

      logger.info("✅ Full configuration update result", {
        success: fullConfigUpdateResult,
        agentId: existingAgent.agentId,
        voiceId: businessConfig.voiceId || existingAgent.voiceId,
      });
    } catch (error) {
      logger.error("❌ Error updating agent configuration", {
        agentId: existingAgent.agentId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return existingAgent.agentId;
  }

  // Get voices
  const voicesResponse = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      Accept: "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
  });

  if (!voicesResponse.ok) {
    logger.error("Failed to fetch voices");
    return null;
  }

  const voicesData = await voicesResponse.json();
  const voices = voicesData.voices || [];

  // Use the voiceId from businessConfig if provided, otherwise fallback to Rachel/Sarah
  let voice: any;
  if (businessConfig.voiceId) {
    voice = voices.find((v: any) => v.voice_id === businessConfig.voiceId);
    logger.info("Using configured voice", {
      voiceId: businessConfig.voiceId,
      found: !!voice,
      voiceName: voice?.name,
    });
  }

  // Fallback to Rachel or Sarah for telephony if no voice found or configured
  if (!voice) {
    voice =
      voices.find((v: any) =>
        ["rachel", "sarah"].includes(v.name.toLowerCase())
      ) || voices[0];
    logger.info("Using fallback voice", { voiceName: voice?.name });
  }

  if (!voice) {
    logger.error("No voices available");
    return null;
  }

  // Build tools: built-in tools FIRST, then user tools
  // This ensures built-in tools always work independently
  const builtInTools = buildBuiltInTools(businessConfig.transferEnabled);
  const userTools = await buildUserTools(businessConfig.businessId);
  const tools = [...builtInTools, ...userTools];

  const promptConfig: any = {
    prompt: businessConfig.systemMessage,
    llm: "gpt-4o-mini",
    temperature: businessConfig.temperature,
    max_tokens: 150,
    tools,
  };

  logger.info("✅ Creating agent with separated tools", {
    builtInToolCount: builtInTools.length,
    userToolCount: userTools.length,
    totalToolCount: tools.length,
    toolNames: tools.map((t: any) => t.name),
    hasEndCallTool: tools.some((t: any) => t.name === "end_call"),
    transferEnabled: businessConfig.transferEnabled,
    businessId: businessConfig.businessId,
  });

  // CRITICAL DEBUG: Log the actual end_call tool configuration
  const endCallTool = tools.find((t: any) => t.name === "end_call");
  if (endCallTool) {
    logger.info("🔍 DEBUG: end_call tool configuration being sent to ElevenLabs", {
      name: endCallTool.name,
      type: endCallTool.type,
      descriptionLength: endCallTool.description?.length || 0,
      descriptionPreview: endCallTool.description?.substring(0, 150) || "NO DESCRIPTION",
      expects_response: endCallTool.expects_response,
      fullDescription: endCallTool.description,
    });
  } else {
    logger.error("❌ CRITICAL: end_call tool NOT FOUND in tools array during agent creation!");
  }

  // Create agent with ulaw_8000 audio format and optimized settings
  const agentPayload = {
    name: `${businessConfig.businessName} AI Receptionist`,
    conversation_config: {
      conversation: { max_duration_seconds: 600 },
      turn: {
        mode: "turn",
        turn_timeout: 10, // Increased from 1 to 10 seconds - gives user more time to respond
        silence_end_call_timeout: -1, // Don't end call on silence
      },
      asr: {
        quality: "high",
        provider: "elevenlabs",
        user_input_audio_format: "ulaw_8000",
        no_speech_threshold: 0.3, // Increased to 0.4 (40%) - faster detection that user stopped speaking
      },
      tts: {
        voice_id: voice.voice_id,
        model_id: "eleven_flash_v2",
        agent_output_audio_format: "ulaw_8000",
        optimize_streaming_latency: 1, // Reduced to 2 for faster response streaming
        stability: 0.5,
        similarity_boost: 0.5,
        speed: 1.0,
      },
      agent: {
        first_message: businessConfig.firstMessage,
        language: "en",
        prompt: promptConfig,
      },
    },
  };

  const agentResponse = await fetch(
    `${ELEVENLABS_BASE_URL}/convai/agents/create`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
    }
  );

  if (!agentResponse.ok) {
    const errorText = await agentResponse.text();
    logger.error("Failed to create agent", { error: errorText });
    return null;
  }

  const agentData = await agentResponse.json();
  const agentId = agentData.agent_id;

  if (!agentId) return null;

  // Generate initial config hash
  const initialHash = generateConfigHash(
    businessConfig.systemMessage,
    businessConfig.firstMessage,
    businessConfig.temperature,
    businessConfig.transferEnabled,
    businessConfig.transferPhoneNumber
  );

  // Save to database
  await db.elevenLabsAgent.create({
    data: {
      businessId: businessConfig.businessId,
      agentId: agentId,
      voiceId: voice.voice_id,
      voiceName: voice.name,
      configHash: initialHash,
      isActive: true,
    },
  });

  logger.info("Created new agent", { agentId, voiceName: voice.name });
  return agentId;
}

// Start recording via Twilio API
const startRecording = async (twilioCallSid: string, webhookUrl: string) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      logger.error("❌ Missing Twilio credentials");
      return null;
    }

    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    logger.info("🎙️ Starting call recording via API", { twilioCallSid });

    const recording = await client.calls(twilioCallSid).recordings.create({
      recordingStatusCallback: webhookUrl,
      recordingStatusCallbackMethod: "POST",
    });

    logger.info("✅ Recording started", {
      twilioCallSid,
      recordingSid: recording.sid,
    });

    return recording;
  } catch (error) {
    logger.error("❌ Error starting recording:", error);
    return null;
  }
};
const createCallRecord = async (
  businessConfig: any,
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

    logger.info("✅ Created call record:", {
      callId: call.id,
      businessId: businessConfig.businessId,
      businessName: businessConfig.businessName,
      twilioCallSid,
      customerPhone: customerPhone || "Unknown",
    });
    return call;
  } catch (error) {
    logger.error("❌ Error creating call record", error);
    return null;
  }
};

// Track calls that have been terminated to prevent duplicate attempts
const terminatedCalls = new Set<string>();

// Function to end Twilio call
const endTwilioCall = async (twilioCallSid: string) => {
  if (!twilioCallSid) {
    logger.warn("⚠️ No twilioCallSid provided to endTwilioCall");
    return;
  }

  // Check if we've already attempted to terminate this call
  if (terminatedCalls.has(twilioCallSid)) {
    logger.info("ℹ️ Call termination already attempted, skipping", {
      twilioCallSid,
    });
    return;
  }

  // Mark this call as being terminated
  terminatedCalls.add(twilioCallSid);

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      logger.error("❌ Missing Twilio credentials for ending call");
      return;
    }

    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    logger.info("🔚 Attempting to end Twilio call", {
      twilioCallSid,
    });

    // Try to update the call directly without fetching first
    // This is more efficient and handles the case where the call might have just ended
    const updatedCall = await client.calls(twilioCallSid).update({
      status: "completed",
    });

    logger.info("✅ Twilio call ended successfully", {
      twilioCallSid,
      newStatus: updatedCall.status,
    });
  } catch (error: any) {
    // If the call doesn't exist (404), it means it already ended - this is OK
    if (error.code === 20404) {
      logger.info("ℹ️ Call already ended (404 - not found)", {
        twilioCallSid,
      });
    } else {
      // For other errors, log them as actual errors
      logger.error("❌ Error ending Twilio call", {
        twilioCallSid,
        errorMessage: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        errorDetails: error.moreInfo || error.details,
      });
    }
  } finally {
    // Clean up the terminated call from the set after a delay
    // This prevents memory leaks while still preventing immediate duplicates
    setTimeout(() => {
      terminatedCalls.delete(twilioCallSid);
    }, 30000); // Clean up after 30 seconds
  }
};

// Function to finalize call record and send email
// Track finalized calls to prevent duplicates
const finalizedCalls = new Set<string>();

const finalizeCallRecord = async (
  callId: string,
  callStartTime: Date,
  businessName: string,
  twilioCallSid?: string,
  businessId?: string
) => {
  // Prevent duplicate finalization
  if (finalizedCalls.has(callId)) {
    logger.info("⚠️ Call already finalized, skipping", { callId });
    return;
  }

  finalizedCalls.add(callId);
  if (!callId || !callStartTime) return;

  try {
    const duration = Math.floor((Date.now() - callStartTime.getTime()) / 1000);

    // End Twilio call if still active
    if (twilioCallSid) {
      await endTwilioCall(twilioCallSid);
    }

    // Update call record
    const updatedCall = await db.call.update({
      where: { id: callId },
      data: {
        status: "COMPLETED",
        duration: duration,
        summary: `Call with ${businessName || "business"} - Duration: ${duration}s`,
      },
    });

    // Track billing usage
    try {
      const { BillingService } = await import("../services/billingService.js");
      const billingService = new BillingService();
      await billingService.trackCallUsage(callId, duration);
      logger.info("✅ Tracked billing usage for call", { callId, duration });
    } catch (billingError) {
      logger.error("❌ Error tracking billing usage", billingError);
      // Don't fail the call completion if billing tracking fails
    }

    logger.info("✅ Finalized call record", {
      callId,
      duration,
      twilioCallSid,
    });

    // Email will be sent after summary generation in the transcription process
    logger.info("📧 Email will be sent after summary generation", {
      callId,
      businessId,
    });
  } catch (error) {
    logger.error("❌ Error finalizing call record", error);
  }
};

// Incoming call handler with recording
router.all("/incoming-call", async (req: Request, res: Response) => {
  try {
    const calledNumber = req.body?.Called || req.query?.Called;
    const callerNumber = req.body?.From || req.query?.From;
    const twilioCallSid = req.body?.CallSid || req.query?.CallSid;

    logger.info("📞 Incoming call received", {
      calledNumber,
      callerNumber,
      twilioCallSid,
    });

    if (!calledNumber) {
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, we could not process your call.</Say>
          <Hangup/>
        </Response>`);
    }

    const businessConfig = await getBusinessConfig(calledNumber);

    if (!businessConfig) {
      logger.error("❌ No business config found", { calledNumber });
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, this number is not configured.</Say>
          <Hangup/>
        </Response>`);
    }

    logger.info("✅ Business config loaded", {
      businessId: businessConfig.businessId,
      businessName: businessConfig.businessName,
      calledNumber,
    });

    // Check subscription status before proceeding with call
    const subscriptionValidation =
      await subscriptionValidationService.validateSubscriptionForCall(
        businessConfig.businessId
      );

    if (subscriptionValidation.isBlocked) {
      logger.warn("🚫 Call blocked due to subscription issue", {
        businessId: businessConfig.businessId,
        businessName: businessConfig.businessName,
        reason: subscriptionValidation.reason,
        callerNumber,
        twilioCallSid,
      });

      return res
        .type("text/xml")
        .send(
          subscriptionValidationService.getBlockedCallTwiML(
            subscriptionValidation
          )
        );
    }

    logger.info("📞 Getting or creating ElevenLabs agent...", {
      businessId: businessConfig.businessId,
    });

    const agentId = await getOrCreateAgent(businessConfig);

    logger.info("🤖 Agent ID retrieved", { agentId, businessId: businessConfig.businessId });

    if (!agentId) {
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, we're having technical difficulties.</Say>
          <Hangup/>
        </Response>`);
    }

    // Create call record immediately
    const call = await createCallRecord(
      businessConfig,
      twilioCallSid,
      callerNumber
    );

    logger.info("✅ Call record created", {
      callId: call?.id,
      twilioCallSid,
    });

    const protocol =
      req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
    const host = req.headers.host || "localhost:3001";
    const websocketUrl = `${protocol}://${host}/api/elevenlabs-agent/media-stream`;

    // Setup recording webhook URL
    const recordingWebhookUrl = process.env.NGROK_URL
      ? `${process.env.NGROK_URL}/api/webhooks/recording-status`
      : `https://${host}/api/webhooks/recording-status`;

    logger.info("🎙️ Setting up call WITH recording", {
      businessName: businessConfig.businessName,
      agentId,
      callerNumber,
      twilioCallSid,
      recordingWebhookUrl,
    });

    // TwiML with Connect and Hangup
    // When the WebSocket stream closes, Twilio will execute the Hangup verb to end the call
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="businessId" value="${businessConfig.businessId}" />
            <Parameter name="businessName" value="${businessConfig.businessName}" />
            <Parameter name="agentId" value="${agentId}" />
            <Parameter name="twilioCallSid" value="${twilioCallSid}" />
            <Parameter name="callerNumber" value="${callerNumber || "Unknown"}" />
            <Parameter name="callId" value="${call?.id || ""}" />
            <Parameter name="startRecording" value="true" />
          </Stream>
        </Connect>
        <Hangup/>
      </Response>`;

    res.type("text/xml").send(twimlResponse);
  } catch (error) {
    logger.error("❌ Error handling call", error);
    res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, we encountered an error.</Say>
        <Hangup/>
      </Response>`);
  }
});

// WebSocket server setup
export const setupElevenLabsAgentWebSocket = (server: Server) => {
  const wss = new WebSocket.Server({
    server,
    path: "/api/elevenlabs-agent/media-stream",
    perMessageDeflate: false,
  });

  wss.on("connection", (ws: WebSocket) => {
    logger.info("🔌 Twilio connected to WebSocket");

    let streamSid: string | null = null;
    let elevenLabsWs: WebSocket | null = null;

    // Call recording state
    let callId: string | null = null;
    let callStartTime: Date | null = null;
    let businessName: string | null = null;
    let businessId: string | null = null;
    let twilioCallSid: string | null = null;
    let callerNumber: string | null = null;

    // Flag to prevent race condition when handling end_call tool
    let handlingEndCall = false;

    const connectToElevenLabs = async (agentId: string) => {
      try {
        const signedUrl = await getSignedUrl(agentId);
        elevenLabsWs = new WebSocket(signedUrl);

        elevenLabsWs.on("open", () => {
          logger.info("✅ Connected to ElevenLabs");
        });

        elevenLabsWs.on("message", (data) => {
          const message = JSON.parse(data.toString());

          // TEMPORARY DEBUG: Log ALL message types to see what's coming through
          logger.info("📨 RAW ElevenLabs message", {
            type: message.type,
            allKeys: Object.keys(message).join(", "),
            messagePreview: JSON.stringify(message).substring(0, 200),
          });

          // Only log important events: tool calls, errors, and conversation initiation
          // Skip verbose events like transcripts, responses, and interruptions
          const hasToolCall = !!(
            message.client_tool_call ||
            message.tool_call ||
            message.agent_tool_response
          );

          // Only log tool calls and critical events (not routine transcript/response events)
          const isImportantEvent = hasToolCall ||
            message.type === "conversation_initiation_metadata" ||
            message.type === "error";

          // ALWAYS log agent responses to see what AI is saying
          if (message.type === "agent_response" && message.agent_response_event?.agent_response) {
            const agentText = message.agent_response_event.agent_response;
            logger.info("🤖 AI Response", {
              text: agentText,
            });

            // AUTO-DETECT GOODBYE: If AI says goodbye, automatically end the call
            // This bypasses unreliable tool calling by ElevenLabs
            const goodbyePhrases = [
              "goodbye", "bye", "have a great day", "have a wonderful day",
              "have a good day", "have a nice day", "talk to you later",
              "take care", "see you", "thanks for calling"
            ];

            const textLower = agentText.toLowerCase();
            const isGoodbye = goodbyePhrases.some(phrase => textLower.includes(phrase));

            if (isGoodbye && !handlingEndCall) {
              logger.info("🔚 AUTO-DETECTED GOODBYE - Ending call in 3 seconds", {
                agentResponse: agentText,
                twilioCallSid,
                callId,
              });

              // Set flag to prevent duplicate calls
              handlingEndCall = true;

              // Wait 3 seconds for the goodbye audio to finish, then end call
              setTimeout(() => {
                logger.info("⏰ Goodbye message complete, closing Twilio WebSocket", {
                  twilioCallSid,
                  callId,
                });

                // Close Twilio connection (ws is the Twilio WebSocket)
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.close();
                }

                // Close ElevenLabs connection
                if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
                  elevenLabsWs.close();
                }
              }, 3000); // 3 second delay for audio to finish
            }
          }

          // Also check for response event
          if (message.type === "response" || message.response) {
            logger.info("🗣️ AI Speaking", {
              type: message.type,
              content: message.response?.content || message.content || "unknown",
            });
          }

          if (isImportantEvent) {
            logger.info("📨 ElevenLabs event", {
              type: message.type,
              hasToolCall,
              keys: Object.keys(message).join(", "),
            });

            // Log full agent_tool_response structure for debugging
            if (
              message.type === "agent_tool_response" &&
              message.agent_tool_response
            ) {
              logger.info("🔍 agent_tool_response structure", {
                agentToolResponse: JSON.stringify(message.agent_tool_response),
                responseKeys: Object.keys(message.agent_tool_response).join(
                  ", "
                ),
              });
            }
          }

          if (message.type === "conversation_initiation_metadata") {
            const meta = message.conversation_initiation_metadata_event;
            logger.info("🎵 Audio formats confirmed", {
              input: meta?.user_input_audio_format,
              output: meta?.agent_output_audio_format,
            });
          } else if (
            message.type === "audio" &&
            message.audio_event?.audio_base_64
          ) {
            if (streamSid) {
              ws.send(
                JSON.stringify({
                  event: "media",
                  streamSid,
                  media: { payload: message.audio_event.audio_base_64 },
                })
              );
            }
          } else if (message.type === "interruption" && streamSid) {
            ws.send(JSON.stringify({ event: "clear", streamSid }));
          } else if (message.type === "ping" && message.ping_event?.event_id) {
            elevenLabsWs?.send(
              JSON.stringify({
                type: "pong",
                event_id: message.ping_event.event_id,
              })
            );
          } else if (
            message.type === "client_tool_call" ||
            message.type === "tool_call" ||
            message.type === "agent_tool_response"
          ) {
            // Handle tool calls per ElevenLabs WebSocket API spec
            // Support multiple event types:
            // - client_tool_call: Client tools (v2 API)
            // - tool_call: Legacy/system tools
            // - agent_tool_response: System tools response (tool info in agent_tool_response field)
            const toolCall =
              message.client_tool_call ||
              message.tool_call ||
              message.agent_tool_response;
            const toolName = toolCall?.tool_name || toolCall?.name; // 'name' is used in some versions
            const toolCallId = toolCall?.tool_call_id || toolCall?.id;
            const parameters = toolCall?.parameters || {};

            // Enhanced logging to help debug tool call structure
            logger.info("🔧 Tool call received", {
              type: message.type,
              toolName: toolName,
              toolCallId: toolCallId,
              parameters: parameters,
              hasClientToolCall: !!message.client_tool_call,
              hasToolCall: !!message.tool_call,
              hasAgentToolResponse: !!message.agent_tool_response,
              toolCallKeys: toolCall
                ? Object.keys(toolCall).join(", ")
                : "none",
              rawMessage: JSON.stringify(message).substring(0, 500), // Log first 500 chars of raw message
            });

            if (toolName === "end_call") {
              // Set flag to prevent race condition with close handler
              handlingEndCall = true;

              logger.info(
                "🔚 ✅ END CALL TOOL INVOKED - Call will end after goodbye message",
                {
                  twilioCallSid,
                  callId,
                  hasTwilioCallSid: !!twilioCallSid,
                  timestamp: new Date().toISOString(),
                }
              );

              // Send tool result back to ElevenLabs per API spec
              if (elevenLabsWs?.readyState === WebSocket.OPEN && toolCallId) {
                elevenLabsWs.send(
                  JSON.stringify({
                    type: "client_tool_result",
                    tool_call_id: toolCallId,
                    result: "Call ended successfully",
                    is_error: false,
                  })
                );
                logger.info("✅ Sent tool result to ElevenLabs");
              }

              // Wait for goodbye message to finish playing (3 seconds)
              // Then close Twilio WebSocket to properly end the call
              setTimeout(() => {
                logger.info(
                  "⏰ Goodbye message complete, closing Twilio WebSocket",
                  {
                    twilioCallSid,
                    wsReadyState: ws.readyState,
                  }
                );

                // CRITICAL: Close the Twilio WebSocket to end the call
                // This is the proper way to end a call using Media Streams
                // The WebSocket close will trigger cleanup via the ws.on("close") handler
                if (ws.readyState === WebSocket.OPEN) {
                  logger.info("🔌 Closing Twilio WebSocket to end call");
                  ws.close();
                } else {
                  logger.warn("⚠️ Twilio WebSocket not open, cannot close", {
                    readyState: ws.readyState,
                  });
                  // If WebSocket is already closed, manually finalize
                  if (callId && callStartTime && businessName) {
                    finalizeCallRecord(
                      callId,
                      callStartTime,
                      businessName,
                      twilioCallSid || undefined,
                      businessId || undefined
                    ).catch((error) => {
                      logger.error("❌ Error finalizing call record", error);
                    });
                  }
                }
              }, 3000); // Wait 3 seconds for goodbye audio to finish
            } else if (toolName === "transfer_to_human") {
              logger.info("📞 Transfer to human tool invoked", {
                twilioCallSid,
                callId,
              });

              // Transfer the call to a human agent
              // This will redirect the Twilio call to the transfer phone number
              const transferCall = async () => {
                try {
                  // Get transfer phone number from ElevenLabsAgent
                  const agent = await db.elevenLabsAgent.findFirst({
                    where: { businessId: businessId || "" },
                  });

                  const transferNumber = agent?.transferPhoneNumber;

                  if (!transferNumber) {
                    logger.error("❌ No transfer phone number configured");

                    // Send error result to ElevenLabs
                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: "Transfer failed: No phone number configured",
                          is_error: true,
                        })
                      );
                    }
                    return;
                  }

                  const accountSid = process.env.TWILIO_ACCOUNT_SID;
                  const authToken = process.env.TWILIO_AUTH_TOKEN;

                  if (!accountSid || !authToken || !twilioCallSid) {
                    logger.error("❌ Missing Twilio credentials or call SID");

                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: "Transfer failed: Missing credentials",
                          is_error: true,
                        })
                      );
                    }
                    return;
                  }

                  const twilio = require("twilio");
                  const client = twilio(accountSid, authToken);

                  logger.info("🔄 Transferring call to human", {
                    twilioCallSid,
                    transferNumber,
                  });

                  // For calls connected via Media Streams, we cannot update with TwiML
                  // Instead, we must redirect the call to a URL that returns TwiML
                  const ngrokUrl =
                    process.env.NGROK_URL || process.env.PUBLIC_URL;

                  if (!ngrokUrl) {
                    logger.error(
                      "❌ Missing NGROK_URL or PUBLIC_URL for transfer"
                    );

                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: "Transfer failed: Server URL not configured",
                          is_error: true,
                        })
                      );
                    }
                    return;
                  }

                  // CRITICAL: Do NOT close ElevenLabs WebSocket before redirect!
                  // Closing it triggers disconnect handlers that end the call (404 error)

                  // Redirect the call to our transfer endpoint which returns TwiML
                  const transferUrl = `${ngrokUrl}/api/twilio/transfer?number=${encodeURIComponent(transferNumber)}`;

                  await client.calls(twilioCallSid).update({
                    url: transferUrl,
                    method: "POST",
                  });

                  logger.info("✅ Call redirected for transfer successfully");

                  // Send success result to ElevenLabs
                  if (
                    elevenLabsWs?.readyState === WebSocket.OPEN &&
                    toolCallId
                  ) {
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id: toolCallId,
                        result: "Call transferred successfully",
                        is_error: false,
                      })
                    );
                  }

                  // Close both WebSockets after redirect completes
                  // This gives Twilio time to fetch the transfer TwiML before disconnect
                  setTimeout(() => {
                    logger.info("Closing WebSockets after transfer redirect");
                    if (elevenLabsWs?.readyState === WebSocket.OPEN) {
                      elevenLabsWs.close();
                    }
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.close();
                    }
                  }, 2000); // 2 second delay
                } catch (error: any) {
                  logger.error("❌ Error transferring call", { error });

                  // Handle specific Twilio error codes
                  if (error.code === 20404) {
                    logger.warn(
                      "⚠️ Call not found (404) - call may have already ended or been disconnected"
                    );
                  }

                  // Send error result to ElevenLabs
                  if (
                    elevenLabsWs?.readyState === WebSocket.OPEN &&
                    toolCallId
                  ) {
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id: toolCallId,
                        result: `Transfer failed: ${error instanceof Error ? error.message : String(error)}`,
                        is_error: true,
                      })
                    );
                  }
                }
              };

              transferCall();
            } else {
              // Handle other tools (webhook tools, custom client tools)
              logger.info("🔧 Generic tool invoked", {
                toolName,
                toolCallId,
                parameters,
              });

              // Execute webhook or custom tool
              const executeWebhookTool = async () => {
                try {
                  // Fetch tool configuration from database
                  const toolConfig = await db.tool.findFirst({
                    where: {
                      businessId: businessId || "",
                      isActive: true,
                      config: {
                        path: ["name"],
                        equals: toolName,
                      },
                    },
                  });

                  if (!toolConfig) {
                    logger.error("❌ Tool not found in database", { toolName });

                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: `Tool '${toolName}' not found`,
                          is_error: true,
                        })
                      );
                    }
                    return;
                  }

                  const config = toolConfig.config as any;

                  // Handle webhook tools
                  if (config.type === "webhook") {
                    logger.info("🌐 Executing webhook tool", {
                      toolName,
                      url: config.api_schema?.url,
                    });

                    const webhookUrl = config.api_schema?.url;
                    const method = config.api_schema?.method || "POST";
                    const headers = config.api_schema?.request_headers || {};

                    if (!webhookUrl) {
                      throw new Error("Webhook URL not configured");
                    }

                    // Inject system parameters into webhook payload
                    const webhookPayload = {
                      ...parameters, // AI-extracted parameters
                      // System-provided parameters for context
                      business_id: businessId || "",
                      call_id: callId || "",
                      twilio_call_sid: twilioCallSid || "",
                      caller_phone: callerNumber || "",
                      stream_sid: streamSid || "",
                    };

                    logger.info("🌐 Webhook payload", {
                      toolName,
                      aiParams: Object.keys(parameters),
                      systemParams: ["business_id", "call_id", "twilio_call_sid", "caller_phone", "stream_sid"],
                    });

                    // Make webhook request
                    const response = await fetch(webhookUrl, {
                      method: method,
                      headers: {
                        "Content-Type": "application/json",
                        ...headers,
                      },
                      body:
                        method !== "GET"
                          ? JSON.stringify(webhookPayload)
                          : undefined,
                    });

                    const result = await response.text();

                    logger.info("✅ Webhook executed successfully", {
                      toolName,
                      status: response.status,
                    });

                    // Send result to ElevenLabs
                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: result || "Success",
                          is_error: !response.ok,
                        })
                      );
                    }
                  } else {
                    // Handle client tools (non-webhook)
                    logger.info("📦 Client tool executed", { toolName });

                    // Send generic success response
                    if (
                      elevenLabsWs?.readyState === WebSocket.OPEN &&
                      toolCallId
                    ) {
                      elevenLabsWs.send(
                        JSON.stringify({
                          type: "client_tool_result",
                          tool_call_id: toolCallId,
                          result: "Tool executed successfully",
                          is_error: false,
                        })
                      );
                    }
                  }
                } catch (error) {
                  logger.error("❌ Error executing tool", {
                    toolName,
                    error:
                      error instanceof Error ? error.message : String(error),
                  });

                  // Send error result to ElevenLabs
                  if (
                    elevenLabsWs?.readyState === WebSocket.OPEN &&
                    toolCallId
                  ) {
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id: toolCallId,
                        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        is_error: true,
                      })
                    );
                  }
                }
              };

              executeWebhookTool();
            }
          }
        });

        elevenLabsWs.on("close", () => {
          logger.info("🔌 ElevenLabs disconnected", {
            handlingEndCall,
            willSkipCleanup: handlingEndCall,
          });

          // If we're handling end_call tool, skip cleanup here
          // The end_call handler will close the Twilio WebSocket after the goodbye message
          // which will trigger proper cleanup via the Twilio close handler
          if (handlingEndCall) {
            logger.info(
              "⏭️ Skipping cleanup - end_call handler will manage call termination"
            );
            return;
          }

          // Normal flow: ElevenLabs disconnected unexpectedly (not due to end_call)
          // Close the Twilio WebSocket to hang up the call
          logger.info("📞 ElevenLabs disconnected unexpectedly, ending call");
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          } else {
            // WebSocket already closed, finalize manually
            if (callId && callStartTime && businessName) {
              finalizeCallRecord(
                callId,
                callStartTime,
                businessName,
                twilioCallSid || undefined,
                businessId || undefined
              ).catch((error) => {
                logger.error("❌ Error finalizing call record", error);
              });
            }
          }
        });
      } catch (error) {
        logger.error("❌ Error connecting to ElevenLabs:", error);
      }
    };

    ws.on("message", async (message) => {
      const data = JSON.parse(message.toString());

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        const customParameters = data.start.customParameters || {};
        const agentId =
          customParameters.agentId || "agent_8001k6wjmac4e27tx268nfwq2611";
        businessName = customParameters.businessName;
        businessId = customParameters.businessId;
        callId = customParameters.callId;
        callStartTime = new Date();
        twilioCallSid = customParameters.twilioCallSid || null;
        callerNumber = customParameters.callerNumber || null;
        const shouldStartRecording = customParameters.startRecording === "true";

        logger.info("🎬 Stream started", {
          streamSid,
          agentId,
          businessName,
          callId,
          twilioCallSid,
        });

        // Register call in active calls map
        if (callId && twilioCallSid && streamSid) {
          registerActiveCall(
            streamSid,
            callId,
            twilioCallSid,
            businessId || ""
          );
          logger.info("📝 Registered active call", {
            streamSid,
            callId,
            twilioCallSid,
          });
        }

        // Start recording via API after stream is established
        if (shouldStartRecording && twilioCallSid) {
          const webhookUrl = process.env.NGROK_URL
            ? `${process.env.NGROK_URL}/api/webhooks/recording-status`
            : "https://server-production-0693e.up.railway.app/api/webhooks/recording-status";

          setTimeout(async () => {
            if (twilioCallSid) {
              await startRecording(twilioCallSid, webhookUrl);
            }
          }, 2000); // Wait 2 seconds for stream to be fully established
        }

        // Store callId in WebSocket for tool access
        (ws as any).callId = callId;
        (ws as any).twilioCallSid = twilioCallSid;

        await connectToElevenLabs(agentId);
      } else if (
        data.event === "media" &&
        elevenLabsWs?.readyState === WebSocket.OPEN
      ) {
        elevenLabsWs.send(
          JSON.stringify({
            user_audio_chunk: data.media.payload,
          })
        );
      } else if (data.event === "stop") {
        logger.info("⏹️ Stream stopped");

        // Finalize call record (includes ending Twilio call)
        if (callId && callStartTime && businessName) {
          await finalizeCallRecord(
            callId,
            callStartTime,
            businessName,
            twilioCallSid || undefined,
            businessId || undefined
          );
        }

        elevenLabsWs?.close();
      }
    });

    ws.on("close", () => {
      logger.info("🔌 Twilio disconnected");

      // Clean up from active calls
      if (streamSid) {
        unregisterActiveCall(streamSid);
        logger.info("🗑️ Removed from active calls", { streamSid });
      }

      // Finalize call record on disconnect (includes ending Twilio call)
      if (callId && callStartTime && businessName) {
        finalizeCallRecord(
          callId,
          callStartTime,
          businessName,
          twilioCallSid || undefined,
          businessId || undefined
        );
      }

      elevenLabsWs?.close();
    });

    ws.on("error", (error) => {
      logger.error("❌ Twilio WebSocket error:", error);
      elevenLabsWs?.close();
    });
  });

  return wss;
};

export default router;
