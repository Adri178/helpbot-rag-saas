import { describe, expect, it } from "vitest";
import { computeMidtransSignature, isValidMidtransSignature } from "./signature";

// Known vector: SHA512("test-order-123" + "200" + "15000.00" + "SB-Mid-server-abcdef123456")
const KNOWN = {
  orderId: "test-order-123",
  statusCode: "200",
  grossAmount: "15000.00",
  serverKey: "SB-Mid-server-abcdef123456",
  expected:
    "c4bc57ea9405e060fee1c276b18d160f3bb016018ca119a857d9fc38b2ef60705fe98de2ee4cca601745fd3072ca5135038f5581b2a247597b0f6990193d4a3d",
};

describe("computeMidtransSignature", () => {
  it("matches a known SHA512 vector", () => {
    expect(computeMidtransSignature(KNOWN)).toBe(KNOWN.expected);
  });

  it("changes if any field changes (order_id, status_code, gross_amount, server_key)", () => {
    const base = computeMidtransSignature(KNOWN);
    expect(computeMidtransSignature({ ...KNOWN, orderId: "different" })).not.toBe(base);
    expect(computeMidtransSignature({ ...KNOWN, statusCode: "201" })).not.toBe(base);
    expect(computeMidtransSignature({ ...KNOWN, grossAmount: "15000.01" })).not.toBe(base);
    expect(computeMidtransSignature({ ...KNOWN, serverKey: "other-key" })).not.toBe(base);
  });
});

describe("isValidMidtransSignature", () => {
  it("accepts the correct signature", () => {
    expect(
      isValidMidtransSignature({ ...KNOWN, signatureKey: KNOWN.expected })
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      isValidMidtransSignature({ ...KNOWN, signatureKey: "0".repeat(128) })
    ).toBe(false);
  });

  it("rejects a signature computed with the wrong server key (forged notification)", () => {
    const forged = computeMidtransSignature({ ...KNOWN, serverKey: "attacker-guessed-key" });
    expect(isValidMidtransSignature({ ...KNOWN, signatureKey: forged })).toBe(false);
  });
});
