import { db } from "@repo/db";
import { logger } from "../../utils/logger";
import { instructions } from "../../utils/instructions";

const DEFAULT_VOICE = "alloy";
const DEFAULT_TEMPERATURE = 0.6;

export interface BusinessConfig {
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

export class BusinessConfigService {
  /**
   * Fetch business configuration by phone number
   */
  async getConfigByPhone(phoneNumber: string): Promise<BusinessConfig | null> {
    try {
      const business = await db.business.findFirst({
        where: { phoneNumber },
        include: { aiAgentConfig: true },
      });

      if (!business) {
        logger.info("No business found for phone number", { phoneNumber });
        return null;
      }

      return await this.buildBusinessConfig(business);
    } catch (error) {
      logger.error("Error fetching business config by phone", { phoneNumber, error });
      return null;
    }
  }

  /**
   * Fetch business configuration by ID
   */
  async getConfigById(businessId: string): Promise<BusinessConfig | null> {
    try {
      const business = await db.business.findUnique({
        where: { id: businessId },
        include: { aiAgentConfig: true },
      });

      if (!business) {
        logger.info("No business found for ID", { businessId });
        return null;
      }

      return await this.buildBusinessConfig(business);
    } catch (error) {
      logger.error("Error fetching business config by ID", { businessId, error });
      return null;
    }
  }

  /**
   * Build business configuration from database record
   */
  private async buildBusinessConfig(business: any): Promise<BusinessConfig> {
    let aiConfig = business.aiAgentConfig;
    
    if (!aiConfig) {
      aiConfig = await this.createDefaultAIConfig(business.id);
    }

    const sessionInstructions = this.buildSessionInstructions(aiConfig);
    
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
  }

  /**
   * Create default AI configuration for business
   */
  private async createDefaultAIConfig(businessId: string) {
    const aiConfig = await db.aIAgentConfig.create({
      data: {
        businessId,
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

    logger.info("Created default AIAgentConfig for business", { businessId });
    return aiConfig;
  }

  /**
   * Build session instructions from AI configuration
   */
  private buildSessionInstructions(aiConfig: any): string[] {
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

    return sessionInstructions;
  }
}
