/**
 * ElevenLabs Agent Management Routes
 *
 * Internal API endpoints for managing ElevenLabs agents.
 * Used by onboarding and other internal processes.
 *
 * These routes use x-business-id header authentication (like billing routes)
 * rather than full session authentication.
 */

import type { Request, Response } from "express";
import { Router } from "express";
import { elevenLabsAgentService } from "../services/elevenLabsAgentService";
import { logger } from "../utils/logger";

const router: Router = Router();

// Helper to get businessId from headers
const getBusinessId = (req: Request): string | null => {
  return (req.headers["x-business-id"] as string) || null;
};

// POST /api/elevenlabs-management/create - Create agent during onboarding
router.post("/create", async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ error: "Business ID required" });
    }

    const {
      businessName,
      businessDescription,
      voiceName,
      firstMessage,
      // Optional agent settings
      askForName = true,
      askForPhone = true,
      askForEmail = true,
      askForCompany = false,
      askForAddress = false,
      systemPrompt,
      goodbyeMessage,
      temperature,
      // Transfer settings
      transferEnabled = false,
      transferPhoneNumber = '',
    } = req.body;

    if (!businessName || !businessDescription || !voiceName || !firstMessage) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: businessName, businessDescription, voiceName, firstMessage",
      });
    }

    const agentId = await elevenLabsAgentService.createAgent({
      businessId,
      businessName,
      businessDescription,
      voiceName,
      firstMessage,
      // Pass agent settings to be stored in ElevenLabsAgent
      askForName,
      askForPhone,
      askForEmail,
      askForCompany,
      askForAddress,
      systemPrompt,
      goodbyeMessage,
      temperature,
      // Transfer settings
      transferEnabled,
      transferPhoneNumber,
    });

    if (!agentId) {
      return res.status(500).json({
        success: false,
        error: "Failed to create ElevenLabs agent",
      });
    }

    logger.info("Created ElevenLabs agent via management API", {
      businessId,
      agentId,
    });

    return res.json({
      success: true,
      data: { agentId },
    });
  } catch (error) {
    logger.error("Error creating ElevenLabs agent:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT /api/elevenlabs-management/update - Update agent
router.put("/update", async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ error: "Business ID required" });
    }

    const {
      systemPrompt,
      firstMessage,
      voiceName,
      temperature,
      goodbyeMessage,
      askForName,
      askForPhone,
      askForCompany,
      askForEmail,
      askForAddress,
      transferEnabled,
      transferPhoneNumber,
    } = req.body;

    const success = await elevenLabsAgentService.updateAgent(businessId, {
      systemPrompt,
      firstMessage,
      voiceName,
      temperature,
      goodbyeMessage,
      askForName,
      askForPhone,
      askForCompany,
      askForEmail,
      askForAddress,
      transferEnabled,
      transferPhoneNumber,
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        error: "Failed to update ElevenLabs agent",
      });
    }

    logger.info("Updated ElevenLabs agent via management API", { businessId });

    return res.json({
      success: true,
      message: "Agent updated successfully",
    });
  } catch (error) {
    logger.error("Error updating ElevenLabs agent:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/elevenlabs-management/status - Get agent status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ error: "Business ID required" });
    }

    const agentDetails = await elevenLabsAgentService.getAgentDetails(businessId);

    if (!agentDetails) {
      return res.json({
        success: true,
        data: {
          hasAgent: false,
          agentId: null,
          voiceId: null,
          voiceName: null,
        },
      });
    }

    logger.info("Fetched ElevenLabs agent status via management API", {
      businessId,
      agentId: agentDetails.agentId,
    });

    return res.json({
      success: true,
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
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
