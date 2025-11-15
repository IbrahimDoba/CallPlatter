import { db } from "@repo/db";
import { ingestMeterEvent } from "../config/polar";
import {
  PLAN_CONFIGS,
  mapPolarProductToPlanType,
  getPlanConfig,
  type PlanType,
} from "../config/billingPlans";

interface PolarSubscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  trial_start?: string;
  ends_at?: string; // Polar uses ends_at for trial end during trialing status
  customer_id: string;
  product?: {
    name: string;
  };
}

export interface BillingPlan {
  name: string;
  monthlyPriceUSD: number;
  minutesIncluded: number;
  overageRateUSD: number;
}

// Re-export the centralized plan configs for backward compatibility
export const BILLING_PLANS: Record<PlanType, BillingPlan> = {
  STARTER: {
    name: PLAN_CONFIGS.STARTER.name,
    monthlyPriceUSD: PLAN_CONFIGS.STARTER.monthlyPriceUSD,
    minutesIncluded: PLAN_CONFIGS.STARTER.minutesIncluded,
    overageRateUSD: PLAN_CONFIGS.STARTER.overageRateUSD,
  },
  BUSINESS: {
    name: PLAN_CONFIGS.BUSINESS.name,
    monthlyPriceUSD: PLAN_CONFIGS.BUSINESS.monthlyPriceUSD,
    minutesIncluded: PLAN_CONFIGS.BUSINESS.minutesIncluded,
    overageRateUSD: PLAN_CONFIGS.BUSINESS.overageRateUSD,
  },
  ENTERPRISE: {
    name: PLAN_CONFIGS.ENTERPRISE.name,
    monthlyPriceUSD: PLAN_CONFIGS.ENTERPRISE.monthlyPriceUSD,
    minutesIncluded: PLAN_CONFIGS.ENTERPRISE.minutesIncluded,
    overageRateUSD: PLAN_CONFIGS.ENTERPRISE.overageRateUSD,
  },
};

export class BillingService {
  /**
   * Create subscription from Polar webhook (trial or paid)
   * Polar handles all trial logic - we just sync the data
   */
  async syncSubscriptionFromPolar(polarSubscription: PolarSubscription, businessId: string) {
    const isTrial = polarSubscription.status === 'trialing';
    const planType = mapPolarProductToPlanType(polarSubscription.product?.name);
    const planConfig = getPlanConfig(planType);

    // Use actual dates from Polar
    const currentPeriodStart = polarSubscription.current_period_start
      ? new Date(polarSubscription.current_period_start)
      : new Date();
    const currentPeriodEnd = polarSubscription.current_period_end
      ? new Date(polarSubscription.current_period_end)
      : new Date();

    // Get trial end date from Polar - they may use 'ends_at' during trial or 'trial_end'
    const trialEndsAt = isTrial && polarSubscription.ends_at
      ? new Date(polarSubscription.ends_at)
      : polarSubscription.trial_end
        ? new Date(polarSubscription.trial_end)
        : null;

    const subscriptionData = {
      businessId,
      planType,
      status: isTrial ? 'TRIAL' as const : 'ACTIVE' as const,
      currentPeriodStart,
      currentPeriodEnd,
      minutesIncluded: planConfig.minutesIncluded,
      minutesUsed: 0,
      overageRate: planConfig.overageRateUSD, // Store USD rate
      trialEndsAt,
      trialActivated: isTrial,
      trialStartedAt: isTrial ? currentPeriodStart : null,
      trialPlanType: isTrial ? planType : null,
      polarSubscriptionId: polarSubscription.id,
      polarCustomerId: polarSubscription.customer_id,
    };

    return await db.subscription.upsert({
      where: { businessId },
      create: subscriptionData,
      update: subscriptionData,
    });
  }

  /**
   * Handle trial conversion (called by Polar webhook)
   */
  async handleTrialConversion(polarSubscription: PolarSubscription, businessId: string) {
    const planType = mapPolarProductToPlanType(polarSubscription.product?.name);
    const planConfig = getPlanConfig(planType);

    return await db.subscription.update({
      where: { businessId },
      data: {
        planType,
        status: 'ACTIVE' as const,
        currentPeriodStart: polarSubscription.current_period_start
          ? new Date(polarSubscription.current_period_start)
          : new Date(),
        currentPeriodEnd: polarSubscription.current_period_end
          ? new Date(polarSubscription.current_period_end)
          : new Date(),
        minutesIncluded: planConfig.minutesIncluded,
        overageRate: planConfig.overageRateUSD,
        trialEndsAt: null, // Trial ended
        trialActivated: false,
      }
    });
  }

  /**
   * Create a new subscription for a business
   * NOTE: Prefer letting Polar webhook create subscriptions
   */
  async createSubscription(
    businessId: string,
    planType: PlanType,
    startDate: Date = new Date()
  ) {
    const planConfig = getPlanConfig(planType);
    const currentPeriodStart = new Date(startDate);
    const currentPeriodEnd = new Date(startDate);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    return await db.subscription.create({
      data: {
        businessId,
        planType,
        status: "ACTIVE",
        currentPeriodStart,
        currentPeriodEnd,
        minutesIncluded: planConfig.minutesIncluded,
        minutesUsed: 0,
        overageRate: planConfig.overageRateUSD,
      },
    });
  }

  /**
   * Check and reset billing period if needed
   */
  async checkAndResetPeriod(businessId: string) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const now = new Date();

    // Check if current period has ended
    if (now >= subscription.currentPeriodEnd) {
      const oldPeriodEnd = new Date(subscription.currentPeriodEnd);
      const month = oldPeriodEnd.getMonth() + 1;
      const year = oldPeriodEnd.getFullYear();

      // Generate final bill for the completed period
      try {
        await this.generateMonthlyBill(businessId, month, year);
      } catch (error) {
        console.error("Error generating monthly bill:", error);
      }

      // Reset the subscription period
      const newPeriodStart = new Date(subscription.currentPeriodEnd);
      const newPeriodEnd = new Date(subscription.currentPeriodEnd);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          minutesUsed: 0,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
        },
      });

      console.log(`Reset billing period for business ${businessId}`);
      return true;
    }

    return false;
  }

  /**
   * Track call usage and update billing
   */
  async trackCallUsage(callId: string, durationSeconds: number) {
    try {
      // Get call details first (outside transaction)
      const call = await db.call.findUnique({
        where: { id: callId },
        include: { business: { include: { subscription: true } } },
      });

      if (!call || !call.business.subscription) {
        throw new Error("Call or subscription not found");
      }

      // Store polarCustomerId and planType before transaction for meter event
      const subscription = call.business.subscription;
      const polarCustomerId = subscription.polarCustomerId;
      const planType = subscription.planType;

      // Check and reset period if needed (before tracking)
      await this.checkAndResetPeriod(call.businessId);

      // Convert seconds to minutes (round up to nearest minute)
      const durationMinutes = Math.ceil(durationSeconds / 60);

      // Use transaction to prevent race conditions
      const result = await db.$transaction(async (tx) => {
        // Update call with duration in minutes
        await tx.call.update({
          where: { id: callId },
          data: {
            durationMinutes: durationMinutes,
            duration: durationSeconds,
          },
        });

        // Update subscription usage
        if (!subscription) {
          throw new Error("Subscription not found");
        }
        const newMinutesUsed = subscription.minutesUsed + durationMinutes;

        await tx.subscription.update({
          where: { id: subscription.id },
          data: { minutesUsed: newMinutesUsed },
        });

        // Update monthly billing usage
        await this.updateMonthlyUsage(
          call.businessId,
          new Date(call.createdAt),
          durationMinutes,
          tx
        );

        console.log(`Tracked ${durationMinutes} minutes for call ${callId}`);
        return { success: true, minutesTracked: durationMinutes };
      });

      // Send meter event to Polar after transaction completes
      if (polarCustomerId) {
        await ingestMeterEvent(
          "minutes_used",
          polarCustomerId,
          {
            callId: callId,
            durationMinutes: durationMinutes,
            durationSeconds: durationSeconds,
            businessId: call.businessId,
            planType: planType,
          }
        );
      } else {
        console.warn(`No polarCustomerId found for subscription ${subscription.id}, skipping meter event`);
      }

      return result;
    } catch (error) {
      console.error("Error tracking call usage:", error);
      throw error;
    }
  }

  /**
   * Update monthly usage tracking with proper overage calculation
   */
  async updateMonthlyUsage(
    businessId: string,
    callDate: Date,
    minutesUsed: number,
    tx?: any // Prisma transaction client - using any for flexibility
  ) {
    const prisma = tx || db;
    const month = callDate.getMonth() + 1; // 1-12
    const year = callDate.getFullYear();

    // Get subscription to access overage rate
    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found for business");
    }

    // Check if billing usage record exists
    const existingUsage = await prisma.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId,
          month,
          year,
        },
      },
    });

    if (!existingUsage) {
      // Create new billing usage record
      const overageMinutes = Math.max(
        0,
        minutesUsed - subscription.minutesIncluded
      );
      const overageCost = overageMinutes * Number(subscription.overageRate);

      await prisma.billingUsage.create({
        data: {
          businessId,
          month,
          year,
          includedMinutes: subscription.minutesIncluded,
          totalMinutes: minutesUsed,
          overageMinutes: overageMinutes,
          overageCost: overageCost,
          totalCost: overageCost,
        },
      });
    } else {
      // Update existing record
      const newTotalMinutes = Number(existingUsage.totalMinutes) + minutesUsed;
      const overageMinutes = Math.max(
        0,
        newTotalMinutes - subscription.minutesIncluded
      );
      const overageCost = overageMinutes * Number(subscription.overageRate);

      await prisma.billingUsage.update({
        where: { id: existingUsage.id },
        data: {
          totalMinutes: newTotalMinutes,
          overageMinutes: overageMinutes,
          overageCost: overageCost,
          totalCost: overageCost,
        },
      });
    }
  }

  /**
   * Get current usage for a business
   */
  async getCurrentUsage(businessId: string) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    // Return null if no subscription exists - no auto-creation
    if (!subscription) {
      return {
        subscription: null,
        currentUsage: null
      };
    }

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const billingUsage = await db.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId,
          month,
          year,
        },
      },
    });

    return {
      subscription,
      currentUsage: billingUsage || {
        totalMinutes: 0,
        includedMinutes: subscription.minutesIncluded,
        overageMinutes: 0,
        overageCost: 0,
        totalCost: 0,
      },
    };
  }

  /**
   * Check if business has exceeded usage limits
   */
  async checkUsageLimits(businessId: string): Promise<{
    withinLimits: boolean;
    minutesUsed: number;
    minutesIncluded: number;
    overageMinutes: number;
    percentageUsed: number;
  }> {
    const { subscription, currentUsage } =
      await this.getCurrentUsage(businessId);

    // If no subscription exists, return limits exceeded
    if (!subscription || !currentUsage) {
      return {
        withinLimits: false,
        minutesUsed: 0,
        minutesIncluded: 0,
        overageMinutes: 0,
        percentageUsed: 100,
      };
    }

    const minutesUsed = Number(currentUsage.totalMinutes);
    const minutesIncluded = subscription.minutesIncluded;
    const overageMinutes = Math.max(0, minutesUsed - minutesIncluded);
    const percentageUsed = (minutesUsed / minutesIncluded) * 100;

    return {
      withinLimits: overageMinutes === 0,
      minutesUsed,
      minutesIncluded,
      overageMinutes,
      percentageUsed: Math.min(100, percentageUsed),
    };
  }

  /**
   * Calculate overage charges for a business
   */
  async calculateOverageCharges(
    businessId: string,
    month: number,
    year: number
  ) {
    const billingUsage = await db.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId,
          month,
          year,
        },
      },
    });

    if (!billingUsage) {
      return { overageMinutes: 0, overageCost: 0 };
    }

    return {
      overageMinutes: Number(billingUsage.overageMinutes),
      overageCost: Number(billingUsage.overageCost),
    };
  }

  /**
   * Generate monthly bill for a business
   */
  async generateMonthlyBill(businessId: string, month: number, year: number) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const billingUsage = await db.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId,
          month,
          year,
        },
      },
    });

    const planConfig = getPlanConfig(subscription.planType as PlanType);

    if (!planConfig) {
      throw new Error(`Invalid plan type: ${subscription.planType}`);
    }

    const baseCost = planConfig.monthlyPriceUSD;
    const overageCost = billingUsage ? Number(billingUsage.overageCost) : 0;
    const totalCost = baseCost + overageCost;

    // Check if bill already exists for this period
    const existingBill = await db.billingTransaction.findFirst({
      where: {
        businessId,
        type: "SUBSCRIPTION",
        month,
        year,
      },
    });

    if (existingBill) {
      console.log(`Bill already exists for ${month}/${year}`);
      return {
        transaction: existingBill,
        baseCost,
        overageCost,
        totalCost,
        usage: billingUsage,
      };
    }

    // Create billing transaction
    const transaction = await db.billingTransaction.create({
      data: {
        businessId,
        type: "SUBSCRIPTION",
        amount: totalCost,
        description: `Monthly bill for ${planConfig.name} plan - ${month}/${year}`,
        month,
        year,
        status: "PENDING",
      },
    });

    // If there's overage, create a separate transaction for transparency
    if (overageCost > 0 && billingUsage) {
      await db.billingTransaction.create({
        data: {
          businessId,
          type: "OVERAGE",
          amount: overageCost,
          description: `Overage charges: ${Number(billingUsage.overageMinutes)} minutes @ $${Number(subscription.overageRate)}/min - ${month}/${year}`,
          month,
          year,
          status: "PENDING",
        },
      });
    }

    return {
      transaction,
      baseCost,
      overageCost,
      totalCost,
      usage: billingUsage,
    };
  }

  /**
   * Get billing history for a business
   */
  async getBillingHistory(businessId: string, limit = 10) {
    return await db.billingTransaction.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get detailed usage report for a specific period
   */
  async getUsageReport(businessId: string, month: number, year: number) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const billingUsage = await db.billingUsage.findUnique({
      where: {
        businessId_month_year: {
          businessId,
          month,
          year,
        },
      },
    });

    // Get all calls for this period
    const calls = await db.call.findMany({
      where: {
        businessId,
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const planConfig = getPlanConfig(subscription.planType as PlanType);

    return {
      period: { month, year },
      plan: {
        name: planConfig.name,
        monthlyPriceUSD: planConfig.monthlyPriceUSD,
        minutesIncluded: planConfig.minutesIncluded,
        overageRateUSD: Number(subscription.overageRate),
      },
      usage: {
        totalMinutes: billingUsage ? Number(billingUsage.totalMinutes) : 0,
        includedMinutes: subscription.minutesIncluded,
        overageMinutes: billingUsage ? Number(billingUsage.overageMinutes) : 0,
        overageCost: billingUsage ? Number(billingUsage.overageCost) : 0,
        totalCost:
          planConfig.monthlyPriceUSD +
          (billingUsage ? Number(billingUsage.overageCost) : 0),
      },
      calls: {
        total: calls.length,
        totalDuration: calls.reduce(
          (sum, call) => sum + (Number(call.durationMinutes) || 0),
          0
        ),
        details: calls.map((call) => ({
          id: call.id,
          date: call.createdAt,
          duration: Number(call.durationMinutes) || 0,
          customerPhone: call.customerPhone,
        })),
      },
    };
  }

  /**
   * Update subscription plan
   * NOTE: Prefer letting Polar handle plan changes via webhook
   */
  async updateSubscriptionPlan(businessId: string, newPlanType: PlanType) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const newPlanConfig = getPlanConfig(newPlanType);

    // Update subscription with new plan details
    return await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planType: newPlanType,
        minutesIncluded: newPlanConfig.minutesIncluded,
        overageRate: newPlanConfig.overageRateUSD,
      },
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(businessId: string) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    // Generate final bill before cancellation
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    await this.generateMonthlyBill(businessId, month, year);

    // Update subscription status
    return await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
      },
    });
  }
}

// Export singleton instance
export const billingService = new BillingService();
