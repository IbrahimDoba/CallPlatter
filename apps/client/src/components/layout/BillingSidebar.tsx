"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Zap, 
  Crown, 
  Building,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { billingApi, type Subscription, type UsageLimits } from "@/lib/billingApi";
import { PricingModal } from "@/components/module/PricingModal";

interface BillingSidebarProps {
  businessId?: string;
}

export default function BillingSidebar({ businessId }: BillingSidebarProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        const [subscriptionData, usageData] = await Promise.all([
          billingApi.getCurrentUsage(),
          billingApi.getUsageLimits()
        ]);
        
        setSubscription(subscriptionData.subscription);
        setUsage(usageData);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [businessId]);

  if (loading) {
    return (
      <div className="mx-2 mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="mx-2 mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">No Plan</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Get started with a plan</p>
        <PricingModal>
          <Button size="sm" className="w-full">
            Choose Plan
          </Button>
        </PricingModal>
      </div>
    );
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'FREE': return <Zap className="h-4 w-4" />;
      case 'STARTER': return <Zap className="h-4 w-4" />;
      case 'BUSINESS': return <Crown className="h-4 w-4" />;
      case 'ENTERPRISE': return <Building className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'bg-green-100 text-green-800 border-green-200';
      case 'STARTER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BUSINESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENTERPRISE': return 'bg-gold-100 text-gold-800 border-gold-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-NG', {
  //     style: 'currency',
  //     currency: 'NGN'
  //   }).format(amount);
  // };

  const usagePercentage = usage ? (usage.minutesUsed / usage.minutesIncluded) * 100 : 0;
  const isNearLimit = usagePercentage > 75;
  const isOverLimit = usagePercentage >= 100;

  return (
    <div className="mx-2 mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Plan Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getPlanIcon(subscription.planType)}
          <span className="text-sm font-medium text-gray-900">
            {subscription.planType} Plan
          </span>
        </div>
        <Badge className={getPlanColor(subscription.planType)}>
          {subscription.planType}
        </Badge>
      </div>

      {/* Usage Progress */}
      {usage && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Usage</span>
            <span className="text-xs text-gray-600">
              {usage.minutesUsed} / {usage.minutesIncluded} min
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-2"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {usagePercentage.toFixed(1)}% used
            </span>
            {isOverLimit && (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Over limit
              </span>
            )}
            {isNearLimit && !isOverLimit && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Near limit
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plan Details */}
      {/* TODO: Implement overage rate display when billing is fully implemented */}
      {/* {subscription.planType !== 'FREE' && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Overage rate</span>
            <span className="font-medium">{formatCurrency(subscription.overageRate)}/min</span>
          </div>
        </div>
      )} */}

      {/* Action Buttons */}
      {subscription.planType === 'FREE' ? (
        <PricingModal currentPlan={subscription.planType}>
          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </PricingModal>
      ) : (
        <div className="space-y-2">
          <PricingModal currentPlan={subscription.planType}>
            <Button size="sm" variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
          </PricingModal>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // Redirect to Polar customer portal
              window.location.href = '/portal';
            }}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
        </div>
      )}

    </div>
  );
}
