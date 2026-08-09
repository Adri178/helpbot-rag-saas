import type { SupabaseClient } from "@supabase/supabase-js";
import { OUT_OF_SCOPE_ANSWER } from "@/lib/chat/context";

export interface BotMessageStats {
  totalMessages: number;
  answeredCount: number;
  rejectedCount: number;
  /** 0-100, or null if the bot has no messages yet. */
  responseRate: number | null;
}

/**
 * All-time assistant-message counts per chatbot, computed in application
 * code from a single query rather than a DB aggregate — simplest option
 * at this app's scale (see rateLimit.ts's countRecentMessages for the same
 * embedded-resource-filter pattern this reuses).
 */
export async function getBotMessageStats(
  supabase: SupabaseClient,
  chatbotIds: string[]
): Promise<Record<string, BotMessageStats>> {
  const stats: Record<string, BotMessageStats> = {};
  for (const id of chatbotIds) {
    stats[id] = { totalMessages: 0, answeredCount: 0, rejectedCount: 0, responseRate: null };
  }
  if (chatbotIds.length === 0) return stats;

  const { data, error } = await supabase
    .from("messages")
    .select("content, conversations!inner(chatbot_id)")
    .eq("role", "assistant")
    .in("conversations.chatbot_id", chatbotIds);
  if (error) throw error;

  for (const row of data ?? []) {
    const chatbotId = (row as unknown as { conversations: { chatbot_id: string } })
      .conversations.chatbot_id;
    const bucket = stats[chatbotId];
    if (!bucket) continue;
    bucket.totalMessages += 1;
    if (row.content === OUT_OF_SCOPE_ANSWER) {
      bucket.rejectedCount += 1;
    } else {
      bucket.answeredCount += 1;
    }
  }

  for (const bucket of Object.values(stats)) {
    bucket.responseRate =
      bucket.totalMessages === 0
        ? null
        : Math.round((bucket.answeredCount / bucket.totalMessages) * 100);
  }

  return stats;
}

export type DocumentAggregateStatus = "ready" | "processing" | "error" | "empty";

/** Rolls up a chatbot's documents into one status: any error wins over
 * any still-processing, which wins over all-ready, which wins over empty. */
export function aggregateDocumentStatus(
  documents: { status: string }[]
): DocumentAggregateStatus {
  if (documents.length === 0) return "empty";
  if (documents.some((d) => d.status === "error")) return "error";
  if (documents.some((d) => d.status === "processing")) return "processing";
  return "ready";
}
