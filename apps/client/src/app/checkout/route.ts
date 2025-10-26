import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  successUrl: process.env.SUCCESS_URL || "http://localhost:3000/success",
  returnUrl: process.env.RETURN_URL || "http://localhost:3000/calls", // Back button URL
  server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
  theme: "light", // You can make this dynamic based on user preference
});
