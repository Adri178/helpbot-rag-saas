import { UploadPdfForm } from "./UploadPdfForm";
import { PasteTextForm } from "./PasteTextForm";
import { DeleteDocButton } from "./DeleteDocButton";
import { EMBEDDING_MODEL } from "@/lib/gemini/embed";

export interface DocRow {
  id: string;
  filename: string;
  source_type: string;
  status: string;
  error_message: string | null;
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  ready: { bg: "#EAF6F3", fg: "#0B7A6E", label: "Siap" },
  processing: { bg: "#FEF3C7", fg: "#92400E", label: "Memproses" },
  error: { bg: "#FEE2E2", fg: "#9F1239", label: "Gagal" },
};

export function DocsTab({
  chatbotId,
  documents,
  totalChunks,
}: {
  chatbotId: string;
  documents: DocRow[];
  totalChunks: number;
}) {
  const readyCount = documents.filter((d) => d.status === "ready").length;
  const trainPct = documents.length === 0 ? 0 : Math.round((readyCount / documents.length) * 100);
  const trainNote =
    documents.length === 0
      ? "Belum ada dokumen — upload PDF atau tempel teks untuk mulai melatih bot."
      : documents.some((d) => d.status === "processing")
        ? `${documents.length - readyCount} dokumen sedang diproses.`
        : documents.some((d) => d.status === "error")
          ? `${documents.filter((d) => d.status === "error").length} dokumen gagal diproses.`
          : "Semua dokumen siap dijawab.";

  return (
    <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UploadPdfForm chatbotId={chatbotId} />
          <PasteTextForm chatbotId={chatbotId} />
        </div>

        <div className="overflow-hidden rounded-[16px] border border-[#E7E7E4]">
          <div className="grid grid-cols-[1fr_110px_130px_80px] gap-2 border-b border-[#F0F0EE] bg-[#FAFAF9] px-5 py-3 font-mono text-[11px] tracking-[.08em] text-[#8A8A94] uppercase">
            <span>Dokumen</span>
            <span>Tipe</span>
            <span>Status</span>
            <span></span>
          </div>
          {documents.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#71717A]">
              Belum ada dokumen.
            </div>
          ) : (
            documents.map((d) => {
              const st = STATUS_STYLE[d.status] ?? STATUS_STYLE.processing;
              return (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_110px_130px_80px] items-center gap-2 border-b border-[#F4F4F3] px-5 py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-semibold text-[#111]">
                      {d.filename}
                    </p>
                    {d.status === "error" && d.error_message && (
                      <p className="m-0 mt-0.5 truncate text-xs text-red-600">
                        {d.error_message}
                      </p>
                    )}
                  </div>
                  <span className="text-[13px] text-[#52525B]">{d.source_type}</span>
                  <span
                    className="inline-flex w-fit items-center justify-center rounded-full px-2.5 py-[5px] text-[11px] font-semibold"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    {st.label}
                  </span>
                  <DeleteDocButton chatbotId={chatbotId} documentId={d.id} filename={d.filename} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-[16px] border border-[#E7E7E4] bg-[#FAFAF9] p-5.5">
        <p className="m-0 text-sm font-semibold text-[#111]">Status pelatihan</p>
        <div className="h-2 overflow-hidden rounded-full bg-[#E7E7E4]">
          <div className="h-full rounded-full bg-[#0B7A6E]" style={{ width: `${trainPct}%` }} />
        </div>
        <p className="m-0 text-[13px] leading-[1.5] text-[#71717A]">{trainNote}</p>
        <div className="h-px bg-[#E7E7E4]" />
        <div className="flex justify-between">
          <span className="text-[13px] text-[#71717A]">Total chunk</span>
          <span className="font-mono text-[13px] text-[#111]">{totalChunks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[13px] text-[#71717A]">Dokumen aktif</span>
          <span className="font-mono text-[13px] text-[#111]">{documents.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[13px] text-[#71717A]">Model</span>
          <span className="font-mono text-[13px] text-[#111]">{EMBEDDING_MODEL}</span>
        </div>
      </div>
    </div>
  );
}
