'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { billingApi, type BillingUsage, type UsageLimits, type Subscription } from '@/lib/billingApi';
import { toast } from 'sonner';

export default function BillingDashboard() {
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const [usageData, limitsData] = await Promise.all([
        billingApi.getCurrentUsage(),
        billingApi.getUsageLimits()
      ]);
      
      setUsage(usageData.currentUsage);
      setSubscription(usageData.subscription);
      setLimits(limitsData);
      setError(null);
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing data');
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg inline-block">
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading billing data</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-3"
            onClick={loadBillingData}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!usage || !subscription || !limits) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No billing data available</p>
      </div>
    );
  }

  const usagePercentage = (usage.totalMinutes / usage.includedMinutes) * 100;
  const isOverLimit = limits.overageMinutes > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your usage and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{subscription.planType}</h3>
              <p className="text-sm text-muted-foreground">
                {usage.includedMinutes.toLocaleString()} minutes included
              </p>
            </div>
            <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              {usage.totalMinutes.toLocaleString()} of {usage.includedMinutes.toLocaleString()} minutes used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className={isOverLimit ? 'bg-red-100' : ''}
              />
              {isOverLimit && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Over limit by {limits.overageMinutes.toLocaleString()} minutes</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOverLimit ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Within Limits</span>
                <Badge variant={limits.withinLimits ? 'default' : 'destructive'}>
                  {limits.withinLimits ? 'Yes' : 'No'}
                </Badge>
              </div>
              {isOverLimit && (
                <div className="text-sm">
                  <p className="text-red-600">
                    Overage: ₦{usage.overageCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Details</CardTitle>
          <CardDescription>
            Detailed breakdown of your current usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{usage.totalMinutes.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Minutes Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{usage.includedMinutes.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Minutes Included</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {limits.overageMinutes.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Overage Minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={loadBillingData} variant="outline">
          Refresh Data
        </Button>
        {isOverLimit && (
          <Button variant="default">
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
