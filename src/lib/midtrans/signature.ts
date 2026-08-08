import { createHash } from "crypto";

/**
 * Midtrans's webhook signature scheme: SHA512(order_id + status_code +
 * gross_amount + ServerKey). Pure function — no I/O — so it's
 * unit-testable against a known vector without hitting the network.
 * gross_amount must be passed through exactly as Midtrans sent it (e.g.
 * "15000.00") — recomputing our own formatting here would silently break
 * verification if Midtrans's formatting ever differs from ours.
 */
export function computeMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}): string {
  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${params.serverKey}`;
  return createHash("sha512").update(raw).digest("hex");
}

export function isValidMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
  signatureKey: string;
}): boolean {
  const expected = computeMidtransSignature(params);
  return expected === params.signatureKey;
}
