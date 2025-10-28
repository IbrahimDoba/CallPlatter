"use client";

import { useState } from "react";
import { AlertTriangle, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionBannerProps {
  businessId: string;
}

export function SubscriptionBanner({ businessId }: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { subscription, isLoading, error } = useSubscription(businessId);

  // Check if subscription is expired, cancelled, past due, or suspended
  const isSubscriptionExpired = () => {
    if (!subscription) return true; // No subscription = expired
    
    // Check subscription status
    if (subscription.status === 'CANCELLED' || 
        subscription.status === 'PAST_DUE' || 
        subscription.status === 'SUSPENDED') {
      return true;
    }
    
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    
    // Check if period has ended
    if (now > periodEnd) return true;
    
    // Check if any plan has exceeded included minutes and has no overage allowance
    if (subscription.minutesUsed > subscription.minutesIncluded && subscription.overageRate === 0) {
      return true;
    }
    
    return false;
  };

  // Check if subscription is about to expire (within 3 days)
  const isSubscriptionExpiringSoon = () => {
    if (!subscription) return false;
    
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysUntilExpiry = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };

  // Don't show banner if loading, dismissed, or no subscription
  if (isLoading || isDismissed || !subscription || error) {
    return null;
  }

  const isExpired = isSubscriptionExpired();
  const isExpiringSoon = isSubscriptionExpiringSoon();

  // Only show banner if subscription is expired or expiring soon
  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  const getBannerMessage = () => {
    if (isExpired) {
      if (subscription.status === 'CANCELLED') {
        return "Your subscription has been cancelled. Please renew to continue receiving calls.";
      }
      if (subscription.status === 'PAST_DUE') {
        return "Your subscription payment failed. Please update your payment method to continue receiving calls.";
      }
      if (subscription.status === 'SUSPENDED') {
        return "Your subscription has been suspended. Please contact support to reactivate your account.";
      }
      if (subscription.planType === "TRIAL") {
        return "Your free minutes have been used up. Upgrade to continue receiving calls.";
      }
      return "Your subscription has expired. Renew to continue receiving calls.";
    }
    
    if (isExpiringSoon) {
      return `Your subscription expires in ${Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days. Renew now to avoid service interruption.`;
    }
    
    return "";
  };

  const getBannerTitle = () => {
    if (isExpired) {
      if (subscription.status === 'CANCELLED') {
        return "Subscription Cancelled";
      }
      if (subscription.status === 'PAST_DUE') {
        return "Payment Failed";
      }
      if (subscription.status === 'SUSPENDED') {
        return "Subscription Suspended";
      }
      return "Subscription Expired";
    }
    return "Subscription Expiring Soon";
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
            {getBannerTitle()}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            {getBannerMessage()}
          </div>
          {subscription && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Current plan: {subscription.planType} • 
              Minutes used: {subscription.minutesUsed}/{subscription.minutesIncluded}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href={isExpired ? "/pricing" : "/profile"}>
              <CreditCard className="h-3 w-3 mr-1" />
              {isExpired ? "Renew Subscription" : "Manage Billing"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
