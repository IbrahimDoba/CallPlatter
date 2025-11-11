// services/elevenLabsToolsService.ts
import { logger } from "../utils/logger";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

interface CreateSystemToolParams {
  name: string;
  description: string;
  systemToolType: "end_call" | "language_detection" | "transfer_to_agent" | "transfer_to_number" | "skip_turn" | "play_keypad_touch_tone" | "voicemail_detection";
}

interface ToolResponse {
  id: string;
  tool_config: {
    type: string;
    name: string;
    description: string;
    params?: {
      system_tool_type: string;
    };
  };
}

/**
 * Create a system tool in ElevenLabs workspace
 */
export async function createSystemTool(params: CreateSystemToolParams): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    logger.error("❌ Missing ElevenLabs API key");
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/tools`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_config: {
          type: "system",
          name: params.name,
          description: params.description,
          params: {
            system_tool_type: params.systemToolType,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("❌ Failed to create system tool", {
        status: response.status,
        error: errorText,
        toolName: params.name,
      });
      return null;
    }

    const data: ToolResponse = await response.json();
    logger.info("✅ Created system tool", {
      toolId: data.id,
      toolName: params.name,
      systemToolType: params.systemToolType,
    });

    return data.id;
  } catch (error) {
    logger.error("❌ Error creating system tool", {
      error,
      toolName: params.name,
    });
    return null;
  }
}

/**
 * Get or create the end_call tool
 * Returns the tool ID
 */
export async function getOrCreateEndCallTool(): Promise<string | null> {
  // First, try to list existing tools to see if end_call already exists
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/tools`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY || "",
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const tools = data.tools || [];

      // Look for existing end_call tool
      const endCallTool = tools.find(
        (tool: ToolResponse) =>
          tool.tool_config?.type === "system" &&
          tool.tool_config?.params?.system_tool_type === "end_call"
      );

      if (endCallTool) {
        logger.info("✅ Found existing end_call tool", {
          toolId: endCallTool.id,
        });
        return endCallTool.id;
      }
    }
  } catch (error) {
    logger.warn("⚠️ Could not list existing tools, will create new one", { error });
  }

  // Create the tool if it doesn't exist
  return await createSystemTool({
    name: "end_call",
    description:
      "Ends the phone call immediately. MUST be called after saying goodbye when: 1) Customer says goodbye/thank you, 2) All questions answered, 3) Customer asks to hang up, or 4) 10+ seconds of silence. Do NOT mention this tool in speech - just invoke it silently after your goodbye message.",
    systemToolType: "end_call",
  });
}

/**
 * Get a tool by ID
 */
export async function getTool(toolId: string): Promise<ToolResponse | null> {
  if (!ELEVENLABS_API_KEY) {
    logger.error("❌ Missing ElevenLabs API key");
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/tools/${toolId}`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      logger.error("❌ Failed to get tool", {
        toolId,
        status: response.status,
      });
      return null;
    }

    const data: ToolResponse = await response.json();
    return data;
  } catch (error) {
    logger.error("❌ Error getting tool", { toolId, error });
    return null;
  }
}

/**
 * List all tools in the workspace
 */
export async function listTools(): Promise<ToolResponse[]> {
  if (!ELEVENLABS_API_KEY) {
    logger.error("❌ Missing ElevenLabs API key");
    return [];
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/tools`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      logger.error("❌ Failed to list tools", { status: response.status });
      return [];
    }

    const data = await response.json();
    return data.tools || [];
  } catch (error) {
    logger.error("❌ Error listing tools", { error });
    return [];
  }
}

