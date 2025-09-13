import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { validateSession, SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";

const router: Router = Router();

const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export type CallWithLogs = {
  id: string;
  businessId: string;
  customerPhone: string;
  customerName: string | null;
  summary: string | null;
  duration: number | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'MISSED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  audioFileUrl: string | null;
  logs: {
    id: string;
    message: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }[];
};

export type PaginatedCalls = {
  calls: CallWithLogs[];
  total: number;
};

// Apply session validation to all routes
router.use(validateSession);

// GET /api/calls
router.get("/", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;
    const { page, limit } = paginationSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    const [calls, total] = await Promise.all([
      db.call.findMany({
        where: { businessId },
        include: {
          logs: {
            orderBy: { timestamp: 'asc' },
            select: {
              id: true,
              message: true,
              sender: true,
              timestamp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.call.count({ where: { businessId } })
    ]);

    // Ensure customerPhone is never null and return paginated results
    const result: PaginatedCalls = {
      calls: calls.map(call => ({
        ...call,
        customerPhone: call.customerPhone || 'Unknown'
      })) as CallWithLogs[],
      total
    };

    logger.info("Fetched calls", { 
      businessId, 
      count: calls.length,
      total,
      page,
      limit,
      userId: req.user.id 
    });

    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error fetching calls:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
