/**
 * ElevenLabs Agent Service
 *
 * Centralized service for managing ElevenLabs conversational AI agents.
 * - Creates agent once during onboarding
 * - Updates agent only when settings change
 * - Fetches stored agent ID for calls (no API call needed)
 */

import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { buildBasePromptSections, buildSystemPrompt, type PromptSections } from "@/utils/instructions";
import crypto from "crypto";

// Read API key at runtime to ensure it's loaded from environment
const getElevenLabsApiKey = () => process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// Voice mapping: local voice names to ElevenLabs voice IDs
// These are the recommended voices for telephony (8kHz audio)
export const VOICE_MAPPING: Record<string, { voiceId: string; voiceName: string }> = {
  // ElevenLabs professional voices optimized for telephony
  james: { voiceId: "Smxkoz0xiOoHo5WcSskf", voiceName: "James" },
  rachel: { voiceId: "21m00Tcm4TlvDq8ikWAM", voiceName: "Rachel" },
  sarah: { voiceId: "EXAVITQu4vr4xnSDxMaL", voiceName: "Sarah" },
  domi: { voiceId: "AZnzlk1XvdvUeBnXmlld", voiceName: "Domi" },
  bella: { voiceId: "EXAVITQu4vr4xnSDxMaL", voiceName: "Bella" },
  antoni: { voiceId: "ErXwobaYiN019PkySvjV", voiceName: "Antoni" },
  elli: { voiceId: "MF3mGyEYCl7XYWbV9V6O", voiceName: "Elli" },
  josh: { voiceId: "TxGEqnHWrfWFTfGW9XjX", voiceName: "Josh" },
  arnold: { voiceId: "VR6AewLTigWG4xSOukaG", voiceName: "Arnold" },
  adam: { voiceId: "pNInz6obpgDQGcFmaJgB", voiceName: "Adam" },
  sam: { voiceId: "yoZ06aMxZJJ28mfd3POQ", voiceName: "Sam" },
};

interface CreateAgentConfig {
  businessId: string;
  businessName: string;
  businessDescription: string;
  voiceName: string;
  firstMessage: string;
  // Agent settings (stored in ElevenLabsAgent)
  askForName?: boolean;
  askForPhone?: boolean;
  askForEmail?: boolean;
  askForCompany?: boolean;
  askForAddress?: boolean;
  systemPrompt?: string;
  goodbyeMessage?: string;
  temperature?: number;
}

interface UpdateAgentConfig {
  systemPrompt?: string;
  firstMessage?: string;
  voiceName?: string;
  temperature?: number;
  businessMemories?: Array<{ title: string; content: string }>;
  askForName?: boolean;
  askForPhone?: boolean;
  askForCompany?: boolean;
  askForEmail?: boolean;
  askForAddress?: boolean;
  goodbyeMessage?: string;
}

export class ElevenLabsAgentService {
  /**
   * Map local voice name to ElevenLabs voice ID
   */
  getVoiceMapping(voiceName: string): { voiceId: string; voiceName: string } {
    const normalizedName = voiceName.toLowerCase().trim();

    // Check if it's already a voice ID (starts with capital letter and is long)
    if (voiceName.length > 15 && /^[A-Za-z0-9]+$/.test(voiceName)) {
      return { voiceId: voiceName, voiceName: voiceName };
    }

    const mapping = VOICE_MAPPING[normalizedName] as { voiceId: string; voiceName: string } | undefined;
    if (mapping) {
      return mapping;
    }

    // Fallback to Rachel (professional female voice optimized for telephony)
    logger.warn(`Unknown voice name: ${voiceName}, falling back to Rachel`);
    return VOICE_MAPPING.rachel as { voiceId: string; voiceName: string };
  }

  /**
   * Generate a hash of the configuration to detect changes
   */
  generateConfigHash(
    systemMessage: string,
    firstMessage: string,
    temperature: number,
    voiceId: string
  ): string {
    const configString = `${systemMessage}|${firstMessage}|${temperature}|${voiceId}`;
    return crypto.createHash("md5").update(configString).digest("hex");
  }

  /**
   * Build system message from business config
   * Uses structured 6 building blocks approach (Personality, Environment, Tone, Goal, Guardrails, Tools)
   */
  buildSystemMessage(
    businessDescription: string,
    businessMemories: Array<{ title: string; content: string }> = [],
    aiConfig?: any
  ): string {
    const baseSections = buildBasePromptSections();
    const customSections: Partial<PromptSections> = {};

    // Add business description to environment
    const businessContext = `\n\n## Business Context
You are the AI receptionist for a business with the following description:
${businessDescription}`;

    customSections.environment = baseSections.environment + businessContext;

    // Add business memory context to Environment section
    if (businessMemories && businessMemories.length > 0) {
      const businessKnowledge = `\n\n## Business Knowledge Base
You have access to the following important information about this business:

${businessMemories.map((memory) => `• ${memory.title}: ${memory.content}`).join("\n")}

Use this information to answer customer questions accurately. If asked about something in your knowledge base, provide the information confidently.`;

      customSections.environment += businessKnowledge;
    }

    // Add custom system prompt if provided
    const additionalContent: string[] = [];

    if (aiConfig?.systemPrompt) {
      additionalContent.push(`\n\n## Additional Instructions\n${aiConfig.systemPrompt}`);
    }

    // Add customer information collection to Goal section
    if (aiConfig) {
      const questionsToAsk = [];
      if (aiConfig.askForName) questionsToAsk.push("name");
      if (aiConfig.askForPhone) questionsToAsk.push("phone number");
      if (aiConfig.askForCompany) questionsToAsk.push("company name");
      if (aiConfig.askForAddress) questionsToAsk.push("address");

      if (questionsToAsk.length > 0) {
        const infoCollectionNote = `\n\n**Customer Information Collection:** Collect customer information (${questionsToAsk.join(", ")}) ONLY AFTER you have gathered all the necessary business information (date, time, quantity, service details, etc.). Focus on their request first, then get their contact details at the end.`;

        customSections.goal = baseSections.goal + infoCollectionNote;

        if (aiConfig.askForPhone) {
          customSections.goal += `\n\n**Phone Number Collection:** Use caller ID when available. Ask "Is this the best number to reach you at?" instead of "What's your phone number?". This is more natural and saves time.`;
        }
      }

      if (aiConfig.goodbyeMessage) {
        customSections.tools = baseSections.tools.replace(
          'Say your goodbye message (e.g., "Thank you for calling, have a great day!")',
          `Say your goodbye message: "${aiConfig.goodbyeMessage}"`
        );
      }
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

    return buildSystemPrompt(finalSections, additionalContent);
  }

  /**
   * Create a new ElevenLabs agent during onboarding
   * This should be called ONCE when user completes onboarding
   */
  async createAgent(config: CreateAgentConfig): Promise<string | null> {
    const apiKey = getElevenLabsApiKey();
    if (!apiKey) {
      logger.error("Missing ElevenLabs API key", {
        hasEnvVar: !!process.env.ELEVENLABS_API_KEY,
        envVarLength: process.env.ELEVENLABS_API_KEY?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('ELEVEN')).join(', '),
      });
      return null;
    }

    const {
      businessId,
      businessName,
      businessDescription,
      voiceName,
      firstMessage,
      askForName = true,
      askForPhone = true,
      askForEmail = true,
      askForCompany = false,
      askForAddress = false,
      systemPrompt,
      goodbyeMessage,
      temperature = 0.7,
    } = config;

    // Check if agent already exists
    const existingAgent = await db.elevenLabsAgent.findFirst({
      where: { businessId },
    });

    if (existingAgent) {
      logger.info("Agent already exists for business", {
        businessId,
        agentId: existingAgent.agentId,
      });
      return existingAgent.agentId;
    }

    // Get voice mapping
    const voiceMapping = this.getVoiceMapping(voiceName);
    logger.info("Creating agent with voice", {
      requestedVoice: voiceName,
      mappedVoiceId: voiceMapping.voiceId,
      mappedVoiceName: voiceMapping.voiceName,
    });

    // Build initial system message with agent settings
    const agentConfig = {
      systemPrompt,
      askForName,
      askForPhone,
      askForCompany,
      askForEmail,
      askForAddress,
      goodbyeMessage,
    };
    const systemMessage = this.buildSystemMessage(businessDescription, [], agentConfig);

    // Build prompt config with end_call system tool
    const promptConfig = {
      prompt: systemMessage,
      llm: "gpt-4o-mini",
      temperature,
      max_tokens: 150,
      tools: [
        {
          type: "system",
          name: "end_call",
          description: "", // Empty description uses default end call prompt
        },
      ],
    };

    // Create agent payload
    const agentPayload = {
      name: `${businessName} AI Receptionist`,
      conversation_config: {
        conversation: { max_duration_seconds: 600 },
        turn: {
          mode: "turn",
          turn_timeout: 10,
          silence_end_call_timeout: -1,
        },
        asr: {
          quality: "high",
          provider: "elevenlabs",
          user_input_audio_format: "ulaw_8000",
          no_speech_threshold: 0.3,
        },
        tts: {
          voice_id: voiceMapping.voiceId,
          model_id: "eleven_flash_v2",
          agent_output_audio_format: "ulaw_8000",
          optimize_streaming_latency: 1,
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
    };

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Failed to create ElevenLabs agent", {
          status: response.status,
          error: errorText,
        });
        return null;
      }

      const agentData = await response.json();
      const agentId = agentData.agent_id;

      if (!agentId) {
        logger.error("No agent_id returned from ElevenLabs");
        return null;
      }

      // Generate initial config hash
      const initialHash = this.generateConfigHash(
        systemMessage,
        firstMessage,
        temperature,
        voiceMapping.voiceId
      );

      // Save to database with all settings
      await db.elevenLabsAgent.create({
        data: {
          businessId,
          agentId,
          voiceId: voiceMapping.voiceId,
          voiceName: voiceMapping.voiceName,
          configHash: initialHash,
          isActive: true,
          // Store agent settings
          firstMessage,
          goodbyeMessage,
          systemPrompt,
          temperature,
          askForName,
          askForPhone,
          askForEmail,
          askForCompany,
          askForAddress,
        },
      });

      logger.info("Created new ElevenLabs agent", {
        businessId,
        agentId,
        voiceName: voiceMapping.voiceName,
        voiceId: voiceMapping.voiceId,
      });

      return agentId;
    } catch (error) {
      logger.error("Error creating ElevenLabs agent", { error });
      return null;
    }
  }

  /**
   * Update an existing ElevenLabs agent
   * This should be called when user updates agent settings
   */
  async updateAgent(businessId: string, updates: UpdateAgentConfig): Promise<boolean> {
    const apiKey = getElevenLabsApiKey();
    if (!apiKey) {
      logger.error("Missing ElevenLabs API key");
      return false;
    }

    const existingAgent = await db.elevenLabsAgent.findFirst({
      where: { businessId },
    });

    if (!existingAgent) {
      logger.error("No agent found for business", { businessId });
      return false;
    }

    // Get business memories
    const businessMemories = await db.businessMemory.findMany({
      where: { businessId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Get business description
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { description: true },
    });

    // Merge updates with current config from ElevenLabsAgent
    const mergedConfig = {
      systemPrompt: updates.systemPrompt ?? existingAgent.systemPrompt ?? null,
      firstMessage: updates.firstMessage ?? existingAgent.firstMessage ?? "Hello! How can I assist you today?",
      temperature: updates.temperature ?? existingAgent.temperature ?? 0.7,
      askForName: updates.askForName ?? existingAgent.askForName ?? true,
      askForPhone: updates.askForPhone ?? existingAgent.askForPhone ?? true,
      askForCompany: updates.askForCompany ?? existingAgent.askForCompany ?? false,
      askForEmail: updates.askForEmail ?? existingAgent.askForEmail ?? true,
      askForAddress: updates.askForAddress ?? existingAgent.askForAddress ?? false,
      goodbyeMessage: updates.goodbyeMessage ?? existingAgent.goodbyeMessage ?? null,
    };

    // Build new system message
    const memories = updates.businessMemories ?? businessMemories.map(m => ({
      title: m.title,
      content: m.content,
    }));
    const systemMessage = this.buildSystemMessage(
      business?.description || "",
      memories,
      mergedConfig
    );

    // Get voice ID (either from update or existing)
    let voiceId = existingAgent.voiceId;
    let voiceName = existingAgent.voiceName;
    if (updates.voiceName) {
      const voiceMapping = this.getVoiceMapping(updates.voiceName);
      voiceId = voiceMapping.voiceId;
      voiceName = voiceMapping.voiceName;
    }

    // Generate new config hash
    const newHash = this.generateConfigHash(
      systemMessage,
      mergedConfig.firstMessage,
      mergedConfig.temperature,
      voiceId
    );

    // Check if anything changed
    if (newHash === existingAgent.configHash) {
      logger.info("Agent config unchanged, skipping update", {
        businessId,
        agentId: existingAgent.agentId,
      });
      return true;
    }

    // Build update payload
    const promptConfig = {
      prompt: systemMessage,
      llm: "gpt-4o-mini",
      temperature: mergedConfig.temperature,
      max_tokens: 150,
      tools: [
        {
          type: "system",
          name: "end_call",
          description: "",
        },
      ],
    };

    const updatePayload = {
      conversation_config: {
        turn: {
          mode: "turn",
          turn_timeout: 10,
          silence_end_call_timeout: -1,
        },
        asr: {
          quality: "high",
          provider: "elevenlabs",
          user_input_audio_format: "ulaw_8000",
          no_speech_threshold: 0.3,
        },
        tts: {
          voice_id: voiceId,
          model_id: "eleven_flash_v2",
          agent_output_audio_format: "ulaw_8000",
          optimize_streaming_latency: 1,
          stability: 0.5,
          similarity_boost: 0.5,
          speed: 1.0,
        },
        agent: {
          first_message: mergedConfig.firstMessage,
          language: "en",
          prompt: promptConfig,
        },
      },
    };

    try {
      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/convai/agents/${existingAgent.agentId}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Failed to update ElevenLabs agent", {
          agentId: existingAgent.agentId,
          status: response.status,
          error: errorText,
        });
        return false;
      }

      // Update database with new hash, voice, and all settings
      await db.elevenLabsAgent.update({
        where: { id: existingAgent.id },
        data: {
          configHash: newHash,
          voiceId,
          voiceName,
          // Update all settings
          firstMessage: mergedConfig.firstMessage,
          goodbyeMessage: mergedConfig.goodbyeMessage,
          systemPrompt: mergedConfig.systemPrompt,
          temperature: mergedConfig.temperature,
          askForName: mergedConfig.askForName,
          askForPhone: mergedConfig.askForPhone,
          askForEmail: mergedConfig.askForEmail,
          askForCompany: mergedConfig.askForCompany,
          askForAddress: mergedConfig.askForAddress,
          updatedAt: new Date(),
        },
      });

      logger.info("Updated ElevenLabs agent", {
        businessId,
        agentId: existingAgent.agentId,
        newHash,
        voiceId,
      });

      return true;
    } catch (error) {
      logger.error("Error updating ElevenLabs agent", { error });
      return false;
    }
  }

  /**
   * Get agent ID for a business (no API call, just database lookup)
   * This is what should be called during calls - fast and efficient
   */
  async getAgentId(businessId: string): Promise<string | null> {
    const agent = await db.elevenLabsAgent.findFirst({
      where: { businessId, isActive: true },
    });

    if (!agent) {
      logger.warn("No agent found for business", { businessId });
      return null;
    }

    return agent.agentId;
  }

  /**
   * Get agent details for a business
   */
  async getAgentDetails(businessId: string): Promise<{
    agentId: string;
    voiceId: string;
    voiceName: string;
  } | null> {
    const agent = await db.elevenLabsAgent.findFirst({
      where: { businessId, isActive: true },
    });

    if (!agent) {
      return null;
    }

    return {
      agentId: agent.agentId,
      voiceId: agent.voiceId,
      voiceName: agent.voiceName,
    };
  }

  /**
   * Delete agent (for cleanup)
   */
  async deleteAgent(businessId: string): Promise<boolean> {
    const apiKey = getElevenLabsApiKey();
    if (!apiKey) {
      logger.error("Missing ElevenLabs API key");
      return false;
    }

    const agent = await db.elevenLabsAgent.findFirst({
      where: { businessId },
    });

    if (!agent) {
      logger.info("No agent to delete", { businessId });
      return true;
    }

    try {
      // Delete from ElevenLabs
      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/convai/agents/${agent.agentId}`,
        {
          method: "DELETE",
          headers: {
            "xi-api-key": apiKey,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        logger.error("Failed to delete ElevenLabs agent", {
          agentId: agent.agentId,
          status: response.status,
          error: errorText,
        });
        // Continue to delete from database even if API call fails
      }

      // Delete from database
      await db.elevenLabsAgent.delete({
        where: { id: agent.id },
      });

      logger.info("Deleted ElevenLabs agent", {
        businessId,
        agentId: agent.agentId,
      });

      return true;
    } catch (error) {
      logger.error("Error deleting ElevenLabs agent", { error });
      return false;
    }
  }
}

export const elevenLabsAgentService = new ElevenLabsAgentService();
