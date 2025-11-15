/**
 * Subscription Sync Service
 *
 * Validates that the database subscription state matches Polar's state.
 * Provides utilities for debugging sync issues.
 */

import { db } from "@repo/db";
import { logger } from "../utils/logger";
import { polar, isPolarAvailable } from "../config/polar";
import { mapPolarProductToPlanType, getPlanConfig } from "../config/billingPlans";

interface SyncStatus {
  inSync: boolean;
  mismatches: string[];
  dbSubscription: any;
  polarSubscription: any;
}

export class SubscriptionSyncService {
  /**
   * Fetch subscription from Polar API
   */
  async fetchPolarSubscription(polarSubscriptionId: string) {
    if (!isPolarAvailable() || !polar) {
      logger.warn("Polar SDK not available, cannot fetch subscription");
      return null;
    }

    try {
      const subscription = await polar.subscriptions.get({
        id: polarSubscriptionId,
      });
      return subscription;
    } catch (error) {
      logger.error("Error fetching Polar subscription:", error);
      return null;
    }
  }

  /**
   * Validate that DB subscription matches Polar subscription
   */
  async validateSubscriptionSync(businessId: string): Promise<SyncStatus> {
    const mismatches: string[] = [];

    // Get DB subscription
    const dbSubscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!dbSubscription) {
      return {
        inSync: false,
        mismatches: ["No subscription found in database"],
        dbSubscription: null,
        polarSubscription: null,
      };
    }

    if (!dbSubscription.polarSubscriptionId) {
      return {
        inSync: false,
        mismatches: ["No Polar subscription ID linked to DB subscription"],
        dbSubscription,
        polarSubscription: null,
      };
    }

    // Fetch from Polar
    const polarSubscription = await this.fetchPolarSubscription(
      dbSubscription.polarSubscriptionId
    );

    if (!polarSubscription) {
      return {
        inSync: false,
        mismatches: ["Could not fetch subscription from Polar API"],
        dbSubscription,
        polarSubscription: null,
      };
    }

    // Compare key fields
    // Status comparison
    const polarStatus = this.mapPolarStatus(polarSubscription.status);
    if (dbSubscription.status !== polarStatus) {
      mismatches.push(
        `Status mismatch: DB=${dbSubscription.status}, Polar=${polarStatus} (raw: ${polarSubscription.status})`
      );
    }

    // Period dates comparison (Polar SDK uses camelCase)
    if (polarSubscription.currentPeriodStart) {
      const polarStart = new Date(polarSubscription.currentPeriodStart);
      if (
        dbSubscription.currentPeriodStart.getTime() !== polarStart.getTime()
      ) {
        mismatches.push(
          `Period start mismatch: DB=${dbSubscription.currentPeriodStart.toISOString()}, Polar=${polarStart.toISOString()}`
        );
      }
    }

    if (polarSubscription.currentPeriodEnd) {
      const polarEnd = new Date(polarSubscription.currentPeriodEnd);
      if (dbSubscription.currentPeriodEnd.getTime() !== polarEnd.getTime()) {
        mismatches.push(
          `Period end mismatch: DB=${dbSubscription.currentPeriodEnd.toISOString()}, Polar=${polarEnd.toISOString()}`
        );
      }
    }

    // Plan type comparison
    const polarPlanType = mapPolarProductToPlanType(
      polarSubscription.product?.name
    );
    if (dbSubscription.planType !== polarPlanType) {
      mismatches.push(
        `Plan type mismatch: DB=${dbSubscription.planType}, Polar=${polarPlanType}`
      );
    }

    // Trial end date comparison (for trial subscriptions)
    if (polarSubscription.status === "trialing") {
      const polarTrialEnd = polarSubscription.endsAt
        ? new Date(polarSubscription.endsAt)
        : null;
      if (
        polarTrialEnd &&
        dbSubscription.trialEndsAt?.getTime() !== polarTrialEnd.getTime()
      ) {
        mismatches.push(
          `Trial end mismatch: DB=${dbSubscription.trialEndsAt?.toISOString()}, Polar=${polarTrialEnd.toISOString()}`
        );
      }
    }

    return {
      inSync: mismatches.length === 0,
      mismatches,
      dbSubscription,
      polarSubscription,
    };
  }

  /**
   * Map Polar status to our internal status
   */
  private mapPolarStatus(
    polarStatus: string
  ): "TRIAL" | "ACTIVE" | "CANCELLED" | "PAST_DUE" | "SUSPENDED" {
    switch (polarStatus) {
      case "trialing":
        return "TRIAL";
      case "active":
        return "ACTIVE";
      case "canceled":
      case "incomplete_expired":
        return "CANCELLED";
      case "past_due":
      case "unpaid":
        return "PAST_DUE";
      default:
        return "ACTIVE";
    }
  }

  /**
   * Force sync subscription from Polar (admin operation)
   * This should only be used for debugging/fixing sync issues
   */
  async forceSyncFromPolar(businessId: string): Promise<SyncStatus> {
    const dbSubscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!dbSubscription?.polarSubscriptionId) {
      return {
        inSync: false,
        mismatches: ["No Polar subscription ID to sync from"],
        dbSubscription,
        polarSubscription: null,
      };
    }

    const polarSubscription = await this.fetchPolarSubscription(
      dbSubscription.polarSubscriptionId
    );

    if (!polarSubscription) {
      return {
        inSync: false,
        mismatches: ["Could not fetch subscription from Polar"],
        dbSubscription,
        polarSubscription: null,
      };
    }

    // Update DB to match Polar
    const planType = mapPolarProductToPlanType(polarSubscription.product?.name);
    const planConfig = getPlanConfig(planType);

    const currentPeriodStart = polarSubscription.currentPeriodStart
      ? new Date(polarSubscription.currentPeriodStart)
      : dbSubscription.currentPeriodStart;

    const currentPeriodEnd = polarSubscription.currentPeriodEnd
      ? new Date(polarSubscription.currentPeriodEnd)
      : dbSubscription.currentPeriodEnd;

    const status = this.mapPolarStatus(polarSubscription.status);

    const trialEndsAt =
      polarSubscription.status === "trialing" && polarSubscription.endsAt
        ? new Date(polarSubscription.endsAt)
        : null;

    await db.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        planType,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        minutesIncluded: planConfig.minutesIncluded,
        overageRate: planConfig.overageRateUSD,
        trialEndsAt,
        trialActivated: status === "TRIAL",
        polarCustomerId:
          polarSubscription.customerId || dbSubscription.polarCustomerId,
      },
    });

    logger.info(`✅ Force synced subscription for business ${businessId}`, {
      planType,
      status,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      trialEndsAt: trialEndsAt?.toISOString() || null,
    });

    // Re-validate to confirm sync
    return this.validateSubscriptionSync(businessId);
  }

  /**
   * Get detailed subscription state for debugging
   */
  async getSubscriptionDebugInfo(businessId: string) {
    const subscription = await db.subscription.findUnique({
      where: { businessId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            users: {
              select: {
                email: true,
                polarCustomerId: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return { error: "No subscription found" };
    }

    const syncStatus = subscription.polarSubscriptionId
      ? await this.validateSubscriptionSync(businessId)
      : { inSync: false, mismatches: ["No Polar subscription linked"] };

    return {
      subscription: {
        id: subscription.id,
        businessId: subscription.businessId,
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        trialActivated: subscription.trialActivated,
        minutesIncluded: subscription.minutesIncluded,
        minutesUsed: subscription.minutesUsed,
        overageRate: Number(subscription.overageRate),
        polarSubscriptionId: subscription.polarSubscriptionId,
        polarCustomerId: subscription.polarCustomerId,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
      business: subscription.business,
      syncStatus,
      timestamps: {
        now: new Date(),
        periodEndsIn: subscription.currentPeriodEnd
          ? Math.round(
              (subscription.currentPeriodEnd.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ) + " days"
          : null,
        trialEndsIn: subscription.trialEndsAt
          ? Math.round(
              (subscription.trialEndsAt.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ) + " days"
          : null,
      },
    };
  }
}

export const subscriptionSyncService = new SubscriptionSyncService();
