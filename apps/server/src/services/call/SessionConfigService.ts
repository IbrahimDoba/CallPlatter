import { logger } from "../../utils/logger";
import { BusinessConfig } from "./BusinessConfigService";
import { lookupCallerContext } from "../callLookupService";

export interface SessionConfig {
  type: "session.update";
  session: {
    type: "realtime";
    output_modalities: ["audio"];
    audio: {
      input: {
        format: { type: "audio/pcmu" };
        turn_detection: any;
      };
      output: {
        format: { type: "audio/pcmu" };
        voice: string;
      };
    };
    instructions: string;
  };
}

export class SessionConfigService {
  /**
   * Build minimal instructions for first message delivery
   */
  buildMinimalInstructions(firstMessage: string): string {
    return [
      "You are a voice AI receptionist. Speak naturally and conversationally.",
      "Keep responses brief (1-2 sentences) but don't sound robotic.",
      "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
      `IMPORTANT: When the call starts, you MUST greet the caller with exactly this message: "${firstMessage}". Do not use any other greeting or start collecting information until after you've delivered this exact first message.`
    ].join("\n");
  }

  /**
   * Build personalized instructions for existing customers
   */
  buildPersonalizedInstructions(businessSystemMessage: string, customerContext: string): string {
    return [
      "You are a voice AI receptionist. Speak naturally and conversationally.",
      "Keep responses brief (1-2 sentences) but don't sound robotic.",
      "CRITICAL: Stop speaking when interrupted. Never continue over the caller.",
      businessSystemMessage, // Include full business context
      "",
      "IMPORTANT: When the call starts, follow the customer context instructions below to greet the caller personally. Do not use any other greeting or start collecting information until after you've delivered the personalized greeting.",
      "",
      customerContext
    ].join("\n");
  }

  /**
   * Build full session configuration with business memories
   */
  buildFullSessionConfig(
    businessConfig: BusinessConfig,
    businessMemories: string
  ): SessionConfig {
    return {
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
  }

  /**
   * Build session configuration for first message delivery
   */
  buildFirstMessageSessionConfig(
    businessConfig: BusinessConfig,
    instructions: string
  ): SessionConfig {
    return {
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
        instructions,
      },
    };
  }

  /**
   * Determine appropriate session configuration based on customer context
   */
  async buildAppropriateSessionConfig(
    businessConfig: BusinessConfig,
    callerNumber?: string
  ): Promise<{ config: SessionConfig; isExistingCustomer: boolean }> {
    try {
      const callContext = await lookupCallerContext(
        businessConfig.businessId,
        callerNumber || ""
      );
      const businessMemories = callContext.contextInstructions || "";
      
      const hasCustomerContext = businessMemories.includes("CUSTOMER CONTEXT:");
      
      if (hasCustomerContext) {
        // Existing customer - use personalized greeting
        const instructions = this.buildPersonalizedInstructions(businessMemories);
        const config = this.buildFirstMessageSessionConfig(businessConfig, instructions);
        
        logger.info("Using personalized greeting for existing customer", {
          businessId: businessConfig.businessId,
          callerNumber: callerNumber || "Unknown"
        });
        
        return { config, isExistingCustomer: true };
      } else {
        // New customer - use business first message
        const instructions = this.buildMinimalInstructions(businessConfig.firstMessage!);
        const config = this.buildFirstMessageSessionConfig(businessConfig, instructions);
        
        logger.info("Using business first message for new customer", {
          businessId: businessConfig.businessId,
          callerNumber: callerNumber || "Unknown"
        });
        
        return { config, isExistingCustomer: false };
      }
    } catch (error) {
      logger.error("Error building session configuration", error);
      
      // Fallback to business first message
      const instructions = this.buildMinimalInstructions(businessConfig.firstMessage!);
      const config = this.buildFirstMessageSessionConfig(businessConfig, instructions);
      
      return { config, isExistingCustomer: false };
    }
  }

  /**
   * Build minimal session config (for immediate setup)
   */
  buildMinimalSessionConfig(businessConfig: BusinessConfig): SessionConfig {
    const voice = businessConfig.voice || "alloy";
    const enableServerVAD = businessConfig.enableServerVAD ?? true;
    const turnDetection = businessConfig.turnDetection || "server_vad";
    
    const instructions = businessConfig.firstMessage 
      ? this.buildMinimalInstructions(businessConfig.firstMessage)
      : "You are a voice AI receptionist. Speak naturally and conversationally.";
    
    return {
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
        instructions: instructions,
      },
    };
  }

  /**
   * Build session config with customer context (for updates)
   */
  buildSessionConfigWithCustomerContext(businessConfig: BusinessConfig, customerContext: string): SessionConfig {
    const voice = businessConfig.voice || "alloy";
    const enableServerVAD = businessConfig.enableServerVAD ?? true;
    const turnDetection = businessConfig.turnDetection || "server_vad";
    
    const instructions = this.buildPersonalizedInstructions(businessConfig.systemMessage, customerContext);
    
    return {
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
        instructions: instructions,
      },
    };
  }
}
