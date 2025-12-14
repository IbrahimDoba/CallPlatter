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
  private lastSyncTimes: Map<string, number> = new Map();
  private readonly SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

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
   * Sync subscription from Polar API on demand (called when user loads usage page)
   * This ensures the DB always reflects Polar's current state
   *
   * SAFEGUARDS:
   * - Rate limited to once every 5 minutes per business
   * - Validates changes make logical sense before applying
   * - Prevents backwards period changes
   */
  async syncSubscriptionOnLoad(businessId: string): Promise<{
    synced: boolean;
    subscription: any;
    changes: string[];
  }> {
    const changes: string[] = [];

    // SAFEGUARD 1: Rate limiting - only sync once every 5 minutes
    const lastSyncTime = this.lastSyncTimes.get(businessId) || 0;
    const timeSinceLastSync = Date.now() - lastSyncTime;

    if (timeSinceLastSync < this.SYNC_COOLDOWN_MS) {
      const minutesRemaining = Math.ceil((this.SYNC_COOLDOWN_MS - timeSinceLastSync) / 60000);
      logger.debug(`Skipping sync for ${businessId} - last synced ${Math.floor(timeSinceLastSync / 1000)}s ago (cooldown: ${minutesRemaining}m remaining)`);

      const dbSubscription = await db.subscription.findUnique({
        where: { businessId },
      });

      return {
        synced: false,
        subscription: dbSubscription,
        changes: [`Sync skipped - cooldown active (${minutesRemaining}m remaining)`],
      };
    }

    const dbSubscription = await db.subscription.findUnique({
      where: { businessId },
    });

    if (!dbSubscription) {
      return {
        synced: false,
        subscription: null,
        changes: ["No subscription found in database"],
      };
    }

    if (!dbSubscription.polarSubscriptionId) {
      return {
        synced: false,
        subscription: dbSubscription,
        changes: ["No Polar subscription ID linked"],
      };
    }

    // Fetch latest from Polar
    const polarSubscription = await this.fetchPolarSubscription(
      dbSubscription.polarSubscriptionId
    );

    if (!polarSubscription) {
      logger.warn(`Could not fetch Polar subscription ${dbSubscription.polarSubscriptionId}`);
      return {
        synced: false,
        subscription: dbSubscription,
        changes: ["Could not fetch from Polar API"],
      };
    }

    // Check if anything needs updating
    const polarStatus = this.mapPolarStatus(polarSubscription.status);
    const planType = mapPolarProductToPlanType(polarSubscription.product?.name);
    const planConfig = getPlanConfig(planType);

    const currentPeriodStart = polarSubscription.currentPeriodStart
      ? new Date(polarSubscription.currentPeriodStart)
      : dbSubscription.currentPeriodStart;

    const currentPeriodEnd = polarSubscription.currentPeriodEnd
      ? new Date(polarSubscription.currentPeriodEnd)
      : dbSubscription.currentPeriodEnd;

    // Determine trial end - Polar uses trialEnd field
    const trialEndsAt = polarSubscription.trialEnd
      ? new Date(polarSubscription.trialEnd)
      : null;

    // SAFEGUARD 2: Validate changes make logical sense
    const warnings: string[] = [];

    // Check for backwards period start (should never happen)
    if (currentPeriodStart.getTime() < dbSubscription.currentPeriodStart.getTime()) {
      const daysDiff = Math.floor((dbSubscription.currentPeriodStart.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
      warnings.push(
        `🚨 REJECTED: Period start would move backwards by ${daysDiff} days (${dbSubscription.currentPeriodStart.toISOString()} → ${currentPeriodStart.toISOString()})`
      );
    }

    // Check for cancelled->active transition without new period (suspicious)
    if (dbSubscription.status === "CANCELLED" && polarStatus === "ACTIVE") {
      const isNewPeriod = dbSubscription.currentPeriodStart.getTime() !== currentPeriodStart.getTime();
      if (!isNewPeriod) {
        warnings.push(
          `⚠️ WARNING: Status changing from CANCELLED to ACTIVE without period change`
        );
      }
    }

    // If there are critical warnings, reject the sync
    if (warnings.length > 0 && warnings.some(w => w.includes("REJECTED"))) {
      logger.error(`❌ Sync rejected for business ${businessId}:`, warnings);
      return {
        synced: false,
        subscription: dbSubscription,
        changes: warnings,
      };
    }

    // Check what needs updating
    let needsUpdate = false;

    if (dbSubscription.status !== polarStatus) {
      changes.push(`Status: ${dbSubscription.status} → ${polarStatus}`);
      needsUpdate = true;
    }

    if (dbSubscription.planType !== planType) {
      changes.push(`Plan: ${dbSubscription.planType} → ${planType}`);
      needsUpdate = true;
    }

    // Only update period start if it's moving forward or staying same
    if (
      dbSubscription.currentPeriodStart.getTime() !== currentPeriodStart.getTime() &&
      currentPeriodStart.getTime() >= dbSubscription.currentPeriodStart.getTime()
    ) {
      changes.push(
        `Period start: ${dbSubscription.currentPeriodStart.toISOString()} → ${currentPeriodStart.toISOString()}`
      );
      needsUpdate = true;
    }

    if (
      dbSubscription.currentPeriodEnd.getTime() !== currentPeriodEnd.getTime()
    ) {
      changes.push(
        `Period end: ${dbSubscription.currentPeriodEnd.toISOString()} → ${currentPeriodEnd.toISOString()}`
      );
      needsUpdate = true;
    }

    if (
      (trialEndsAt?.getTime() || null) !==
      (dbSubscription.trialEndsAt?.getTime() || null)
    ) {
      changes.push(
        `Trial ends: ${dbSubscription.trialEndsAt?.toISOString() || "null"} → ${trialEndsAt?.toISOString() || "null"}`
      );
      needsUpdate = true;
    }

    if (!needsUpdate) {
      logger.debug(`✅ Subscription for business ${businessId} is in sync with Polar`);
      // Update last sync time even if no changes
      this.lastSyncTimes.set(businessId, Date.now());
      return {
        synced: true,
        subscription: dbSubscription,
        changes: [],
      };
    }

    // Check if this is a period change (need to reset usage)
    const isNewPeriod =
      dbSubscription.currentPeriodStart.getTime() !== currentPeriodStart.getTime();

    // Update the subscription
    const updatedSubscription = await db.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        planType,
        status: polarStatus,
        currentPeriodStart,
        currentPeriodEnd,
        minutesIncluded: planConfig.minutesIncluded,
        overageRate: planConfig.overageRateUSD,
        trialEndsAt,
        trialActivated: polarStatus === "TRIAL",
        // Reset minutes if new period
        minutesUsed: isNewPeriod ? 0 : dbSubscription.minutesUsed,
        polarCustomerId:
          polarSubscription.customerId || dbSubscription.polarCustomerId,
      },
    });

    // If new period, reset BillingUsage
    if (isNewPeriod) {
      const newPeriodMonth = currentPeriodStart.getMonth() + 1;
      const newPeriodYear = currentPeriodStart.getFullYear();

      await db.billingUsage.upsert({
        where: {
          businessId_month_year: {
            businessId,
            month: newPeriodMonth,
            year: newPeriodYear,
          },
        },
        create: {
          businessId,
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
      changes.push(`Reset usage for new period ${newPeriodMonth}/${newPeriodYear}`);
    }

    logger.info(`✅ Synced subscription for business ${businessId}:`, changes);

    // Update last sync time
    this.lastSyncTimes.set(businessId, Date.now());

    return {
      synced: true,
      subscription: updatedSubscription,
      changes,
    };
  }

  /**
   * Clear sync cooldown for a business (useful after webhook events)
   */
  clearSyncCooldown(businessId: string): void {
    this.lastSyncTimes.delete(businessId);
    logger.debug(`Cleared sync cooldown for business ${businessId}`);
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
