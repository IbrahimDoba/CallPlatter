import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";
import { sendPasswordResetSuccess } from "../services/resendService";

const router: Router = Router();

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/reset-password - Reset password with token
router.post("/", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = resetPasswordSchema.parse(req.body);

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

    // Find the password reset token
    const tokenRecord = await db.passwordResetToken.findFirst({
      where: {
        email,
        token: resetToken,
        used: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!tokenRecord) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      return res.status(400).json({
        message: "Reset token has expired. Please request a new one."
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used
    await db.$transaction(async (tx: any) => {
      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      // Mark reset token as used
      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      });
    });

    // Send password reset success email
    try {
      await sendPasswordResetSuccess({
        email,
        businessName: user.business?.name || "Your Business",
      });

      logger.info("Password reset success email sent", {
        userId: user.id,
        email
      });
    } catch (emailError) {
      logger.error("Failed to send password reset success email:", emailError);
      // Don't fail the request if email fails
    }

    logger.info("Password reset successfully", {
      userId: user.id,
      email
    });

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Reset password error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
