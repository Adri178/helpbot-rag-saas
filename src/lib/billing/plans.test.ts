import { describe, expect, it } from "vitest";
import { getPlanLimits, PLAN_LIMITS } from "./plans";

describe("getPlanLimits", () => {
  it("returns free limits for 'free'", () => {
    expect(getPlanLimits("free")).toEqual(PLAN_LIMITS.free);
  });

  it("returns pro limits for 'pro'", () => {
    expect(getPlanLimits("pro")).toEqual(PLAN_LIMITS.pro);
  });

  it("falls back to free limits for null/undefined/unknown values", () => {
    expect(getPlanLimits(null)).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits(undefined)).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits("enterprise")).toEqual(PLAN_LIMITS.free);
  });
});
