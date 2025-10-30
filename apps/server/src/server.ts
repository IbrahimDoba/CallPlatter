import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { validateEnvironment } from "./utils/helpers";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { generalLimiter, authLimiter, apiLimiter, waitlistLimiter, webhookLimiter } from "./middleware/rateLimiter";
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
// CORS configuration - supports multiple origins from env or defaults to localhost for dev
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : process.env.NODE_ENV === 'production'
  ? [] // In production, require CORS_ORIGIN to be set
  : ["http://localhost:3000", "http://localhost:3002"];

// Log CORS configuration on startup
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  logger.warn("⚠️  CORS_ORIGIN not set in production - CORS requests may fail!");
} else {
  logger.info(`CORS configured for origins: ${allowedOrigins.join(", ")}`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // In production with no allowed origins configured, deny all
      if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
        return callback(new Error(`CORS_ORIGIN not configured. Origin "${origin}" blocked.`));
      }
      
      // If no origins configured in dev, allow all (fallback)
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
// Apply general rate limiting to all routes
app.use(generalLimiter);

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

// API Routes with specific rate limiting
app.use("/api/ai-receptionist", apiLimiter, aiReceptionistRoutes);
app.use("/api/appointments", apiLimiter, appointmentsRoutes);
app.use("/api/calls", apiLimiter, callsRoutes);
app.use("/api/settings", apiLimiter, settingsRoutes);
app.use("/api/dashboard", apiLimiter, dashboardRoutes);
app.use("/api/signup", authLimiter, signupRoutes);
app.use("/api/webhooks", webhookLimiter, webhooksRoutes);
app.use("/api/agent", apiLimiter, agentRoutes);
app.use("/api/openai", apiLimiter, openaiRoutes);
app.use("/api/uploadthing", apiLimiter, uploadthingRoutes);
app.use("/api/embeddings", apiLimiter, embeddingsRoutes);
app.use("/api/pinecone", apiLimiter, pineconeRoutes);
app.use("/api/waitlist", waitlistLimiter, waitlistRoutes);
app.use("/api/billing", apiLimiter, billingRoutes);
app.use("/api/voice", apiLimiter, voiceUpdateRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/admin/phone-numbers", apiLimiter, adminPhoneNumbersRoutes);
app.use("/api/resend-otp", authLimiter, resendOTPRoutes);
app.use("/api/verify-email", authLimiter, verifyEmailRoutes);
app.use("/api/forgot-password", authLimiter, forgotPasswordRoutes);
app.use("/api/verify-reset-otp", authLimiter, verifyResetOTPRoutes);
app.use("/api/reset-password", authLimiter, resetPasswordRoutes);
app.use("/api/twilio", apiLimiter, twilioRoutes);

app.use("/api/openai-realtime", apiLimiter, openaiRealtimeRoutes);
app.use("/api/elevenlabs-agent", apiLimiter, elevenLabsAgentRoutes);

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
