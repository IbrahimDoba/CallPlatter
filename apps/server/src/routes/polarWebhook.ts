import { Router, type Request, type Response } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import crypto from "crypto";

const router: Router = Router();

// Local PlanType definition to match our current schema
type PlanType = "STARTER" | "BUSINESS" | "ENTERPRISE";

// Helper function to map Polar plan to our PlanType
function mapPolarPlanToPlanType(polarProductName?: string): PlanType {
  if (!polarProductName) return "STARTER";
  
  const name = polarProductName.toLowerCase();
  if (name.includes("starter")) return "STARTER";
  if (name.includes("business")) return "BUSINESS";
  if (name.includes("enterprise")) return "ENTERPRISE";
  
  return "STARTER";
}

// Helper function to get billing plan details
function getBillingPlanDetails(planType: PlanType) {
  const plans: Record<PlanType, { minutesIncluded: number; overageRate: number; monthlyPrice: number }> = {
    STARTER: { minutesIncluded: 40, overageRate: 0.89, monthlyPrice: 20 },
    BUSINESS: { minutesIncluded: 110, overageRate: 0.61, monthlyPrice: 45 },
    ENTERPRISE: { minutesIncluded: 300, overageRate: 0.44, monthlyPrice: 120 },
  };
  
  return plans[planType];
}

// Verify Polar webhook signature
function verifyPolarSignature(secret: string, signature: string, body: string): boolean {
  if (!secret || !signature) {
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');
    
    // Strip possible "sha256=" prefix from signature
    const signatureHex = signature.replace(/^sha256=/, '');
    
    // Convert to buffers for comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signatureHex, 'hex');
    
    // Lengths must match for timingSafeEqual
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    logger.warn("Error verifying Polar webhook signature:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Middleware to verify webhook signature
// Uses raw body buffer captured by server middleware for accurate signature verification
const verifyWebhook = (req: Request, res: Response, next: () => void) => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.warn("POLAR_WEBHOOK_SECRET not configured, skipping signature verification");
    // In production, this should fail - but we'll allow it for now to not break existing setups
    if (process.env.NODE_ENV === 'production') {
      logger.error("POLAR_WEBHOOK_SECRET is required in production!");
    }
    return next();
  }
  
  // Polar uses 'x-polar-signature' header
  // Try common variations to handle different Polar API versions
  const signature = (req.headers['x-polar-signature'] || 
                     req.headers['polar-signature'] || 
                     req.headers['x-webhook-signature']) as string;
  
  // Get raw body buffer from request (set by server middleware)
  const rawBodyBuffer = (req as any).rawBody as Buffer | undefined;
  
  if (!rawBodyBuffer) {
    logger.error("Raw body buffer not found - signature verification cannot proceed");
    // In production, reject if we can't verify
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ 
        success: false, 
        error: "Internal error: raw body not available" 
      });
    }
    // In development, allow through but warn
    logger.warn("⚠️ Allowing webhook without raw body (development mode)");
    return next();
  }
  
  // Convert buffer to string for signature verification
  const rawBody = rawBodyBuffer.toString('utf8');
  
  if (!signature) {
    logger.warn("Missing Polar webhook signature", {
      headers: Object.keys(req.headers).filter(h => h.toLowerCase().includes('signature') || h.toLowerCase().includes('polar'))
    });
    // Reject in production if signature is missing
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ 
        success: false, 
        error: "Missing signature" 
      });
    }
    logger.warn("⚠️ Allowing webhook without signature (development mode)");
    return next();
  }
  
  if (!verifyPolarSignature(webhookSecret, signature, rawBody)) {
    logger.warn("Invalid Polar webhook signature", {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasSignature: !!signature,
      signatureLength: signature?.length
    });
    return res.status(401).json({ 
      success: false, 
      error: "Invalid signature" 
    });
  }
  
  logger.debug("✅ Polar webhook signature verified successfully");
  next();
};

// Handle customer creation
async function handleCustomerCreated(payload: any) {
  try {
    logger.info("🔒 Polar webhook: Customer created", { 
      timestamp: new Date().toISOString(),
      payloadType: payload.type 
    });
    
    const customer = payload.data;
    
    if (customer?.email) {
      await db.user.updateMany({
        where: { email: customer.email },
        data: { polarCustomerId: customer.id }
      });
      logger.info(`✅ Updated user ${customer.email} with Polar customer ID: ${customer.id}`);
    }
  } catch (error) {
    logger.error("❌ Error handling customer creation:", error);
    throw error;
  }
}

// Handle successful payments
async function handleOrderPaid(payload: any) {
  try {
    logger.info("💰 Order paid webhook received", payload);
    const customer = payload.data?.customer || payload.data;
    const order = payload.data?.order || payload.data;
    
    const customerEmail = customer?.email || order?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in order paid payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true }
    });
    
    if (!user?.business) {
      logger.error(`❌ No business found for user ${customerEmail}`);
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
    
    logger.info(`✅ Created billing transaction for business ${user.business.id}`);
  } catch (error) {
    logger.error("❌ Error handling order paid:", error);
    throw error;
  }
}

// Handle subscription created
async function handleSubscriptionCreated(payload: any) {
  try {
    logger.info("🔔 Subscription created webhook received", payload);
    const customer = payload.data?.customer;
    const subscription = payload.data;
    
    // Try to get email from customer or user object
    const customerEmail = customer?.email || subscription?.user?.email || subscription?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in subscription created payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true }
    });
    
    if (!user) {
      logger.error(`❌ No user found for email ${customerEmail}`);
      return;
    }
    
    if (!user.business) {
      logger.error(`❌ No business found for user ${customerEmail}. User ID: ${user.id}`);
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
    
    // Get the period month/year for billing usage reset
    const periodMonth = currentPeriodStart.getMonth() + 1; // 1-12
    const periodYear = currentPeriodStart.getFullYear();
    
    if (existingSubscription) {
      // For subscription.created, ALWAYS reset usage regardless of period
      // This ensures that when subscription is created/recreated, usage starts fresh
      
      // Update existing subscription - always reset minutesUsed
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType,
          status: subscriptionStatus as "TRIAL" | "ACTIVE" | "CANCELLED",
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planDetails.minutesIncluded,
          overageRate: planDetails.overageRate,
          trialEndsAt: isTrial && subscription.trial_end ? new Date(subscription.trial_end) : null,
          polarSubscriptionId: subscription.id,
          polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
          // Always reset minutes used when subscription is created
          minutesUsed: 0,
        }
      });
      
      // Always reset BillingUsage for the current period's month
      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId: user.business.id,
            month: periodMonth,
            year: periodYear,
          }
        },
        create: {
          businessId: user.business.id,
          month: periodMonth,
          year: periodYear,
          totalMinutes: 0,
          includedMinutes: planDetails.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
        update: {
          totalMinutes: 0,
          includedMinutes: planDetails.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        }
      });
      logger.info(`✅ Reset BillingUsage for business ${user.business.id} for ${periodMonth}/${periodYear}`);
      
      logger.info(`✅ Updated existing subscription for business ${user.business.id} with plan ${planType} (usage reset)`);
    } else {
      // Create new subscription record
      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: subscriptionStatus as "TRIAL" | "ACTIVE" | "CANCELLED",
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planDetails.minutesIncluded,
          minutesUsed: 0,
          overageRate: planDetails.overageRate,
          trialEndsAt: isTrial && subscription.trial_end ? new Date(subscription.trial_end) : null,
          polarSubscriptionId: subscription.id,
          polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
        }
      });
      
      // Create BillingUsage record for the new subscription
      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId: user.business.id,
            month: periodMonth,
            year: periodYear,
          }
        },
        create: {
          businessId: user.business.id,
          month: periodMonth,
          year: periodYear,
          totalMinutes: 0,
          includedMinutes: planDetails.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
        update: {
          totalMinutes: 0,
          includedMinutes: planDetails.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        }
      });
      logger.info(`✅ Created ${isTrial ? 'trial' : 'active'} subscription for business ${user.business.id} with plan ${planType} and reset usage`);
    }
  } catch (error) {
    logger.error("❌ Error handling subscription created:", error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(payload: any) {
  try {
    const customer = payload.data?.customer;
    const subscription = payload.data;
    
    logger.info("🔔 Subscription updated webhook received:", {
      type: payload.type,
      subscriptionId: subscription?.id,
      status: subscription?.status,
      customerEmail: customer?.email || subscription?.user?.email
    });
    
    // Try to get email from customer or user object
    const customerEmail = customer?.email || subscription?.user?.email || subscription?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in subscription updated payload", {
        hasCustomer: !!customer,
        hasUser: !!subscription?.user,
        subscriptionKeys: Object.keys(subscription || {})
      });
      return;
    }
    
    if (!subscription?.id) {
      logger.error("❌ No subscription ID found in payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: { include: { phoneNumberRecord: true } } }
    });
    
    if (!user) {
      logger.error(`❌ No user found for email ${customerEmail}`);
      return;
    }
    
    if (!user.business) {
      logger.error(`❌ No business found for user ${customerEmail} (User ID: ${user.id})`);
      return;
    }
    
    // Check if subscription is revoked (immediate loss of access)
    if (subscription.status === "canceled" || subscription.status === "revoked") {
      logger.warn(`⚠️ Subscription ${subscription.status} for business ${user.business.id}`);
      
      // Find subscription first
      const existingSubscription = await db.subscription.findFirst({
        where: {
          OR: [
            { polarSubscriptionId: subscription.id },
            { businessId: user.business.id }
          ]
        }
      });
      
      if (existingSubscription) {
        // Update existing subscription to cancelled
        await db.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            polarSubscriptionId: subscription.id,
          }
        });
        logger.info(`✅ Cancelled subscription ${existingSubscription.id} for business ${user.business.id}`);
      } else {
        // Create cancelled subscription record
        const planType = mapPolarPlanToPlanType(subscription.product?.name);
        const planDetails = getBillingPlanDetails(planType);
        
        await db.subscription.create({
          data: {
            businessId: user.business.id,
            planType,
            status: "CANCELLED",
            currentPeriodStart: new Date(subscription.current_period_start || Date.now()),
            currentPeriodEnd: new Date(subscription.current_period_end || Date.now()),
            minutesIncluded: planDetails.minutesIncluded,
            minutesUsed: 0,
            overageRate: planDetails.overageRate,
            polarSubscriptionId: subscription.id,
            polarCustomerId: customer.id,
            cancelledAt: new Date(),
          }
        });
        logger.info(`✅ Created cancelled subscription record for business ${user.business.id}`);
      }
      
      // Release phone number if business has one
      if (user.business.phoneNumberRecord?.twilioSid) {
        try {
          const { twilioService } = await import("../services/twilioService.js");
          await twilioService.releaseBusinessPhoneNumber(user.business.id);
          logger.info(`✅ Released phone number for business ${user.business.id} due to ${subscription.status} subscription`);
        } catch (phoneError) {
          logger.error("❌ Error releasing phone number:", phoneError);
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
    
    // Determine subscription status
    const isTrial = subscription.status === "trialing" || (subscription.trial_end && new Date(subscription.trial_end) > new Date());
    const subscriptionStatus = isTrial ? "TRIAL" : subscription.status === "active" ? "ACTIVE" : "CANCELLED";
    
    // Check if subscription already exists (by polarSubscriptionId or businessId)
    const existingSubscription = await db.subscription.findFirst({
      where: {
        OR: [
          { polarSubscriptionId: subscription.id },
          { businessId: user.business.id }
        ]
      }
    });
    
    const subscriptionData = {
      businessId: user.business.id,
      planType,
      status: subscriptionStatus as "TRIAL" | "ACTIVE" | "CANCELLED",
      currentPeriodStart,
      currentPeriodEnd,
      minutesIncluded: planDetails.minutesIncluded,
      overageRate: planDetails.overageRate,
      trialEndsAt: isTrial && subscription.trial_end ? new Date(subscription.trial_end) : null,
      polarSubscriptionId: subscription.id,
      polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
      cancelledAt: subscription.status === "canceled" || subscription.status === "revoked" ? new Date() : null,
    };
    
    if (existingSubscription) {
      // Check if this is a new billing period (period start date changed)
      const isNewPeriod = existingSubscription.currentPeriodStart.getTime() !== currentPeriodStart.getTime();
      
      // Update existing subscription with minutesUsed reset if new period
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          ...subscriptionData,
          // Reset minutes used if it's a new billing period
          minutesUsed: isNewPeriod ? 0 : existingSubscription.minutesUsed,
        }
      });
      
      // If new period, reset BillingUsage for the new period's month
      if (isNewPeriod) {
        const newPeriodMonth = currentPeriodStart.getMonth() + 1; // 1-12
        const newPeriodYear = currentPeriodStart.getFullYear();
        
        // Reset or create BillingUsage record for the new period
        await db.billingUsage.upsert({
          where: {
            businessId_month_year: {
              businessId: user.business.id,
              month: newPeriodMonth,
              year: newPeriodYear,
            }
          },
          create: {
            businessId: user.business.id,
            month: newPeriodMonth,
            year: newPeriodYear,
            totalMinutes: 0,
            includedMinutes: planDetails.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
          update: {
            totalMinutes: 0,
            includedMinutes: planDetails.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          }
        });
        logger.info(`✅ Reset BillingUsage for business ${user.business.id} for ${newPeriodMonth}/${newPeriodYear}`);
      }
      
      logger.info(`✅ Updated subscription for business ${user.business.id} with plan ${planType}, status: ${subscriptionStatus}${isNewPeriod ? ' (new period - usage reset)' : ''}`);
    } else {
      // Create new subscription if it doesn't exist
      await db.subscription.create({
        data: {
          ...subscriptionData,
          minutesUsed: 0,
        }
      });
      logger.info(`✅ Created new subscription for business ${user.business.id} with plan ${planType}, status: ${subscriptionStatus}`);
    }
  } catch (error) {
    logger.error("❌ Error handling subscription updated:", error);
    throw error;
  }
}

// Handle subscription canceled
async function handleSubscriptionCanceled(payload: any) {
  try {
    logger.info("🔔 Subscription canceled webhook received", payload);
    const customer = payload.data?.customer;
    const subscription = payload.data;
    
    // Try to get email from customer or user object
    const customerEmail = customer?.email || subscription?.user?.email || subscription?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in subscription canceled payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: { include: { phoneNumberRecord: true } } }
    });
    
    if (!user?.business) {
      logger.error(`❌ No business found for user ${customerEmail}`);
      return;
    }
    
    // Find subscription first (upsert pattern)
    const existingSubscription = await db.subscription.findFirst({
      where: {
        OR: [
          { polarSubscriptionId: subscription.id },
          { businessId: user.business.id }
        ]
      }
    });
    
    if (existingSubscription) {
      // Update existing subscription to cancelled
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          polarSubscriptionId: subscription.id,
        }
      });
      logger.info(`✅ Cancelled subscription ${existingSubscription.id} for business ${user.business.id}`);
    } else {
      // Create cancelled subscription record if it doesn't exist
      const planType = mapPolarPlanToPlanType(subscription.product?.name);
      const planDetails = getBillingPlanDetails(planType);
      
      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: "CANCELLED",
          currentPeriodStart: new Date(subscription.current_period_start || Date.now()),
          currentPeriodEnd: new Date(subscription.current_period_end || Date.now()),
          minutesIncluded: planDetails.minutesIncluded,
          minutesUsed: 0,
          overageRate: planDetails.overageRate,
          polarSubscriptionId: subscription.id,
          polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
          cancelledAt: new Date(),
        }
      });
      logger.info(`✅ Created cancelled subscription record for business ${user.business.id}`);
    }
    
    // Release phone number if business has one
    if (user.business.phoneNumberRecord?.twilioSid) {
      try {
        const { twilioService } = await import("../services/twilioService.js");
        await twilioService.releaseBusinessPhoneNumber(user.business.id);
        logger.info(`✅ Released phone number for business ${user.business.id}`);
      } catch (phoneError) {
        logger.error("❌ Error releasing phone number:", phoneError);
      }
    }
  } catch (error) {
    logger.error("❌ Error handling subscription canceled:", error);
    throw error;
  }
}

// Handle subscription active
async function handleSubscriptionActive(payload: any) {
  try {
    logger.info("🔔 Subscription activated webhook received", payload);
    const customer = payload.data?.customer;
    const subscription = payload.data;
    
    // Try to get email from customer or user object
    const customerEmail = customer?.email || subscription?.user?.email || subscription?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in subscription active payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true }
    });
    
    if (!user?.business) {
      logger.error(`❌ No business found for user ${customerEmail}`);
      return;
    }
    
    // Check if subscription exists
    const existingSubscription = await db.subscription.findFirst({
      where: {
        OR: [
          { polarSubscriptionId: subscription.id },
          { businessId: user.business.id }
        ]
      }
    });
    
    const planType = mapPolarPlanToPlanType(subscription.product?.name);
    const planDetails = getBillingPlanDetails(planType);
    const currentPeriodStart = new Date(subscription.current_period_start || Date.now());
    const currentPeriodEnd = new Date(subscription.current_period_end || Date.now());
    
    if (existingSubscription) {
      // Check if this is a new billing period (period start date changed)
      const isNewPeriod = existingSubscription.currentPeriodStart.getTime() !== currentPeriodStart.getTime();
      
      // Update existing subscription
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "ACTIVE",
          planType,
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planDetails.minutesIncluded,
          overageRate: planDetails.overageRate,
          polarSubscriptionId: subscription.id,
          polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
          cancelledAt: null,
          trialEndsAt: null,
          // Reset minutes used if it's a new billing period
          minutesUsed: isNewPeriod ? 0 : existingSubscription.minutesUsed,
        }
      });
      
      // If new period, reset BillingUsage for the new period's month
      if (isNewPeriod) {
        const newPeriodMonth = currentPeriodStart.getMonth() + 1; // 1-12
        const newPeriodYear = currentPeriodStart.getFullYear();
        
        // Reset or create BillingUsage record for the new period
        await db.billingUsage.upsert({
          where: {
            businessId_month_year: {
              businessId: user.business.id,
              month: newPeriodMonth,
              year: newPeriodYear,
            }
          },
          create: {
            businessId: user.business.id,
            month: newPeriodMonth,
            year: newPeriodYear,
            totalMinutes: 0,
            includedMinutes: planDetails.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
          update: {
            totalMinutes: 0,
            includedMinutes: planDetails.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          }
        });
        logger.info(`✅ Reset BillingUsage for business ${user.business.id} for ${newPeriodMonth}/${newPeriodYear}`);
      }
      
      logger.info(`✅ Activated existing subscription for business ${user.business.id} with plan ${planType}${isNewPeriod ? ' (new period - usage reset)' : ''}`);
    } else {
      // Create new subscription if it doesn't exist
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
          polarCustomerId: customer?.id || subscription?.customer_id || subscription?.user_id,
        }
      });
      logger.info(`✅ Created and activated new subscription for business ${user.business.id} with plan ${planType}`);
    }
  } catch (error) {
    logger.error("❌ Error handling subscription active:", error);
    throw error;
  }
}

// Handle subscription revoked
async function handleSubscriptionRevoked(payload: any) {
  // Treat revoked same as canceled
  await handleSubscriptionCanceled(payload);
}

// Handle refunds
async function handleRefundCreated(payload: any) {
  try {
    logger.info("💰 Refund created webhook received", payload);
    const customer = payload.data?.customer;
    const refund = payload.data?.refund || payload.data;
    
    const customerEmail = customer?.email || refund?.customer?.email;
    
    if (!customerEmail) {
      logger.error("❌ No customer email found in refund created payload");
      return;
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true }
    });
    
    if (!user?.business) {
      logger.error(`❌ No business found for user ${customerEmail}`);
      return;
    }
    
    // Create billing transaction for the refund
    await db.billingTransaction.create({
      data: {
        businessId: user.business.id,
        type: "REFUND",
        amount: refund?.amount || 0,
        description: `Refund for ${refund?.reason || 'refund'}`,
        status: "PAID",
        paidAt: new Date(),
      }
    });
    
    logger.info(`✅ Created refund transaction for business ${user.business.id}`);
  } catch (error) {
    logger.error("❌ Error handling refund created:", error);
    throw error;
  }
}

// Main webhook endpoint
router.post("/", verifyWebhook, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const eventType = payload.type;

    logger.info("📥 Polar webhook received", {
      type: eventType,
      subscriptionId: payload.subscription?.id,
      customerEmail: payload.customer?.email
    });

    // Route to appropriate handler based on event type
    switch (eventType) {
      case "customer.created":
        await handleCustomerCreated(payload);
        break;
      
      case "order.paid":
        await handleOrderPaid(payload);
        break;
      
      case "subscription.created":
        await handleSubscriptionCreated(payload);
        break;
      
      case "subscription.updated":
        await handleSubscriptionUpdated(payload);
        break;
      
      case "subscription.canceled":
        await handleSubscriptionCanceled(payload);
        break;
      
      case "subscription.active":
        await handleSubscriptionActive(payload);
        break;
      
      case "subscription.revoked":
        await handleSubscriptionRevoked(payload);
        break;
      
      case "refund.created":
        await handleRefundCreated(payload);
        break;
      
      default:
        logger.info("ℹ️ Unhandled Polar webhook event type:", eventType, {
          hasData: !!payload.data,
          dataKeys: payload.data ? Object.keys(payload.data) : []
        });
    }

    res.status(200).json({ 
      success: true, 
      message: "Webhook processed successfully" 
    });
  } catch (error) {
    logger.error("❌ Error processing Polar webhook:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error processing webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;

