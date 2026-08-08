export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
}

// Below this, the best match is almost certainly irrelevant — skip the LLM
// call entirely rather than paying for a response we'd reject anyway. This
// is a coarse, untuned cutoff; Phase 5's evaluation set will validate it
// against real hit-rate numbers. The LLM's own grounding instruction (see
// buildSystemPrompt) is the primary defense against hallucinated answers,
// not this threshold.
export const MIN_SIMILARITY = 0.3;

// Keeps the prompt (and cost) bounded regardless of how many/how large the
// retrieved chunks are.
export const MAX_CONTEXT_CHARS = 6000;

export const OUT_OF_SCOPE_ANSWER =
  "Maaf, saya tidak punya informasi itu di data saya.";

/**
 * Whether the retrieved chunks carry enough signal to bother asking the
 * LLM. Pure — no I/O — so it's unit-testable without a live DB or API call.
 */
export function hasUsableContext(chunks: RetrievedChunk[]): boolean {
  return chunks.length > 0 && chunks[0].similarity >= MIN_SIMILARITY;
}

/**
 * Joins chunk contents into one context block for the prompt, stopping
 * before the total would exceed `maxChars`. Always includes at least the
 * first chunk, even if it alone exceeds the cap, so a single relevant
 * source is never dropped entirely.
 */
export function buildContext(
  chunks: RetrievedChunk[],
  maxChars: number = MAX_CONTEXT_CHARS
): string {
  const parts: string[] = [];
  let total = 0;

  for (const chunk of chunks) {
    const block = `[Sumber ${parts.length + 1}]\n${chunk.content}`;
    const addedLength = block.length + (parts.length > 0 ? 2 : 0); // "\n\n" separator
    if (parts.length > 0 && total + addedLength > maxChars) break;
    parts.push(block);
    total += addedLength;
  }

  return parts.join("\n\n");
}

export function buildSystemPrompt(customPrompt?: string | null): string {
  const base = [
    "Kamu adalah asisten customer service yang HANYA boleh menjawab berdasarkan konteks dokumen yang diberikan di bawah.",
    "Jika jawabannya tidak ada di konteks, katakan dengan jujur bahwa kamu tidak punya informasi itu — jangan mengarang jawaban.",
    "Jawab singkat, jelas, dan dalam bahasa yang sama dengan pertanyaan pengguna (Indonesia atau Inggris).",
  ].join(" ");

  return customPrompt?.trim() ? `${base}\n\nInstruksi tambahan dari pemilik bot: ${customPrompt.trim()}` : base;
}
