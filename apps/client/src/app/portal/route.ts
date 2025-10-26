import { CustomerPortal } from "@polar-sh/nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@repo/db";


export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  getCustomerId: async () => {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    // Get user from database to check for Polar customer ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { polarCustomerId: true }
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Return Polar customer ID if exists, otherwise use user ID
    return user.polarCustomerId || session.user.id;
  },
  returnUrl: process.env.RETURN_URL || "http://localhost:3000/calls",
  server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
});
