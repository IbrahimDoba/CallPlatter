import { Webhooks } from "@polar-sh/nextjs";
import { db } from "@repo/db";
import type { PlanType } from "@prisma/client";

// Note: Using 'any' type for Polar webhook payloads as the exact types are not available
// The payload structure may vary and we need to access properties dynamically

// Helper function to map Polar plan to our PlanType
function mapPolarPlanToPlanType(polarProductName?: string): PlanType {
  if (!polarProductName) return "FREE";
  
  const name = polarProductName.toLowerCase();
  if (name.includes("starter")) return "STARTER";
  if (name.includes("business")) return "BUSINESS";
  if (name.includes("enterprise")) return "ENTERPRISE";
  
  return "FREE";
}

// Helper function to get billing plan details - using accurate USD values from pricing config
function getBillingPlanDetails(planType: PlanType) {
  const plans: Record<PlanType, { minutesIncluded: number; overageRate: number; monthlyPrice: number }> = {
    FREE: { minutesIncluded: 5, overageRate: 0, monthlyPrice: 0 },
    STARTER: { minutesIncluded: 40, overageRate: 0.89, monthlyPrice: 20 },
    BUSINESS: { minutesIncluded: 110, overageRate: 0.61, monthlyPrice: 45 },
    ENTERPRISE: { minutesIncluded: 300, overageRate: 0.44, monthlyPrice: 120 },
  };
  
  return plans[planType];
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
  
  // Handle customer creation - store Polar customer ID
  onCustomerCreated: async (payload) => {
    try {
      // Security logging
      console.log("🔒 Polar webhook: Customer created", { 
        timestamp: new Date().toISOString(),
        payloadType: payload.type 
      });
      
      const customer = payload.data;
      
      if (customer.email) {
        await db.user.updateMany({
          where: { email: customer.email },
          data: { polarCustomerId: customer.id }
        });
        console.log(`✅ Updated user ${customer.email} with Polar customer ID: ${customer.id}`);
      }
    } catch (error) {
      console.error("❌ Error handling customer creation:", error);
      throw error;
    }
  },
  
  // Handle successful payments
  onOrderPaid: async (payload) => {
    try {
      console.log("Order paid:", payload);
      // Access customer and order from the payload structure
      const customer = (payload as any).customer;
      const order = (payload as any).order;
      
      if (!customer?.email) {
        console.error("No customer email found in order paid payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Create billing transaction for the payment
      await db.billingTransaction.create({
        data: {
          businessId: user.business.id,
          type: "PAYMENT",
          amount: order?.total_amount || 0,
          description: `Payment for order ${order?.id || 'unknown'}`,
          status: "PAID",
          paidAt: new Date(),
        }
      });
      
      console.log(`Created billing transaction for business ${user.business.id}`);
    } catch (error) {
      console.error("Error handling order paid:", error);
      throw error;
    }
  },
  
  // Handle subscription events
  onSubscriptionCreated: async (payload) => {
    try {
      console.log("Subscription created:", payload);
      const customer = (payload as any).customer;
      const subscription = (payload as any).subscription;
      
      if (!customer?.email) {
        console.error("No customer email found in subscription created payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Determine plan type from subscription
      const planType = mapPolarPlanToPlanType(subscription.product?.name);
      const planDetails = getBillingPlanDetails(planType);
      
      // Calculate period dates
      const currentPeriodStart = new Date(subscription.current_period_start || Date.now());
      const currentPeriodEnd = new Date(subscription.current_period_end || Date.now());
      
      // Create subscription record
      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: "ACTIVE",
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planDetails.minutesIncluded,
          minutesUsed: 0,
          overageRate: planDetails.overageRate,
          polarSubscriptionId: subscription.id,
          polarCustomerId: customer.id,
        }
      });
      
      console.log(`Created subscription for business ${user.business.id} with plan ${planType}`);
    } catch (error) {
      console.error("Error handling subscription created:", error);
      throw error;
    }
  },
  
  onSubscriptionUpdated: async (payload) => {
    try {
      console.log("Subscription updated:", payload);
      const customer = (payload as any).customer;
      const subscription = (payload as any).subscription;
      
      if (!customer?.email) {
        console.error("No customer email found in subscription updated payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Determine plan type from subscription
      const planType = mapPolarPlanToPlanType(subscription.product?.name);
      const planDetails = getBillingPlanDetails(planType);
      
      // Calculate period dates
      const currentPeriodStart = new Date(subscription.current_period_start || Date.now());
      const currentPeriodEnd = new Date(subscription.current_period_end || Date.now());
      
      // Update subscription record
      await db.subscription.updateMany({
        where: { 
          businessId: user.business.id,
          polarSubscriptionId: subscription.id 
        },
        data: {
          planType,
          status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planDetails.minutesIncluded,
          overageRate: planDetails.overageRate,
        }
      });
      
      console.log(`Updated subscription for business ${user.business.id} with plan ${planType}`);
    } catch (error) {
      console.error("Error handling subscription updated:", error);
      throw error;
    }
  },
  
  onSubscriptionCanceled: async (payload) => {
    try {
      console.log("Subscription canceled:", payload);
      const customer = (payload as any).customer;
      const subscription = (payload as any).subscription;
      
      if (!customer?.email) {
        console.error("No customer email found in subscription canceled payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Update subscription status to cancelled
      await db.subscription.updateMany({
        where: { 
          businessId: user.business.id,
          polarSubscriptionId: subscription.id 
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        }
      });
      
      console.log(`Cancelled subscription for business ${user.business.id}`);
    } catch (error) {
      console.error("Error handling subscription canceled:", error);
      throw error;
    }
  },
  
  onSubscriptionActive: async (payload) => {
    try {
      console.log("Subscription activated:", payload);
      const customer = (payload as any).customer;
      const subscription = (payload as any).subscription;
      
      if (!customer?.email) {
        console.error("No customer email found in subscription active payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Update subscription status to active
      await db.subscription.updateMany({
        where: { 
          businessId: user.business.id,
          polarSubscriptionId: subscription.id 
        },
        data: {
          status: "ACTIVE",
          cancelledAt: null, // Clear cancellation date if it was set
        }
      });
      
      console.log(`Activated subscription for business ${user.business.id}`);
    } catch (error) {
      console.error("Error handling subscription active:", error);
      throw error;
    }
  },
  
  // Handle refunds
  onRefundCreated: async (payload) => {
    try {
      console.log("Refund created:", payload);
      const customer = (payload as any).customer;
      const refund = (payload as any).refund;
      
      if (!customer?.email) {
        console.error("No customer email found in refund created payload");
        return;
      }
      
      // Find the user by email
      const user = await db.user.findUnique({
        where: { email: customer.email },
        include: { business: true }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Create billing transaction for the refund
      await db.billingTransaction.create({
        data: {
          businessId: user.business.id,
          type: "REFUND",
          amount: refund.amount || 0,
          description: `Refund for ${refund.reason || 'refund'}`,
          status: "PAID", // Refunds are considered "paid" to the customer
          paidAt: new Date(),
        }
      });
      
      console.log(`Created refund transaction for business ${user.business.id}`);
    } catch (error) {
      console.error("Error handling refund created:", error);
      throw error;
    }
  },
  
  // Catch-all handler for any other events
  onPayload: async (payload) => {
    console.log("Webhook received:", payload.type, payload);
    // Log all webhook events for debugging
  },
});
