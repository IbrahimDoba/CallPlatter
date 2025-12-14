import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import {
  validateSession,
  type SessionAuthenticatedRequest,
} from "../middleware/sessionAuth";
import { logger } from "../utils/logger";
import { elevenLabsAgentService } from "../services/elevenLabsAgentService";

const router: Router = Router();

const agentConfigSchema = z.object({
  firstMessage: z.string().optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
  voice: z.string().optional().nullable(),
  accent: z.string().optional().nullable(),
  responseModel: z.string().optional().nullable(),
  transcriptionModel: z.string().optional().nullable(),
  enableServerVAD: z.boolean().optional().nullable(),
  turnDetection: z.string().optional().nullable(),
  temperature: z.number().min(0).max(2).optional().nullable(),
  settings: z.unknown().optional().nullable(),
  // Business details
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
});

const businessMemorySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isActive: z.boolean().default(true),
});

// Apply session validation to all routes
router.use(validateSession);

// GET /api/agent/config
router.get("/config", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    // Get business details
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, description: true },
    });

    // Get config from ElevenLabsAgent (single source of truth)
    const agent = await db.elevenLabsAgent.findUnique({
      where: { businessId },
    });

    const businessMemories = await db.businessMemory.findMany({
      where: {
        businessId,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    logger.info("Fetched agent config and memories", {
      businessId,
      hasConfig: !!agent,
      memoryCount: businessMemories.length,
      userId: req.user.id,
    });

    // Transform ElevenLabsAgent to config format for backwards compatibility
    const config = agent
      ? {
          id: agent.id,
          businessId: agent.businessId,
          firstMessage: agent.firstMessage,
          goodbyeMessage: agent.goodbyeMessage,
          systemPrompt: agent.systemPrompt,
          voice: agent.voiceName,
          temperature: agent.temperature,
          askForName: agent.askForName,
          askForPhone: agent.askForPhone,
          askForEmail: agent.askForEmail,
          askForCompany: agent.askForCompany,
          askForAddress: agent.askForAddress,
          transferEnabled: agent.transferEnabled,
          transferPhoneNumber: agent.transferPhoneNumber,
          settings: agent.settings,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          // ElevenLabs specific fields
          agentId: agent.agentId,
          voiceId: agent.voiceId,
          voiceName: agent.voiceName,
        }
      : null;

    return res.json({
      ok: true,
      data: {
        config,
        memories: businessMemories,
        business: business
          ? {
              id: business.id,
              name: business.name,
              description: business.description,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error("Error fetching agent config:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// POST /api/agent/config
router.post("/config", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const body = agentConfigSchema.parse(req.body);

    // Update business details if provided
    if (body.businessName || body.businessDescription) {
      const businessUpdate: { name?: string; description?: string } = {};
      if (body.businessName) businessUpdate.name = body.businessName;
      if (body.businessDescription)
        businessUpdate.description = body.businessDescription;

      await db.business.update({
        where: { id: businessId },
        data: businessUpdate,
      });

      logger.info("Updated business details", {
        businessId,
        name: body.businessName,
        userId: req.user.id,
      });
    }

    // Check if agent exists
    const existingAgent = await db.elevenLabsAgent.findUnique({
      where: { businessId },
    });

    // Only update agent config if agent exists
    if (existingAgent) {
      // Update ElevenLabsAgent via the service (this also updates ElevenLabs API)
      const success = await elevenLabsAgentService.updateAgent(businessId, {
        systemPrompt: body.systemPrompt ?? undefined,
        firstMessage: body.firstMessage ?? undefined,
        voiceName: body.voice ?? undefined,
        temperature: body.temperature ?? undefined,
      });

      if (!success) {
        return res.status(500).json({
          ok: false,
          error: "Failed to update agent configuration",
        });
      }
    }

    // Get the updated agent (if exists)
    const agent = await db.elevenLabsAgent.findUnique({
      where: { businessId },
    });

    logger.info("Saved agent config", {
      businessId,
      agentId: agent?.agentId,
      hasAgent: !!agent,
      userId: req.user.id,
    });

    // Transform to config format
    const config = agent
      ? {
          id: agent.id,
          businessId: agent.businessId,
          firstMessage: agent.firstMessage,
          goodbyeMessage: agent.goodbyeMessage,
          systemPrompt: agent.systemPrompt,
          voice: agent.voiceName,
          temperature: agent.temperature,
          askForName: agent.askForName,
          askForPhone: agent.askForPhone,
          askForEmail: agent.askForEmail,
          askForCompany: agent.askForCompany,
          askForAddress: agent.askForAddress,
          transferEnabled: agent.transferEnabled,
          transferPhoneNumber: agent.transferPhoneNumber,
          settings: agent.settings,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          agentId: agent.agentId,
          voiceId: agent.voiceId,
          voiceName: agent.voiceName,
        }
      : null;

    return res.json({
      ok: true,
      data: config,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error saving agent config:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// GET /api/agent/memories
router.get("/memories", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    const memories = await db.businessMemory.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" },
    });

    logger.info("Fetched business memories", {
      businessId,
      memoryCount: memories.length,
      userId: req.user.id,
    });

    return res.json({
      ok: true,
      data: memories,
    });
  } catch (error) {
    logger.error("Error fetching business memories:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// POST /api/agent/memories
router.post("/memories", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const body = businessMemorySchema.parse(req.body);

    const memory = await db.businessMemory.create({
      data: {
        businessId,
        title: body.title,
        content: body.content,
        isActive: body.isActive,
      },
    });

    logger.info("Created business memory", {
      businessId,
      memoryId: memory.id,
      title: memory.title,
      userId: req.user.id,
    });

    return res.json({
      ok: true,
      data: memory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error creating business memory:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/agent/memories/:id
router.put("/memories/:id", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const memoryId = req.params.id;
    const body = businessMemorySchema.parse(req.body);

    const memory = await db.businessMemory.update({
      where: {
        id: memoryId,
        businessId, // Ensure user can only update their own business memories
      },
      data: {
        title: body.title,
        content: body.content,
        isActive: body.isActive,
      },
    });

    logger.info("Updated business memory", {
      businessId,
      memoryId: memory.id,
      title: memory.title,
      userId: req.user.id,
    });

    return res.json({
      ok: true,
      data: memory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error updating business memory:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// DELETE /api/agent/memories/:id
router.delete(
  "/memories/:id",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessId = req.user.businessId;
      const memoryId = req.params.id;

      await db.businessMemory.delete({
        where: {
          id: memoryId,
          businessId, // Ensure user can only delete their own business memories
        },
      });

      logger.info("Deleted business memory", {
        businessId,
        memoryId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        message: "Memory deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting business memory:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

// GET /api/agent/crm-imports
router.get("/crm-imports", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    const imports = await db.cRMImport.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    logger.info("Fetched CRM imports", {
      businessId,
      importCount: imports.length,
      userId: req.user.id,
    });

    return res.json({
      ok: true,
      data: imports.map((imp) => ({
        id: imp.id,
        fileName: imp.fileName,
        status: imp.status,
        recordsProcessed: imp.recordsProcessed || undefined,
        phoneNumbersFound: imp.phoneNumbersFound || undefined,
        errorMessage: imp.errorMessage || undefined,
        pineconeNamespace: imp.pineconeNamespace || undefined,
        createdAt: imp.createdAt.toISOString(),
        updatedAt: imp.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error("Error fetching CRM imports:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// DELETE /api/agent/crm-imports/:id
router.delete(
  "/crm-imports/:id",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessId = req.user.businessId;
      const importId = req.params.id;

      // TODO: Also delete from Pinecone namespace
      // For now, just delete the import record
      await db.cRMImport.delete({
        where: {
          id: importId,
          businessId, // Ensure user can only delete their own business imports
        },
      });

      logger.info("Deleted CRM import", {
        businessId,
        importId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        message: "Import deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting CRM import:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

// POST /api/agent/elevenlabs/create - Create ElevenLabs agent (called during onboarding)
const createElevenLabsAgentSchema = z.object({
  businessName: z.string().min(1),
  businessDescription: z.string().min(1),
  voiceName: z.string().min(1),
  firstMessage: z.string().min(1),
});

router.post(
  "/elevenlabs/create",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!process.env.ELEVENLABS_API_KEY) {
        logger.error("Missing ElevenLabs API key - cannot create agent");
        return res.status(500).json({
          ok: false,
          error:
            "ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY environment variable.",
        });
      }
      const businessId = req.user.businessId;
      const body = createElevenLabsAgentSchema.parse(req.body);

      const agentId = await elevenLabsAgentService.createAgent({
        businessId,
        businessName: body.businessName,
        businessDescription: body.businessDescription,
        voiceName: body.voiceName,
        firstMessage: body.firstMessage,
      });

      if (!agentId) {
        return res.status(500).json({
          ok: false,
          error: "Failed to create ElevenLabs agent",
        });
      }

      logger.info("Created ElevenLabs agent via API", {
        businessId,
        agentId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        data: { agentId },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Validation error",
          details: error.errors,
        });
      }

      logger.error("Error creating ElevenLabs agent:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

// PUT /api/agent/elevenlabs/update - Update ElevenLabs agent
const updateElevenLabsAgentSchema = z.object({
  systemPrompt: z.string().optional().nullable(),
  firstMessage: z.string().optional(),
  voiceName: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  goodbyeMessage: z.string().optional().nullable(),
  askForName: z.boolean().optional(),
  askForPhone: z.boolean().optional(),
  askForCompany: z.boolean().optional(),
  askForEmail: z.boolean().optional(),
  askForAddress: z.boolean().optional(),
});

router.put(
  "/elevenlabs/update",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessId = req.user.businessId;
      const body = updateElevenLabsAgentSchema.parse(req.body);

      const success = await elevenLabsAgentService.updateAgent(businessId, {
        systemPrompt: body.systemPrompt ?? undefined,
        firstMessage: body.firstMessage,
        voiceName: body.voiceName,
        temperature: body.temperature,
        goodbyeMessage: body.goodbyeMessage ?? undefined,
        askForName: body.askForName,
        askForPhone: body.askForPhone,
        askForCompany: body.askForCompany,
        askForEmail: body.askForEmail,
        askForAddress: body.askForAddress,
      });

      if (!success) {
        return res.status(500).json({
          ok: false,
          error: "Failed to update ElevenLabs agent",
        });
      }

      logger.info("Updated ElevenLabs agent via API", {
        businessId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        message: "Agent updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          ok: false,
          error: "Validation error",
          details: error.errors,
        });
      }

      logger.error("Error updating ElevenLabs agent:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

// GET /api/agent/elevenlabs/status - Get ElevenLabs agent status
router.get(
  "/elevenlabs/status",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessId = req.user.businessId;
      const agentDetails =
        await elevenLabsAgentService.getAgentDetails(businessId);

      if (!agentDetails) {
        return res.json({
          ok: true,
          data: {
            hasAgent: false,
            agentId: null,
            voiceId: null,
            voiceName: null,
          },
        });
      }

      logger.info("Fetched ElevenLabs agent status", {
        businessId,
        agentId: agentDetails.agentId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        data: {
          hasAgent: true,
          agentId: agentDetails.agentId,
          voiceId: agentDetails.voiceId,
          voiceName: agentDetails.voiceName,
        },
      });
    } catch (error) {
      logger.error("Error fetching ElevenLabs agent status:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

// POST /api/agent/elevenlabs/sync - Sync agent with current config (updates if needed)
router.post(
  "/elevenlabs/sync",
  async (req: SessionAuthenticatedRequest, res) => {
    try {
      if (!req.user?.businessId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const businessId = req.user.businessId;

      // Get current config from ElevenLabsAgent (single source of truth)
      const agent = await db.elevenLabsAgent.findUnique({
        where: { businessId },
      });

      if (!agent) {
        return res.status(400).json({
          ok: false,
          error: "No ElevenLabs agent configuration found",
        });
      }

      // Update the ElevenLabs agent with current database config
      const success = await elevenLabsAgentService.updateAgent(businessId, {
        systemPrompt: agent.systemPrompt ?? undefined,
        firstMessage: agent.firstMessage ?? undefined,
        voiceName: agent.voiceName ?? undefined,
        temperature: agent.temperature ?? undefined,
        goodbyeMessage: agent.goodbyeMessage ?? undefined,
        askForName: agent.askForName ?? undefined,
        askForPhone: agent.askForPhone ?? undefined,
        askForCompany: agent.askForCompany ?? undefined,
        askForEmail: agent.askForEmail ?? undefined,
        askForAddress: agent.askForAddress ?? undefined,
      });

      if (!success) {
        return res.status(500).json({
          ok: false,
          error: "Failed to sync ElevenLabs agent",
        });
      }

      logger.info("Synced ElevenLabs agent with current config", {
        businessId,
        userId: req.user.id,
      });

      return res.json({
        ok: true,
        message: "Agent synced successfully",
      });
    } catch (error) {
      logger.error("Error syncing ElevenLabs agent:", error);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
);

export default router;
