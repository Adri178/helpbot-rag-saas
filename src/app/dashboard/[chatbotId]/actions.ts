"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractPdfText } from "@/lib/ingest/pdf";
import { processDocument } from "@/lib/ingest/process";

export type DocumentFormState = { error: string } | null;

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB — cost guardrail, not the full
// rate-limit/quota system built in Phase 5.
const MAX_TEXT_CHARS = 50_000;

export async function uploadPdfDocument(
  chatbotId: string,
  _prevState: DocumentFormState,
  formData: FormData
): Promise<DocumentFormState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file PDF terlebih dahulu." };
  }
  if (file.type !== "application/pdf") {
    return { error: "File harus berformat PDF." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { error: "Ukuran PDF maksimal 5MB." };
  }

  const supabase = await createClient();

  // RLS's documents_insert_own policy re-checks that chatbotId actually
  // belongs to the signed-in user — this insert fails closed if a client
  // tampers with the chatbotId.
  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({ chatbot_id: chatbotId, filename: file.name, source_type: "pdf" })
    .select("id")
    .single();

  if (insertError || !document) {
    return { error: insertError?.message ?? "Gagal menyimpan dokumen." };
  }

  let text: string;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    text = await extractPdfText(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membaca PDF.";
    await supabase
      .from("documents")
      .update({ status: "error", error_message: message })
      .eq("id", document.id);
    return { error: `Gagal membaca PDF: ${message}` };
  }

  try {
    await processDocument(supabase, {
      documentId: document.id,
      chatbotId,
      text,
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Gagal memproses PDF: ${err.message}`
          : "Gagal memproses PDF.",
    };
  }

  revalidatePath(`/dashboard/${chatbotId}`);
  return null;
}

export async function addTextDocument(
  chatbotId: string,
  _prevState: DocumentFormState,
  formData: FormData
): Promise<DocumentFormState> {
  const title = String(formData.get("title") ?? "").trim() || "FAQ/teks tempel";
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return { error: "Isi teks/FAQ tidak boleh kosong." };
  }
  if (content.length > MAX_TEXT_CHARS) {
    return {
      error: `Maksimal ${MAX_TEXT_CHARS.toLocaleString("id-ID")} karakter.`,
    };
  }

  const supabase = await createClient();

  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({ chatbot_id: chatbotId, filename: title, source_type: "faq" })
    .select("id")
    .single();

  if (insertError || !document) {
    return { error: insertError?.message ?? "Gagal menyimpan dokumen." };
  }

  try {
    await processDocument(supabase, {
      documentId: document.id,
      chatbotId,
      text: content,
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Gagal memproses teks: ${err.message}`
          : "Gagal memproses teks.",
    };
  }

  revalidatePath(`/dashboard/${chatbotId}`);
  return null;
}
