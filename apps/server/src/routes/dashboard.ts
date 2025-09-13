import { Router } from "express";
import { db } from "@repo/db";
import { validateSession, SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";

const router: Router = Router();

// Apply session validation to all routes
router.use(validateSession);

// GET /api/dashboard/stats
router.get("/stats", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    // Get total calls
    const totalCalls = await db.call.count({
      where: { businessId }
    });

    // Get total appointments
    const totalAppointments = await db.appointment.count({
      where: { businessId }
    });

    // Get recent calls (last 5)
    const recentCalls = await db.call.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get recent appointments (last 5)
    const recentAppointments = await db.appointment.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    logger.info("Fetched dashboard stats", { 
      businessId, 
      totalCalls,
      totalAppointments,
      userId: req.user.id 
    });

    return res.json({
      totalCalls,
      totalAppointments,
      recentCalls,
      recentAppointments,
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
