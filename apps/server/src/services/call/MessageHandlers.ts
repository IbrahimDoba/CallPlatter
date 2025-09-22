import WebSocket from "ws";
import { logger } from "../../utils/logger";
import { BusinessConfig } from "./BusinessConfigService";
import { CallStateService } from "./CallStateService";
import { SessionConfigService } from "./SessionConfigService";
import { lookupCallerContext } from "../callLookupService";

export class MessageHandlers {
  constructor(
    private openAiWs: WebSocket,
    private twilioWs: WebSocket | null,
    private stateService: CallStateService,
    private sessionConfigService: SessionConfigService
  ) {}

  /**
   * Handle OpenAI WebSocket messages
   */
  handleOpenAIMessage(data: Buffer): void {
    try {
      const response = JSON.parse(data.toString());

      // Check for errors
      if (response.type === "error") {
        this.handleOpenAIError(response);
        return;
      }

      // Check session status
      if (response.type === "session.created" || response.type === "session.updated") {
        logger.info("Session status:", response.type);
      }

      // Handle session updates for first message delivery
      if (response.type === "session.updated" && this.shouldHandleSessionUpdate()) {
        this.handleSessionUpdate();
      }

      // Handle response events
      if (response.type === "response.output_audio.delta" && response.delta) {
        this.handleAudioDelta(response);
      }

      if (response.type === "input_audio_buffer.speech_started") {
        this.handleSpeechStarted();
      }

      // Log other events
      const LOG_EVENT_TYPES = [
        "error",
        "response.content.done",
        "rate_limits.updated",
        "response.done",
        "session.created",
        "session.updated",
      ];

      if (LOG_EVENT_TYPES.includes(response.type)) {
        logger.info(`OpenAI event: ${response.type}`);
      }

    } catch (error) {
      logger.error("Error processing OpenAI message:", error);
    }
  }

  /**
   * Handle Twilio WebSocket messages
   */
  async handleTwilioMessage(message: Buffer): Promise<void> {
    try {
      const data = JSON.parse(message.toString()) as {
        event: string;
        start?: { streamSid?: string; customParameters?: Record<string, string> };
        media?: { timestamp: number; payload: string };
        streamSid?: string;
      };


      switch (data.event) {
        case "start":
          await this.handleStartEvent(data);
          break;
        case "media":
          this.handleMediaEvent(data);
          break;
        case "mark":
          this.handleMarkEvent();
          break;
        case "stop":
          this.handleStopEvent();
          break;
        default:
          logger.warn("Unknown Twilio event type:", { event: data.event });
      }
    } catch (error) {
      logger.error("Error parsing Twilio message:", {
        error: error instanceof Error ? error.message : String(error),
        messageSize: message.length,
        messagePreview: message.toString().substring(0, 200),
      });
    }
  }

  /**
   * Handle start event from Twilio
   */
  private async handleStartEvent(data: any): Promise<void> {
    const customParameters = data.start?.customParameters || {};
    const businessId = customParameters.businessId || null;
    const businessName = customParameters.businessName || null;
    const twilioCallSid = customParameters.twilioCallSid || null;
    const callerNumber = customParameters.callerNumber || null;

    this.stateService.updateState({
      businessId,
      businessName,
      callerNumber,
      streamSid: data.start?.streamSid || null,
    });

    logger.info("Extracted parameters from Twilio start event:", {
      businessId,
      businessName,
      twilioCallSid,
      callerNumber,
      customParameters,
      streamSid: data.start?.streamSid,
    });
  }

  /**
   * Handle media event from Twilio
   */
  private handleMediaEvent(data: any): void {
    if (data.media) {
      this.stateService.set("latestMediaTimestamp", data.media.timestamp);
      
      if (this.openAiWs.readyState === WebSocket.OPEN) {
        try {
          const audioAppend = {
            type: "input_audio_buffer.append",
            audio: data.media.payload,
          };
          this.openAiWs.send(JSON.stringify(audioAppend));
          
        } catch (error) {
          logger.error("Error sending audio to OpenAI:", {
            error: error instanceof Error ? error.message : String(error),
            timestamp: data.media.timestamp,
            payloadSize: data.media.payload.length,
            openAiReady: this.openAiWs.readyState === WebSocket.OPEN,
          });
        }
      } else {
        logger.warn("OpenAI WebSocket not ready for audio:", {
          readyState: this.openAiWs.readyState,
          timestamp: data.media.timestamp,
        });
      }
    }
  }

  /**
   * Handle mark event from Twilio
   */
  private handleMarkEvent(): void {
    this.stateService.removeFromMarkQueue();
  }

  /**
   * Handle stop event from Twilio
   */
  private handleStopEvent(): void {
    const state = this.stateService.getState();
    logger.info("Stream stopped:", { streamSid: state.streamSid });
  }

  /**
   * Handle audio delta from OpenAI
   */
  private handleAudioDelta(response: any): void {
    const state = this.stateService.getState();
    
    try {
      const audioDelta = {
        event: "media",
        streamSid: state.streamSid,
        media: { payload: response.delta },
      };
      
      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
        this.twilioWs.send(JSON.stringify(audioDelta));
      } else {
        logger.warn("Twilio WebSocket not ready for audio delta:", {
          readyState: this.twilioWs?.readyState,
          streamSid: state.streamSid,
        });
      }

      if (!state.responseStartTimestampTwilio) {
        this.stateService.set("responseStartTimestampTwilio", state.latestMediaTimestamp);
      }

      if (response.item_id) {
        this.stateService.set("lastAssistantItem", response.item_id);
      }

      this.sendMark();
    } catch (error) {
      logger.error("Error handling audio delta:", {
        error: error instanceof Error ? error.message : String(error),
        streamSid: state.streamSid,
        deltaSize: response.delta?.length,
        itemId: response.item_id,
      });
    }
  }

  /**
   * Handle speech started event
   */
  private handleSpeechStarted(): void {
    const state = this.stateService.getState();
    
    if (state.markQueue.length > 0 && state.responseStartTimestampTwilio !== null) {
      const elapsedTime = state.latestMediaTimestamp - state.responseStartTimestampTwilio;

      if (state.lastAssistantItem && elapsedTime > 0 && elapsedTime < 5000) {
        const truncateEvent = {
          type: "conversation.item.truncate",
          item_id: state.lastAssistantItem,
          content_index: 0,
          audio_end_ms: elapsedTime,
        };
        
        try {
          this.openAiWs.send(JSON.stringify(truncateEvent));
          logger.info("Sent truncate event", { 
            item_id: state.lastAssistantItem, 
            elapsedTime 
          });
        } catch (error) {
          logger.error("Error sending truncate event", error);
        }
      }

      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
        this.twilioWs.send(
          JSON.stringify({
            event: "clear",
            streamSid: state.streamSid,
          })
        );
      }

      this.stateService.clearMarkQueue();
      this.stateService.set("lastAssistantItem", null);
      this.stateService.set("responseStartTimestampTwilio", null);
    }
  }

  /**
   * Send mark for response tracking
   */
  private sendMark(): void {
    const state = this.stateService.getState();
    
    if (state.streamSid) {
      const markEvent = {
        event: "mark",
        streamSid: state.streamSid,
        mark: { name: "responsePart" },
      };
      
      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
        this.twilioWs.send(JSON.stringify(markEvent));
        this.stateService.addToMarkQueue("responsePart");
      }
    }
  }

  /**
   * Handle session update for first message delivery
   * NOTE: Customer lookup is now handled in WebSocketConnectionService to avoid duplicates
   */
  private async handleSessionUpdate(): Promise<void> {
    const state = this.stateService.getState();
    
    if (!state.businessId) return;

    // Mark memories as injected to prevent duplicate processing
    this.stateService.markMemoriesInjected();

    // Customer lookup is now handled in WebSocketConnectionService
    // No need to do duplicate lookup here
  }

  /**
   * Check if we should handle session update
   */
  private shouldHandleSessionUpdate(): boolean {
    const state = this.stateService.getState();
    return !!(state.businessId && !state.memoriesInjected);
  }

  /**
   * Handle OpenAI errors
   */
  private handleOpenAIError(response: any): void {
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
      logger.warn("Voice update error - session may already be configured");
    } else if (response.error?.code === "invalid_value" && 
               response.error?.message?.includes("Audio content")) {
      logger.warn("Audio truncation error - skipping truncation", {
        message: response.error.message,
      });
    }
  }
}
