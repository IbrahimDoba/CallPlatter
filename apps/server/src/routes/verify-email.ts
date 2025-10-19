import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { logger } from "../utils/logger";
import { isValidOTPFormat, isOTPExpired, checkVerificationRateLimit } from "../utils/otp";
import { sendEmailVerifiedSuccess } from "../services/resendService";

const router: Router = Router();

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

// POST /api/verify-email - Verify email with OTP
router.post("/", async (req, res) => {
  try {
    const { email, otp } = verifyEmailSchema.parse(req.body);

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      return res.status(400).json({
        message: "Invalid OTP format. Please enter a 6-digit code."
      });
    }

    // Check rate limiting for verification attempts
    const canAttemptVerification = await checkVerificationRateLimit(db, email);
    if (!canAttemptVerification) {
      return res.status(429).json({
        message: "Too many verification attempts. Please try again later."
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

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Find the most recent OTP token for this email
    const otpToken = await db.emailVerificationToken.findFirst({
      where: {
        email,
        otp,
        used: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpToken) {
      return res.status(400).json({
        message: "Invalid verification code"
      });
    }

    // Check if OTP has expired
    if (isOTPExpired(otpToken.expiresAt)) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one."
      });
    }

    // Verify the OTP and mark email as verified
    await db.$transaction(async (tx: any) => {
      // Update user to mark email as verified
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          emailVerificationOtp: null, // Clear OTP
          otpExpiresAt: null, // Clear expiration
        },
      });

      // Mark OTP token as used
      await tx.emailVerificationToken.update({
        where: { id: otpToken.id },
        data: { used: true },
      });
    });

    // Send success email
    try {
      await sendEmailVerifiedSuccess({
        email,
        businessName: user.business?.name || "Your Business",
      });

      logger.info("Email verification success email sent", {
        userId: user.id,
        email
      });
    } catch (emailError) {
      logger.error("Failed to send verification success email:", emailError);
      // Don't fail the verification if success email fails
    }

    logger.info("Email verified successfully", {
      userId: user.id,
      email
    });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessId: user.businessId,
        role: user.role,
        emailVerified: true,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Email verification error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
