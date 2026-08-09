import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./navItems";

describe("isNavItemActive", () => {
  it("marks Chatbot active on the list page", () => {
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
  });

  it("keeps Chatbot active on a chatbot detail page", () => {
    expect(isNavItemActive("/dashboard", "/dashboard/abc-123")).toBe(true);
  });

  it("does not mark Chatbot active on other sections", () => {
    expect(isNavItemActive("/dashboard", "/dashboard/usage")).toBe(false);
    expect(isNavItemActive("/dashboard", "/dashboard/settings")).toBe(false);
    expect(isNavItemActive("/dashboard", "/dashboard/conversations")).toBe(false);
  });

  it("marks a section active on its own page", () => {
    expect(isNavItemActive("/dashboard/usage", "/dashboard/usage")).toBe(true);
  });

  it("marks a section active on nested routes under it", () => {
    expect(
      isNavItemActive("/dashboard/conversations", "/dashboard/conversations/xyz")
    ).toBe(true);
  });

  it("does not cross-match different sections", () => {
    expect(isNavItemActive("/dashboard/usage", "/dashboard/settings")).toBe(false);
  });
});
