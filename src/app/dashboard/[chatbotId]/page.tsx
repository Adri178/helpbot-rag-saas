import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadPdfForm } from "./UploadPdfForm";
import { PasteTextForm } from "./PasteTextForm";
import { TestChat } from "./TestChat";
import { EmbedSnippet } from "./EmbedSnippet";

const STATUS_LABEL: Record<string, string> = {
  processing: "Memproses...",
  ready: "Siap",
  error: "Gagal",
};

const STATUS_CLASS: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export default async function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const { chatbotId } = await params;
  const supabase = await createClient();

  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("id, name")
    .eq("id", chatbotId)
    .single();

  // RLS already scopes this to the signed-in user's own chatbots; a
  // missing row here means "not found or not yours" either way.
  if (!chatbot) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, source_type, status, error_message, created_at")
    .eq("chatbot_id", chatbotId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <header>
        <Link href="/dashboard" className="text-sm text-gray-600 underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">{chatbot.name}</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <UploadPdfForm chatbotId={chatbotId} />
        <PasteTextForm chatbotId={chatbotId} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Dokumen</h2>
        {documents && documents.length > 0 ? (
          <ul className="divide-y rounded border">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">{doc.filename}</p>
                  {doc.status === "error" && doc.error_message && (
                    <p className="text-sm text-red-600">
                      {doc.error_message}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[doc.status] ?? ""}`}
                >
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded border border-dashed py-10 text-center text-gray-600">
            Belum ada dokumen.
          </div>
        )}
      </section>

      <TestChat chatbotId={chatbotId} />
      <EmbedSnippet chatbotId={chatbotId} />
    </main>
  );
}
