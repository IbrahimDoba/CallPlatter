import { Router } from "express";
import { validateSession, SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";

const router: Router = Router();

// Apply session validation to all routes
router.use(validateSession);

// GET /api/settings
router.get("/", async (req: SessionAuthenticatedRequest, res) => {
  logger.info("Settings GET endpoint called", { userId: req.user?.id });
  return res.status(501).json({ 
    message: "Settings endpoint is not implemented yet" 
  });
});

// PUT /api/settings
router.put("/", async (req: SessionAuthenticatedRequest, res) => {
  logger.info("Settings PUT endpoint called", { userId: req.user?.id });
  return res.status(501).json({ 
    message: "Update settings is not implemented yet" 
  });
});

export default router;
