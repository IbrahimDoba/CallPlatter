import { Router, type Request, type Response } from 'express';
import { db } from '@repo/db';
import { logger } from '../utils/logger';

const router: Router = Router();

// Helper function to get business ID from headers (temporary auth)
function getBusinessId(req: Request): string | null {
  const businessId = req.headers['x-business-id'] as string || 
                     req.headers['x-user-business-id'] as string || 
                     null;
  
  logger.info("Voice update request", { 
    businessId, 
    allHeaders: req.headers,
    specificHeaders: {
      'x-business-id': req.headers['x-business-id'],
      'x-user-business-id': req.headers['x-user-business-id'],
      'authorization': req.headers['authorization'],
      'x-user-id': req.headers['x-user-id']
    }
  });
  
  return businessId;
}

// Update agent voice
router.patch('/voice', async (req: Request, res: Response) => {
  try {
    let businessId = getBusinessId(req);
    
    // If no business ID in headers, try to get it from user ID
    if (!businessId) {
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        logger.info("No business ID in headers, trying to get from user ID", { userId });
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { businessId: true }
          });
          businessId = user?.businessId || null;
          logger.info("Retrieved business ID from user", { userId, businessId });
        } catch (error) {
          logger.error("Error fetching user business ID", { userId, error });
        }
      }
    }
    
    if (!businessId) {
      logger.error("No business ID found", { 
        headers: req.headers,
        userId: req.headers['x-user-id']
      });
      return res.status(401).json({ 
        error: 'Business ID required',
        details: 'No business ID found in headers or user record'
      });
    }

    const { voice, voiceId, voiceName } = req.body;

    logger.info("Voice update request body", { voice, voiceId, voiceName, businessId });
    
    // Log the headers to see what's being sent
    logger.info("Voice update headers", {
      'x-business-id': req.headers['x-business-id'],
      'x-user-business-id': req.headers['x-user-business-id'],
      'x-user-id': req.headers['x-user-id']
    });

    if (!voice && !voiceId) {
      return res.status(400).json({
        success: false,
        error: 'Voice or voiceId is required'
      });
    }

    // Update AI Agent Config
    if (voice) {
      logger.info("Updating AI Agent Config", { businessId, voice });
      
      const aiConfig = await db.aIAgentConfig.upsert({
        where: { businessId },
        update: { 
          voice,
          updatedAt: new Date()
        },
        create: {
          businessId,
          voice: voice || 'james',
          firstMessage: "Hello! How can I assist you today?",
          systemPrompt: "",
          responseModel: "gpt-4o-realtime-preview-2024-12-17",
          transcriptionModel: "whisper-1",
          enableServerVAD: true,
          turnDetection: "server_vad",
          temperature: 0.7,
          askForName: true,
          askForPhone: true,
          askForCompany: false,
          askForEmail: true,
          askForAddress: false
        }
      });
      
      logger.info("AI Agent Config updated", { aiConfig });
    }

    // Update ElevenLabs Agent if voiceId is provided
    if (voiceId) {
      logger.info("Updating ElevenLabs Agent", { businessId, voiceId, voiceName });
      
      const elevenLabsAgent = await db.elevenLabsAgent.findFirst({
        where: { businessId }
      });

      if (elevenLabsAgent) {
        logger.info("Found existing ElevenLabs agent", { agentId: elevenLabsAgent.agentId });
        
        // Update existing ElevenLabs agent voice
        const updatedAgent = await db.elevenLabsAgent.update({
          where: { id: elevenLabsAgent.id },
          data: {
            voiceId,
            voiceName: voiceName || voiceId,
            updatedAt: new Date()
          }
        });
        
        logger.info("ElevenLabs agent updated in database", { updatedAgent });

        // Call ElevenLabs API to update the agent's voice
        try {
          const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
          const ELEVENLABS_BASE_URL = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';

          if (ELEVENLABS_API_KEY) {
            logger.info("Calling ElevenLabs API", { agentId: elevenLabsAgent.agentId, voiceId });
            
            const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${elevenLabsAgent.agentId}`, {
              method: 'PATCH',
              headers: {
                'Accept': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
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
              logger.error("Failed to update ElevenLabs agent voice", { 
                agentId: elevenLabsAgent.agentId, 
                status: response.status,
                error: errorText
              });
              // Don't fail the request, just log the error
            } else {
              logger.info("Updated ElevenLabs agent voice successfully", { 
                agentId: elevenLabsAgent.agentId, 
                voiceId 
              });
            }
          } else {
            logger.warn("ElevenLabs API key not found, skipping API update");
          }
        } catch (error) {
          logger.error("Error updating ElevenLabs agent voice", { 
            agentId: elevenLabsAgent.agentId, 
            error: error instanceof Error ? error.message : String(error)
          });
          // Don't fail the request, just log the error
        }
      } else {
        logger.warn("No ElevenLabs agent found for business", { businessId });
        // Note: ElevenLabs agent creation should be handled by the main agent creation flow
        // For now, we'll just log this and continue with the AI config update
      }
    }

    logger.info("Voice updated successfully", { businessId, voice, voiceId });
    
    // Verify the update was successful by fetching the current config
    const updatedConfig = await db.aIAgentConfig.findUnique({
      where: { businessId },
      select: { voice: true, updatedAt: true }
    });
    
    const updatedElevenLabsAgent = await db.elevenLabsAgent.findFirst({
      where: { businessId },
      select: { voiceId: true, voiceName: true, updatedAt: true }
    });
    
    logger.info("Verification - Updated configs", { 
      aiConfig: updatedConfig, 
      elevenLabsAgent: updatedElevenLabsAgent 
    });
    
    res.json({
      success: true,
      message: 'Voice updated successfully',
      data: {
        voice,
        voiceId,
        voiceName,
        updatedAt: new Date().toISOString(),
        verification: {
          aiConfigVoice: updatedConfig?.voice,
          elevenLabsVoiceId: updatedElevenLabsAgent?.voiceId
        }
      }
    });

  } catch (error) {
    logger.error('Error updating voice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update voice',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get available voices
router.get('/voices', async (req: Request, res: Response) => {
  try {
    let businessId = getBusinessId(req);
    
    // If no business ID in headers, try to get it from user ID
    if (!businessId) {
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        logger.info("No business ID in headers for voices, trying to get from user ID", { userId });
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { businessId: true }
          });
          businessId = user?.businessId || null;
          logger.info("Retrieved business ID from user for voices", { userId, businessId });
        } catch (error) {
          logger.error("Error fetching user business ID for voices", { userId, error });
        }
      }
    }
    
    if (!businessId) {
      logger.error("No business ID found for voices", { 
        headers: req.headers,
        userId: req.headers['x-user-id']
      });
      return res.status(401).json({ 
        error: 'Business ID required',
        details: 'No business ID found in headers or user record'
      });
    }

    // Get current voice configuration
    const aiConfig = await db.aIAgentConfig.findUnique({
      where: { businessId },
      select: { voice: true }
    });

    const elevenLabsAgent = await db.elevenLabsAgent.findFirst({
      where: { businessId },
      select: { voiceId: true, voiceName: true }
    });

    // Available voices with descriptions and ElevenLabs voice IDs
    const availableVoices = [
      {
        id: 'james',
        name: 'James',
        description: 'Neutral, balanced tone',
        voiceId: 'Smxkoz0xiOoHo5WcSskf',
        category: 'Standard'
      },
      {
        id: 'peter',
        name: 'Peter',
        description: 'Professional, clear voice',
        voiceId: 'ChO6kqkVouUn0s7HMunx',
        category: 'Standard'
      },
      {
        id: 'hope',
        name: 'Hope',
        description: 'Warm, friendly voice',
        voiceId: 'zGjIP4SZlMnY9m93k97r',
        category: 'Standard'
      },
      {
        id: 'emmanuel',
        name: 'Emmanuel',
        description: 'Confident, authoritative voice',
        voiceId: '77aEIu0qStu8Jwv1EdhX',
        category: 'Standard'
      },
      {
        id: 'stella',
        name: 'Stella',
        description: 'Energetic, engaging voice',
        voiceId: '2vbhUP8zyKg4dEZaTWGn',
        category: 'Standard'
      }
    ];

    res.json({
      success: true,
      data: {
        currentVoice: aiConfig?.voice || 'james',
        currentVoiceId: elevenLabsAgent?.voiceId,
        currentVoiceName: elevenLabsAgent?.voiceName,
        availableVoices
      }
    });

  } catch (error) {
    logger.error('Error fetching voices:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch voices' 
    });
  }
});

export default router;
