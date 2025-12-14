/**
 * ElevenLabs Tool Service
 *
 * Handles all interactions with ElevenLabs Conversational AI Tools API
 * Reference: https://elevenlabs.io/docs/agents-platform/api-reference/tools/create
 */

import axios, { AxiosError } from "axios";
import { logger } from "../utils/logger.js";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/convai/tools";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Type definitions matching ElevenLabs API schema
export interface WebhookToolConfig {
  type: "webhook";
  name: string;
  description: string;
  response_timeout_secs?: number;
  disable_interruptions?: boolean;
  force_pre_tool_speech?: boolean;
  api_schema: {
    url: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    content_type?: "application/json" | "application/x-www-form-urlencoded";
    request_headers?: Record<string, string>;
    request_body_schema?: any; // JSON Schema
    query_params_schema?: any; // JSON Schema
  };
}

export interface ClientToolConfig {
  type: "client";
  name: string;
  description: string;
  response_timeout_secs?: number;
  disable_interruptions?: boolean;
  force_pre_tool_speech?: boolean;
  parameters?: any; // JSON Schema
  expects_response?: boolean;
}

export interface SystemToolConfig {
  type: "system";
  name: string;
  description?: string;
  params: {
    system_tool_type: "end_call" | "language_detection" | "transfer_to_agent" | "transfer_to_number" | "skip_turn" | "play_keypad_touch_tone" | "voicemail_detection";
    // Additional params depending on system_tool_type
    [key: string]: any;
  };
}

export type ToolConfig = WebhookToolConfig | ClientToolConfig | SystemToolConfig;

export interface CreateToolRequest {
  tool_config: ToolConfig;
}

export interface ToolResponse {
  id: string;
  tool_config: ToolConfig;
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  usage_stats: {
    total_calls?: number;
    avg_latency_secs: number;
  };
}

export class ElevenLabsToolService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ELEVENLABS_API_KEY || "";

    if (!this.apiKey) {
      logger.error("ElevenLabs API key not found");
      throw new Error("ELEVENLABS_API_KEY is required");
    }
  }

  /**
   * Create a new tool in ElevenLabs workspace
   */
  async createTool(toolConfig: ToolConfig): Promise<ToolResponse> {
    try {
      logger.info("Creating ElevenLabs tool", {
        toolName: toolConfig.name,
        toolType: toolConfig.type
      });

      const response = await axios.post<ToolResponse>(
        ELEVENLABS_API_URL,
        { tool_config: toolConfig },
        {
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("ElevenLabs tool created successfully", {
        toolId: response.data.id,
        toolName: toolConfig.name,
      });

      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to create tool");
      throw error;
    }
  }

  /**
   * Get a specific tool by ID
   */
  async getTool(toolId: string): Promise<ToolResponse> {
    try {
      logger.info("Fetching ElevenLabs tool", { toolId });

      const response = await axios.get<ToolResponse>(
        `${ELEVENLABS_API_URL}/${toolId}`,
        {
          headers: {
            "xi-api-key": this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to fetch tool");
      throw error;
    }
  }

  /**
   * List all tools in the workspace
   */
  async listTools(): Promise<ToolResponse[]> {
    try {
      logger.info("Listing all ElevenLabs tools");

      const response = await axios.get<ToolResponse[]>(
        ELEVENLABS_API_URL,
        {
          headers: {
            "xi-api-key": this.apiKey,
          },
        }
      );

      logger.info("Tools fetched successfully", {
        count: response.data.length
      });

      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to list tools");
      throw error;
    }
  }

  /**
   * Update an existing tool
   */
  async updateTool(toolId: string, toolConfig: ToolConfig): Promise<ToolResponse> {
    try {
      logger.info("Updating ElevenLabs tool", {
        toolId,
        toolName: toolConfig.name
      });

      const response = await axios.patch<ToolResponse>(
        `${ELEVENLABS_API_URL}/${toolId}`,
        { tool_config: toolConfig },
        {
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("Tool updated successfully", { toolId });

      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to update tool");
      throw error;
    }
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolId: string): Promise<void> {
    try {
      logger.info("Deleting ElevenLabs tool", { toolId });

      await axios.delete(
        `${ELEVENLABS_API_URL}/${toolId}`,
        {
          headers: {
            "xi-api-key": this.apiKey,
          },
        }
      );

      logger.info("Tool deleted successfully", { toolId });
    } catch (error) {
      this.handleError(error, "Failed to delete tool");
      throw error;
    }
  }

  /**
   * Helper: Create a webhook tool configuration
   */
  static createWebhookToolConfig(config: {
    name: string;
    description: string;
    url: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    requestBodySchema?: any;
    queryParamsSchema?: any;
  }): WebhookToolConfig {
    return {
      type: "webhook",
      name: config.name,
      description: config.description,
      api_schema: {
        url: config.url,
        method: config.method || "POST",
        content_type: "application/json",
        request_headers: config.headers,
        request_body_schema: config.requestBodySchema,
        query_params_schema: config.queryParamsSchema,
      },
    };
  }

  /**
   * Helper: Create a client tool configuration
   */
  static createClientToolConfig(config: {
    name: string;
    description: string;
    parameters?: any;
    expectsResponse?: boolean;
  }): ClientToolConfig {
    return {
      type: "client",
      name: config.name,
      description: config.description,
      parameters: config.parameters,
      expects_response: config.expectsResponse !== false, // Default true
    };
  }

  /**
   * Helper: Create a system tool configuration
   */
  static createSystemToolConfig(config: {
    name: string;
    systemToolType: "end_call" | "language_detection" | "transfer_to_agent" | "transfer_to_number";
    description?: string;
    params?: any;
  }): SystemToolConfig {
    return {
      type: "system",
      name: config.name,
      description: config.description,
      params: {
        system_tool_type: config.systemToolType,
        ...config.params,
      },
    };
  }

  /**
   * Error handler
   */
  private handleError(error: unknown, message: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logger.error(message, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } else {
      logger.error(message, { error });
    }
  }
}
