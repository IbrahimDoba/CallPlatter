
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export interface AdminStats {
  totalBusinesses: number;
  totalCalls: number;
  callsToday: number;
  activeSubscriptions: number;
  recentCalls: Array<{
    id: string;
    customerPhone: string;
    customerName: string | null;
    summary: string | null;
    duration: number | null;
    status: string;
    createdAt: string;
    business: {
      name: string;
      phoneNumber: string;
    };
  }>;
  usersByPlan: Array<{
    planType: string;
    _count: {
      planType: number;
    };
  }>;
  businessesByPlan: Array<{
    planType: string;
    _count: {
      planType: number;
    };
  }>;
  callsByStatus: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  totalRevenue: number;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  subscription: {
    id: string;
    planType: string;
    status: string;
    minutesUsed: number;
    minutesIncluded: number;
  } | null;
  _count: {
    calls: number;
  };
}

export interface Call {
  id: string;
  businessId: string;
  customerPhone: string;
  customerName: string | null;
  summary: string | null;
  duration: number | null;
  status: string;
  createdAt: string;
  business: {
    name: string;
    phoneNumber: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class AdminApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await this.request<{ success: boolean; data: AdminStats }>('/api/admin/stats');
    return response.data;
  }

  /**
   * Get all users with their details
   */
  async getUsers(page = 1, limit = 10, search = ''): Promise<{
    users: Array<{
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      createdAt: string;
      business: {
        id: string;
        name: string;
        phoneNumber: string;
        totalCalls: number;
        subscription: {
          id: string;
          planType: string;
          status: string;
          minutesUsed: number;
          minutesIncluded: number;
          currentPeriodStart: string;
          currentPeriodEnd: string;
        } | null;
      } | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await this.request<{
      success: boolean;
      data: {
        users: Array<{
          id: string;
          name: string;
          email: string;
          phoneNumber: string;
          createdAt: string;
          business: {
            id: string;
            name: string;
            phoneNumber: string;
            totalCalls: number;
            subscription: {
              id: string;
              planType: string;
              status: string;
              minutesUsed: number;
              minutesIncluded: number;
              currentPeriodStart: string;
              currentPeriodEnd: string;
            } | null;
          } | null;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/api/admin/users?${params}`);

    return response.data;
  }

  /**
   * Get all businesses with pagination
   */
  async getBusinesses(page = 1, limit = 10, search = ''): Promise<{
    businesses: Business[];
    pagination: Pagination;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await this.request<{
      success: boolean;
      data: {
        businesses: Business[];
        pagination: Pagination;
      };
    }>(`/api/admin/businesses?${params}`);

    return response.data;
  }

  /**
   * Get all calls with pagination
   */
  async getCalls(page = 1, limit = 10, status?: string, businessId?: string): Promise<{
    calls: Call[];
    pagination: Pagination;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(businessId && { businessId }),
    });

    const response = await this.request<{
      success: boolean;
      data: {
        calls: Call[];
        pagination: Pagination;
      };
    }>(`/api/admin/calls?${params}`);

    return response.data;
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptions(): Promise<{
    subscriptions: Array<{
      id: string;
      planType: string;
      status: string;
      minutesUsed: number;
      minutesIncluded: number;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      business: {
        id: string;
        name: string;
      };
    }>;
    planAnalytics: Record<string, { count: number; revenue: number }>;
  }> {
    const response = await this.request<{
      success: boolean;
      data: {
        subscriptions: Array<{
          id: string;
          planType: string;
          status: string;
          minutesUsed: number;
          minutesIncluded: number;
          currentPeriodStart: string;
          currentPeriodEnd: string;
          business: {
            id: string;
            name: string;
          };
        }>;
        planAnalytics: Record<string, { count: number; revenue: number }>;
      };
    }>('/api/admin/subscriptions');

    return response.data;
  }

  /**
   * Get all phone numbers
   */
  async getPhoneNumbers(): Promise<{
    id: string;
    number: string;
    countryCode: string;
    isActive: boolean;
    isAssigned: boolean;
    assignedTo: string | null;
    createdAt: string;
    business?: {
      id: string;
      name: string;
    };
  }[]> {
    const response = await this.request<{
      ok: boolean;
      data: {
        id: string;
        number: string;
        countryCode: string;
        isActive: boolean;
        isAssigned: boolean;
        assignedTo: string | null;
        createdAt: string;
        business?: {
          id: string;
          name: string;
        };
      }[];
    }>('/api/admin/phone-numbers');

    return response.data;
  }

  /**
   * Add new phone number
   */
  async addPhoneNumber(data: { number: string; countryCode: string }): Promise<{
    id: string;
    number: string;
    countryCode: string;
    isActive: boolean;
    isAssigned: boolean;
    assignedTo: string | null;
    createdAt: string;
  }> {
    const response = await this.request<{
      ok: boolean;
      data: {
        id: string;
        number: string;
        countryCode: string;
        isActive: boolean;
        isAssigned: boolean;
        assignedTo: string | null;
        createdAt: string;
      };
    }>('/api/admin/phone-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  /**
   * Update phone number
   */
  async updatePhoneNumber(id: string, data: { isActive?: boolean }): Promise<{
    id: string;
    number: string;
    countryCode: string;
    isActive: boolean;
    isAssigned: boolean;
    assignedTo: string | null;
    createdAt: string;
  }> {
    const response = await this.request<{
      ok: boolean;
      data: {
        id: string;
        number: string;
        countryCode: string;
        isActive: boolean;
        isAssigned: boolean;
        assignedTo: string | null;
        createdAt: string;
      };
    }>(`/api/admin/phone-numbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  /**
   * Delete phone number
   */
  async deletePhoneNumber(id: string): Promise<void> {
    await this.request(`/api/admin/phone-numbers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApi();
