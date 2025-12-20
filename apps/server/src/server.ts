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
import adminSubscriptionRoutes from "./routes/admin-subscription";
import resendOTPRoutes from "./routes/resend-otp";
import verifyEmailRoutes from "./routes/verify-email";
import forgotPasswordRoutes from "./routes/forgot-password";
import verifyResetOTPRoutes from "./routes/verify-reset-otp";
import resetPasswordRoutes from "./routes/reset-password";
import twilioRoutes from "./routes/twilio";
import demoRequestRoutes from "./routes/demo-request";
import polarWebhookRoutes from "./routes/polarWebhook";
import elevenLabsAgentManagementRoutes from "./routes/elevenLabsAgentManagement";
import toolsRoutes from "./routes/tools";

dotenv.config();

validateEnvironment();

const app = express() as express.Express;
const server = createServer(app);
const PORT = Number.parseInt(process.env.PORT || "3001");

// Use env TRUST_PROXY_HOPS if provided; default to 1 in production, 0 otherwise
const TRUST_PROXY_HOPS = Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
  ? Number(process.env.TRUST_PROXY_HOPS)
  : process.env.NODE_ENV === "production"
    ? 1
    : 0;
app.set("trust proxy", TRUST_PROXY_HOPS);

// Middleware - CORS must be FIRST
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : null;

// Helper function to normalize origin (remove trailing slashes)
const normalizeOrigin = (origin: string): string => {
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
};

// Helper function to check if origin is allowed
const isOriginAllowed = (origin: string): boolean => {
  if (!corsOrigins) return true; // Allow all if CORS_ORIGIN not set
  const normalized = normalizeOrigin(origin);
  return corsOrigins.some((allowed) => normalizeOrigin(allowed) === normalized);
};

app.options("*", (req, res) => {
  const origin = req.headers.origin;

  // Always set CORS headers for preflight requests
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-business-id, x-user-id, x-user-email, x-user-business-id, x-user-role, x-user-name"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (origin) {
    if (isOriginAllowed(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      // Log rejected origin for debugging
      logger.warn(
        `CORS Preflight: Origin "${origin}" not in allowed list: ${corsOrigins?.join(", ") || "none"}`
      );
      // Don't set Access-Control-Allow-Origin for rejected origins
      // Browser will reject the preflight, which is expected
    }
  }

  res.status(204).end();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (!corsOrigins) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        logger.warn(
          `CORS: Origin "${origin}" not in allowed list: ${corsOrigins.join(", ")}`
        );
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-business-id",
      "x-user-id",
      "x-user-email",
      "x-user-business-id",
      "x-user-role",
      "x-user-name",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Log CORS config
if (corsOrigins) {
  logger.info(`CORS configured for origins: ${corsOrigins.join(", ")}`);
} else {
  logger.info("CORS configured to allow all origins");
}

// Remove general rate limiting to avoid conflicts
// app.use(generalLimiter);

// Middleware to capture raw body for Polar webhook signature verification
// This must be before express.json() to capture the raw buffer
app.use(
  "/api/webhooks/polar",
  express.raw({ type: () => true, limit: "10mb" }),
  (req, res, next) => {
    // Store raw body buffer for signature verification (before parsing)
    const rawBodyBuffer = req.body as Buffer;
    (req as any).rawBody = rawBodyBuffer;

    logger.info("Polar Webhook Middleware Hit", {
      contentType: req.headers["content-type"],
      rawBodyLength: rawBodyBuffer?.length || 0,
      isBuffer: Buffer.isBuffer(rawBodyBuffer),
    });

    // Parse JSON for normal request handling
    try {
      const parsedBody = JSON.parse(rawBodyBuffer.toString("utf8"));
      (req as any).body = parsedBody;
      // Mark that body is already parsed to prevent express.json() from parsing again
      (req as any)._body = true;
    } catch (error) {
      logger.error("Failed to parse Polar webhook body:", error);
      return res
        .status(400)
        .json({ success: false, error: "Invalid JSON body" });
    }
    next();
  }
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/admin/subscription", adminSubscriptionRoutes);
app.use("/api/resend-otp", resendOTPRoutes);
app.use("/api/verify-email", verifyEmailRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/verify-reset-otp", verifyResetOTPRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/demo-request", demoRequestRoutes);
app.use("/api/webhooks/polar", polarWebhookRoutes);

app.use("/api/openai-realtime", openaiRealtimeRoutes);
app.use("/api/elevenlabs-agent", elevenLabsAgentRoutes);
app.use("/api/elevenlabs-management", elevenLabsAgentManagementRoutes);
app.use("/api/tools", toolsRoutes);

setupElevenLabsAgentWebSocket(server);

app.use(notFoundHandler);

app.use(errorHandler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server successfully listening on 0.0.0.0:${PORT}`);
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
  });
});

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

export { app, server };
