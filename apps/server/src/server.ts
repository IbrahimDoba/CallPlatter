import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { validateEnvironment } from "./utils/helpers";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
// Rate limiting removed - uncomment if needed later
// import { generalLimiter, authLimiter, apiLimiter, waitlistLimiter, webhookLimiter } from "./middleware/rateLimiter";
import aiReceptionistRoutes from "./routes/aiReceptionist";
import appointmentsRoutes from "./routes/appointments";
import callsRoutes from "./routes/calls";
import settingsRoutes from "./routes/settings";
import dashboardRoutes from "./routes/dashboard";
import signupRoutes from "./routes/signup";
import webhooksRoutes from "./routes/webhooks";
import agentRoutes from "./routes/agent";
import openaiRoutes from "./routes/openai";
import { AIReceptionistService } from "./services/aiReceptionistService";

import openaiRealtimeRoutes from "./routes/OpenaiRealTimeCall";
import elevenLabsAgentRoutes, {
  setupElevenLabsAgentWebSocket,
} from "./routes/elevenLabsAgent";
import uploadthingRoutes from "./routes/uploadthing";
import embeddingsRoutes from "./routes/embeddings";
import pineconeRoutes from "./routes/pinecone";
import waitlistRoutes from "./routes/waitlist";
import billingRoutes from "./routes/billing";
import voiceUpdateRoutes from "./routes/voiceUpdate";
import adminRoutes from "./routes/admin";
import adminPhoneNumbersRoutes from "./routes/admin-phone-numbers";
import resendOTPRoutes from "./routes/resend-otp";
import verifyEmailRoutes from "./routes/verify-email";
import forgotPasswordRoutes from "./routes/forgot-password";
import verifyResetOTPRoutes from "./routes/verify-reset-otp";
import resetPasswordRoutes from "./routes/reset-password";
import twilioRoutes from "./routes/twilio";

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnvironment();

const app = express() as express.Express;
const server = createServer(app);
const PORT = Number.parseInt(process.env.PORT || "3001");

// Trust proxy for reverse proxies (set an explicit hop count to avoid permissive config)
// Use env TRUST_PROXY_HOPS if provided; default to 1 in production, 0 otherwise
const TRUST_PROXY_HOPS = Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
  ? Number(process.env.TRUST_PROXY_HOPS)
  : (process.env.NODE_ENV === 'production' ? 1 : 0);
app.set('trust proxy', TRUST_PROXY_HOPS);

// Middleware
// CORS configuration - simple but production-safe
// In dev: allows all origins. In prod: uses CORS_ORIGIN env var if set, otherwise allows all
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true; // Allow all if not set

app.use(
  cors({
    origin: corsOrigin, // Array of origins in prod, or true for all in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-business-id',
      'x-user-id',
      'x-user-email',
      'x-user-business-id',
      'x-user-role',
      'x-user-name',
      'access-control-allow-origin',
      'access-control-allow-credentials',
    ],
  })
);

// Log CORS config
if (Array.isArray(corsOrigin)) {
  logger.info(`CORS configured for origins: ${corsOrigin.join(', ')}`);
} else {
  logger.info('CORS configured to allow all origins');
}

// Remove general rate limiting to avoid conflicts
// app.use(generalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AI Receptionist Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes - rate limiting removed for simplicity
app.use("/api/ai-receptionist", aiReceptionistRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/calls", callsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/openai", openaiRoutes);
app.use("/api/uploadthing", uploadthingRoutes);
app.use("/api/embeddings", embeddingsRoutes);
app.use("/api/pinecone", pineconeRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/voice", voiceUpdateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/phone-numbers", adminPhoneNumbersRoutes);
app.use("/api/resend-otp", resendOTPRoutes);
app.use("/api/verify-email", verifyEmailRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/verify-reset-otp", verifyResetOTPRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/twilio", twilioRoutes);

app.use("/api/openai-realtime", openaiRealtimeRoutes);
app.use("/api/elevenlabs-agent", elevenLabsAgentRoutes);

// Setup Twilio media stream WebSocket handlers
// setupOpenAIRealtimeWebSocket(server); // Temporarily disabled to test ElevenLabs
setupElevenLabsAgentWebSocket(server);

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
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  const aiService = AIReceptionistService.getInstance();
  aiService.cleanupTempFiles();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  const aiService = AIReceptionistService.getInstance();
  aiService.cleanupTempFiles();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Export app and server for use in other modules
export { app, server };
