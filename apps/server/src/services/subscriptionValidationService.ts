import { db } from "@repo/db";
import { logger } from "../utils/logger";

export interface SubscriptionValidationResult {
  isBlocked: boolean;
  reason: 'expired' | 'no_credits' | 'cancelled' | 'none';
  message: string;
  subscription?: {
    planType: string;
    status: string;
    minutesUsed: number;
    minutesIncluded: number;
    currentPeriodEnd: Date;
  };
}

export class SubscriptionValidationService {
  /**
   * Check if a business's subscription allows calls
   */
  async validateSubscriptionForCall(businessId: string): Promise<SubscriptionValidationResult> {
    try {
      // Get subscription details
      const subscription = await db.subscription.findUnique({
        where: { businessId },
      });

      if (!subscription) {
        return {
          isBlocked: true,
          reason: 'none',
          message: 'No subscription found. Please contact support.',
        };
      }

      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);

      // Check if subscription is cancelled
      if (subscription.status === 'CANCELLED') {
        return {
          isBlocked: true,
          reason: 'cancelled',
          message: 'Your subscription has been cancelled. Please renew to continue receiving calls.',
          subscription: {
            planType: subscription.planType,
            status: subscription.status,
            minutesUsed: subscription.minutesUsed,
            minutesIncluded: subscription.minutesIncluded,
            currentPeriodEnd: periodEnd,
          },
        };
      }

      // Check if subscription period has expired
      if (now > periodEnd) {
        return {
          isBlocked: true,
          reason: 'expired',
          message: 'Your subscription has expired. Please renew to continue receiving calls.',
          subscription: {
            planType: subscription.planType,
            status: subscription.status,
            minutesUsed: subscription.minutesUsed,
            minutesIncluded: subscription.minutesIncluded,
            currentPeriodEnd: periodEnd,
          },
        };
      }

      // Check if credits/minutes are exhausted
      if (subscription.minutesUsed >= subscription.minutesIncluded) {
        // For FREE plan, block if no minutes left
        if (subscription.planType === 'FREE') {
          return {
            isBlocked: true,
            reason: 'no_credits',
            message: 'Your free minutes have been used up. Upgrade to continue receiving calls.',
            subscription: {
              planType: subscription.planType,
              status: subscription.status,
              minutesUsed: subscription.minutesUsed,
              minutesIncluded: subscription.minutesIncluded,
              currentPeriodEnd: periodEnd,
            },
          };
        }

        // For paid plans, check if overage is allowed
        if (subscription.overageRate === 0) {
          return {
            isBlocked: true,
            reason: 'no_credits',
            message: 'You have used all your included minutes. Please upgrade your plan to continue receiving calls.',
            subscription: {
              planType: subscription.planType,
              status: subscription.status,
              minutesUsed: subscription.minutesUsed,
              minutesIncluded: subscription.minutesIncluded,
              currentPeriodEnd: periodEnd,
            },
          };
        }
      }

      // Subscription is valid and has credits
      return {
        isBlocked: false,
        reason: 'none',
        message: 'Subscription is valid',
        subscription: {
          planType: subscription.planType,
          status: subscription.status,
          minutesUsed: subscription.minutesUsed,
          minutesIncluded: subscription.minutesIncluded,
          currentPeriodEnd: periodEnd,
        },
      };
    } catch (error) {
      logger.error("Error validating subscription for call:", error);
      return {
        isBlocked: true,
        reason: 'none',
        message: 'Unable to verify subscription status. Please try again later.',
      };
    }
  }

  /**
   * Get a user-friendly message for blocked calls
   */
  getBlockedCallMessage(result: SubscriptionValidationResult): string {
    switch (result.reason) {
      case 'expired':
        return 'Your subscription has expired. Please renew your subscription to continue receiving calls.';
      case 'no_credits':
        if (result.subscription?.planType === 'FREE') {
          return 'Your free minutes have been used up. Please upgrade your plan to continue receiving calls.';
        }
        return 'You have used all your included minutes. Please upgrade your plan to continue receiving calls.';
      case 'cancelled':
        return 'Your subscription has been cancelled. Please renew your subscription to continue receiving calls.';
      default:
        return 'We are unable to process your call at this time. Please try again later.';
    }
  }

  /**
   * Get TwiML response for blocked calls
   */
  getBlockedCallTwiML(result: SubscriptionValidationResult): string {
    const message = this.getBlockedCallMessage(result);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">${message}</Say>
        <Hangup/>
      </Response>`;
  }
}

// Export singleton instance
export const subscriptionValidationService = new SubscriptionValidationService();
