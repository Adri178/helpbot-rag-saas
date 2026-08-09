import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "../_shell/PageHeader";
import { DetailTabs } from "./DetailTabs";

export default async function ChatbotDetailPage({
  params,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const { chatbotId } = await params;
  const supabase = await createClient();

  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("id, name, accent_color, widget_position, greeting, show_sources")
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

  const { count: totalChunks } = await supabase
    .from("chunks")
    .select("id", { count: "exact", head: true })
    .eq("chatbot_id", chatbotId);

  return (
    <>
      <PageHeader
        title={chatbot.name}
        subtitle="Kelola dokumen, uji jawaban, dan pasang widget."
        backHref="/dashboard"
        backLabel="Semua chatbot"
      />
      <div className="flex-1 overflow-y-auto px-10 py-7">
        <DetailTabs
          chatbotId={chatbotId}
          documents={documents ?? []}
          totalChunks={totalChunks ?? 0}
          accentColor={chatbot.accent_color}
          widgetPosition={chatbot.widget_position === "left" ? "left" : "right"}
          greeting={chatbot.greeting ?? ""}
          showSources={chatbot.show_sources}
        />
      </div>
    </>
  );
}
