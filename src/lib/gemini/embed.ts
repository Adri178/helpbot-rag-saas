import { getGeminiClient } from "./client";

// Text-only embedding model (we extract text ourselves before embedding, so
// we don't need the newer multimodal gemini-embedding-2).
export const EMBEDDING_MODEL = "gemini-embedding-001";
// Truncated from the model's native 3072 dims — pgvector's HNSW/IVFFlat
// indexes cap out around 2000 dims, and 1536 keeps solid retrieval quality.
// Must match the `chunks.embedding` column in
// supabase/migrations/0002_chatbots_documents_chunks.sql.
export const EMBEDDING_DIMENSIONS = 1536;

// Gemini's embedContent endpoint accepts a batch of texts per call; cap the
// batch size so a very large document can't exceed the API's per-request
// item limit.
const BATCH_SIZE = 100;

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * Embeds a list of texts with Gemini, returning one vector per input text
 * in the same order. Note: truncated (< 3072-dim) Gemini embeddings are not
 * L2-normalized, but that's fine here — pgvector's cosine distance operator
 * (`<=>`, used in Phase 3) is scale-invariant, so no normalization step is
 * needed before storing.
 */
export async function embedTexts(
  texts: string[],
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getGeminiClient();
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new Error(
        `Gemini returned ${embeddings.length} embeddings for ${batch.length} inputs`
      );
    }

    for (const embedding of embeddings) {
      if (!embedding.values) {
        throw new Error("Gemini returned an embedding with no values");
      }
      vectors.push(embedding.values);
    }
  }

  return vectors;
}
