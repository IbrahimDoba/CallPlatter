"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  CreditCard, 
  Clock, 
  TrendingUp,
  Settings,
  Crown,
  Zap
} from "lucide-react";
import { billingApi, type Subscription, type UsageLimits } from "@/lib/billingApi";
import { PricingModal } from "@/components/module/PricingModal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const hasFetched = useRef(false);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchBillingData = async () => {
      if (!session?.user?.businessId || fetching || hasFetched.current) return;
      
      try {
        hasFetched.current = true;
        setFetching(true);
        setLoading(true);
        
        // Only fetch essential data first
        const subscriptionData = await billingApi.getCurrentUsage();
        
        if (!isMounted) return;
        
        setSubscription(subscriptionData.subscription);
        
        // Fetch additional data in parallel but don't block UI
        Promise.all([
          billingApi.getUsageLimits(),
          billingApi.getBillingHistory(5)
        ]).then(([usageData, billingHistory]) => {
          if (!isMounted) return;
          
          setUsage(usageData);
          
          // Calculate real stats from billing history
          const totalCalls = billingHistory.length;
          const totalMinutes = billingHistory.reduce((sum, transaction) => {
            return sum + (transaction.amount || 0);
          }, 0);
          
          setStats({
            totalCalls,
            totalMinutes: Math.floor(totalMinutes / 100),
            monthlyGrowth: 0
          });
        }).catch(error => {
          console.error('Error fetching additional billing data:', error);
        });
        
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setFetching(false);
        }
      }
    };

    if (session?.user?.businessId) {
      fetchBillingData();
    } else {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
      hasFetched.current = false;
    };
  }, [session?.user?.businessId, fetching]); // Include fetching in dependencies

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'TRIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STARTER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BUSINESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENTERPRISE': return 'bg-gold-100 text-gold-800 border-gold-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'TRIAL': return <Zap className="h-4 w-4" />;
      case 'STARTER': return <Zap className="h-4 w-4" />;
      case 'BUSINESS': return <Crown className="h-4 w-4" />;
      case 'ENTERPRISE': return <Building className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and billing information</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{session.user?.name || "User"}</h3>
                  <p className="text-gray-600">{session.user?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{session.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium">
                      {subscription?.currentPeriodStart 
                        ? new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })
                        : 'Recently'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Usage
              </CardTitle>
              <CardDescription>
                Your current plan and usage information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlanIcon(subscription.planType)}
                      <div>
                        <p className="font-semibold">{subscription.planType} Plan</p>
                        <p className="text-sm text-gray-600">
                          {subscription.status === 'ACTIVE' ? 'Active' : subscription.status}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPlanColor(subscription.planType)}>
                      {subscription.planType}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Minutes Included</p>
                      <p className="text-lg font-semibold">{subscription.minutesIncluded.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Minutes Used</p>
                      <p className="text-lg font-semibold">{subscription.minutesUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Overage Rate</p>
                      <p className="text-lg font-semibold">{formatCurrency(subscription.overageRate)}/min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Billing</p>
                      <p className="text-lg font-semibold">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                  </div>

                  {usage && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Usage This Month</p>
                          <p className="text-sm text-gray-600">
                            {usage.minutesUsed} / {usage.minutesIncluded} minutes
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (usage.minutesUsed / usage.minutesIncluded) > 0.9 ? 'bg-red-500' : 
                              (usage.minutesUsed / usage.minutesIncluded) > 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((usage.minutesUsed / usage.minutesIncluded) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {((usage.minutesUsed / usage.minutesIncluded) * 100).toFixed(1)}% used
                        </p>
                        {subscription.status === 'TRIAL' && usage.minutesUsed >= usage.minutesIncluded && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-xs text-yellow-800">
                              ⚠️ You've used all your free minutes. Upgrade to continue making calls.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    {subscription.status === 'TRIAL' ? (
                      <PricingModal currentPlan={subscription.planType}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Paid Plan
                        </Button>
                      </PricingModal>
                    ) : (
                      <>
                        <PricingModal currentPlan={subscription.planType}>
                          <Button variant="outline" size="sm">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        </PricingModal>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Billing Settings
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <p className="font-semibold">{stats.totalCalls.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Minutes</p>
                  <p className="font-semibold">{stats.totalMinutes.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="font-semibold">
                    {stats.monthlyGrowth > 0 ? `+${stats.monthlyGrowth}%` : 'No data'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing History
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Business Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
