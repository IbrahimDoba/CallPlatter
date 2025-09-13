import { Router } from "express";
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { instructions } from "@/utils/instructions";

const router: Router = Router();

/**
 * POST /api/ai-receptionist/realtime/ephemeral-token
 * Mints a short-lived ephemeral token for OpenAI Realtime WebRTC sessions.
 * Never expose your permanent API key to the browser – use this endpoint instead.
 */
router.post("/realtime/ephemeral-token", async (req, res) => {
  try {
    const {
      model = "gpt-4o-realtime-preview-2024-12-17",
      voice,
      businessId,
    } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ success: false, error: "Server missing OPENAI_API_KEY" });
    }

    // Load per-business AI Agent config to personalize the realtime session
    let sessionVoice = voice || "alloy";
    // let instructions = [
    //   "You are an AI phone receptionist for a business.",
    //   "Your job: greet callers, answer questions, route appropriately, book appointments, and take messages.",
    //   "Style: extremely concise, friendly, and professional. Prefer one short sentence (<= 15 words).",
    //   "CRITICAL: Only respond ONCE per user message. Never generate multiple responses or interrupt yourself.",
    //   "Wait for the caller to speak before responding. Do not continue talking after your response.",
    //   "Ask at most one clarifying question only when necessary to proceed.",
    //   "Avoid filler and small talk. No emojis. Keep the conversation natural and efficient.",
    //   'If there is silence for more than 5 seconds after your response, ask "Are you still there?" once. If no response after 5 more seconds, say goodbye and append <END_CALL>.',
    //   "When the conversation is complete or the caller is done, append <END_CALL> after your final sentence.",
    // ].join("\n");
    let transcriptionModel: string | undefined = "whisper-1";
    let temperature: number | undefined = 0.7; // Lower temperature for more predictable responses
    let firstMessage: string | null | undefined = undefined;

    // Create a mutable copy of the instructions
    const sessionInstructions = [...instructions];

    let usedConfig = false;
    if (typeof businessId === "string" && businessId.trim()) {
      try {
        let cfg = await db.aIAgentConfig.findUnique({ where: { businessId } });
        logger.info("Loading AIAgentConfig for realtime session", {
          businessId,
          found: !!cfg,
        });

        // Fallback: sometimes client may send a userId; resolve to their businessId
        if (!cfg) {
          try {
            const user = await db.user.findUnique({
              where: { id: businessId },
            });
            if (user?.businessId) {
              logger.info(
                "Resolved userId to businessId for AIAgentConfig lookup",
                { userId: businessId, resolvedBusinessId: user.businessId }
              );
              cfg = await db.aIAgentConfig.findUnique({
                where: { businessId: user.businessId },
              });
            } else if (user) {
              // Secondary fallback: find a business that contains this user
              try {
                const biz = await db.business.findFirst({
                  where: { users: { some: { id: user.id } } },
                });
                if (biz) {
                  logger.info(
                    "Resolved user via membership to business for AIAgentConfig lookup",
                    { userId: user.id, resolvedBusinessId: biz.id }
                  );
                  cfg = await db.aIAgentConfig.findUnique({
                    where: { businessId: biz.id },
                  });
                }
              } catch (e2) {
                logger.warn(
                  "Failed membership-based business resolution for AIAgentConfig",
                  { userId: user.id, e2 }
                );
              }
            }
          } catch (e) {
            logger.warn(
              "Failed attempting user->business fallback for AIAgentConfig",
              { candidateId: businessId, e }
            );
          }
        }

        if (!cfg) {
          // As a final step: if the provided ID is a valid business, create a default config lazily
          try {
            const biz = await db.business.findUnique({
              where: { id: businessId },
            });
            if (biz) {
              cfg = await db.aIAgentConfig.create({
                data: {
                  businessId: biz.id,
                  voice: sessionVoice,
                  responseModel: "gpt-4o-realtime-preview-2024-12-17",
                  transcriptionModel: transcriptionModel || "whisper-1",
                  systemPrompt: null,
                  agentLLM: null,
                  firstMessage: null,
                  temperature: 0.7,
                },
              });
              logger.info("Created default AIAgentConfig for business", {
                businessId: biz.id,
              });
            } else {
              logger.info(
                "No business found matching provided id; continuing with in-memory defaults",
                { providedId: businessId }
              );
            }
          } catch (e3) {
            logger.warn("Failed to auto-create default AIAgentConfig", {
              candidateBusinessId: businessId,
              e3,
            });
          }
        }

        if (cfg) {
          if (cfg.voice) sessionVoice = cfg.voice;
          if (cfg.systemPrompt) sessionInstructions.push(`\n\n${cfg.systemPrompt}`);
          if (cfg.agentLLM) sessionInstructions.push(`\n\nBusiness memory/context:\n${cfg.agentLLM}`);
          if (cfg.firstMessage) {
            sessionInstructions.push(`\n\nWhen the call starts, greet the caller with: "${cfg.firstMessage}"`);
            firstMessage = cfg.firstMessage;
          }
          if (cfg.transcriptionModel)
            transcriptionModel = cfg.transcriptionModel;
          if (typeof cfg.temperature === "number")
            temperature = cfg.temperature;
          usedConfig = true;
        }
      } catch (err) {
        logger.error("Failed to load AIAgentConfig for realtime session", {
          businessId,
          err,
        });
      }
    }

    // Create a Realtime session with OpenAI; response contains a client_secret.value token
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          voice: sessionVoice,
          // Request both audio and text so the session can emit text events
          modalities: ["audio", "text"],
          // Ask the provider to transcribe incoming audio for user-side text
          input_audio_transcription: {
            model: transcriptionModel || "whisper-1",
          },
          // Enhanced VAD settings for better silence detection
          turn_detection: {
            type: "server_vad",
            threshold: 0.4, // Higher threshold to reduce false positives
            prefix_padding_ms: 300, // Audio before speech starts
            silence_duration_ms: 800, // Longer silence before ending turn (1.2 seconds)
          },
          // Enhanced session configuration
          instructions: sessionInstructions.join('\n'),
          temperature: temperature || 0.6, // Lower temperature for consistency
          max_response_output_tokens: 350, // Shorter responses to prevent cutoffs

          tool_choice: "none", // Disable tools to prevent unexpected behavior
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      logger.error("Failed to create Realtime session", {
        status: response.status,
        body: text,
      });
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to mint ephemeral token",
          details: text,
        });
    }

    const data = await response.json();
    // Typical shape: { id, client_secret: { value, expires_at }, ... }
    const token = data?.client_secret?.value;
    const expiresAt = data?.client_secret?.expires_at;

    if (!token) {
      logger.error("Realtime session response missing client_secret");
      return res
        .status(500)
        .json({ success: false, error: "Invalid session response" });
    }

    logger.info("Ephemeral token minted for Realtime session", {
      businessId: typeof businessId === "string" ? businessId : null,
      usedConfig,
      expiresAt,
      applied: {
        voice: sessionVoice,
        transcriptionModel,
        temperature,
      },
    });

    res.json({
      success: true,
      token,
      expiresAt,
      model,
      voice: sessionVoice,
      firstMessage: firstMessage || null,
      usedConfig,
      applied: {
        voice: sessionVoice,
        transcriptionModel,
        temperature,
      },
    });
  } catch (error) {
    logger.error("Error minting ephemeral token:", error);
    res
      .status(500)
      .json({ success: false, error: "Error minting ephemeral token" });
  }
});

/**
 * POST /api/ai-receptionist/realtime/refresh-token
 * Refresh an expired ephemeral token for an existing session
 */
router.post("/realtime/refresh-token", async (req, res) => {
  try {
    const { businessId } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ success: false, error: "Server missing OPENAI_API_KEY" });
    }

    // Create new session (tokens can't be refreshed, need new session)
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
          modalities: ["audio", "text"],
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 800,
          },
          instructions:
            "You are an AI phone receptionist. Be concise and professional.",
          temperature: 0.7,
          max_response_output_tokens: 150,
          tool_choice: "none",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      logger.error("Failed to refresh Realtime session", {
        status: response.status,
        body: text,
      });
      return res
        .status(500)
        .json({ success: false, error: "Failed to refresh token" });
    }

    const data = await response.json();
    const token = data?.client_secret?.value;
    const expiresAt = data?.client_secret?.expires_at;

    if (!token) {
      return res
        .status(500)
        .json({ success: false, error: "Invalid refresh response" });
    }

    logger.info("Ephemeral token refreshed", { businessId, expiresAt });
    res.json({ success: true, token, expiresAt });
  } catch (error) {
    logger.error("Error refreshing ephemeral token:", error);
    res
      .status(500)
      .json({ success: false, error: "Error refreshing ephemeral token" });
  }
});

/**
 * GET /api/ai-receptionist/health
 * Health check for AI receptionist service
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Receptionist service is running",
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  });
});

export default router;
