import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidMidtransSignature } from "@/lib/midtrans/signature";

/**
 * Midtrans (sandbox) payment notification — the only place that actually
 * grants Pro. /api/midtrans/checkout only starts a transaction; Midtrans
 * calling back here with a valid signature is the source of truth.
 *
 * Not verified end-to-end locally (no public URL to register as the
 * notification URL yet — deferred to Phase 7 once deployed), but the
 * signature check itself is unit-tested in signature.test.ts against a
 * known vector.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } =
    body as Record<string, unknown>;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY is not set; cannot verify webhook.");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  if (
    typeof order_id !== "string" ||
    typeof status_code !== "string" ||
    typeof gross_amount !== "string" ||
    typeof signature_key !== "string"
  ) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const valid = isValidMidtransSignature({
    orderId: order_id,
    statusCode: status_code,
    grossAmount: gross_amount,
    serverKey,
    signatureKey: signature_key,
  });
  if (!valid) {
    console.error("Midtrans webhook signature mismatch for order", order_id);
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("billing_orders")
    .select("user_id")
    .eq("order_id", order_id)
    .single();

  if (!order) {
    // Not one of ours (or already deleted) — ack so Midtrans stops
    // retrying, but there's nothing to update.
    console.error("Midtrans webhook for unknown order_id:", order_id);
    return NextResponse.json({ received: true });
  }

  const isPaid =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");
  const isFailed = transaction_status === "deny" || transaction_status === "cancel";
  const isExpired = transaction_status === "expire";

  const newStatus = isPaid ? "paid" : isFailed ? "failed" : isExpired ? "expired" : "pending";

  await supabase
    .from("billing_orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("order_id", order_id);

  if (newStatus === "paid") {
    const { error } = await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("id", order.user_id);
    if (error) console.error("Failed to upgrade profile to pro:", error);
  }

  return NextResponse.json({ received: true });
}
