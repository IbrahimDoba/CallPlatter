
export interface Subscription {
  id: string;
  businessId: string;
  planType: string;
  status: string;
  minutesUsed: number;
  minutesIncluded: number;
  overageRate: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLimits {
  minutesUsed: number;
  minutesIncluded: number;
  overageRate: number;
}

export interface BillingHistoryItem {
  id: string;
  businessId: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: Date;
  subscription: {
    id: string;
    planType: string;
  };
}

export interface MonthlyBill {
  id: string;
  businessId: string;
  totalAmount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  createdAt: Date;
}

export class BillingApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get current usage for a business
   */
  async getCurrentUsage(): Promise<{ subscription: Subscription; currentUsage: UsageLimits }> {
    const response = await this.apiRequest("/api/billing/usage");
    return response.data;
  }

  /**
   * Get usage limits for a business
   */
  async getUsageLimits(): Promise<UsageLimits> {
    const response = await this.apiRequest("/api/billing/limits");
    return response.data;
  }

  /**
   * Get billing history
   */
  async getBillingHistory(): Promise<BillingHistoryItem[]> {
    const response = await this.apiRequest("/api/billing/history");
    return response.data;
  }

  /**
   * Create subscription for business
   */
  async createSubscription(
    planType: "STARTER" | "BUSINESS" | "ENTERPRISE"
  ): Promise<Subscription> {
    const response = await this.apiRequest("/api/billing/subscription", {
      method: "POST",
      body: JSON.stringify({ planType }),
    });
    return response.data;
  }

  /**
   * Update subscription plan for business
   */
  async updateSubscription(
    planType: "STARTER" | "BUSINESS" | "ENTERPRISE"
  ): Promise<Subscription> {
    const response = await this.apiRequest("/api/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ planType }),
    });
    return response.data;
  }

  /**
   * Generate monthly bill
   */
  async generateMonthlyBill(): Promise<MonthlyBill> {
    const response = await this.apiRequest("/api/billing/generate-bill", {
      method: "POST",
    });
    return response.data;
  }
}

export const billingApi = new BillingApi();
