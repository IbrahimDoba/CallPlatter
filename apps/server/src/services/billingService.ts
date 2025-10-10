import { db } from "@repo/db";

// Temporary string literals until database migration is complete
type PlanType = "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE";

export interface BillingPlan {
  name: string;
  monthlyPrice: number; // in NGN
  monthlyPriceUSD: number; // in USD
  minutesIncluded: number;
  overageRate: number; // per minute in NGN
  overageRateUSD: number; 
}



// Exchange rate constant

export const BILLING_PLANS: Record<PlanType, BillingPlan> = {
  FREE: {
    name: "Free",
    monthlyPrice: 0, // ₦0
    monthlyPriceUSD: 0, // $0
    minutesIncluded: 5, // 5 minutes free
    overageRate: 0, // No overage charges for free plan
    overageRateUSD: 0, // $0 per minute
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 30000, // ₦30,000
    monthlyPriceUSD: 18.18, // $18.18 (10% cheaper than $20)
    minutesIncluded: 38, // ~25 calls at 1.5min each
    overageRate: 1467, // ₦1,467 per minute (39% profit margin)
    overageRateUSD: 0.89, // $0.89 per minute
  },
  BUSINESS: {
    name: "Business",
    monthlyPrice: 71000, // ₦71,000
    monthlyPriceUSD: 43.03, // $43.03 (10% cheaper than $48)
    minutesIncluded: 105, // ~70 calls at 1.5min each
    overageRate: 1000, // ₦1,000 per minute (27% profit margin)
    overageRateUSD: 0.61, // $0.61 per minute
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPrice: 190000, // ₦190,000
    monthlyPriceUSD: 115.15, // $115.15 (10% cheaper than $128)
    minutesIncluded: 300, // ~200 calls at 1.5min each
    overageRate: 733, // ₦733 per minute (22% profit margin)
    overageRateUSD: 0.44, // $0.44 per minute
  },
};

export class BillingService {
  /**
   * Create a new subscription for a business
   */
  async createSubscription(
    businessId: string,
    planType: PlanType,
    startDate: Date = new Date()
  ) {
    const plan = BILLING_PLANS[planType];
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
        minutesIncluded: plan.minutesIncluded,
        minutesUsed: 0,
        overageRate: plan.overageRate,
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

      // Check and reset period if needed (before tracking)
      await this.checkAndResetPeriod(call.businessId);

      // Use transaction to prevent race conditions
      return await db.$transaction(async (tx) => {
        // Convert seconds to minutes (round up to nearest minute)
        const durationMinutes = Math.ceil(durationSeconds / 60);

        // Update call with duration in minutes
        await tx.call.update({
          where: { id: callId },
          data: {
            durationMinutes: durationMinutes,
            duration: durationSeconds,
          },
        });

        // Update subscription usage
        const subscription = call.business.subscription!;
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
    tx?: any // Prisma transaction client
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
    let subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    // If no subscription exists, create a default FREE subscription
    if (!subscription) {
      subscription = await this.createSubscription(businessId, "FREE");
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

    const plan =
      BILLING_PLANS[subscription.planType as keyof typeof BILLING_PLANS];

    if (!plan) {
      throw new Error(`Invalid plan type: ${subscription.planType}`);
    }

    const baseCost = plan.monthlyPrice;
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
        description: `Monthly bill for ${plan.name} plan - ${month}/${year}`,
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
          description: `Overage charges: ${Number(billingUsage.overageMinutes)} minutes @ ₦${Number(subscription.overageRate)}/min - ${month}/${year}`,
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

    const plan =
      BILLING_PLANS[subscription.planType as keyof typeof BILLING_PLANS];

    return {
      period: { month, year },
      plan: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        monthlyPriceUSD: plan.monthlyPriceUSD,
        minutesIncluded: plan.minutesIncluded,
        overageRate: Number(subscription.overageRate),
        overageRateUSD: plan.overageRateUSD,
      },
      usage: {
        totalMinutes: billingUsage ? Number(billingUsage.totalMinutes) : 0,
        includedMinutes: subscription.minutesIncluded,
        overageMinutes: billingUsage ? Number(billingUsage.overageMinutes) : 0,
        overageCost: billingUsage ? Number(billingUsage.overageCost) : 0,
        totalCost:
          plan.monthlyPrice +
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
   */
  async updateSubscriptionPlan(businessId: string, newPlanType: PlanType) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const newPlan = BILLING_PLANS[newPlanType];

    // Update subscription with new plan details
    return await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planType: newPlanType,
        minutesIncluded: newPlan.minutesIncluded,
        overageRate: newPlan.overageRate,
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
