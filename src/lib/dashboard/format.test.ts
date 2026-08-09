import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./format";

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-09T12:00:00Z");

  it("returns 'baru saja' for under a minute", () => {
    expect(formatRelativeTime("2026-08-09T11:59:30Z", now)).toBe("baru saja");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime("2026-08-09T11:55:00Z", now)).toBe("5 menit lalu");
  });

  it("formats hours", () => {
    expect(formatRelativeTime("2026-08-09T09:00:00Z", now)).toBe("3 jam lalu");
  });

  it("formats days", () => {
    expect(formatRelativeTime("2026-08-06T12:00:00Z", now)).toBe("3 hari lalu");
  });

  it("formats months", () => {
    expect(formatRelativeTime("2026-06-01T12:00:00Z", now)).toBe("2 bulan lalu");
  });
});
