import WebSocket from "ws";
import { logger } from "../../utils/logger";
import { BusinessConfig } from "./BusinessConfigService";
import { CallStateService } from "./CallStateService";
import { CallRecordingService } from "./CallRecordingService";
import { SessionConfigService } from "./SessionConfigService";
import { MessageHandlers } from "./MessageHandlers";

export class WebSocketConnectionService {
  private openAiWs: WebSocket | null = null;
  private messageHandlers: MessageHandlers | null = null;

  constructor(
    private stateService: CallStateService,
    private recordingService: CallRecordingService,
    private sessionConfigService: SessionConfigService
  ) {}

  /**
   * Initialize OpenAI WebSocket connection
   */
  async initializeOpenAIConnection(businessConfig: BusinessConfig, callerNumber?: string): Promise<void> {
    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) {
      logger.error("Missing OpenAI API key");
      throw new Error("OpenAI API key not configured");
    }

    logger.info("Initializing OpenAI WebSocket connection:", {
      keyPrefix: OPENAI_API_KEY.substring(0, 7) + "...",
      keyLength: OPENAI_API_KEY.length,
      businessId: businessConfig.businessId,
      callerNumber: callerNumber || "Unknown",
      environment: process.env.NODE_ENV,
    });

    try {
      this.openAiWs = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }
      );

      this.messageHandlers = new MessageHandlers(
        this.openAiWs,
        null as any, // Will be set when Twilio connection is established
        this.stateService,
        this.sessionConfigService
      );

      this.setupOpenAIEventHandlers(businessConfig, callerNumber);
    } catch (error) {
      logger.error("Failed to initialize OpenAI WebSocket connection:", {
        error: error instanceof Error ? error.message : String(error),
        businessId: businessConfig.businessId,
        callerNumber: callerNumber || "Unknown",
      });
      throw error;
    }
  }

  /**
   * Setup Twilio WebSocket connection
   */
  setupTwilioConnection(twilioWs: WebSocket): void {
    if (this.messageHandlers) {
      // Update the Twilio WebSocket reference in message handlers
      (this.messageHandlers as any).twilioWs = twilioWs;
    }
  }

  /**
   * Configure session for first message delivery
   */
  async configureSessionForFirstMessage(businessConfig: BusinessConfig, callerNumber?: string): Promise<void> {
    if (!this.openAiWs || this.openAiWs.readyState !== WebSocket.OPEN) {
      logger.warn("OpenAI WebSocket not ready for session configuration");
      return;
    }

    try {
      const { config, isExistingCustomer } = await this.sessionConfigService.buildAppropriateSessionConfig(
        businessConfig,
        callerNumber
      );

      this.openAiWs.send(JSON.stringify(config));
      this.stateService.markSessionConfigured();

      logger.info("Session configured for first message delivery", {
        businessId: businessConfig.businessId,
        isExistingCustomer,
        greetingType: isExistingCustomer ? "personalized" : "business_first_message"
      });
    } catch (error) {
      logger.error("Error configuring session for first message", error);
    }
  }

  /**
   * Setup OpenAI event handlers
   */
  private setupOpenAIEventHandlers(businessConfig: BusinessConfig, callerNumber?: string): void {
    if (!this.openAiWs) return;

    this.openAiWs.on("open", () => {
      logger.info("Connected to OpenAI Realtime API", {
        businessId: businessConfig.businessId,
        callerNumber: callerNumber || "Unknown",
        environment: process.env.NODE_ENV,
      });
      this.configureSessionForFirstMessage(businessConfig, callerNumber);
    });

    this.openAiWs.on("message", (data) => {
      try {
        if (this.messageHandlers) {
          const buffer = data instanceof Buffer ? data : Buffer.from(data as ArrayBuffer);
          this.messageHandlers.handleOpenAIMessage(buffer);
        }
      } catch (error) {
        logger.error("Error handling OpenAI message:", {
          error: error instanceof Error ? error.message : String(error),
          businessId: businessConfig.businessId,
          dataSize: data instanceof Buffer ? data.length : (data as ArrayBuffer).byteLength,
        });
      }
    });

    this.openAiWs.on("close", (code, reason) => {
      logger.error("OpenAI WebSocket closed:", {
        code,
        reason: reason.toString(),
        timestamp: new Date().toISOString(),
        businessId: businessConfig.businessId,
        callerNumber: callerNumber || "Unknown",
        environment: process.env.NODE_ENV,
      });
    });

    this.openAiWs.on("error", (error) => {
      logger.error("OpenAI WebSocket error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as Error & { code?: string }).code,
        businessId: businessConfig.businessId,
        callerNumber: callerNumber || "Unknown",
        environment: process.env.NODE_ENV,
      });
    });
  }

  /**
   * Handle Twilio message
   */
  async handleTwilioMessage(message: Buffer): Promise<void> {
    if (this.messageHandlers) {
      await this.messageHandlers.handleTwilioMessage(message);
    }
  }

  /**
   * Close connections
   */
  closeConnections(): void {
    if (this.openAiWs && this.openAiWs.readyState === WebSocket.OPEN) {
      this.openAiWs.close();
    }
  }

  /**
   * Check if OpenAI connection is ready
   */
  isOpenAIReady(): boolean {
    return this.openAiWs !== null && this.openAiWs.readyState === WebSocket.OPEN;
  }
}
