"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { useRateLimit } from "@/hooks/useRateLimit";
import { RATE_LIMITS } from "@/lib/rateLimiter";

interface RateLimitWarningProps {
  type: 'contact' | 'waitlist' | 'api' | 'auth';
  className?: string;
}

const rateLimitConfigs = {
  contact: RATE_LIMITS.CONTACT_FORM,
  waitlist: RATE_LIMITS.WAITLIST,
  api: RATE_LIMITS.API_CALLS,
  auth: RATE_LIMITS.AUTH
};

export function RateLimitWarning({ type, className = "" }: RateLimitWarningProps) {
  const { isAllowed, remaining, getRemainingTime, resetTime } = useRateLimit(rateLimitConfigs[type]);

  if (isAllowed) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Rate Limit Exceeded
          </h3>
          <p className="text-sm text-red-700 mt-1">
            You've made too many requests. Please wait {getRemainingTime()} before trying again.
          </p>
          <div className="flex items-center mt-2 text-xs text-red-600">
            <Clock className="w-3 h-3 mr-1" />
            Resets at {resetTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RateLimitInfo({ type, className = "" }: RateLimitWarningProps) {
  const { remaining, getRemainingTime } = useRateLimit(rateLimitConfigs[type]);

  if (remaining <= 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700">
          {remaining} requests remaining
        </span>
      </div>
    </div>
  );
}
