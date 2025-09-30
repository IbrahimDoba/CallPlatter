import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { validateSession, type SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";

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

    const config = await db.aIAgentConfig.findUnique({
      where: { businessId }
    });

    const businessMemories = await db.businessMemory.findMany({
      where: { 
        businessId,
        isActive: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    logger.info("Fetched agent config and memories", { 
      businessId, 
      hasConfig: !!config,
      memoryCount: businessMemories.length,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: {
        config: config || null,
        memories: businessMemories
      }
    });
  } catch (error) {
    logger.error("Error fetching agent config:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
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

    // Prepare data for upsert
    const data = {
      firstMessage: body.firstMessage,
      systemPrompt: body.systemPrompt,
      voice: body.voice ?? undefined,
      accent: body.accent ?? undefined, // TODO: Uncomment after running database migration
      responseModel: body.responseModel ?? undefined,
      transcriptionModel: body.transcriptionModel ?? undefined,
      enableServerVAD: body.enableServerVAD ?? undefined,
      turnDetection: body.turnDetection ?? undefined,
      temperature: body.temperature,
      settings: body.settings as any,
    };

    // Upsert the configuration
    const config = await db.aIAgentConfig.upsert({
      where: { businessId },
      update: { ...data },
      create: { businessId, ...data },
    });

    logger.info("Saved agent config", { 
      businessId, 
      configId: config.id,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: config
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors
      });
    }

    logger.error("Error saving agent config:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
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
      orderBy: { createdAt: 'asc' }
    });

    logger.info("Fetched business memories", { 
      businessId, 
      memoryCount: memories.length,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: memories
    });
  } catch (error) {
    logger.error("Error fetching business memories:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
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
      }
    });

    logger.info("Created business memory", { 
      businessId, 
      memoryId: memory.id,
      title: memory.title,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: memory
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors
      });
    }

    logger.error("Error creating business memory:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
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
        businessId // Ensure user can only update their own business memories
      },
      data: {
        title: body.title,
        content: body.content,
        isActive: body.isActive,
      }
    });

    logger.info("Updated business memory", { 
      businessId, 
      memoryId: memory.id,
      title: memory.title,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: memory
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors
      });
    }

    logger.error("Error updating business memory:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
    });
  }
});

// DELETE /api/agent/memories/:id
router.delete("/memories/:id", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const memoryId = req.params.id;

    await db.businessMemory.delete({
      where: { 
        id: memoryId,
        businessId // Ensure user can only delete their own business memories
      }
    });

    logger.info("Deleted business memory", { 
      businessId, 
      memoryId,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      message: "Memory deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting business memory:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
    });
  }
});

// GET /api/agent/crm-imports
router.get("/crm-imports", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    const imports = await db.cRMImport.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    logger.info("Fetched CRM imports", { 
      businessId, 
      importCount: imports.length,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      data: imports.map(imp => ({
        id: imp.id,
        fileName: imp.fileName,
        status: imp.status,
        recordsProcessed: imp.recordsProcessed || undefined,
        phoneNumbersFound: imp.phoneNumbersFound || undefined,
        errorMessage: imp.errorMessage || undefined,
        pineconeNamespace: imp.pineconeNamespace || undefined,
        createdAt: imp.createdAt.toISOString(),
        updatedAt: imp.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    logger.error("Error fetching CRM imports:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
    });
  }
});

// DELETE /api/agent/crm-imports/:id
router.delete("/crm-imports/:id", async (req: SessionAuthenticatedRequest, res) => {
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
        businessId // Ensure user can only delete their own business imports
      }
    });

    logger.info("Deleted CRM import", { 
      businessId, 
      importId,
      userId: req.user.id 
    });

    return res.json({
      ok: true,
      message: "Import deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting CRM import:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Internal server error" 
    });
  }
});

export default router;
