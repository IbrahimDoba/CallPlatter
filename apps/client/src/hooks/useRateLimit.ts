"use client";

import { useState, useEffect, useCallback } from 'react';
import { clientRateLimiter, RATE_LIMITS, type RateLimitConfig } from '@/lib/rateLimiter';

interface UseRateLimitReturn {
  isAllowed: boolean;
  remaining: number;
  timeUntilReset: number;
  resetTime: Date;
  checkLimit: () => boolean;
  getRemainingTime: () => string;
}

export function useRateLimit(config: RateLimitConfig): UseRateLimitReturn {
  const [isAllowed, setIsAllowed] = useState(true);
  const [remaining, setRemaining] = useState(config.maxRequests);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  const checkLimit = useCallback(() => {
    const allowed = clientRateLimiter.isAllowed(config);
    const remainingCount = clientRateLimiter.getRemaining(config);
    const timeUntil = clientRateLimiter.getTimeUntilReset(config);

    setIsAllowed(allowed);
    setRemaining(remainingCount);
    setTimeUntilReset(timeUntil);

    return allowed;
  }, [config]);

  const getRemainingTime = useCallback(() => {
    if (timeUntilReset <= 0) return '0 seconds';
    
    const minutes = Math.floor(timeUntilReset / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [timeUntilReset]);

  // Check limit on mount and when config changes
  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  // Update remaining time every second
  useEffect(() => {
    if (timeUntilReset > 0) {
      const interval = setInterval(() => {
        const newTimeUntil = clientRateLimiter.getTimeUntilReset(config);
        setTimeUntilReset(newTimeUntil);
        
        if (newTimeUntil <= 0) {
          checkLimit(); // Recheck when time expires
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeUntilReset, config, checkLimit]);

  return {
    isAllowed,
    remaining,
    timeUntilReset,
    resetTime: new Date(Date.now() + timeUntilReset),
    checkLimit,
    getRemainingTime
  };
}

// Pre-configured hooks for common use cases
export function useContactFormRateLimit() {
  return useRateLimit(RATE_LIMITS.CONTACT_FORM);
}

export function useWaitlistRateLimit() {
  return useRateLimit(RATE_LIMITS.WAITLIST);
}

export function useApiRateLimit() {
  return useRateLimit(RATE_LIMITS.API_CALLS);
}

export function useAuthRateLimit() {
  return useRateLimit(RATE_LIMITS.AUTH);
}
