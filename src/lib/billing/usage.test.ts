import { describe, expect, it } from "vitest";
import { currentMonthKey } from "./usage";

describe("currentMonthKey", () => {
  it("formats as YYYY-MM in UTC", () => {
    expect(currentMonthKey(new Date("2026-01-05T12:00:00Z"))).toBe("2026-01");
    expect(currentMonthKey(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
  });

  it("pads single-digit months", () => {
    expect(currentMonthKey(new Date("2026-03-01T00:00:00Z"))).toBe("2026-03");
  });
});
