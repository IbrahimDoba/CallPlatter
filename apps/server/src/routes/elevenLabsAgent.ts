// routes/elevenLabsAgent.ts
import { Router, type Request, type Response } from "express";
import WebSocket from "ws";
import type { Server } from "http";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { instructions } from "@/utils/instructions";
import { emailService } from "../services/emailService";

const router: Router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// Helper to get signed WebSocket URL
async function getSignedUrl(agentId: string): Promise<string> {
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/convai/conversation/get_signed_url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY || '' }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get signed URL: ${response.statusText}`);
  }

  const data = await response.json();
  return data.signed_url;
}

// Build system message from business config with business memories
function buildSystemMessage(aiConfig: any, businessMemories: any[]): string {
  const sessionInstructions = [...instructions];

  // Add business memory context FIRST (highest priority)
  if (businessMemories && businessMemories.length > 0) {
    sessionInstructions.push(`\n\n## BUSINESS KNOWLEDGE BASE
You have access to the following important information about this business:

${businessMemories.map((memory) => `• ${memory.title}: ${memory.content}`).join("\n")}

Use this information to answer customer questions accurately. If asked about something in your knowledge base, provide the information confidently.`);
  }

  if (aiConfig.systemPrompt) {
    sessionInstructions.push(`\n\n${aiConfig.systemPrompt}`);
  }

  const questionsToAsk = [];
  if (aiConfig.askForName) questionsToAsk.push("name");
  if (aiConfig.askForPhone) questionsToAsk.push("phone number");
  if (aiConfig.askForCompany) questionsToAsk.push("company name");
  if (aiConfig.askForAddress) questionsToAsk.push("address");

  if (questionsToAsk.length > 0) {
    sessionInstructions.push(
      `\n\nDuring the conversation, naturally collect: ${questionsToAsk.join(", ")}.`
    );
  }

  if (aiConfig.firstMessage) {
    sessionInstructions.push(
      `\n\nStart with: "${aiConfig.firstMessage}"`
    );
  }

  if (aiConfig.goodbyeMessage) {
    sessionInstructions.push(
      `\n\nEnd with: "${aiConfig.goodbyeMessage}"`
    );
  }

  // Add end call tool instructions
  sessionInstructions.push(`\n\n## CALL ENDING
You have an "end_call" tool to hang up when:
- Conversation is complete
- Customer says goodbye or asks to hang up
- Customer becomes unresponsive

Use the tool with: reason, summary, callId, twilioCallSid`);

  return sessionInstructions.join("\n");
}

// Get or create business config with business memories
async function getBusinessConfig(phoneNumber: string) {
  const business = await db.business.findFirst({
    where: { phoneNumber },
    include: { 
      aiAgentConfig: true,
      elevenLabsAgent: true, // Include ElevenLabs agent to get the correct voiceId
      businessMemories: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!business) return null;

  let aiConfig = business.aiAgentConfig;
  if (!aiConfig) {
    aiConfig = await db.aIAgentConfig.create({
      data: {
        businessId: business.id,
        voice: "alloy",
        responseModel: "gpt-4o-realtime-preview-2024-12-17",
        transcriptionModel: "whisper-1",
        systemPrompt: null,
        firstMessage: null,
        goodbyeMessage: null,
        temperature: 0.7,
        enableServerVAD: true,
        turnDetection: "server_vad",
        askForName: true,
        askForPhone: true,
        askForCompany: false,
        askForEmail: false,
        askForAddress: false,
      },
    });
  }

  // Get the voiceId from ElevenLabsAgent if it exists, otherwise use the AI config voice
  const voiceId = business.elevenLabsAgent?.voiceId || aiConfig.voice || "alloy";

  logger.info("🎤 Voice configuration", {
    businessId: business.id,
    elevenLabsVoiceId: business.elevenLabsAgent?.voiceId,
    aiConfigVoice: aiConfig.voice,
    finalVoiceId: voiceId,
    hasElevenLabsAgent: !!business.elevenLabsAgent
  });

  return {
    businessId: business.id,
    businessName: business.name,
    temperature: aiConfig.temperature || 0.7,
    systemMessage: buildSystemMessage(aiConfig, business.businessMemories),
    firstMessage: aiConfig.firstMessage || "Hello! How can I assist you today?",
    voiceId: voiceId, // Use the correct voiceId from ElevenLabsAgent
  };
}

// Generate a hash of the configuration to detect changes
function generateConfigHash(systemMessage: string, firstMessage: string, temperature: number): string {
  const crypto = require('crypto');
  const configString = `${systemMessage}|${firstMessage}|${temperature}`;
  return crypto.createHash('md5').update(configString).digest('hex');
}

// Update existing agent's prompt only if changed
async function updateAgentPrompt(agentId: string, systemMessage: string, firstMessage: string, temperature: number, lastConfigHash?: string): Promise<boolean> {
  try {
    const currentHash = generateConfigHash(systemMessage, firstMessage, temperature);
    
    // Skip update if config hasn't changed
    if (lastConfigHash && lastConfigHash === currentHash) {
      logger.info("Agent config unchanged, skipping update", { agentId });
      return true;
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            first_message: firstMessage,
            prompt: {
              prompt: systemMessage,
              temperature: temperature,
            }
          }
        }
      })
    });

    if (!response.ok) {
      logger.error("Failed to update agent prompt", { agentId, status: response.status });
      return false;
    }

    // Update the hash in database
    const agent = await db.elevenLabsAgent.findFirst({ where: { agentId } });
    if (agent) {
      await db.elevenLabsAgent.update({
        where: { id: agent.id },
        data: { configHash: currentHash, updatedAt: new Date() }
      });
    }

    logger.info("Updated agent prompt", { agentId, newHash: currentHash });
    return true;
  } catch (error) {
    logger.error("Error updating agent prompt", { agentId, error });
    return false;
  }
}

// Update agent's voice
async function updateAgentVoice(agentId: string, voiceId: string): Promise<boolean> {
  try {
    logger.info("🔄 Starting voice update", { agentId, voiceId });
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_config: {
          tts: {
            voice_id: voiceId,
            // Keep other TTS settings the same
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to update agent voice", { 
        agentId, 
        status: response.status, 
        error: errorText 
      });
      return false;
    }

    logger.info("✅ ElevenLabs API voice update successful", { agentId, voiceId });

    // Update voice in database
    const agent = await db.elevenLabsAgent.findFirst({ where: { agentId } });
    if (agent) {
      await db.elevenLabsAgent.update({
        where: { id: agent.id },
        data: { 
          voiceId: voiceId,
          updatedAt: new Date() 
        }
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
  if (!ELEVENLABS_API_KEY) {
    logger.error("Missing ElevenLabs API key");
    return null;
  }

  // Check for existing agent
  const existingAgent = await db.elevenLabsAgent.findFirst({
    where: { businessId: businessConfig.businessId },
  });

  if (existingAgent) {
    logger.info("Using existing agent", { 
      agentId: existingAgent.agentId,
      currentVoiceId: existingAgent.voiceId,
      newVoiceId: businessConfig.voiceId,
      voiceChanged: businessConfig.voiceId !== existingAgent.voiceId
    });
    
    // Only update if config has changed
    await updateAgentPrompt(
      existingAgent.agentId, 
      businessConfig.systemMessage,
      businessConfig.firstMessage,
      businessConfig.temperature,
      existingAgent.configHash || undefined
    );
    
    // Always update voice to ensure ElevenLabs agent has the correct voice
    // This handles cases where the database was updated but ElevenLabs wasn't
    if (businessConfig.voiceId) {
      logger.info("Updating agent voice to ensure consistency", {
        agentId: existingAgent.agentId,
        currentVoiceId: existingAgent.voiceId,
        targetVoiceId: businessConfig.voiceId,
        forceUpdate: true
      });
      const voiceUpdateResult = await updateAgentVoice(existingAgent.agentId, businessConfig.voiceId);
      logger.info("Voice update result", { success: voiceUpdateResult });
    } else {
      logger.info("No voice ID provided, skipping voice update");
    }
    
    return existingAgent.agentId;
  }

  // Get voices
  const voicesResponse = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      'Accept': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  });

  if (!voicesResponse.ok) {
    logger.error("Failed to fetch voices");
    return null;
  }

  const voicesData = await voicesResponse.json();
  const voices = voicesData.voices || [];
  
  // Use the voiceId from businessConfig if provided, otherwise fallback to Rachel/Sarah
  let voice;
  if (businessConfig.voiceId) {
    voice = voices.find((v: any) => v.voice_id === businessConfig.voiceId);
    logger.info("Using configured voice", { 
      voiceId: businessConfig.voiceId, 
      found: !!voice,
      voiceName: voice?.name 
    });
  }
  
  // Fallback to Rachel or Sarah for telephony if no voice found or configured
  if (!voice) {
    voice = voices.find((v: any) => 
      ['rachel', 'sarah'].includes(v.name.toLowerCase())
    ) || voices[0];
    logger.info("Using fallback voice", { voiceName: voice?.name });
  }

  if (!voice) {
    logger.error("No voices available");
    return null;
  }

  // Create agent with ulaw_8000 audio format and optimized settings
  const agentPayload = {
    name: `${businessConfig.businessName} AI Receptionist`,
    conversation_config: {
      conversation: { max_duration_seconds: 600 },
      turn: { 
        mode: "turn",  // Fixed: should be 'turn' not 'turn_based'
        turn_timeout: 1,  // Fixed: must be -1 or between 1-300 seconds
        silence_end_call_timeout: -1  // Don't end call on silence
      },
      asr: {
        quality: "high",
        provider: "elevenlabs",
        user_input_audio_format: "ulaw_8000",
        no_speech_threshold: 0.1  // More sensitive to silence detection for faster response
      },
      tts: {
        voice_id: voice.voice_id,
        model_id: "eleven_flash_v2",  // Using flash v2 model for faster responses
        agent_output_audio_format: "ulaw_8000",
        optimize_streaming_latency: 4,  // Maximum streaming optimization
        stability: 0.5,  // Normal stability for good voice quality
        similarity_boost: 0.5,  // Normal similarity for good voice quality
        speed: 1.0  // Normal speech speed
      },
      agent: {
        first_message: businessConfig.firstMessage,
        language: "en",
        prompt: {
          prompt: businessConfig.systemMessage,
          llm: "gpt-4o-mini",
          temperature: businessConfig.temperature,
          max_tokens: 80  // Even shorter responses for faster generation
        },
        tools: [
          {
            type: "webhook",
            name: "end_call",
            description: "End the phone call when the conversation is complete or the customer requests to hang up",
            response_timeout_secs: 10,
            disable_interruptions: false,
            force_pre_tool_speech: false,
            api_schema: {
              url: `${process.env.NGROK_URL || "https://server-production-0693e.up.railway.app"}/api/elevenlabs-agent/end-call`,
              method: "POST",
              request_body_schema: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    description: "Reason for ending the call (e.g., 'conversation_complete', 'customer_requested', 'no_response')"
                  },
                  summary: {
                    type: "string", 
                    description: "Brief summary of the call outcome"
                  },
                  callId: {
                    type: "string",
                    description: "The call ID from the database"
                  },
                  twilioCallSid: {
                    type: "string", 
                    description: "The Twilio Call SID"
                  }
                },
                required: ["reason"]
              }
            }
          }
        ]
      }
    }
  };

  const agentResponse = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/create`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(agentPayload)
  });

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
    businessConfig.temperature
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

    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    logger.info("🎙️ Starting call recording via API", { twilioCallSid });

    const recording = await client.calls(twilioCallSid).recordings.create({
      recordingStatusCallback: webhookUrl,
      recordingStatusCallbackMethod: 'POST',
      recordingStatusCallbackEvent: ['completed']
    });

    logger.info("✅ Recording started", {
      twilioCallSid,
      recordingSid: recording.sid
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

// Function to finalize call record and send email
// Track finalized calls to prevent duplicates
const finalizedCalls = new Set<string>();

const finalizeCallRecord = async (callId: string, callStartTime: Date, businessName: string, businessId?: string) => {
  // Prevent duplicate finalization
  if (finalizedCalls.has(callId)) {
    logger.info("⚠️ Call already finalized, skipping", { callId });
    return;
  }
  
  finalizedCalls.add(callId);
  if (!callId || !callStartTime) return;

  try {
    const duration = Math.floor(
      (Date.now() - callStartTime.getTime()) / 1000
    );

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
      const { BillingService } = await import('../services/billingService.js');
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
    });

    // Email will be sent after summary generation in the transcription process
    logger.info("📧 Email will be sent after summary generation", { callId, businessId });
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
      twilioCallSid
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
      return res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, this number is not configured.</Say>
          <Hangup/>
        </Response>`);
    }

    const agentId = await getOrCreateAgent(businessConfig);

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
      twilioCallSid
    });

    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'wss' : 'ws';
    const host = req.headers.host || 'localhost:3001';
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
      recordingWebhookUrl
    });

    // Simple TwiML with just Connect - recording will be started via API
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${websocketUrl}">
            <Parameter name="businessId" value="${businessConfig.businessId}" />
            <Parameter name="businessName" value="${businessConfig.businessName}" />
            <Parameter name="agentId" value="${agentId}" />
            <Parameter name="twilioCallSid" value="${twilioCallSid}" />
            <Parameter name="callerNumber" value="${callerNumber || 'Unknown'}" />
            <Parameter name="callId" value="${call?.id || ''}" />
            <Parameter name="startRecording" value="true" />
          </Stream>
        </Connect>
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

// End call tool endpoint
router.post("/end-call", async (req: Request, res: Response) => {
  try {
    const { reason, summary, callId, twilioCallSid } = req.body;
    
    logger.info("🔚 End call tool triggered", {
      reason,
      summary,
      callId,
      twilioCallSid
    });

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
          
          logger.info("✅ Call ended via Twilio API", { twilioCallSid });
        } else {
          logger.error("❌ Missing Twilio credentials for ending call");
        }
      } catch (error) {
        logger.error("❌ Error ending call via Twilio API:", error);
      }
    }

    // Update call record with end reason
    if (callId) {
      try {
        await db.call.update({
          where: { id: callId },
          data: {
            status: "COMPLETED",
            summary: summary || `Call ended: ${reason}`
          }
        });
        logger.info("✅ Call record updated with end reason", { callId });
      } catch (error) {
        logger.error("❌ Error updating call record:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
      reason,
      summary
    });
  } catch (error) {
    logger.error("❌ Error in end-call endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error ending call"
    });
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

    const connectToElevenLabs = async (agentId: string) => {
      try {
        const signedUrl = await getSignedUrl(agentId);
        elevenLabsWs = new WebSocket(signedUrl);

        elevenLabsWs.on("open", () => {
          logger.info("✅ Connected to ElevenLabs");
        });

        elevenLabsWs.on("message", (data) => {
          const message = JSON.parse(data.toString());

          if (message.type === "conversation_initiation_metadata") {
            const meta = message.conversation_initiation_metadata_event;
            logger.info("🎵 Audio formats confirmed", {
              input: meta?.user_input_audio_format,
              output: meta?.agent_output_audio_format
            });
          } else if (message.type === "audio" && message.audio_event?.audio_base_64) {
            if (streamSid) {
              ws.send(JSON.stringify({
                event: "media",
                streamSid,
                media: { payload: message.audio_event.audio_base_64 }
              }));
            }
          } else if (message.type === "interruption" && streamSid) {
            ws.send(JSON.stringify({ event: "clear", streamSid }));
          } else if (message.type === "ping" && message.ping_event?.event_id) {
            elevenLabsWs?.send(JSON.stringify({
              type: "pong",
              event_id: message.ping_event.event_id
            }));
          }
        });

        elevenLabsWs.on("error", (error) => {
          logger.error("❌ ElevenLabs error:", error);
        });

        elevenLabsWs.on("close", () => {
          logger.info("🔌 ElevenLabs disconnected");
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
        const agentId = customParameters.agentId || "agent_8001k6wjmac4e27tx268nfwq2611";
        businessName = customParameters.businessName;
        businessId = customParameters.businessId;
        callId = customParameters.callId;
        callStartTime = new Date();
        const twilioCallSid = customParameters.twilioCallSid;
        const shouldStartRecording = customParameters.startRecording === "true";

        logger.info("🎬 Stream started", { 
          streamSid, 
          agentId, 
          businessName,
          callId,
          twilioCallSid
        });

        // Start recording via API after stream is established
        if (shouldStartRecording && twilioCallSid) {
          const webhookUrl = process.env.NGROK_URL 
            ? `${process.env.NGROK_URL}/api/webhooks/recording-status`
            : "https://server-production-0693e.up.railway.app/api/webhooks/recording-status";
          
          setTimeout(async () => {
            await startRecording(twilioCallSid, webhookUrl);
          }, 2000); // Wait 2 seconds for stream to be fully established
        }

        // Store callId in WebSocket for tool access
        (ws as any).callId = callId;
        (ws as any).twilioCallSid = twilioCallSid;

        await connectToElevenLabs(agentId);
      } else if (data.event === "media" && elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.send(JSON.stringify({
          user_audio_chunk: data.media.payload
        }));
      } else if (data.event === "stop") {
        logger.info("⏹️ Stream stopped");
        
        // Finalize call record
        if (callId && callStartTime && businessName) {
          await finalizeCallRecord(callId, callStartTime, businessName, businessId || undefined);
        }
        
        elevenLabsWs?.close();
      }
    });

    ws.on("close", () => {
      logger.info("🔌 Twilio disconnected");
      
      // Finalize call record on disconnect
      if (callId && callStartTime && businessName) {
        finalizeCallRecord(callId, callStartTime, businessName, businessId || undefined);
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