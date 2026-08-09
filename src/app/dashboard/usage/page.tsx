import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/billing/plans";
import { currentMonthKey } from "@/lib/billing/usage";
import { getBotMessageStats } from "@/lib/dashboard/stats";
import { PageHeader } from "../_shell/PageHeader";
import { UpgradeButton } from "../UpgradeButton";

const BAR_COLORS = ["#0B7A6E", "#111827", "#6D3BEB", "#B45309", "#1D4ED8"];

export default async function UsagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user?.id ?? "")
    .single();
  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const { data: usageRow } = await supabase
    .from("usage")
    .select("message_count")
    .eq("user_id", user?.id ?? "")
    .eq("month", currentMonthKey())
    .maybeSingle();
  const used = usageRow?.message_count ?? 0;

  const { data: chatbots } = await supabase.from("chatbots").select("id, name");
  const stats = await getBotMessageStats(supabase, (chatbots ?? []).map((b) => b.id));

  const totals = Object.values(stats).reduce(
    (acc, s) => ({
      total: acc.total + s.totalMessages,
      answered: acc.answered + s.answeredCount,
      rejected: acc.rejected + s.rejectedCount,
    }),
    { total: 0, answered: 0, rejected: 0 }
  );
  const answeredPct = totals.total === 0 ? null : Math.round((totals.answered / totals.total) * 100);
  const maxMsgs = Math.max(1, ...(chatbots ?? []).map((b) => stats[b.id]?.totalMessages ?? 0));

  return (
    <>
      <PageHeader title="Penggunaan" subtitle="Kuota dan performa jawaban bulan ini." />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-7">
        <div className="flex flex-col gap-5.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-[14px] border border-[#E7E7E4] p-5">
              <p className="font-mono m-0 text-[11px] tracking-[.08em] text-[#8A8A94] uppercase">
                Pesan bulan ini
              </p>
              <p className="m-0 mt-2 text-[32px] font-bold tracking-[-0.03em] text-[#111]">
                {used}
                <span className="text-base text-[#A1A1A6]">/{limits.maxMessagesPerMonth}</span>
              </p>
            </div>
            <div className="rounded-[14px] border border-[#E7E7E4] p-5">
              <p className="font-mono m-0 text-[11px] tracking-[.08em] text-[#8A8A94] uppercase">
                Terjawab dari dokumen
              </p>
              <p className="m-0 mt-2 text-[32px] font-bold tracking-[-0.03em] text-[#111]">
                {answeredPct === null ? "—" : `${answeredPct}%`}
              </p>
            </div>
            <div className="rounded-[14px] border border-[#E7E7E4] p-5">
              <p className="font-mono m-0 text-[11px] tracking-[.08em] text-[#8A8A94] uppercase">
                Ditolak jujur
              </p>
              <p className="m-0 mt-2 text-[32px] font-bold tracking-[-0.03em] text-[#111]">
                {totals.rejected}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[16px] border border-[#E7E7E4] p-6">
            <p className="m-0 text-[15px] font-semibold text-[#111]">Pesan per chatbot</p>
            {(chatbots ?? []).length === 0 ? (
              <p className="m-0 text-sm text-[#71717A]">Belum ada chatbot.</p>
            ) : (
              (chatbots ?? []).map((b, i) => {
                const msgs = stats[b.id]?.totalMessages ?? 0;
                const barPct = Math.round((msgs / maxMsgs) * 100);
                return (
                  <div key={b.id} className="flex items-center gap-3.5">
                    <span className="w-[150px] truncate text-sm text-[#52525B]">{b.name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F4F4F3]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barPct}%`,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="font-mono w-10 text-right text-[13px] text-[#111]">
                      {msgs}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {plan === "free" && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-[#0A3D38] px-6 py-5.5">
              <div>
                <p className="m-0 text-base font-semibold text-white">
                  Naik ke Pro — kuota jauh lebih besar
                </p>
                <p className="m-0 mt-1 text-[13px] text-white/75">
                  10 chatbot · 20 dokumen per bot · 2.000 pesan / bulan.
                </p>
              </div>
              <UpgradeButton
                label="Upgrade"
                className="inline-flex flex-shrink-0 items-center justify-center rounded-[9px] bg-white px-[18px] py-[11px] text-sm font-semibold text-[#111] disabled:opacity-50"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
