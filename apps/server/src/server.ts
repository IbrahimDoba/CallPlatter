import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { validateEnvironment } from './utils/helpers';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import aiReceptionistRoutes from './routes/aiReceptionist';
// import businessRoutes from './routes/business';
// import conversationRoutes from './routes/conversations';
// import aiConversationRoutes from './routes/ai-conversations';
// import callTestingRoutes from './routes/call-testing';
import { createSocketServer } from './config/socket';
import { AIReceptionistService } from './services/aiReceptionistService';
import type { AgentRuntimeConfig } from './services/aiReceptionistService';
import { db } from '@repo/db';

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnvironment();

const app = express() as express.Express;
const server = createServer(app);
const io = createSocketServer(server);
const PORT = Number.parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Receptionist Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/ai-receptionist', aiReceptionistRoutes);
// app.use('/api/businesses', businessRoutes);
// app.use('/api/conversations', conversationRoutes);
// app.use('/api/ai-conversations', aiConversationRoutes);
// app.use('/api/call-testing', callTestingRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`, { socketId: socket.id });

  const aiService = AIReceptionistService.getInstance();
  let currentBusinessId: string | undefined;
  let currentAgentCfg: AgentRuntimeConfig | undefined;
  let firstMessageSent = false;

  const loadAgentCfg = async (businessId: string) => {
    try {
      let cfg = await db.aIAgentConfig.findUnique({ where: { businessId } });
      if (!cfg) {
        // Fallback: ID might actually be a userId; resolve to their businessId
        try {
          const user = await db.user.findUnique({ where: { id: businessId } });
          if (user?.businessId) {
            logger.info('Resolved userId to businessId for agent config lookup (WS)', { userId: businessId, resolvedBusinessId: user.businessId });
            cfg = await db.aIAgentConfig.findUnique({ where: { businessId: user.businessId } });
          } else if (user) {
            // Secondary fallback: find a business that contains this user
            try {
              const biz = await db.business.findFirst({ where: { users: { some: { id: user.id } } } });
              if (biz) {
                logger.info('Resolved user via membership to business for agent config lookup (WS)', { userId: user.id, resolvedBusinessId: biz.id });
                cfg = await db.aIAgentConfig.findUnique({ where: { businessId: biz.id } });
              }
            } catch (e2) {
              logger.warn('Failed membership-based business resolution for agent config (WS)', { userId: user.id, e2 });
            }
          }
        } catch (e) {
          logger.warn('Failed user->business fallback during agent config lookup (WS)', { candidateId: businessId, e });
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
                voice: 'alloy',
                responseModel: 'gpt-4o-realtime-preview-2024-12-17',
                transcriptionModel: 'whisper-1',
                systemPrompt: null,
                agentLLM: null,
                firstMessage: null,
              },
            });
            logger.info('Created default AIAgentConfig for business (WS)', { businessId: biz.id });
          } else {
            logger.info('No agent config and provided id is not a Business; using in-memory defaults (WS)', { providedId: businessId });
          }
        } catch (e3) {
          logger.warn('Failed to auto-create default AIAgentConfig (WS)', { candidateBusinessId: businessId, e3 });
        }
      }
      if (!cfg) {
        logger.info('No agent config found for business, falling back to defaults', { businessId });
        currentAgentCfg = undefined;
        return;
      }
      currentAgentCfg = {
        transcriptionModel: cfg.transcriptionModel ?? undefined,
        responseModel: cfg.responseModel ?? undefined,
        voice: cfg.voice ?? undefined,
        firstMessage: cfg.firstMessage ?? null,
        agentLLM: cfg.agentLLM ?? null,
        systemPrompt: cfg.systemPrompt ?? null,
        temperature: cfg.temperature ?? null,
      };
      logger.info('Loaded agent config for business', { businessId });

      // If we haven't played the first message yet for this connection, do it now
      if (!firstMessageSent && currentAgentCfg?.firstMessage) {
        try {
          const buf = await aiService.textToSpeech(currentAgentCfg.firstMessage, currentAgentCfg);
          socket.emit('audio-response', {
            audio: buf,
            format: 'mp3',
            duration: 0,
            text: currentAgentCfg.firstMessage,
          });
          firstMessageSent = true;
          logger.info('Emitted firstMessage audio to client', { socketId: socket.id });
        } catch (err) {
          logger.error('Failed to synthesize firstMessage', { err });
        }
      }
    } catch (err) {
      logger.error('Failed to load agent config', { businessId, err });
      currentAgentCfg = undefined;
    }
  };

  // AI Receptionist audio processing
  socket.on('audio-chunk', async (audioData: ArrayBuffer) => {
    try {
      logger.info('Received audio chunk for processing', { 
        socketId: socket.id,
        audioSize: audioData.byteLength 
      });

      // Safeguard: If first message wasn't yet sent, send it now before processing user audio
      if (!firstMessageSent && currentAgentCfg?.firstMessage) {
        try {
          const greetBuf = await aiService.textToSpeech(currentAgentCfg.firstMessage, currentAgentCfg);
          socket.emit('audio-response', {
            audio: greetBuf,
            format: 'mp3',
            duration: 0,
            text: currentAgentCfg.firstMessage,
          });
          firstMessageSent = true;
          logger.info('Emitted firstMessage (safeguard) before processing first user audio', { socketId: socket.id });
        } catch (err) {
          logger.error('Failed to synthesize firstMessage (safeguard)', { err });
        }
      }

      const audioBuffer = Buffer.from(audioData);
      const details = await aiService.processAudioConversationWithDetails(audioBuffer, currentAgentCfg);

      // Detect end-of-call marker and strip it from spoken text
      const endMarker = '<END_CALL>';
      const endDetected = details.aiResponse.includes(endMarker);

      // If we detect end, emit an event so client can hang up/stop stream
      if (endDetected) {
        logger.info('END_CALL detected; notifying client to end call', { socketId: socket.id });
        socket.emit('end-call');
      }

      // Emit audio response (already synthesized from original aiResponse)
      socket.emit('audio-response', {
        audio: details.audioBuffer,
        format: 'mp3',
        duration: 0,
        // Provide the text with marker removed for UI/debug
        text: details.aiResponse.replaceAll(endMarker, '').trim(),
      });
      logger.info('Audio response sent to client', { socketId: socket.id });
    } catch (error) {
      logger.error('Error processing audio:', error);
      socket.emit('audio-error', { message: 'Failed to process audio' });
    }
  });

  // Handle client joining a business room
  socket.on('join-business', async (businessId: string) => {
    socket.join(`business-${businessId}`);
    logger.info(`Client ${socket.id} joined business room: ${businessId}`, {
      socketId: socket.id,
      businessId,
    });
    currentBusinessId = businessId;
    await loadAgentCfg(businessId);
  });

  // Handle client leaving a business room
  socket.on('leave-business', (businessId: string) => {
    socket.leave(`business-${businessId}`);
    logger.info(`Client ${socket.id} left business room: ${businessId}`, {
      socketId: socket.id,
      businessId,
    });
    if (currentBusinessId === businessId) {
      currentBusinessId = undefined;
      currentAgentCfg = undefined;
      firstMessageSent = false;
    }
  });

  // Allow clients to refresh agent config when updated from dashboard
  socket.on('refresh-agent-config', async () => {
    if (currentBusinessId) {
      await loadAgentCfg(currentBusinessId);
      socket.emit('agent-config-refreshed');
    }
  });

  // Handle new call event
  socket.on('new-call', (callData) => {
    logger.info(`New call received: ${callData.id}`, { callData });
    // Broadcast to all clients in the business room
    socket.broadcast.to(`business-${callData.businessId}`).emit('call-updated', callData);
  });

  // Handle call status updates
  socket.on('call-status-update', (updateData) => {
    logger.info(`Call status update: ${updateData.callId}`, { updateData });
    // Broadcast to all clients in the business room
    socket.broadcast.to(`business-${updateData.businessId}`).emit('call-updated', updateData);
  });

  // Handle test call events
  socket.on('join-test-call', (sessionId: string) => {
    socket.join(`test-call-${sessionId}`);
    logger.info(`Client ${socket.id} joined test call: ${sessionId}`, {
      socketId: socket.id,
      sessionId,
    });
  });

  socket.on('leave-test-call', (sessionId: string) => {
    socket.leave(`test-call-${sessionId}`);
    logger.info(`Client ${socket.id} left test call: ${sessionId}`, {
      socketId: socket.id,
      sessionId,
    });
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`, { socketId: socket.id });
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  const aiService = AIReceptionistService.getInstance();
  aiService.cleanupTempFiles();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  const aiService = AIReceptionistService.getInstance();
  aiService.cleanupTempFiles();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export io for use in other modules
export { app, server, io };
