import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { logger } from "../utils/logger";
import { generateSecureOTP, getPasswordResetOTPExpirationTime, checkPasswordResetOTPRateLimit } from "../utils/otp";
import { sendPasswordResetOTP } from "../services/resendService";

const router: Router = Router();

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/forgot-password - Send password reset OTP
router.post("/", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message: "If an account with this email exists, a password reset code has been sent."
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        message: "Please verify your email before resetting your password"
      });
    }

    // Check rate limiting for password reset OTP requests
    const canRequestOTP = await checkPasswordResetOTPRateLimit(db, email);
    if (!canRequestOTP) {
      return res.status(429).json({
        message: "Too many password reset requests. Please try again later."
      });
    }

    // Generate new OTP and token
    const otp = generateSecureOTP();
    const otpExpiresAt = getPasswordResetOTPExpirationTime();
    const resetToken = require('crypto').randomBytes(32).toString('hex');

    // Create password reset token record
    await db.passwordResetToken.create({
      data: {
        email,
        otp,
        token: resetToken,
        expiresAt: otpExpiresAt,
      },
    });

    // Send password reset OTP email
    try {
      await sendPasswordResetOTP({
        email,
        otp,
        businessName: user.business?.name || "Your Business",
      });

      logger.info("Password reset OTP email sent", {
        userId: user.id,
        email
      });
    } catch (emailError) {
      logger.error("Failed to send password reset OTP email:", emailError);
      // Don't fail the request if email fails - user can request resend
    }

    logger.info("Password reset OTP requested", {
      userId: user.id,
      email
    });

    return res.status(200).json({
      message: "If an account with this email exists, a password reset code has been sent."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
