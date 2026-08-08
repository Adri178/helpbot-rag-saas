import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkText } from "./chunk";
import { embedTexts } from "@/lib/gemini/embed";

/**
 * Chunks + embeds `text`, stores the resulting rows in `chunks`, and flips
 * the parent `documents.status` to "ready". On any failure the document is
 * marked "error" (with a message) before the error is re-thrown, so the
 * caller can still surface something to the user for this request while the
 * DB stays consistent for anyone viewing the document list later.
 */
export async function processDocument(
  supabase: SupabaseClient,
  params: { documentId: string; chatbotId: string; text: string }
): Promise<void> {
  const { documentId, chatbotId, text } = params;

  try {
    const pieces = chunkText(text);
    if (pieces.length === 0) {
      throw new Error("Dokumen tidak berisi teks yang bisa diproses.");
    }

    const vectors = await embedTexts(pieces, "RETRIEVAL_DOCUMENT");

    const rows = pieces.map((content, i) => ({
      document_id: documentId,
      chatbot_id: chatbotId,
      content,
      embedding: vectors[i],
      metadata: { chunk_index: i },
    }));

    const { error: insertError } = await supabase.from("chunks").insert(rows);
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from("documents")
      .update({ status: "ready" })
      .eq("id", documentId);
    if (updateError) throw updateError;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses dokumen.";
    await supabase
      .from("documents")
      .update({ status: "error", error_message: message })
      .eq("id", documentId);
    throw err;
  }
}
