/**
 * Centralized Billing Plans Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for plan details within the application.
 * Polar is the source of truth for subscription state (status, periods, trials).
 * This config defines what each plan includes (minutes, rates).
 */

export type PlanType = "STARTER" | "BUSINESS" | "ENTERPRISE";

export interface PlanConfig {
  name: string;
  minutesIncluded: number;
  overageRateUSD: number;  // USD rate stored in database
  monthlyPriceUSD: number;
}

/**
 * Plan configurations - USD rates are stored in database
 * These values should match what's configured in Polar
 */
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  STARTER: {
    name: "Starter",
    minutesIncluded: 40,
    overageRateUSD: 0.89,
    monthlyPriceUSD: 20,
  },
  BUSINESS: {
    name: "Business",
    minutesIncluded: 110,
    overageRateUSD: 0.61,
    monthlyPriceUSD: 45,
  },
  ENTERPRISE: {
    name: "Enterprise",
    minutesIncluded: 300,
    overageRateUSD: 0.44,
    monthlyPriceUSD: 120,
  },
};

/**
 * Map Polar product name to internal plan type
 * Handles various naming conventions from Polar
 */
export function mapPolarProductToPlanType(productName?: string): PlanType {
  if (!productName) return "STARTER";

  const name = productName.toLowerCase();

  if (name.includes("enterprise")) return "ENTERPRISE";
  if (name.includes("business")) return "BUSINESS";
  if (name.includes("starter")) return "STARTER";

  // Default to STARTER if no match
  return "STARTER";
}

/**
 * Get plan configuration by type
 */
export function getPlanConfig(planType: PlanType): PlanConfig {
  return PLAN_CONFIGS[planType];
}

/**
 * Validate if a string is a valid plan type
 */
export function isValidPlanType(value: string): value is PlanType {
  return ["STARTER", "BUSINESS", "ENTERPRISE"].includes(value);
}
