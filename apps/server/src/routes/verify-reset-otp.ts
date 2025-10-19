import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { logger } from "../utils/logger";
import { isValidOTPFormat, isOTPExpired, checkPasswordResetAttemptRateLimit } from "../utils/otp";

const router: Router = Router();

const verifyResetOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

// POST /api/verify-reset-otp - Verify password reset OTP and return reset token
router.post("/", async (req, res) => {
  try {
    const { email, otp } = verifyResetOTPSchema.parse(req.body);

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      return res.status(400).json({
        message: "Invalid OTP format. Please enter a 6-digit code."
      });
    }

    // Check rate limiting for password reset attempts
    const canAttemptReset = await checkPasswordResetAttemptRateLimit(db, email);
    if (!canAttemptReset) {
      return res.status(429).json({
        message: "Too many password reset attempts. Please try again later."
      });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Find the most recent password reset token for this email
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        email,
        otp,
        used: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Invalid verification code"
      });
    }

    // Check if OTP has expired
    if (isOTPExpired(resetToken.expiresAt)) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one."
      });
    }

    // Mark OTP token as used
    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    logger.info("Password reset OTP verified successfully", {
      userId: user.id,
      email
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken: resetToken.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.business?.name || "Your Business",
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Verify reset OTP error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
