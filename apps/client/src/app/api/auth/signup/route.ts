import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber, password } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if business with same phone number already exists
    const existingBusiness = await db.business.findFirst({
      where: { phoneNumber },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { message: "Business with this phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create business and user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create business first
      const business = await tx.business.create({
        data: {
          name,
          phoneNumber,
        },
      });

      // Create user associated with the business
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name, // Use business name as user name
          businessId: business.id,
          role: "ADMIN", // First user is admin
        },
      });

      return { business, user };
    });

    return NextResponse.json(
      { 
        message: "Business and user created successfully",
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
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
