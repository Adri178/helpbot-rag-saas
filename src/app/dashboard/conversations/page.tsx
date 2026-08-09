import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OUT_OF_SCOPE_ANSWER } from "@/lib/chat/context";
import { formatRelativeTime } from "@/lib/dashboard/format";
import { PageHeader } from "../_shell/PageHeader";

interface RawMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  conversations: { chatbot_id: string; chatbots: { name: string } | null } | null;
}

interface Row {
  id: string;
  question: string;
  botName: string;
  answered: boolean;
  time: string;
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "answered", label: "Terjawab" },
  { key: "rejected", label: "Ditolak" },
] as const;

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const supabase = await createClient();

  // RLS (messages_select_own) already scopes this to the signed-in
  // owner's own chatbots — no explicit user_id filter needed here.
  const { data } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, role, content, created_at, conversations!inner(chatbot_id, chatbots(name))"
    )
    .order("created_at", { ascending: false })
    .limit(400);

  const raw = ((data ?? []) as unknown as RawMessage[]).slice().reverse();

  // Pairing assumes each conversation's messages arrive in strict
  // chronological user -> assistant order, which always holds for real
  // traffic: both /api/chat and /api/public-chat insert the user message,
  // then await the LLM call (seconds), then insert the assistant reply —
  // never simultaneously. (Bulk-inserting synthetic rows in one .insert()
  // call, as a test script might, can share one transaction timestamp and
  // break this ordering — not a real usage pattern.)
  const pendingQuestion = new Map<string, { text: string; botName: string }>();
  const rows: Row[] = [];
  for (const m of raw) {
    const botName = m.conversations?.chatbots?.name ?? "Chatbot";
    if (m.role === "user") {
      pendingQuestion.set(m.conversation_id, { text: m.content, botName });
    } else {
      const q = pendingQuestion.get(m.conversation_id);
      if (!q) continue;
      pendingQuestion.delete(m.conversation_id);
      rows.push({
        id: m.id,
        question: q.text,
        botName: q.botName,
        answered: m.content !== OUT_OF_SCOPE_ANSWER,
        time: m.created_at,
      });
    }
  }
  rows.reverse(); // most recent first

  const filtered = rows.filter((r) => {
    if (filter === "answered") return r.answered;
    if (filter === "rejected") return !r.answered;
    return true;
  });

  const counts = {
    all: rows.length,
    answered: rows.filter((r) => r.answered).length,
    rejected: rows.filter((r) => !r.answered).length,
  };

  return (
    <>
      <PageHeader
        title="Percakapan"
        subtitle="Pertanyaan pengunjung dari semua chatbot-mu."
      />
      <div className="flex-1 overflow-y-auto px-10 py-7">
        <div className="mb-4 flex gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/dashboard/conversations" : `/dashboard/conversations?filter=${f.key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                filter === f.key
                  ? "border border-[#0B7A6E]/30 bg-[#0B7A6E]/10 text-[#0B7A6E]"
                  : "border border-[#E7E7E4] text-[#52525B]"
              }`}
            >
              {f.label}
              <span className="font-mono text-[11px] opacity-70">
                {counts[f.key]}
              </span>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#E7E7E4] py-16 text-center text-[#71717A]">
            Belum ada percakapan.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-[#E7E7E4]">
            <div className="grid grid-cols-[1fr_180px_130px_100px] gap-2 border-b border-[#F0F0EE] bg-[#FAFAF9] px-5 py-3 font-mono text-[11px] tracking-[.08em] text-[#8A8A94] uppercase">
              <span>Pertanyaan pengunjung</span>
              <span>Chatbot</span>
              <span>Status</span>
              <span>Waktu</span>
            </div>
            {filtered.slice(0, 50).map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_180px_130px_100px] items-center gap-2 border-b border-[#F4F4F3] px-5 py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${
                      r.answered ? "bg-[#0B7A6E]" : "bg-[#D4D4D8]"
                    }`}
                  />
                  <span className="truncate text-sm text-[#111]">{r.question}</span>
                </div>
                <span className="truncate text-[13px] text-[#52525B]">{r.botName}</span>
                <span
                  className={`font-mono text-[11px] ${r.answered ? "text-[#0B7A6E]" : "text-[#A1A1A6]"}`}
                >
                  {r.answered ? "terjawab" : "ditolak"}
                </span>
                <span className="text-[13px] text-[#A1A1A6]">
                  {formatRelativeTime(r.time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
