import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { validateSession, type SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";

const router: Router = Router();

// Type definitions for tools (will be properly typed after Prisma regeneration)
interface AgentToolData {
  id: string;
  agentId: string;
  toolType: string;
  toolName: string;
  description: string | null;
  isEnabled: boolean;
  config: unknown;
  elevenLabsToolId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// System tools available in ElevenLabs
const SYSTEM_TOOLS = [
  {
    name: "end_call",
    displayName: "End Call",
    description: "Allows the agent to end the call when appropriate",
    defaultEnabled: true,
  },
  {
    name: "language_detection",
    displayName: "Language Detection",
    description: "Automatically detects the caller's language",
    defaultEnabled: false,
  },
  {
    name: "transfer_to_number",
    displayName: "Transfer to Phone Number",
    description: "Transfer the call to another phone number",
    defaultEnabled: false,
  },
  {
    name: "dtmf",
    displayName: "DTMF Tones",
    description: "Play touch-tone sounds during the call",
    defaultEnabled: false,
  },
];

// Apply session validation to all routes
router.use(validateSession);

// GET /api/agent-tools - Get all tools for the business's agent
router.get("/", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    // Get the agent for this business
    const agent = await db.elevenLabsAgent.findUnique({
      where: { businessId },
      include: {
        tools: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!agent) {
      return res.status(404).json({
        ok: false,
        error: "No agent found. Please create an agent first.",
      });
    }

    // If no tools exist, initialize with default system tools
    if (agent.tools.length === 0) {
      logger.info("Initializing default tools for agent", {
        businessId,
        agentId: agent.id,
      });

      const defaultTools = await Promise.all(
        SYSTEM_TOOLS.map((tool) =>
          db.agentTool.create({
            data: {
              agentId: agent.id,
              toolType: "system",
              toolName: tool.name,
              description: tool.description,
              isEnabled: tool.defaultEnabled,
            },
          })
        )
      );

      return res.json({
        ok: true,
        data: {
          tools: defaultTools.map((tool) => ({
            id: tool.id,
            toolType: tool.toolType,
            toolName: tool.toolName,
            displayName:
              SYSTEM_TOOLS.find((t) => t.name === tool.toolName)?.displayName ||
              tool.toolName,
            description: tool.description,
            isEnabled: tool.isEnabled,
            config: tool.config,
          })),
          totalEnabled: defaultTools.filter((t) => t.isEnabled).length,
          totalTools: defaultTools.length,
        },
      });
    }

    // Return existing tools
    const toolsWithDisplayNames = agent.tools.map((tool) => ({
      id: tool.id,
      toolType: tool.toolType,
      toolName: tool.toolName,
      displayName:
        SYSTEM_TOOLS.find((t) => t.name === tool.toolName)?.displayName ||
        tool.toolName,
      description: tool.description,
      isEnabled: tool.isEnabled,
      config: tool.config,
    }));

    logger.info("Fetched agent tools", {
      businessId,
      agentId: agent.id,
      toolCount: agent.tools.length,
      enabledCount: agent.tools.filter((t) => t.isEnabled).length,
    });

    return res.json({
      ok: true,
      data: {
        tools: toolsWithDisplayNames,
        totalEnabled: agent.tools.filter((t) => t.isEnabled).length,
        totalTools: agent.tools.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching agent tools:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/agent-tools/:toolId/toggle - Toggle a tool's enabled status
const toggleToolSchema = z.object({
  isEnabled: z.boolean(),
});

router.put("/:toolId/toggle", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const { toolId } = req.params;
    const body = toggleToolSchema.parse(req.body);

    // Verify the tool belongs to the business's agent
    const agent = await db.elevenLabsAgent.findUnique({
      where: { businessId },
    });

    if (!agent) {
      return res.status(404).json({
        ok: false,
        error: "No agent found",
      });
    }

    const tool = await db.agentTool.findFirst({
      where: {
        id: toolId,
        agentId: agent.id,
      },
    });

    if (!tool) {
      return res.status(404).json({
        ok: false,
        error: "Tool not found",
      });
    }

    // Update the tool's enabled status
    const updatedTool = await db.agentTool.update({
      where: { id: toolId },
      data: { isEnabled: body.isEnabled },
    });

    // Update the ElevenLabs agent configuration with new tool list
    await syncAgentTools(agent.id);

    logger.info("Toggled agent tool", {
      businessId,
      toolId,
      toolName: tool.toolName,
      isEnabled: body.isEnabled,
    });

    return res.json({
      ok: true,
      data: {
        id: updatedTool.id,
        toolName: updatedTool.toolName,
        isEnabled: updatedTool.isEnabled,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error toggling agent tool:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// Helper function to sync agent tools with ElevenLabs
async function syncAgentTools(agentId: string): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    logger.error("Missing ElevenLabs API key");
    return false;
  }

  try {
    const agent = await db.elevenLabsAgent.findUnique({
      where: { id: agentId },
      include: {
        tools: {
          where: { isEnabled: true },
        },
        business: {
          select: { description: true },
          include: {
            businessMemories: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!agent) {
      logger.error("Agent not found", { agentId });
      return false;
    }

    // Build tools array for ElevenLabs API
    const toolsArray = agent.tools.map((tool) => {
      if (tool.toolType === "system") {
        return {
          type: "system",
          name: tool.toolName,
          description: tool.description || "",
        };
      }
      // For webhook/custom tools, use the config
      return tool.config;
    });

    // Build the prompt config with updated tools
    const promptConfig: Record<string, unknown> = {
      prompt: agent.systemPrompt || "",
      llm: "gpt-4o-mini",
      temperature: agent.temperature || 0.7,
      max_tokens: 150,
      tools: toolsArray,
    };

    // Update the agent via ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agent.agentId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: promptConfig,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to sync agent tools with ElevenLabs", {
        agentId: agent.agentId,
        status: response.status,
        error: errorText,
      });
      return false;
    }

    logger.info("Synced agent tools with ElevenLabs", {
      agentId: agent.agentId,
      enabledTools: toolsArray.length,
    });

    return true;
  } catch (error) {
    logger.error("Error syncing agent tools:", error);
    return false;
  }
}

// GET /api/agent-tools/available - Get list of available system tools
router.get("/available", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      ok: true,
      data: SYSTEM_TOOLS,
    });
  } catch (error) {
    logger.error("Error fetching available tools:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

export default router;
