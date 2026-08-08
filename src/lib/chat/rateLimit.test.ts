import { describe, expect, it } from "vitest";
import { isRateLimited, RATE_LIMIT_MAX_MESSAGES } from "./rateLimit";

describe("isRateLimited", () => {
  it("is false when under the default limit", () => {
    expect(isRateLimited(RATE_LIMIT_MAX_MESSAGES - 1)).toBe(false);
  });

  it("is true when at the default limit", () => {
    expect(isRateLimited(RATE_LIMIT_MAX_MESSAGES)).toBe(true);
  });

  it("is true when over the default limit", () => {
    expect(isRateLimited(RATE_LIMIT_MAX_MESSAGES + 5)).toBe(true);
  });

  it("respects a custom limit", () => {
    expect(isRateLimited(3, 5)).toBe(false);
    expect(isRateLimited(5, 5)).toBe(true);
  });
});
