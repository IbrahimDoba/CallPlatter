import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@repo/db";
import { z } from "zod";

const appointmentSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const businessId = session.user.businessId;

    // Get all appointments for the business
    const appointments = await db.appointment.findMany({
      where: { businessId },
      orderBy: { appointmentTime: "asc" },
    });

    return NextResponse.json({
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerName, customerPhone, appointmentTime, notes } = appointmentSchema.parse(body);

    const businessId = session.user.businessId;

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        businessId,
        customerName,
        customerPhone,
        appointmentTime: new Date(appointmentTime),
        notes,
      },
    });

    return NextResponse.json({
      message: "Appointment created successfully",
      appointment,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
