export type Plan = "free" | "pro";

export interface PlanLimits {
  maxChatbots: number;
  maxDocumentsPerChatbot: number;
  maxMessagesPerMonth: number;
}

// Arbitrary but documented MVP limits — not derived from real cost
// modeling, just enough to demonstrate the free/pro gate working. Tune
// later against actual Gemini free-tier quota headroom (see
// src/lib/gemini/generate.ts for the quota surprises found in Phase 5).
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxChatbots: 1,
    maxDocumentsPerChatbot: 3,
    maxMessagesPerMonth: 100,
  },
  pro: {
    maxChatbots: 10,
    maxDocumentsPerChatbot: 20,
    maxMessagesPerMonth: 2000,
  },
};

/** Falls back to the free plan's limits for any unrecognized value, so a
 * malformed/missing `profiles.plan` fails closed (more restrictive)
 * rather than open. */
export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}

// Single source of truth for the Pro price so the landing page's pricing
// section can never drift from what /api/midtrans/checkout actually
// charges (test-mode sandbox amount, not a real market price).
export const PRO_PLAN_PRICE_IDR = 15_000;
