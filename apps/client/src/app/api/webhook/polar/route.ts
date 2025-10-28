import { Webhooks } from "@polar-sh/nextjs";
import { db } from "@repo/db";

// Local PlanType definition to match our current schema
type PlanType = "STARTER" | "BUSINESS" | "ENTERPRISE";

// Note: Using 'any' type for Polar webhook payloads as the exact types are not available
// The payload structure may vary and we need to access properties dynamically

// Helper function to map Polar plan to our PlanType
function mapPolarPlanToPlanType(polarProductName?: string): PlanType {
  if (!polarProductName) return "STARTER"; // Default to STARTER instead of FREE
  
  const name = polarProductName.toLowerCase();
  if (name.includes("starter")) return "STARTER";
  if (name.includes("business")) return "BUSINESS";
  if (name.includes("enterprise")) return "ENTERPRISE";
  
  return "STARTER"; // Default to STARTER instead of FREE
}

// Helper function to get billing plan details - using accurate USD values from pricing config
function getBillingPlanDetails(planType: PlanType) {
  const plans: Record<PlanType, { minutesIncluded: number; overageRate: number; monthlyPrice: number }> = {
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
      
      if (!user) {
        console.error(`No user found for email ${customer.email}`);
        return;
      }
      
      if (!user.business) {
        console.error(`No business found for user ${customer.email}. User ID: ${user.id}`);
        // If user exists but no business, we might need to wait for onboarding to complete
        // Store the subscription info for later processing
        console.log("User exists but no business yet. This might be a timing issue with onboarding.");
        return;
      }
      
      // Determine plan type from subscription
      const planType = mapPolarPlanToPlanType(subscription.product?.name);
      const planDetails = getBillingPlanDetails(planType);
      
      // Calculate period dates
      const currentPeriodStart = new Date(subscription.current_period_start || Date.now());
      const currentPeriodEnd = new Date(subscription.current_period_end || Date.now());
      
      // Check if this is a trial subscription
      const isTrial = subscription.status === 'trialing' || subscription.trial_end;
      const subscriptionStatus = isTrial ? "TRIAL" : "ACTIVE";
      
      // Check if subscription already exists (upsert to handle race conditions)
      const existingSubscription = await db.subscription.findUnique({
        where: { businessId: user.business.id }
      });
      
      if (existingSubscription) {
        // Update existing subscription
        await db.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType,
            status: subscriptionStatus,
            currentPeriodStart,
            currentPeriodEnd,
            minutesIncluded: planDetails.minutesIncluded,
            overageRate: planDetails.overageRate,
            trialEndsAt: isTrial && subscription.trial_end ? new Date(subscription.trial_end) : null,
            polarSubscriptionId: subscription.id,
            polarCustomerId: customer.id,
          }
        });
        console.log(`Updated existing subscription for business ${user.business.id} with plan ${planType}`);
      } else {
        // Create new subscription record
        await db.subscription.create({
          data: {
            businessId: user.business.id,
            planType,
            status: subscriptionStatus,
            currentPeriodStart,
            currentPeriodEnd,
            minutesIncluded: planDetails.minutesIncluded,
            minutesUsed: 0,
            overageRate: planDetails.overageRate,
            trialEndsAt: isTrial && subscription.trial_end ? new Date(subscription.trial_end) : null,
            polarSubscriptionId: subscription.id,
            polarCustomerId: customer.id,
          }
        });
        console.log(`Created ${isTrial ? 'trial' : 'active'} subscription for business ${user.business.id} with plan ${planType}`);
      }
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
        include: { business: { include: { phoneNumberRecord: true } } }
      });
      
      if (!user?.business) {
        console.error(`No business found for user ${customer.email}`);
        return;
      }
      
      // Check if subscription is revoked (immediate loss of access)
      if (subscription.status === "canceled" || subscription.status === "revoked") {
        console.log(`Subscription ${subscription.status} for business ${user.business.id}`);
        
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
        
        // Release phone number if business has one
        if (user.business.phoneNumberRecord?.twilioSid) {
          try {
            const { twilioService } = await import("../../../../../../server/src/services/twilioService");
            await twilioService.releaseBusinessPhoneNumber(user.business.id);
            console.log(`Released phone number for business ${user.business.id} due to ${subscription.status} subscription`);
          } catch (phoneError) {
            console.error("Error releasing phone number:", phoneError);
            // Don't throw - we still want to cancel the subscription even if phone release fails
          }
        }
        
        return;
      }
      
      // Handle normal subscription updates (active, trial, etc.)
      const planType = mapPolarPlanToPlanType(subscription.product?.name);
      const planDetails = getBillingPlanDetails(planType);
      
      // Calculate period dates
      const currentPeriodStart = new Date(subscription.current_period_start || Date.now());
      const currentPeriodEnd = new Date(subscription.current_period_end || Date.now());
      
      // Check if this is a trial conversion (trial ending and becoming active)
      const isTrialConversion = subscription.status === "active" && subscription.trial_end;
      
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
          trialEndsAt: isTrialConversion ? null : undefined, // Clear trial end date on conversion
        }
      });
      
      console.log(`${isTrialConversion ? 'Converted trial to active' : 'Updated'} subscription for business ${user.business.id} with plan ${planType}`);
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
        include: { business: { include: { phoneNumberRecord: true } } }
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
      
      // Release phone number if business has one
      if (user.business.phoneNumberRecord?.twilioSid) {
        try {
          const { twilioService } = await import("../../../../../../server/src/services/twilioService");
          await twilioService.releaseBusinessPhoneNumber(user.business.id);
          console.log(`Released phone number for business ${user.business.id}`);
        } catch (phoneError) {
          console.error("Error releasing phone number:", phoneError);
          // Don't throw - we still want to cancel the subscription even if phone release fails
        }
      }
      
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
