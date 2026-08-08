import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSnapTransaction } from "@/lib/midtrans/client";

// Test-mode price for the Pro plan (IDR, no decimals — Midtrans still
// wants it as a number here; formatted to "X.00" by their API internally).
const PRO_PLAN_GROSS_AMOUNT = 15_000;

/**
 * Creates a Midtrans Snap transaction (sandbox) for the signed-in user to
 * upgrade to Pro, and records it in billing_orders so the webhook can look
 * up which user an incoming notification belongs to. This endpoint only
 * starts checkout — the webhook is what actually grants Pro, once Midtrans
 * confirms payment.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Midtrans caps order_id at 50 chars, so this can't just be
  // `pro-${user.id}-${Date.now()}` (54 chars). We don't need the user id
  // encoded in it anyway — billing_orders maps order_id -> user_id, so a
  // plain random id is enough (and simpler).
  const orderId = `pro-${crypto.randomUUID()}`;
  const origin = new URL(request.url).origin;

  const { error: orderError } = await supabase.from("billing_orders").insert({
    order_id: orderId,
    user_id: user.id,
    amount: PRO_PLAN_GROSS_AMOUNT,
  });
  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  try {
    const snap = await createSnapTransaction({
      orderId,
      grossAmount: PRO_PLAN_GROSS_AMOUNT,
      customerEmail: user.email,
      finishRedirectUrl: `${origin}/dashboard?upgraded=1`,
    });
    return NextResponse.json({ url: snap.redirect_url });
  } catch (err) {
    console.error("Midtrans checkout creation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memulai checkout." },
      { status: 500 }
    );
  }
}
