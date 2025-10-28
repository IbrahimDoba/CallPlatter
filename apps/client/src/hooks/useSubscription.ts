"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { billingApi, type Subscription } from "@/lib/billingApi";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  isSubscriptionValid: boolean;
  isSubscriptionInvalid: boolean;
  hasLoaded: boolean;
}

export function useSubscription(businessId?: string): UseSubscriptionReturn {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!businessId || !session?.user?.businessId) {
      setIsLoading(false);
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [subscriptionData] = await Promise.all([
          billingApi.getCurrentUsage(),
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);

        const { subscription: subData } = subscriptionData;
        setSubscription(subData);
        setHasLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        if (err instanceof Error && err.message.includes("Failed to fetch")) {
          setError("Network error - please check your connection");
        } else {
          setError("Failed to load subscription status");
        }
        setHasLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [businessId, session?.user?.businessId]);

  const isSubscriptionInvalid = () => {
    if (isLoading || !hasLoaded) return false;
    if (!subscription) return true;

    if (
      subscription.status === "CANCELLED" ||
      subscription.status === "PAST_DUE" ||
      subscription.status === "SUSPENDED"
    ) {
      return true;
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);

    if (now > periodEnd) return true;
    if (
      subscription.minutesUsed > subscription.minutesIncluded &&
      subscription.overageRate === 0
    ) {
      return true;
    }

    return false;
  };

  return {
    subscription,
    isLoading,
    error,
    isSubscriptionValid: !isSubscriptionInvalid(),
    isSubscriptionInvalid: isSubscriptionInvalid(),
    hasLoaded,
  };
}
