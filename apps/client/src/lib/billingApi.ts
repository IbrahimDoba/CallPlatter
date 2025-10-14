import { apiRequest } from "./api";
import { getSession } from "next-auth/react";

export interface BillingUsage {
  totalMinutes: number;
  includedMinutes: number;
  overageMinutes: number;
  overageCost: number;
  totalCost: number;
}

export interface Subscription {
  id: string;
  planType: string;
  status: string;
  minutesIncluded: number;
  minutesUsed: number;
  overageRate: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface UsageLimits {
  withinLimits: boolean;
  minutesUsed: number;
  minutesIncluded: number;
  overageMinutes: number;
}

export interface BillingTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export class BillingApi {
  private cachedBusinessId: string | null = null;
  private sessionPromise: Promise<any> | null = null;

  private async getBusinessId(): Promise<string> {
    // Return cached value if available
    if (this.cachedBusinessId) {
      return this.cachedBusinessId;
    }

    // Use existing session promise if one is in progress
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      if (session?.user?.businessId) {
        this.cachedBusinessId = session.user.businessId!;
        return this.cachedBusinessId!;
      }
    }

    // Create new session promise
    this.sessionPromise = getSession();
    const session = await this.sessionPromise;

    if (!session?.user?.businessId) {
      throw new Error("Business ID not found in session");
    }

    this.cachedBusinessId = session.user.businessId!;
    return this.cachedBusinessId!;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const businessId = await this.getBusinessId();
    return {
      "x-business-id": businessId,
    };
  }

  /**
   * Clear cached session data (call this when user logs out or changes)
   */
  clearCache(): void {
    this.cachedBusinessId = null;
    this.sessionPromise = null;
  }

  /**
   * Get current usage for the business
   */
  async getCurrentUsage(): Promise<{
    subscription: Subscription;
    currentUsage: BillingUsage;
  }> {
    const headers = await this.getHeaders();
    const response = await apiRequest("/billing/usage", { headers });
    return response.data;
  }

  /**
   * Get usage limits status
   */
  async getUsageLimits(): Promise<UsageLimits> {
    const headers = await this.getHeaders();
    const response = await apiRequest("/billing/limits", { headers });
    return response.data;
  }

  /**
   * Get billing history
   */
  async getBillingHistory(limit = 10): Promise<BillingTransaction[]> {
    const headers = await this.getHeaders();
    const response = await apiRequest(`/billing/history?limit=${limit}`, {
      headers,
    });
    return response.data;
  }

  /**
   * Create subscription for business
   */
  async createSubscription(
    planType: "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE"
  ): Promise<Subscription> {
    const headers = await this.getHeaders();
    const response = await apiRequest("/billing/subscription", {
      method: "POST",
      body: JSON.stringify({ planType }),
      headers,
    });
    return response.data;
  }

  /**
   * Update subscription plan for business
   */
  async updateSubscription(
    planType: "FREE" | "STARTER" | "BUSINESS" | "ENTERPRISE"
  ): Promise<Subscription> {
    const headers = await this.getHeaders();
    const response = await apiRequest("/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ planType }),
      headers,
    });
    return response.data;
  }

  /**
   * Generate monthly bill
   */
  async generateMonthlyBill(
    month: number,
    year: number
  ): Promise<{ success: boolean; data: unknown }> {
    const headers = await this.getHeaders();
    const response = await apiRequest("/billing/generate-bill", {
      method: "POST",
      body: JSON.stringify({ month, year }),
      headers,
    });
    return response.data;
  }

  /**
   * Get monthly usage for specific month
   */
  async getMonthlyUsage(month: number, year: number): Promise<BillingUsage> {
    const headers = await this.getHeaders();
    const response = await apiRequest(`/billing/usage/${month}/${year}`, {
      headers,
    });
    return response.data;
  }
}

// Create singleton instance to share cache across the app
export const billingApi = new BillingApi();

// Clear cache when user signs out
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "nextauth.session" && !e.newValue) {
      billingApi.clearCache();
    }
  });
}
