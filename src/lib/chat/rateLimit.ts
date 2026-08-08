import type { SupabaseClient } from "@supabase/supabase-js";

// Coarse, un-tuned defaults — a basic abuse guardrail for the public
// endpoint, not the full usage/quota system (that's Phase 6, tied to
// billing plans).
export const RATE_LIMIT_MAX_MESSAGES = 10;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

// Looser than the per-visitor limit on purpose: one IP can legitimately
// represent many visitors (office/shared network, campus wifi). This
// exists only to catch a single visitor bypassing the per-visitor limit
// by clearing localStorage — not to police shared networks. Combined with
// the visitor_id check, clearing storage alone no longer resets the limit.
export const RATE_LIMIT_IP_MAX_MESSAGES = 30;

/** Pure decision so it's unit-testable without a live DB. */
export function isRateLimited(
  recentMessageCount: number,
  max: number = RATE_LIMIT_MAX_MESSAGES
): boolean {
  return recentMessageCount >= max;
}

async function countRecentMessagesSince(
  supabase: SupabaseClient,
  filters: { chatbotId: string; visitorId?: string; ip?: string },
  since: string
): Promise<number> {
  let query = supabase
    .from("messages")
    .select("id, conversations!inner(chatbot_id, visitor_id, ip)", {
      count: "exact",
      head: true,
    })
    .eq("role", "user")
    .eq("conversations.chatbot_id", filters.chatbotId)
    .gte("created_at", since);

  if (filters.visitorId) {
    query = query.eq("conversations.visitor_id", filters.visitorId);
  }
  if (filters.ip) {
    query = query.eq("conversations.ip", filters.ip);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/** Counts this visitor's user messages to this chatbot in the last
 * RATE_LIMIT_WINDOW_MS. */
export async function countRecentMessages(
  supabase: SupabaseClient,
  params: { chatbotId: string; visitorId: string }
): Promise<number> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  return countRecentMessagesSince(
    supabase,
    { chatbotId: params.chatbotId, visitorId: params.visitorId },
    since
  );
}

/** Counts user messages from this IP to this chatbot in the last
 * RATE_LIMIT_WINDOW_MS, regardless of visitor_id. */
export async function countRecentMessagesByIp(
  supabase: SupabaseClient,
  params: { chatbotId: string; ip: string }
): Promise<number> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  return countRecentMessagesSince(
    supabase,
    { chatbotId: params.chatbotId, ip: params.ip },
    since
  );
}
