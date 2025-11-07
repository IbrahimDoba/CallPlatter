import { Router, type Request, type Response } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { logger } from "../utils/logger";
import {
  sendDemoRequestConfirmation,
  sendDemoRequestNotification,
} from "../services/resendService";

const router: Router = Router();

const demoRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySocials: z.string().optional().nullable(),
  demoEmail: z.string().email("Invalid demo email address"),
});

// POST /api/demo-request - Submit demo request
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = demoRequestSchema.parse(req.body);

    // Save to database
    const demoRequest = await db.demoRequest.create({
      data: {
        firstName: validatedData.firstName,
        email: validatedData.email,
        companyName: validatedData.companyName,
        industry: validatedData.industry,
        companySocials: validatedData.companySocials || null,
        demoEmail: validatedData.demoEmail,
        status: "PENDING",
      },
    });

    logger.info("Demo request created", {
      id: demoRequest.id,
      companyName: validatedData.companyName,
      industry: validatedData.industry,
    });

    // Send confirmation email to user
    try {
      await sendDemoRequestConfirmation({
        firstName: validatedData.firstName,
        email: validatedData.demoEmail, // Send to the demo email address
        companyName: validatedData.companyName,
      });

      logger.info("Demo request confirmation email sent", {
        demoRequestId: demoRequest.id,
        email: validatedData.demoEmail,
      });
    } catch (emailError) {
      logger.error("Failed to send demo confirmation email:", emailError);
      // Continue anyway - we have the data saved
    }

    // Send notification email to admin
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL || "ibrahimdoba55@gmail.com";

      await sendDemoRequestNotification({
        firstName: validatedData.firstName,
        email: validatedData.email,
        companyName: validatedData.companyName,
        industry: validatedData.industry,
        companySocials: validatedData.companySocials || null,
        demoEmail: validatedData.demoEmail,
        adminEmail,
      });

      logger.info("Demo request notification email sent", {
        demoRequestId: demoRequest.id,
        adminEmail,
      });
    } catch (emailError) {
      logger.error("Failed to send demo notification email:", emailError);
      // Continue anyway - we have the data saved
    }

    return res.status(200).json({
      success: true,
      message: "Demo request submitted successfully",
      demoRequestId: demoRequest.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    logger.error("Demo request submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

export default router;

