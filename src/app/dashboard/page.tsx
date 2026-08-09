import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/billing/plans";
import { getBotMessageStats, aggregateDocumentStatus } from "@/lib/dashboard/stats";
import { PageHeader } from "./_shell/PageHeader";
import { CreateChatbotCard } from "./CreateChatbotCard";
import { BotCard } from "./BotCard";

const STATUS_LABEL: Record<string, string> = {
  ready: "Siap",
  processing: "Memproses",
  error: "Error",
  empty: "Kosong",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("id, name, created_at, documents(status)")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user?.id ?? "")
    .single();
  const limits = getPlanLimits(profile?.plan);

  const stats = await getBotMessageStats(
    supabase,
    (chatbots ?? []).map((b) => b.id)
  );

  const bots = (chatbots ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    status: aggregateDocumentStatus(b.documents ?? []),
    statusLabel: STATUS_LABEL[aggregateDocumentStatus(b.documents ?? [])],
    documentCount: (b.documents ?? []).length,
    ...stats[b.id],
  }));

  const canCreateMore = bots.length < limits.maxChatbots;

  return (
    <>
      <PageHeader title="Semua chatbot" subtitle="Kelola bot, dokumen, dan widget dari satu tempat." />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-7">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
          <CreateChatbotCard
            disabled={!canCreateMore}
            limit={limits.maxChatbots}
          />
        </div>
      </div>
    </>
  );
}
