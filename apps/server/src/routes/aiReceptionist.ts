import { Router } from 'express';
import { logger } from '../utils/logger';
import { db } from '@repo/db';

const router: Router = Router();

/**
 * POST /api/ai-receptionist/realtime/ephemeral-token
 * Mints a short-lived ephemeral token for OpenAI Realtime WebRTC sessions.
 * Never expose your permanent API key to the browser – use this endpoint instead.
 */
router.post('/realtime/ephemeral-token', async (req, res) => {
  try {
    const { model = 'gpt-4o-realtime-preview-2024-12-17', voice, businessId } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server missing OPENAI_API_KEY' });
    }

    // Load per-business AI Agent config to personalize the realtime session
    let sessionVoice = voice || 'alloy';
    let instructions = [
      'You are an AI phone receptionist for a business.',
      'Your job: greet callers, answer questions, route appropriately, book appointments, and take messages.',
      'Style: extremely concise, friendly, and professional. Prefer one short sentence (<= 20 words).',
      'Ask at most one clarifying question only when necessary to proceed.',
      'Avoid filler and small talk. No emojis. Keep the conversation natural and efficient.',
      'When the conversation is complete or the caller is done, append <END_CALL> after your final sentence.',
    ].join('\n');
    let transcriptionModel: string | undefined = 'whisper-1';
    let temperature: number | undefined = undefined;
    let firstMessage: string | null | undefined = undefined;

    let usedConfig = false;
    if (typeof businessId === 'string' && businessId.trim()) {
      try {
        let cfg = await db.aIAgentConfig.findUnique({ where: { businessId } });
        logger.info('Loading AIAgentConfig for realtime session', { businessId, found: !!cfg });
        // Fallback: sometimes client may send a userId; resolve to their businessId
        if (!cfg) {
          try {
            const user = await db.user.findUnique({ where: { id: businessId } });
            if (user?.businessId) {
              logger.info('Resolved userId to businessId for AIAgentConfig lookup', { userId: businessId, resolvedBusinessId: user.businessId });
              cfg = await db.aIAgentConfig.findUnique({ where: { businessId: user.businessId } });
            } else if (user) {
              // Secondary fallback: find a business that contains this user
              try {
                const biz = await db.business.findFirst({ where: { users: { some: { id: user.id } } } });
                if (biz) {
                  logger.info('Resolved user via membership to business for AIAgentConfig lookup', { userId: user.id, resolvedBusinessId: biz.id });
                  cfg = await db.aIAgentConfig.findUnique({ where: { businessId: biz.id } });
                }
              } catch (e2) {
                logger.warn('Failed membership-based business resolution for AIAgentConfig', { userId: user.id, e2 });
              }
            }
          } catch (e) {
            logger.warn('Failed attempting user->business fallback for AIAgentConfig', { candidateId: businessId, e });
          }
        }
        if (!cfg) {
          // As a final step: if the provided ID is a valid business, create a default config lazily
          try {
            const biz = await db.business.findUnique({ where: { id: businessId } });
            if (biz) {
              cfg = await db.aIAgentConfig.create({
                data: {
                  businessId: biz.id,
                  voice: sessionVoice,
                  responseModel: 'gpt-4o-realtime-preview-2024-12-17',
                  transcriptionModel: transcriptionModel || 'whisper-1',
                  systemPrompt: null,
                  agentLLM: null,
                  firstMessage: null,
                },
              });
              logger.info('Created default AIAgentConfig for business', { businessId: biz.id });
            } else {
              logger.info('No business found matching provided id; continuing with in-memory defaults', { providedId: businessId });
            }
          } catch (e3) {
            logger.warn('Failed to auto-create default AIAgentConfig', { candidateBusinessId: businessId, e3 });
          }
        }
        if (cfg) {
          if (cfg.voice) sessionVoice = cfg.voice;
          if (cfg.systemPrompt) instructions += `\n\n${cfg.systemPrompt}`;
          if (cfg.agentLLM) instructions += `\n\nBusiness memory/context:\n${cfg.agentLLM}`;
          if (cfg.firstMessage) {
            instructions += `\n\nWhen the call starts, greet the caller with: "${cfg.firstMessage}"`;
            firstMessage = cfg.firstMessage;
          }
          if (cfg.transcriptionModel) transcriptionModel = cfg.transcriptionModel;
          if (typeof cfg.temperature === 'number') temperature = cfg.temperature;
          usedConfig = true;
        }
      } catch (err) {
        logger.error('Failed to load AIAgentConfig for realtime session', { businessId, err });
      }
    }

    // Create a Realtime session with OpenAI; response contains a client_secret.value token
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice: sessionVoice,
        // Request both audio and text so the session can emit text events
        modalities: ['audio', 'text'],
        // Ask the provider to transcribe incoming audio for user-side text
        input_audio_transcription: { model: transcriptionModel || 'whisper-1' },
        // Let the server perform VAD/turn-taking to improve transcripts
        turn_detection: { type: 'server_vad' },
        // You can pass other session params here, e.g. instructions, temperature, etc.
        instructions,
        temperature,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Failed to create Realtime session', { status: response.status, body: text });
      return res.status(500).json({ success: false, error: 'Failed to mint ephemeral token', details: text });
    }

    const data = await response.json();
    // Typical shape: { id, client_secret: { value, expires_at }, ... }
    const token = data?.client_secret?.value;
    const expiresAt = data?.client_secret?.expires_at;

    if (!token) {
      logger.error('Realtime session response missing client_secret');
      return res.status(500).json({ success: false, error: 'Invalid session response' });
    }

    logger.info('Ephemeral token minted for Realtime session', {
      businessId: typeof businessId === 'string' ? businessId : null,
      usedConfig,
      applied: {
        voice: sessionVoice,
        transcriptionModel,
        temperature,
      }
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
      }
    });
  } catch (error) {
    logger.error('Error minting ephemeral token:', error);
    res.status(500).json({ success: false, error: 'Error minting ephemeral token' });
  }
});

/**
 * GET /api/ai-receptionist/health
 * Health check for AI receptionist service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Receptionist service is running',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

export default router;
