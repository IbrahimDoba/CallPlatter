/**
 * Client-side rate limiting utility
 * Provides additional protection against spam and abuse
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

class ClientRateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if a request is allowed based on rate limiting rules
   */
  isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = config.key;
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (limit.count >= config.maxRequests) {
      return false;
    }

    // Increment count
    limit.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(config: RateLimitConfig): number {
    const key = config.key;
    const limit = this.limits.get(key);

    if (!limit || Date.now() > limit.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - limit.count);
  }

  /**
   * Get time until reset for a key
   */
  getTimeUntilReset(config: RateLimitConfig): number {
    const key = config.key;
    const limit = this.limits.get(key);

    if (!limit || Date.now() > limit.resetTime) {
      return 0;
    }

    return Math.max(0, limit.resetTime - Date.now());
  }

  /**
   * Clear all limits (useful for testing)
   */
  clear(): void {
    this.limits.clear();
  }
}

// Create a singleton instance
export const clientRateLimiter = new ClientRateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Form submissions
  CONTACT_FORM: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000, // 1 hour
    key: 'contact-form'
  },
  
  // Waitlist signup
  WAITLIST: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    key: 'waitlist'
  },
  
  // API calls
  API_CALLS: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
    key: 'api-calls'
  },
  
  // Authentication attempts
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    key: 'auth'
  }
} as const;

/**
 * Hook for React components to use rate limiting
 */
export function useRateLimit(config: RateLimitConfig) {
  const isAllowed = clientRateLimiter.isAllowed(config);
  const remaining = clientRateLimiter.getRemaining(config);
  const timeUntilReset = clientRateLimiter.getTimeUntilReset(config);

  return {
    isAllowed,
    remaining,
    timeUntilReset,
    resetTime: new Date(Date.now() + timeUntilReset)
  };
}

/**
 * Utility function to check if an action is rate limited
 */
export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
} {
  const isAllowed = clientRateLimiter.isAllowed(config);
  const remaining = clientRateLimiter.getRemaining(config);
  const timeUntilReset = clientRateLimiter.getTimeUntilReset(config);

  return {
    allowed: isAllowed,
    remaining,
    retryAfter: !isAllowed ? Math.ceil(timeUntilReset / 1000) : undefined
  };
}
