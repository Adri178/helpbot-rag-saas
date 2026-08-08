import type { SupabaseClient } from "@supabase/supabase-js";

// Coarse, un-tuned defaults — a basic abuse guardrail for the public
// endpoint, not the full usage/quota system (that's Phase 6, tied to
// billing plans). Keyed by a client-generated visitor_id, so a determined
// visitor can reset it by clearing localStorage; proper IP-aware limiting
// is future hardening (Phase 5), not solved here.
export const RATE_LIMIT_MAX_MESSAGES = 10;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

/** Pure decision so it's unit-testable without a live DB. */
export function isRateLimited(
  recentMessageCount: number,
  max: number = RATE_LIMIT_MAX_MESSAGES
): boolean {
  return recentMessageCount >= max;
}

/**
 * Counts how many user messages this visitor has sent to this chatbot
 * within the rate-limit window, via a join through conversations (the
 * only table that carries visitor_id).
 */
export async function countRecentMessages(
  supabase: SupabaseClient,
  params: { chatbotId: string; visitorId: string }
): Promise<number> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from("messages")
    .select("id, conversations!inner(chatbot_id, visitor_id)", {
      count: "exact",
      head: true,
    })
    .eq("role", "user")
    .eq("conversations.chatbot_id", params.chatbotId)
    .eq("conversations.visitor_id", params.visitorId)
    .gte("created_at", since);

  if (error) throw error;
  return count ?? 0;
}
