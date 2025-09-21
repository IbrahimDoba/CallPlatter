import { db } from "@repo/db";
import twilio from "twilio";
import { logger } from "../../utils/logger";
import { BusinessConfig } from "./BusinessConfigService";

export class CallRecordingService {
  /**
   * Create call record in database
   */
  async createCallRecord(
    businessConfig: BusinessConfig,
    twilioCallSid?: string,
    customerPhone?: string
  ): Promise<string | null> {
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

      logger.info("Created call record", {
        callId: call.id,
        businessId: businessConfig.businessId,
        businessName: businessConfig.businessName,
        twilioCallSid,
        customerPhone: customerPhone || "Unknown",
      });

      return call.id;
    } catch (error) {
      logger.error("Error creating call record", error);
      return null;
    }
  }

  /**
   * Start call recording using Twilio API
   */
  async startCallRecording(twilioCallSid: string): Promise<string | null> {
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const recording = await client.calls(twilioCallSid).recordings.create({
        recordingStatusCallback: `${process.env.BASE_URL || "https://callplatterserver.onrender.com"}/api/webhooks/recording-status`,
      });

      logger.info("Started call recording via API", {
        twilioCallSid,
        recordingSid: recording.sid,
        status: recording.status,
      });

      return recording.sid;
    } catch (error) {
      logger.error("Error starting call recording", error);
      return null;
    }
  }

  /**
   * Finalize call record with duration and summary
   */
  async finalizeCallRecord(
    callId: string,
    businessName: string,
    callStartTime: Date
  ): Promise<void> {
    try {
      const duration = Math.floor((Date.now() - callStartTime.getTime()) / 1000);

      await db.call.update({
        where: { id: callId },
        data: {
          status: "COMPLETED",
          duration: duration,
          summary: `Call with ${businessName} - Duration: ${duration}s`,
        },
      });

      logger.info("Finalized call record", {
        callId,
        duration,
      });
    } catch (error) {
      logger.error("Error finalizing call record", error);
    }
  }

  /**
   * Schedule call recording start with delay
   */
  scheduleRecordingStart(twilioCallSid: string, delayMs: number = 3000): void {
    setTimeout(async () => {
      await this.startCallRecording(twilioCallSid);
    }, delayMs);
  }
}
