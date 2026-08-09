import Link from "next/link";
import type { DocumentAggregateStatus } from "@/lib/dashboard/stats";

const AVATAR_COLORS = ["#0B7A6E", "#111827", "#6D3BEB", "#B45309", "#1D4ED8"];

function avatarColor(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const STATUS_STYLE: Record<DocumentAggregateStatus, { bg: string; fg: string; label: string }> = {
  ready: { bg: "#EAF6F3", fg: "#0B7A6E", label: "Siap" },
  processing: { bg: "#FEF3C7", fg: "#92400E", label: "Memproses" },
  error: { bg: "#FEE2E2", fg: "#9F1239", label: "Error" },
  empty: { bg: "#F4F4F3", fg: "#71717A", label: "Kosong" },
};

export interface BotCardData {
  id: string;
  name: string;
  status: DocumentAggregateStatus;
  documentCount: number;
  totalMessages: number;
  responseRate: number | null;
}

export function BotCard({ bot }: { bot: BotCardData }) {
  const st = STATUS_STYLE[bot.status];

  return (
    <Link
      href={`/dashboard/${bot.id}`}
      className="flex flex-col gap-3.5 rounded-[16px] border border-[#E7E7E4] p-5 shadow-[0_8px_20px_-14px_rgba(0,0,0,.2)] hover:border-[#0B7A6E] hover:shadow-[0_14px_28px_-16px_rgba(11,122,110,.4)]"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-[15px] font-bold text-white"
          style={{ background: avatarColor(bot.name) }}
        >
          {bot.name.charAt(0).toUpperCase()}
        </div>
        <span
          className="inline-flex items-center justify-center rounded-full px-2.5 py-[5px] text-[11px] font-semibold"
          style={{ background: st.bg, color: st.fg }}
        >
          {st.label}
        </span>
      </div>
      <div>
        <p className="m-0 text-[17px] font-semibold text-[#111]">{bot.name}</p>
        <p className="mt-1 mb-0 text-[13px] text-[#71717A]">
          {bot.documentCount} dokumen
        </p>
      </div>
      <div className="flex gap-4 border-t border-[#F0F0EE] pt-3">
        <div>
          <p className="font-mono m-0 text-[15px] text-[#111]">{bot.totalMessages}</p>
          <p className="m-0 mt-0.5 text-[11px] text-[#8A8A94]">pesan</p>
        </div>
        <div>
          <p className="font-mono m-0 text-[15px] text-[#111]">
            {bot.responseRate === null ? "—" : `${bot.responseRate}%`}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-[#8A8A94]">terjawab</p>
        </div>
      </div>
    </Link>
  );
}
