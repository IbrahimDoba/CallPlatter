/**
 * Tool Management API Routes
 *
 * Handles CRUD operations for ElevenLabs conversational AI tools
 */

import express, { Request, Response, Router } from "express";
import { db } from "@repo/db";
import {
  ElevenLabsToolService,
  type ToolConfig,
} from "../services/elevenLabsToolService.js";
import { logger } from "../utils/logger.js";
import { getAllToolTemplates, getToolTemplate } from "../config/toolTemplates.js";

const router: Router = express.Router();
const toolService = new ElevenLabsToolService();

/**
 * Create a new tool
 * POST /api/tools
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    const { tool_config } = req.body as { tool_config: ToolConfig };

    if (!tool_config) {
      res.status(400).json({ error: "tool_config is required" });
      return;
    }

    // Validate required fields
    if (!tool_config.name || !tool_config.description) {
      res.status(400).json({
        error: "tool_config.name and tool_config.description are required",
      });
      return;
    }

    // Check if tool with same name already exists for this business
    const existingTool = await db.tool.findFirst({
      where: {
        businessId,
        name: tool_config.name,
      },
    });

    if (existingTool) {
      res.status(409).json({
        error: `Tool with name '${tool_config.name}' already exists`,
      });
      return;
    }

    logger.info("Creating tool", {
      businessId,
      toolName: tool_config.name,
      toolType: tool_config.type,
    });

    // Create tool in ElevenLabs
    const elevenLabsResponse = await toolService.createTool(tool_config);

    // Store tool in database
    const tool = await db.tool.create({
      data: {
        businessId,
        elevenLabsToolId: elevenLabsResponse.id,
        type: tool_config.type,
        name: tool_config.name,
        description: tool_config.description,
        config: tool_config as any,
        isActive: true,
      },
    });

    logger.info("Tool created successfully", {
      toolId: tool.id,
      elevenLabsToolId: elevenLabsResponse.id,
      toolName: tool.name,
    });

    res.status(201).json({
      success: true,
      tool: {
        id: tool.id,
        elevenLabsToolId: tool.elevenLabsToolId,
        type: tool.type,
        name: tool.name,
        description: tool.description,
        config: tool.config,
        isActive: tool.isActive,
        createdAt: tool.createdAt,
      },
      elevenLabsResponse,
    });
  } catch (error: any) {
    logger.error("Error creating tool", { error });
    res.status(500).json({
      error: "Failed to create tool",
      message: error.message,
    });
  }
});

/**
 * List all tools for a business
 * GET /api/tools
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    const tools = await db.tool.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      include: {
        agentTools: {
          include: {
            agent: {
              select: {
                id: true,
                businessId: true,
              },
            },
          },
        },
      },
    });

    logger.info("Tools fetched successfully", {
      businessId,
      count: tools.length,
    });

    res.json({
      success: true,
      tools: tools.map((tool) => ({
        id: tool.id,
        elevenLabsToolId: tool.elevenLabsToolId,
        type: tool.type,
        name: tool.name,
        description: tool.description,
        config: tool.config,
        isActive: tool.isActive,
        agentCount: tool.agentTools.length,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt,
      })),
    });
  } catch (error: any) {
    logger.error("Error fetching tools", { error });
    res.status(500).json({
      error: "Failed to fetch tools",
      message: error.message,
    });
  }
});

/**
 * Get a specific tool
 * GET /api/tools/:id
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;
    const { id } = req.params;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    const tool = await db.tool.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        agentTools: {
          include: {
            agent: {
              select: {
                id: true,
                businessId: true,
              },
            },
          },
        },
      },
    });

    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    // Optionally fetch latest stats from ElevenLabs
    let elevenLabsStats = null;
    try {
      const elevenLabsData = await toolService.getTool(tool.elevenLabsToolId);
      elevenLabsStats = elevenLabsData.usage_stats;
    } catch (error) {
      logger.warn("Failed to fetch ElevenLabs stats", { toolId: tool.id });
    }

    res.json({
      success: true,
      tool: {
        id: tool.id,
        elevenLabsToolId: tool.elevenLabsToolId,
        type: tool.type,
        name: tool.name,
        description: tool.description,
        config: tool.config,
        isActive: tool.isActive,
        agents: tool.agentTools.map((at) => ({
          agentId: at.agentId,
          isEnabled: at.isEnabled,
        })),
        stats: elevenLabsStats,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching tool", { error });
    res.status(500).json({
      error: "Failed to fetch tool",
      message: error.message,
    });
  }
});

/**
 * Update a tool
 * PUT /api/tools/:id
 */
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;
    const { id } = req.params;
    const { tool_config } = req.body as { tool_config: ToolConfig };

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    if (!tool_config) {
      res.status(400).json({ error: "tool_config is required" });
      return;
    }

    // Find existing tool
    const existingTool = await db.tool.findFirst({
      where: { id, businessId },
    });

    if (!existingTool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    logger.info("Updating tool", {
      toolId: id,
      toolName: tool_config.name,
    });

    // Update tool in ElevenLabs
    const elevenLabsResponse = await toolService.updateTool(
      existingTool.elevenLabsToolId,
      tool_config
    );

    // Update tool in database
    const updatedTool = await db.tool.update({
      where: { id },
      data: {
        type: tool_config.type,
        name: tool_config.name,
        description: tool_config.description,
        config: tool_config as any,
      },
    });

    logger.info("Tool updated successfully", { toolId: id });

    res.json({
      success: true,
      tool: {
        id: updatedTool.id,
        elevenLabsToolId: updatedTool.elevenLabsToolId,
        type: updatedTool.type,
        name: updatedTool.name,
        description: updatedTool.description,
        config: updatedTool.config,
        isActive: updatedTool.isActive,
        updatedAt: updatedTool.updatedAt,
      },
      elevenLabsResponse,
    });
  } catch (error: any) {
    logger.error("Error updating tool", { error });
    res.status(500).json({
      error: "Failed to update tool",
      message: error.message,
    });
  }
});

/**
 * Delete a tool
 * DELETE /api/tools/:id
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;
    const { id } = req.params;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    // Find existing tool
    const existingTool = await db.tool.findFirst({
      where: { id, businessId },
      include: {
        agentTools: true,
      },
    });

    if (!existingTool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    logger.info("Deleting tool", {
      toolId: id,
      toolName: existingTool.name,
    });

    // Delete tool from ElevenLabs
    await toolService.deleteTool(existingTool.elevenLabsToolId);

    // Delete tool from database (cascade deletes agent_tools entries)
    await db.tool.delete({
      where: { id },
    });

    logger.info("Tool deleted successfully", { toolId: id });

    res.json({
      success: true,
      message: "Tool deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting tool", { error });
    res.status(500).json({
      error: "Failed to delete tool",
      message: error.message,
    });
  }
});

/**
 * Attach a tool to an agent
 * POST /api/tools/:id/attach
 */
router.post("/:id/attach", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;
    const { id } = req.params;
    const { agentId } = req.body;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    if (!id) {
      res.status(400).json({ error: "Tool ID is required" });
      return;
    }

    if (!agentId) {
      res.status(400).json({ error: "agentId is required" });
      return;
    }

    // Verify tool exists and belongs to business
    const tool = await db.tool.findFirst({
      where: { id, businessId },
    });

    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    // Verify agent exists and belongs to business
    const agent = await db.elevenLabsAgent.findFirst({
      where: { id: agentId, businessId },
    });

    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    // Check if already attached
    const existingAttachment = await db.agentTool.findUnique({
      where: {
        agentId_toolId: {
          agentId,
          toolId: id,
        },
      },
    });

    if (existingAttachment) {
      res.status(409).json({ error: "Tool already attached to agent" });
      return;
    }

    // Attach tool to agent
    const agentTool = await db.agentTool.create({
      data: {
        agentId,
        toolId: id,
        isEnabled: true,
      },
    });

    logger.info("Tool attached to agent", {
      toolId: id,
      agentId,
    });

    res.status(201).json({
      success: true,
      agentTool: {
        id: agentTool.id,
        agentId: agentTool.agentId,
        toolId: agentTool.toolId,
        isEnabled: agentTool.isEnabled,
      },
    });
  } catch (error: any) {
    logger.error("Error attaching tool to agent", { error });
    res.status(500).json({
      error: "Failed to attach tool to agent",
      message: error.message,
    });
  }
});

/**
 * Detach a tool from an agent
 * POST /api/tools/:id/detach
 */
router.post("/:id/detach", async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = req.headers["x-business-id"] as string;
    const { id } = req.params;
    const { agentId } = req.body;

    if (!businessId) {
      res.status(400).json({ error: "x-business-id header is required" });
      return;
    }

    if (!id) {
      res.status(400).json({ error: "Tool ID is required" });
      return;
    }

    if (!agentId) {
      res.status(400).json({ error: "agentId is required" });
      return;
    }

    // Find and delete the attachment
    const deleted = await db.agentTool.deleteMany({
      where: {
        agentId,
        toolId: id,
        agent: {
          businessId,
        },
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Tool attachment not found" });
      return;
    }

    logger.info("Tool detached from agent", {
      toolId: id,
      agentId,
    });

    res.json({
      success: true,
      message: "Tool detached from agent successfully",
    });
  } catch (error: any) {
    logger.error("Error detaching tool from agent", { error });
    res.status(500).json({
      error: "Failed to detach tool from agent",
      message: error.message,
    });
  }
});

/**
 * Get all tool templates
 * GET /api/tools/templates
 */
router.get("/templates/all", async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = getAllToolTemplates();

    res.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    logger.error("Error fetching templates", { error });
    res.status(500).json({
      error: "Failed to fetch templates",
      message: error.message,
    });
  }
});

/**
 * Get a specific tool template
 * GET /api/tools/templates/:name
 */
router.get("/templates/:name", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      res.status(400).json({ error: "Template name is required" });
      return;
    }

    const template = getToolTemplate(name);

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json({
      success: true,
      template,
    });
  } catch (error: any) {
    logger.error("Error fetching template", { error });
    res.status(500).json({
      error: "Failed to fetch template",
      message: error.message,
    });
  }
});

export default router;
