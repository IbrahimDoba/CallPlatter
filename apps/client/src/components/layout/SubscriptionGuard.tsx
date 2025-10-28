"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { billingApi, type Subscription } from "@/lib/billingApi";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PricingModal } from "@/components/module/PricingModal";
import { LoadingScreen } from "@/components/ui/loader";

interface SubscriptionGuardProps {
  businessId: string;
  children: React.ReactNode;
}

export function SubscriptionGuard({
  businessId,
  children,
}: SubscriptionGuardProps) {
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

  if (isLoading) {
    return <LoadingScreen message="Loading your subscription..." />;
  }

  if (error && subscription === null) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center text-slate-900">
              Connection Error
            </CardTitle>
            <CardDescription className="text-center">
              We couldn't verify your subscription status. This might be a
              temporary network issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubscriptionInvalid()) {
    const getStatusMessage = () => {
      if (!subscription) {
        return {
          title: "Subscription Required",
          message:
            "To access this feature, you'll need an active subscription plan.",
          primaryAction: "View Plans",
          showDetails: false,
        };
      }

      switch (subscription.status) {
        case "CANCELLED":
          return {
            title: "Subscription Inactive",
            message:
              "Your subscription was cancelled. Reactivate to continue using the service.",
            primaryAction: "Reactivate Plan",
            showDetails: true,
          };
        case "PAST_DUE":
          return {
            title: "Payment Issue",
            message:
              "We couldn't process your payment. Please update your payment method to restore access.",
            primaryAction: "Update Payment",
            showDetails: true,
          };
        case "SUSPENDED":
          return {
            title: "Account Suspended",
            message:
              "Your account is temporarily suspended. Please contact our support team for assistance.",
            primaryAction: "Contact Support",
            showDetails: true,
          };
        default:
          return {
            title: "Subscription Expired",
            message:
              "Your subscription period has ended. Renew now to regain access.",
            primaryAction: "Renew Subscription",
            showDetails: true,
          };
      }
    };

    const statusInfo = getStatusMessage();

    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader className="space-y-4 pb-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <Lock className="h-7 w-7 text-slate-700" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-xl text-slate-900">
                {statusInfo.title}
              </CardTitle>
              <CardDescription className="text-slate-600 leading-relaxed">
                {statusInfo.message}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {subscription && statusInfo.showDetails && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Plan</span>
                  <span className="font-medium text-slate-900">
                    {subscription.planType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status</span>
                  <span className="font-medium text-slate-900">
                    {subscription.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Usage</span>
                  <span className="font-medium text-slate-900">
                    {subscription.minutesUsed} / {subscription.minutesIncluded}{" "}
                    minutes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Period End</span>
                  <span className="font-medium text-slate-900">
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <PricingModal currentPlan={subscription?.planType}>
                <Button className="w-full h-11">
                  {statusInfo.primaryAction}
                </Button>
              </PricingModal>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Link href="/profile">Manage Account</Link>
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500">
              Questions?{" "}
              <Link
                href="/contact"
                className="text-slate-900 hover:underline font-medium"
              >
                Get in touch
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
