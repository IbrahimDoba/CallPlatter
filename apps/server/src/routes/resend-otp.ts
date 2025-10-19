import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { logger } from "../utils/logger";
import { generateSecureOTP, getOTPExpirationTime, checkOTPRateLimit } from "../utils/otp";
import { sendOTPVerificationEmail } from "../services/resendService";

const router: Router = Router();

const resendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/resend-otp - Resend OTP for email verification
router.post("/", async (req, res) => {
  try {
    const { email } = resendOTPSchema.parse(req.body);

    // Check if user exists and is not verified
    const user = await db.user.findUnique({
      where: { email },
      include: { business: true }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Check rate limiting for OTP requests
    const canRequestOTP = await checkOTPRateLimit(db, email);
    if (!canRequestOTP) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later."
      });
    }

    // Generate new OTP
    const otp = generateSecureOTP();
    const otpExpiresAt = getOTPExpirationTime();

    // Update user with new OTP and create new verification token
    await db.$transaction(async (tx: any) => {
      // Update user with new OTP
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerificationOtp: otp,
          otpExpiresAt: otpExpiresAt,
        },
      });

      // Create new email verification token
      await tx.emailVerificationToken.create({
        data: {
          email,
          otp,
          expiresAt: otpExpiresAt,
        },
      });
    });

    // Send OTP verification email
    try {
      await sendOTPVerificationEmail({
        email,
        otp,
        businessName: user.business?.name || "Your Business",
      });

      logger.info("OTP resend email sent", {
        userId: user.id,
        email
      });

      return res.status(200).json({
        message: "Verification code sent successfully"
      });
    } catch (emailError) {
      logger.error("Failed to send OTP resend email:", emailError);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again."
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Resend OTP error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
