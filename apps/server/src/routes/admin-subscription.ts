import { Router, type Request, type Response } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { subscriptionSyncService } from "../services/subscriptionSyncService";

const router: Router = Router();

// Simple admin auth (you should improve this with proper authentication)
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me-in-production";

const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/**
 * Get subscription debug info
 * GET /api/admin/subscription/:businessId/debug
 */
router.get("/:businessId/debug", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    const debugInfo = await subscriptionSyncService.getSubscriptionDebugInfo(businessId);

    res.json({
      success: true,
      data: debugInfo,
    });
  } catch (error) {
    logger.error("Error getting subscription debug info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get debug info",
    });
  }
});

/**
 * Manually fix subscription state
 * POST /api/admin/subscription/:businessId/fix
 *
 * Body:
 * {
 *   "planType": "BUSINESS",
 *   "status": "ACTIVE",
 *   "currentPeriodStart": "2025-11-23T11:16:32.295Z",
 *   "currentPeriodEnd": "2025-12-23T11:16:32.295Z",
 *   "trialEndsAt": null,
 *   "cancelledAt": null,
 *   "resetUsage": true
 * }
 */
router.post("/:businessId/fix", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    const {
      planType,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      trialEndsAt,
      cancelledAt,
      resetUsage,
    } = req.body;

    // Validate required fields
    if (!planType || !status || !currentPeriodStart || !currentPeriodEnd) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: planType, status, currentPeriodStart, currentPeriodEnd",
      });
    }

    // Find subscription
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    logger.warn(`🔧 ADMIN: Manually fixing subscription for business ${businessId}`, {
      from: {
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      to: {
        planType,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
        cancelledAt,
      },
    });

    // Update subscription
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planType,
        status,
        currentPeriodStart: new Date(currentPeriodStart),
        currentPeriodEnd: new Date(currentPeriodEnd),
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : null,
        cancelledAt: cancelledAt ? new Date(cancelledAt) : null,
        ...(resetUsage && { minutesUsed: 0 }),
      },
    });

    // Reset usage if requested
    if (resetUsage) {
      const periodStart = new Date(currentPeriodStart);
      const month = periodStart.getMonth() + 1;
      const year = periodStart.getFullYear();

      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId,
            month,
            year,
          },
        },
        create: {
          businessId,
          month,
          year,
          totalMinutes: 0,
          includedMinutes: updated.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
        update: {
          totalMinutes: 0,
          includedMinutes: updated.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
      });

      logger.info(`✅ Reset billing usage for ${month}/${year}`);
    }

    // Clear sync cooldown so next sync can happen
    subscriptionSyncService.clearSyncCooldown(businessId);

    res.json({
      success: true,
      message: "Subscription fixed successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Error fixing subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix subscription",
    });
  }
});

/**
 * Clear sync cooldown for a business
 * POST /api/admin/subscription/:businessId/clear-cooldown
 */
router.post("/:businessId/clear-cooldown", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    subscriptionSyncService.clearSyncCooldown(businessId);

    res.json({
      success: true,
      message: "Sync cooldown cleared",
    });
  } catch (error) {
    logger.error("Error clearing cooldown:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear cooldown",
    });
  }
});

/**
 * Force sync from Polar (bypasses cooldown)
 * POST /api/admin/subscription/:businessId/force-sync
 */
router.post("/:businessId/force-sync", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    // Clear cooldown first
    subscriptionSyncService.clearSyncCooldown(businessId);

    // Force sync
    const result = await subscriptionSyncService.forceSyncFromPolar(businessId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error force syncing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to force sync",
    });
  }
});

export default router;
