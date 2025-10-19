import { Router } from "express";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { logger } from "../utils/logger";
import { generateSecureOTP, getOTPExpirationTime, checkOTPRateLimit } from "../utils/otp";
import { sendOTPVerificationEmail } from "../services/resendService";

const router: Router = Router();

const signupSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/signup
router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    // Check if business with same phone number already exists
    const existingBusiness = await db.business.findFirst({
      where: { phoneNumber },
    });

    if (existingBusiness) {
      return res.status(400).json({
        message: "Business with this phone number already exists"
      });
    }

    // Check rate limiting for OTP requests
    const canRequestOTP = await checkOTPRateLimit(db, email);
    if (!canRequestOTP) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP for email verification
    const otp = generateSecureOTP();
    const otpExpiresAt = getOTPExpirationTime();

    // Create business and user in a transaction
    const result = await db.$transaction(async (tx: any) => {
      // Create business first
      const business = await tx.business.create({
        data: {
          name,
          phoneNumber,
        },
      });

      // Create user associated with the business (email not verified yet)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name, // Use business name as user name
          businessId: business.id,
          role: "ADMIN", // First user is admin
          emailVerified: null, // Email not verified yet
          emailVerificationOtp: otp,
          otpExpiresAt: otpExpiresAt,
        },
      });

      // Create email verification token record
      await tx.emailVerificationToken.create({
        data: {
          email,
          otp,
          expiresAt: otpExpiresAt,
        },
      });

      return { business, user };
    });

    // Send OTP verification email
    try {
      await sendOTPVerificationEmail({
        email,
        otp,
        businessName: name,
      });

      logger.info("OTP verification email sent", {
        businessId: result.business.id,
        userId: result.user.id,
        email
      });
    } catch (emailError) {
      logger.error("Failed to send OTP email:", emailError);
      // Don't fail the signup if email fails - user can request resend
    }

    logger.info("Business and user created successfully (email verification required)", {
      businessId: result.business.id,
      userId: result.user.id,
      email
    });

    return res.status(201).json({
      message: "Account created successfully. Please check your email for verification code.",
      requiresEmailVerification: true,
      business: {
        id: result.business.id,
        name: result.business.name,
        phoneNumber: result.business.phoneNumber,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }

    logger.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;
