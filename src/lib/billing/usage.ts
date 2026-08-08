import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlanLimits } from "./plans";

/** 'YYYY-MM' in UTC — stable regardless of server timezone. */
export function currentMonthKey(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function getCurrentUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("month", currentMonthKey())
    .maybeSingle();

  if (error) throw error;
  return data?.message_count ?? 0;
}

/**
 * Checks whether the chatbot owner (`ownerId`) has budget left this month,
 * based on their plan. Checked BEFORE calling the LLM so a request that's
 * going to be rejected never costs an API call; the count is only
 * incremented after a successful answer (see incrementUsage), so failed
 * requests (e.g. upstream 503s) don't burn quota either.
 */
export async function checkMessageQuota(
  supabase: SupabaseClient,
  params: { ownerId: string; plan: string | null }
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = getPlanLimits(params.plan).maxMessagesPerMonth;
  const used = await getCurrentUsage(supabase, params.ownerId);
  return { allowed: used < limit, used, limit };
}

/** Atomically increments this month's message count via the
 * increment_usage() Postgres function (upsert, avoids a read-then-write
 * race between concurrent requests). */
export async function incrementUsage(
  supabase: SupabaseClient,
  ownerId: string
): Promise<void> {
  const { error } = await supabase.rpc("increment_usage", {
    p_user_id: ownerId,
    p_month: currentMonthKey(),
  });
  if (error) throw error;
}
