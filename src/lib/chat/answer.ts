import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts } from "@/lib/gemini/embed";
import { generateAnswer } from "@/lib/gemini/generate";
import {
  buildContext,
  buildSystemPrompt,
  hasUsableContext,
  OUT_OF_SCOPE_ANSWER,
  type RetrievedChunk,
} from "./context";

const MATCH_COUNT = 5;

interface MatchChunksRow {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export interface AnswerSource {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
}

export interface AnswerResult {
  answer: string;
  sources: AnswerSource[];
}

/**
 * Core RAG step: embed the question, retrieve the chatbot's nearest chunks
 * (tenant-scoped by `match_chunks`, backed by RLS), and either answer from
 * that context or return the grounded out-of-scope fallback. Shared by the
 * dashboard test endpoint (Phase 3) and the public widget endpoint
 * (Phase 4) — callers differ only in auth and rate-limiting.
 */
export async function answerQuestion(
  supabase: SupabaseClient,
  params: { chatbotId: string; question: string; systemPrompt?: string | null }
): Promise<AnswerResult> {
  const { chatbotId, question, systemPrompt } = params;

  const [queryEmbedding] = await embedTexts([question], "RETRIEVAL_QUERY");

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_chatbot_id: chatbotId,
    match_count: MATCH_COUNT,
  });

  if (error) throw error;

  const rows = (data ?? []) as MatchChunksRow[];
  const chunks: RetrievedChunk[] = rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: row.similarity,
  }));

  if (!hasUsableContext(chunks)) {
    return { answer: OUT_OF_SCOPE_ANSWER, sources: [] };
  }

  const context = buildContext(chunks);
  const prompt = `${buildSystemPrompt(systemPrompt)}\n\nKonteks:\n${context}`;

  const answer = await generateAnswer({ systemPrompt: prompt, question });

  const sources: AnswerSource[] = chunks.map((c) => ({
    chunkId: c.id,
    documentId: c.documentId,
    content: c.content,
    similarity: c.similarity,
  }));

  return { answer, sources };
}
