"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { adminApi, type AdminStats } from "@/lib/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(1, 10)
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI receptionist platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Businesses
            </h3>
            <p className="text-3xl font-bold text-primary">
              {stats?.totalBusinesses || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Active businesses
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Calls
            </h3>
            <p className="text-3xl font-bold text-primary">
              {stats?.totalCalls || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All time calls
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Calls Today
            </h3>
            <p className="text-3xl font-bold text-primary">
              {stats?.callsToday || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Calls handled today
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Active Subscriptions
            </h3>
            <p className="text-3xl font-bold text-primary">
              {stats?.activeSubscriptions || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Active plans
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Recent Calls
          </h2>
          <div className="bg-card border border-border rounded-lg p-6">
            {stats?.recentCalls && stats.recentCalls.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {call.customerName || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {call.business.name} • {call.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {call.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">
                No recent calls to display.
              </p>
            )}
            <Button onClick={fetchData} className="mt-4">
              Refresh Data
            </Button>
          </div>
        </div>

        {stats?.usersByPlan && stats.usersByPlan.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Users by Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.usersByPlan.map((plan) => (
                <div key={plan.planType} className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-card-foreground">{plan.planType}</h3>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {plan._count.planType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            All Users
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-foreground">Business</th>
                      <th className="text-left p-4 font-medium text-foreground">Phone</th>
                      <th className="text-left p-4 font-medium text-foreground">Total Calls</th>
                      <th className="text-left p-4 font-medium text-foreground">Subscription</th>
                      <th className="text-left p-4 font-medium text-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border">
                        <td className="p-4 text-foreground">{user.name}</td>
                        <td className="p-4 text-muted-foreground">{user.email}</td>
                        <td className="p-4 text-foreground">
                          {user.business?.name || 'No business'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {user.business?.phoneNumber || user.phoneNumber || 'N/A'}
                        </td>
                        <td className="p-4 text-foreground">
                          {user.business?.totalCalls || 0}
                        </td>
                        <td className="p-4">
                          {user.business?.subscription ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {user.business.subscription.planType}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {user.business.subscription.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.business.subscription.minutesUsed}/{user.business.subscription.minutesIncluded} min
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No subscription</span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}