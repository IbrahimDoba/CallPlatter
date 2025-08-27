import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@repo/db";

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

    // Get total calls
    const totalCalls = await db.call.count({
      where: { businessId }
    });

    // Get total appointments
    const totalAppointments = await db.appointment.count({
      where: { businessId }
    });

    // Get recent calls (last 5)
    const recentCalls = await db.call.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get recent appointments (last 5)
    const recentAppointments = await db.appointment.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      totalCalls,
      totalAppointments,
      recentCalls,
      recentAppointments,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
