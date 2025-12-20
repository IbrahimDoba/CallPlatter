import { Router, type Request, type Response } from "express";
import { db } from "@repo/db";
import { logger } from "../utils/logger";
import crypto from "crypto";
import {
  mapPolarProductToPlanType,
  getPlanConfig,
  type PlanType,
} from "../config/billingPlans";

const router: Router = Router();

/**
 * Decodes the Polar webhook secret.
 * Polar/Standard Webhooks secrets are base64 encoded and may start with 'whsec_'
 */
function decodeWebhookSecret(secret: string): Buffer {
  const actualSecret = secret.startsWith("whsec_")
    ? secret.substring(6)
    : secret;
  return Buffer.from(actualSecret, "base64");
}

// Verify Standard Webhook signature
function verifyStandardWebhookSignature(
  secret: Buffer,
  signatureHeader: string,
  msgId: string,
  timestamp: string,
  body: string
): boolean {
  if (!secret || !signatureHeader || !msgId || !timestamp) {
    logger.warn("Missing required parameters for signature verification", {
      hasSecret: !!secret,
      hasSignatureHeader: !!signatureHeader,
      hasMsgId: !!msgId,
      hasTimestamp: !!timestamp,
    });
    return false;
  }

  try {
    // Construct the signed content according to Standard Webhooks spec
    const signedContent = `${msgId}.${timestamp}.${body}`;

    // Calculate expected signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedContent, "utf8")
      .digest("base64");

    logger.debug("🔍 Signature Verification Debug", {
      msgId,
      timestamp,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100),
      signedContentLength: signedContent.length,
      signedContentPreview: signedContent.substring(0, 100) + "...",
      secretLength: secret.length,
      secretPreview: secret.toString("base64").substring(0, 20) + "...",
      expectedSignature,
      receivedSignatureHeader: signatureHeader,
    });

    // Standard Webhooks signature format: "v1,signature" or "v1,sig1 v1,sig2"
    // Split by space to handle multiple signatures
    const signatureParts = signatureHeader.split(" ");

    for (const part of signatureParts) {
      const [scheme, signature] = part.split(",");

      if (scheme !== "v1") {
        logger.debug("Skipping non-v1 signature scheme", { scheme });
        continue;
      }

      if (!signature) {
        logger.debug("No signature value found for scheme", { scheme });
        continue;
      }

      // Direct string comparison (both are base64)
      if (expectedSignature === signature) {
        logger.info("✅ Signature verified (direct match)");
        return true;
      }

      // Also try timing-safe comparison of the decoded bytes
      try {
        const expectedBuffer = Buffer.from(expectedSignature, "base64");
        const signatureBuffer = Buffer.from(signature, "base64");

        if (expectedBuffer.length !== signatureBuffer.length) {
          logger.debug("Buffer length mismatch", {
            expectedLength: expectedBuffer.length,
            receivedLength: signatureBuffer.length,
          });
          continue;
        }

        if (crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
          logger.info("✅ Signature verified (timing-safe comparison)");
          return true;
        }
      } catch (bufferError) {
        logger.warn("Error in buffer comparison", {
          error: bufferError,
          signature,
        });
      }

      logger.debug("Signature mismatch", {
        scheme,
        expected: expectedSignature,
        received: signature,
      });
    }

    logger.warn("❌ No matching signature found", {
      expectedSignature,
      receivedHeader: signatureHeader,
      signaturesChecked: signatureParts.length,
    });

    return false;
  } catch (error) {
    logger.error("Error verifying Standard Webhook signature", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

// Legacy verification (for x-polar-signature)
function verifyLegacyPolarSignature(
  secret: Buffer,
  signature: string,
  body: string
): boolean {
  if (!secret || !signature) return false;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("hex");

    const signatureHex = signature.replace(/^sha256=/, "");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const signatureBuffer = Buffer.from(signatureHex, "hex");

    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    return false;
  }
}

// Middleware to verify webhook signature
const verifyWebhook = (req: Request, res: Response, next: () => void) => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    logger.warn(
      "POLAR_WEBHOOK_SECRET not configured, skipping signature verification"
    );
    if (process.env.NODE_ENV === "production") {
      logger.error("POLAR_WEBHOOK_SECRET is required in production!");
    }
    return next();
  }

  // Get keys
  const rawBodyBuffer = (req as any).rawBody as Buffer | undefined;
  if (!rawBodyBuffer) {
    logger.error("Raw body buffer not found");
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({
        success: false,
        error: "Internal error: raw body not available",
      });
    }
    return next();
  }

  logger.info("Verifying Polar Webhook Signature", {
    hasSecret: !!webhookSecret,
    secretLength: webhookSecret.length,
    secretStartsWith: webhookSecret.substring(0, 7),
    rawBodyLength: rawBodyBuffer.length,
    headers: {
      "webhook-signature": req.headers["webhook-signature"],
      "webhook-id": req.headers["webhook-id"],
      "webhook-timestamp": req.headers["webhook-timestamp"],
      "content-type": req.headers["content-type"],
    },
  });

  const rawBody = rawBodyBuffer.toString("utf8");

  // Check for Standard Webhooks headers
  const whSignature = req.headers["webhook-signature"] as string;
  const whId = req.headers["webhook-id"] as string;
  const whTimestamp = req.headers["webhook-timestamp"] as string;

  if (whSignature && whId && whTimestamp) {
    // Try multiple secret decoding strategies
    const secretStrategies = [
      {
        name: "Standard (base64 with optional whsec_ prefix)",
        secret: decodeWebhookSecret(webhookSecret),
      },
      {
        name: "Plain UTF-8 (no decoding)",
        secret: Buffer.from(webhookSecret, "utf8"),
      },
      {
        name: "Plain ASCII (no decoding)",
        secret: Buffer.from(webhookSecret, "ascii"),
      },
    ];

    // If it starts with whsec_, also try without the prefix as plain text
    if (webhookSecret.startsWith("whsec_")) {
      secretStrategies.push({
        name: "Without whsec_ prefix (plain)",
        secret: Buffer.from(webhookSecret.substring(6), "utf8"),
      });
    }

    let verified = false;
    for (const strategy of secretStrategies) {
      logger.debug(`Trying secret strategy: ${strategy.name}`, {
        secretLength: strategy.secret.length,
      });

      const isValid = verifyStandardWebhookSignature(
        strategy.secret,
        whSignature,
        whId,
        whTimestamp,
        rawBody
      );

      if (isValid) {
        logger.info(`✅ Signature verified using strategy: ${strategy.name}`);
        verified = true;
        break;
      }
    }

    if (verified) {
      // Check timestamp (prevent replay attacks > 5 mins)
      const ts = parseInt(whTimestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (!isNaN(ts) && Math.abs(now - ts) > 300) {
        logger.warn("Webhook timestamp too old or future", { ts, now });
        return res
          .status(401)
          .json({ success: false, error: "Invalid timestamp" });
      }

      logger.info("✅ Standard Webhook signature verified and timestamp valid");
      return next();
    } else {
      logger.warn("Invalid Standard Webhook signature (all strategies failed)", {
        whId,
        whTimestamp,
        signatureHeader: whSignature,
        strategiesTried: secretStrategies.length,
      });
      // Don't return yet, try legacy just in case (though unlikely if these headers exist)
    }
  }

  // Fallback to legacy
  const legacySignature = (req.headers["x-polar-signature"] ||
    req.headers["polar-signature"] ||
    req.headers["x-webhook-signature"]) as string;

  if (legacySignature) {
    // Legacy secrets might also be base64 or plain, try both or just plain if it's old
    // Polar docs say secrets are base64, so let's try decoded first
    const decodedSecret = decodeWebhookSecret(webhookSecret);

    if (verifyLegacyPolarSignature(decodedSecret, legacySignature, rawBody)) {
      logger.debug("✅ Legacy Polar signature verified (decoded secret)");
      return next();
    }

    // Attempt with plain secret just in case
    if (
      verifyLegacyPolarSignature(
        Buffer.from(webhookSecret),
        legacySignature,
        rawBody
      )
    ) {
      logger.debug("✅ Legacy Polar signature verified (plain secret)");
      return next();
    }
  }

  logger.warn("Missing or invalid signature", {
    hasWhSignature: !!whSignature,
    hasLegacySignature: !!legacySignature,
    headers: Object.keys(req.headers).filter(
      (h) =>
        h.toLowerCase().includes("signature") ||
        h.toLowerCase().includes("webhook")
    ),
  });

  if (process.env.NODE_ENV === "production") {
    return res
      .status(401)
      .json({ success: false, error: "Missing or invalid signature" });
  }

  logger.warn("⚠️ Allowing webhook without valid signature (development mode)");
  next();
};

// Handle customer creation
async function handleCustomerCreated(payload: any) {
  try {
    logger.info("🔒 Polar webhook: Customer created", {
      timestamp: new Date().toISOString(),
      payloadType: payload.type,
    });

    const customer = payload.data;

    if (customer?.email) {
      await db.user.updateMany({
        where: { email: customer.email },
        data: { polarCustomerId: customer.id },
      });
      logger.info(
        `✅ Updated user ${customer.email} with Polar customer ID: ${customer.id}`
      );
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
      include: { business: true },
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
        description: `Payment for order ${order?.id || "unknown"}`,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    logger.info(
      `✅ Created billing transaction for business ${user.business.id}`
    );
  } catch (error) {
    logger.error("❌ Error handling order paid:", error);
    throw error;
  }
}

// Handle subscription created
async function handleSubscriptionCreated(payload: any) {
  try {
    logger.info("🔔 Subscription created webhook received", {
      subscriptionId: payload.data?.id,
      status: payload.data?.status,
      currentPeriodStart: payload.data?.current_period_start,
      currentPeriodEnd: payload.data?.current_period_end,
      trialEndsAt: payload.data?.ends_at, // Polar uses ends_at for trial end during trialing status
      productName: payload.data?.product?.name,
    });

    const customer = payload.data?.customer;
    const subscription = payload.data;

    // Try to get email from customer or user object
    const customerEmail =
      customer?.email ||
      subscription?.user?.email ||
      subscription?.customer?.email;

    if (!customerEmail) {
      logger.error(
        "❌ No customer email found in subscription created payload"
      );
      return;
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true },
    });

    if (!user) {
      logger.error(`❌ No user found for email ${customerEmail}`);
      return;
    }

    if (!user.business) {
      logger.error(
        `❌ No business found for user ${customerEmail}. User ID: ${user.id}`
      );
      return;
    }

    // POLAR IS THE SOURCE OF TRUTH - use actual values from Polar
    const planType = mapPolarProductToPlanType(subscription.product?.name);
    const planConfig = getPlanConfig(planType);

    // Use ACTUAL dates from Polar - this is critical!
    const currentPeriodStart = subscription.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date();
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : new Date();

    // Determine subscription status from Polar's actual status
    // Polar uses: 'trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'
    let subscriptionStatus:
      | "TRIAL"
      | "ACTIVE"
      | "CANCELLED"
      | "PAST_DUE"
      | "SUSPENDED" = "ACTIVE";

    if (subscription.status === "trialing") {
      subscriptionStatus = "TRIAL";
    } else if (subscription.status === "active") {
      subscriptionStatus = "ACTIVE";
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired"
    ) {
      subscriptionStatus = "CANCELLED";
    } else if (
      subscription.status === "past_due" ||
      subscription.status === "unpaid"
    ) {
      subscriptionStatus = "PAST_DUE";
    }

    // Get trial end date from Polar - they may use 'ends_at' during trial or 'trial_end'
    const trialEndsAt =
      subscription.status === "trialing" && subscription.ends_at
        ? new Date(subscription.ends_at)
        : subscription.trial_end
          ? new Date(subscription.trial_end)
          : null;

    logger.info("📊 Subscription details from Polar:", {
      planType,
      status: subscriptionStatus,
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      trialEndsAt: trialEndsAt?.toISOString() || null,
      minutesIncluded: planConfig.minutesIncluded,
      overageRateUSD: planConfig.overageRateUSD,
    });

    // Check if subscription already exists (upsert to handle race conditions)
    const existingSubscription = await db.subscription.findUnique({
      where: { businessId: user.business.id },
    });

    // Get the period month/year for billing usage reset
    const periodMonth = currentPeriodStart.getMonth() + 1; // 1-12
    const periodYear = currentPeriodStart.getFullYear();

    if (existingSubscription) {
      // Update existing subscription with Polar's actual data
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType,
          status: subscriptionStatus,
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planConfig.minutesIncluded,
          overageRate: planConfig.overageRateUSD, // Store USD rate
          trialEndsAt,
          trialActivated: subscriptionStatus === "TRIAL",
          trialStartedAt:
            subscriptionStatus === "TRIAL"
              ? currentPeriodStart
              : existingSubscription.trialStartedAt,
          trialPlanType:
            subscriptionStatus === "TRIAL"
              ? planType
              : existingSubscription.trialPlanType,
          polarSubscriptionId: subscription.id,
          polarCustomerId:
            customer?.id || subscription?.customer_id || subscription?.user_id,
          // Reset minutes used for new subscription
          minutesUsed: 0,
        },
      });

      // Reset BillingUsage for the current period
      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId: user.business.id,
            month: periodMonth,
            year: periodYear,
          },
        },
        create: {
          businessId: user.business.id,
          month: periodMonth,
          year: periodYear,
          totalMinutes: 0,
          includedMinutes: planConfig.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
        update: {
          totalMinutes: 0,
          includedMinutes: planConfig.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
      });

      logger.info(
        `✅ Updated existing subscription for business ${user.business.id}`,
        {
          planType,
          status: subscriptionStatus,
          periodEnd: currentPeriodEnd.toISOString(),
          trialEndsAt: trialEndsAt?.toISOString() || null,
        }
      );
    } else {
      // Create new subscription record with Polar's actual data
      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: subscriptionStatus,
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planConfig.minutesIncluded,
          minutesUsed: 0,
          overageRate: planConfig.overageRateUSD, // Store USD rate
          trialEndsAt,
          trialActivated: subscriptionStatus === "TRIAL",
          trialStartedAt:
            subscriptionStatus === "TRIAL" ? currentPeriodStart : null,
          trialPlanType: subscriptionStatus === "TRIAL" ? planType : null,
          polarSubscriptionId: subscription.id,
          polarCustomerId:
            customer?.id || subscription?.customer_id || subscription?.user_id,
        },
      });

      // Create BillingUsage record
      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId: user.business.id,
            month: periodMonth,
            year: periodYear,
          },
        },
        create: {
          businessId: user.business.id,
          month: periodMonth,
          year: periodYear,
          totalMinutes: 0,
          includedMinutes: planConfig.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
        update: {
          totalMinutes: 0,
          includedMinutes: planConfig.minutesIncluded,
          overageMinutes: 0,
          overageCost: 0,
          totalCost: 0,
        },
      });

      logger.info(
        `✅ Created new subscription for business ${user.business.id}`,
        {
          planType,
          status: subscriptionStatus,
          periodEnd: currentPeriodEnd.toISOString(),
          trialEndsAt: trialEndsAt?.toISOString() || null,
        }
      );
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
      currentPeriodStart: subscription?.current_period_start,
      currentPeriodEnd: subscription?.current_period_end,
      customerEmail: customer?.email || subscription?.user?.email,
    });

    // Try to get email from customer or user object
    const customerEmail =
      customer?.email ||
      subscription?.user?.email ||
      subscription?.customer?.email;

    if (!customerEmail) {
      logger.error(
        "❌ No customer email found in subscription updated payload",
        {
          hasCustomer: !!customer,
          hasUser: !!subscription?.user,
          subscriptionKeys: Object.keys(subscription || {}),
        }
      );
      return;
    }

    if (!subscription?.id) {
      logger.error("❌ No subscription ID found in payload");
      return;
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: { include: { phoneNumberRecord: true } } },
    });

    if (!user) {
      logger.error(`❌ No user found for email ${customerEmail}`);
      return;
    }

    if (!user.business) {
      logger.error(
        `❌ No business found for user ${customerEmail} (User ID: ${user.id})`
      );
      return;
    }

    // Check if subscription is revoked (immediate loss of access)
    if (
      subscription.status === "canceled" ||
      subscription.status === "revoked"
    ) {
      logger.warn(
        `⚠️ Subscription ${subscription.status} for business ${user.business.id}`
      );

      // Find subscription first
      const existingSubscription = await db.subscription.findFirst({
        where: {
          OR: [
            { polarSubscriptionId: subscription.id },
            { businessId: user.business.id },
          ],
        },
      });

      if (existingSubscription) {
        // Update existing subscription to cancelled
        await db.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            polarSubscriptionId: subscription.id,
          },
        });
        logger.info(
          `✅ Cancelled subscription ${existingSubscription.id} for business ${user.business.id}`
        );
      } else {
        // Create cancelled subscription record
        const planType = mapPolarProductToPlanType(subscription.product?.name);
        const planConfig = getPlanConfig(planType);

        await db.subscription.create({
          data: {
            businessId: user.business.id,
            planType,
            status: "CANCELLED",
            currentPeriodStart: new Date(
              subscription.current_period_start || Date.now()
            ),
            currentPeriodEnd: new Date(
              subscription.current_period_end || Date.now()
            ),
            minutesIncluded: planConfig.minutesIncluded,
            minutesUsed: 0,
            overageRate: planConfig.overageRateUSD,
            polarSubscriptionId: subscription.id,
            polarCustomerId: customer.id,
            cancelledAt: new Date(),
          },
        });
        logger.info(
          `✅ Created cancelled subscription record for business ${user.business.id}`
        );
      }

      // Release phone number if business has one
      if (user.business.phoneNumberRecord?.twilioSid) {
        try {
          const { twilioService } = await import(
            "../services/twilioService.js"
          );
          await twilioService.releaseBusinessPhoneNumber(user.business.id);
          logger.info(
            `✅ Released phone number for business ${user.business.id} due to ${subscription.status} subscription`
          );
        } catch (phoneError) {
          logger.error("❌ Error releasing phone number:", phoneError);
        }
      }

      return;
    }

    // POLAR IS THE SOURCE OF TRUTH - use actual values from Polar
    const planType = mapPolarProductToPlanType(subscription.product?.name);
    const planConfig = getPlanConfig(planType);

    // Use ACTUAL dates from Polar
    const currentPeriodStart = subscription.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date();
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : new Date();

    // Determine subscription status from Polar's actual status
    let subscriptionStatus:
      | "TRIAL"
      | "ACTIVE"
      | "CANCELLED"
      | "PAST_DUE"
      | "SUSPENDED" = "ACTIVE";

    if (subscription.status === "trialing") {
      subscriptionStatus = "TRIAL";
    } else if (subscription.status === "active") {
      subscriptionStatus = "ACTIVE";
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired"
    ) {
      subscriptionStatus = "CANCELLED";
    } else if (
      subscription.status === "past_due" ||
      subscription.status === "unpaid"
    ) {
      subscriptionStatus = "PAST_DUE";
    }

    // Get trial end date from Polar
    const trialEndsAt =
      subscription.status === "trialing" && subscription.ends_at
        ? new Date(subscription.ends_at)
        : subscription.trial_end
          ? new Date(subscription.trial_end)
          : null;

    // Check if subscription already exists (by polarSubscriptionId or businessId)
    const existingSubscription = await db.subscription.findFirst({
      where: {
        OR: [
          { polarSubscriptionId: subscription.id },
          { businessId: user.business.id },
        ],
      },
    });

    const subscriptionData = {
      businessId: user.business.id,
      planType,
      status: subscriptionStatus,
      currentPeriodStart,
      currentPeriodEnd,
      minutesIncluded: planConfig.minutesIncluded,
      overageRate: planConfig.overageRateUSD,
      trialEndsAt,
      trialActivated: subscriptionStatus === "TRIAL",
      polarSubscriptionId: subscription.id,
      polarCustomerId:
        customer?.id || subscription?.customer_id || subscription?.user_id,
      cancelledAt: null,
    };

    if (existingSubscription) {
      // Check if this is a new billing period (period start date changed)
      const isNewPeriod =
        existingSubscription.currentPeriodStart.getTime() !==
        currentPeriodStart.getTime();

      // Update existing subscription with minutesUsed reset if new period
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          ...subscriptionData,
          // Reset minutes used if it's a new billing period
          minutesUsed: isNewPeriod ? 0 : existingSubscription.minutesUsed,
          // Update trial tracking fields
          trialStartedAt:
            subscriptionStatus === "TRIAL" &&
            !existingSubscription.trialStartedAt
              ? currentPeriodStart
              : existingSubscription.trialStartedAt,
          trialPlanType:
            subscriptionStatus === "TRIAL"
              ? planType
              : existingSubscription.trialPlanType,
        },
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
            },
          },
          create: {
            businessId: user.business.id,
            month: newPeriodMonth,
            year: newPeriodYear,
            totalMinutes: 0,
            includedMinutes: planConfig.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
          update: {
            totalMinutes: 0,
            includedMinutes: planConfig.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
        });
        logger.info(
          `✅ Reset BillingUsage for business ${user.business.id} for ${newPeriodMonth}/${newPeriodYear}`
        );
      }

      logger.info(`✅ Updated subscription for business ${user.business.id}`, {
        planType,
        status: subscriptionStatus,
        periodEnd: currentPeriodEnd.toISOString(),
        isNewPeriod,
      });
    } else {
      // Create new subscription if it doesn't exist
      await db.subscription.create({
        data: {
          ...subscriptionData,
          minutesUsed: 0,
          trialStartedAt:
            subscriptionStatus === "TRIAL" ? currentPeriodStart : null,
          trialPlanType: subscriptionStatus === "TRIAL" ? planType : null,
        },
      });
      logger.info(
        `✅ Created new subscription for business ${user.business.id}`,
        {
          planType,
          status: subscriptionStatus,
        }
      );
    }
  } catch (error) {
    logger.error("❌ Error handling subscription updated:", error);
    throw error;
  }
}

// Handle subscription canceled
async function handleSubscriptionCanceled(payload: any) {
  try {
    logger.info("🔔 Subscription canceled webhook received", {
      subscriptionId: payload.data?.id,
      status: payload.data?.status,
    });

    const customer = payload.data?.customer;
    const subscription = payload.data;

    // Try to get email from customer or user object
    const customerEmail =
      customer?.email ||
      subscription?.user?.email ||
      subscription?.customer?.email;

    if (!customerEmail) {
      logger.error(
        "❌ No customer email found in subscription canceled payload"
      );
      return;
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: { include: { phoneNumberRecord: true } } },
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
          { businessId: user.business.id },
        ],
      },
    });

    if (existingSubscription) {
      // Update existing subscription to cancelled
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          polarSubscriptionId: subscription.id,
        },
      });
      logger.info(
        `✅ Cancelled subscription ${existingSubscription.id} for business ${user.business.id}`
      );
    } else {
      // Create cancelled subscription record if it doesn't exist
      const planType = mapPolarProductToPlanType(subscription.product?.name);
      const planConfig = getPlanConfig(planType);

      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: "CANCELLED",
          currentPeriodStart: new Date(
            subscription.current_period_start || Date.now()
          ),
          currentPeriodEnd: new Date(
            subscription.current_period_end || Date.now()
          ),
          minutesIncluded: planConfig.minutesIncluded,
          minutesUsed: 0,
          overageRate: planConfig.overageRateUSD,
          polarSubscriptionId: subscription.id,
          polarCustomerId:
            customer?.id || subscription?.customer_id || subscription?.user_id,
          cancelledAt: new Date(),
        },
      });
      logger.info(
        `✅ Created cancelled subscription record for business ${user.business.id}`
      );
    }

    // Release phone number if business has one
    if (user.business.phoneNumberRecord?.twilioSid) {
      try {
        const { twilioService } = await import("../services/twilioService.js");
        await twilioService.releaseBusinessPhoneNumber(user.business.id);
        logger.info(
          `✅ Released phone number for business ${user.business.id}`
        );
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
    logger.info("🔔 Subscription activated webhook received", {
      subscriptionId: payload.data?.id,
      status: payload.data?.status,
      currentPeriodStart: payload.data?.current_period_start,
      currentPeriodEnd: payload.data?.current_period_end,
    });

    const customer = payload.data?.customer;
    const subscription = payload.data;

    // Try to get email from customer or user object
    const customerEmail =
      customer?.email ||
      subscription?.user?.email ||
      subscription?.customer?.email;

    if (!customerEmail) {
      logger.error("❌ No customer email found in subscription active payload");
      return;
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: customerEmail },
      include: { business: true },
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
          { businessId: user.business.id },
        ],
      },
    });

    // POLAR IS THE SOURCE OF TRUTH - use actual values from Polar
    const planType = mapPolarProductToPlanType(subscription.product?.name);
    const planConfig = getPlanConfig(planType);
    const currentPeriodStart = subscription.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date();
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : new Date();

    if (existingSubscription) {
      // Check if this is a new billing period (period start date changed)
      const isNewPeriod =
        existingSubscription.currentPeriodStart.getTime() !==
        currentPeriodStart.getTime();

      // Update existing subscription with Polar's actual data
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "ACTIVE",
          planType,
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planConfig.minutesIncluded,
          overageRate: planConfig.overageRateUSD,
          polarSubscriptionId: subscription.id,
          polarCustomerId:
            customer?.id || subscription?.customer_id || subscription?.user_id,
          cancelledAt: null,
          trialEndsAt: null,
          trialActivated: false,
          // Reset minutes used if it's a new billing period
          minutesUsed: isNewPeriod ? 0 : existingSubscription.minutesUsed,
        },
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
            },
          },
          create: {
            businessId: user.business.id,
            month: newPeriodMonth,
            year: newPeriodYear,
            totalMinutes: 0,
            includedMinutes: planConfig.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
          update: {
            totalMinutes: 0,
            includedMinutes: planConfig.minutesIncluded,
            overageMinutes: 0,
            overageCost: 0,
            totalCost: 0,
          },
        });
        logger.info(
          `✅ Reset BillingUsage for business ${user.business.id} for ${newPeriodMonth}/${newPeriodYear}`
        );
      }

      logger.info(
        `✅ Activated subscription for business ${user.business.id}`,
        {
          planType,
          periodEnd: currentPeriodEnd.toISOString(),
          isNewPeriod,
        }
      );
    } else {
      // Create new subscription if it doesn't exist
      await db.subscription.create({
        data: {
          businessId: user.business.id,
          planType,
          status: "ACTIVE",
          currentPeriodStart,
          currentPeriodEnd,
          minutesIncluded: planConfig.minutesIncluded,
          minutesUsed: 0,
          overageRate: planConfig.overageRateUSD,
          polarSubscriptionId: subscription.id,
          polarCustomerId:
            customer?.id || subscription?.customer_id || subscription?.user_id,
        },
      });
      logger.info(
        `✅ Created active subscription for business ${user.business.id}`,
        {
          planType,
          periodEnd: currentPeriodEnd.toISOString(),
        }
      );
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
      include: { business: true },
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
        description: `Refund for ${refund?.reason || "refund"}`,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    logger.info(
      `✅ Created refund transaction for business ${user.business.id}`
    );
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
      customerEmail: payload.customer?.email,
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
          dataKeys: payload.data ? Object.keys(payload.data) : [],
        });
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    logger.error("❌ Error processing Polar webhook:", error);
    res.status(500).json({
      success: false,
      error: "Error processing webhook",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
