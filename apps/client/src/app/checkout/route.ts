import { Checkout } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const successUrl = searchParams.get('success_url') || process.env.SUCCESS_URL || "http://localhost:3000/success";
  const cancelUrl = searchParams.get('cancel_url') || process.env.RETURN_URL || "http://localhost:3000/calls";

  return Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    successUrl,
    returnUrl: cancelUrl, // Use cancelUrl as returnUrl
    server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    theme: "dark", 
  })(request);
}
