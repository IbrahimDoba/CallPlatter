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
        include: { elevenLabsAgent: true },
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
        include: { elevenLabsAgent: true },
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
    const agent = business.elevenLabsAgent;

    if (!agent) {
      logger.warn("No ElevenLabsAgent found for business", { businessId: business.id });
      // Return default config without creating one - agent should be created during onboarding
      return {
        businessId: business.id,
        businessName: business.name,
        voice: DEFAULT_VOICE,
        temperature: DEFAULT_TEMPERATURE,
        systemMessage: instructions.join("\n"),
        firstMessage: undefined,
        goodbyeMessage: undefined,
        enableServerVAD: true,
        turnDetection: "server_vad",
      };
    }

    const sessionInstructions = this.buildSessionInstructions(agent);

    return {
      businessId: business.id,
      businessName: business.name,
      voice: agent.voiceName || DEFAULT_VOICE,
      temperature: agent.temperature || DEFAULT_TEMPERATURE,
      systemMessage: sessionInstructions.join("\n"),
      firstMessage: agent.firstMessage || undefined,
      goodbyeMessage: agent.goodbyeMessage || undefined,
      enableServerVAD: true,
      turnDetection: "server_vad",
    };
  }

  /**
   * Build session instructions from ElevenLabsAgent configuration
   */
  private buildSessionInstructions(agent: any): string[] {
    const sessionInstructions = [...instructions];

    if (agent.systemPrompt) {
      sessionInstructions.push(`\n\n${agent.systemPrompt}`);
    }

    // Add question collection instructions based on settings
    const questionsToAsk = [];
    if (agent.askForName) questionsToAsk.push("name");
    if (agent.askForPhone) questionsToAsk.push("phone number");
    if (agent.askForEmail) questionsToAsk.push("email address");
    if (agent.askForCompany) questionsToAsk.push("company name");
    if (agent.askForAddress) questionsToAsk.push("address");

    if (questionsToAsk.length > 0) {
      sessionInstructions.push(
        `\n\nDuring the conversation, try to naturally collect the following information from the caller: ${questionsToAsk.join(", ")}. Ask for these details in a conversational way, not all at once.`
      );
    }

    // BusinessMemory will be handled separately in the session update
    if (agent.firstMessage) {
      sessionInstructions.push(
        `\n\nIMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${agent.firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
      );
    }
    if (agent.goodbyeMessage) {
      sessionInstructions.push(
        `\n\nWhen ending the call, use this goodbye message: "${agent.goodbyeMessage}"`
      );
    }

    return sessionInstructions;
  }
}
