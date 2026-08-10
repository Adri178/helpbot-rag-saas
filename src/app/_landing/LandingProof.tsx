import { REPO_LINKS } from "./links";

// Numbers below match eval/results.md (npm run eval), committed in the
// repo — not marketing copy. Re-sync manually if the eval set changes.
const STATS = [
  { value: "100%", label: "hit rate retrieval" },
  { value: "100%", label: "faithfulness" },
  { value: "14", label: "tes evaluasi otomatis" },
];

export function LandingProof() {
  return (
    <div id="bukti" className="scroll-mt-24 border-t border-[#F0F0EE]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-2 lg:gap-18">
        <div className="flex flex-col items-start gap-6">
          <span className="font-mono text-xs tracking-[.12em] text-[#0B7A6E] uppercase">
            Grounding
          </span>
          <h2 className="text-pretty m-0 text-[34px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px] lg:text-[52px] lg:leading-[1.02] lg:tracking-[-0.04em]">
            Jawaban yang bisa <em className="italic">dibuktikan</em>, bukan
            ditebak
          </h2>
          <p className="m-0 max-w-[480px] text-base leading-[1.6] text-[#52525B] sm:text-[17px]">
            Bot hanya boleh menjawab dari potongan dokumen yang benar-benar
            terambil. Kalau tidak ada yang relevan, ia menolak dengan
            kalimat yang sama — bukan mengarang.
          </p>
          <div className="grid w-full grid-cols-3 gap-6 border-t border-[#F0F0EE] pt-5 sm:gap-9">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="m-0 text-[28px] font-bold tracking-[-0.04em] text-[#0B7A6E] sm:text-[34px]">
                  {s.value}
                </p>
                <p className="mt-1 mb-0 text-[13px] text-[#71717A] sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
          <a
            href={REPO_LINKS.evalResults}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#0B7A6E] underline underline-offset-2"
          >
            Lihat hasil evaluasi lengkap →
          </a>
        </div>

        <div className="relative overflow-hidden rounded-[22px] bg-[#0B7A6E] px-6 py-11 sm:px-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(0deg,rgba(255,255,255,.06) 1px,transparent 1px)",
              backgroundSize: "100% 64px",
            }}
          />
          <div className="relative flex flex-col gap-4">
            <div className="rounded-[18px] bg-white p-5 shadow-[0_30px_60px_-24px_rgba(0,0,0,.4)]">
              <p className="m-0 mb-3 text-[15px] leading-[1.55] text-[#18181B]">
                Garansi resmi 12 bulan berlaku untuk semua produk elektronik,
                dihitung dari tanggal invoice.
              </p>
              <div className="flex flex-col gap-2 rounded-[12px] bg-[#F7F7F6] p-3">
                <span className="font-mono text-[10px] tracking-[.1em] text-[#0B7A6E] uppercase">
                  Kutipan sumber
                </span>
                <p className="m-0 text-[13px] leading-[1.5] text-[#52525B]">
                  &ldquo;…garansi resmi 12 bulan untuk kategori elektronik,
                  dihitung sejak tanggal invoice…&rdquo;
                </p>
                <span className="font-mono text-[11px] text-[#8A8A94]">
                  faq-garansi.pdf · chunk 14
                </span>
              </div>
            </div>
            <div className="self-start rounded-[16px] border border-white/24 bg-white/14 px-4.5 py-3.5 text-sm whitespace-nowrap text-white">
              Bisa klaim garansi tanpa nota?
            </div>
            <div className="self-start rounded-[16px] bg-white px-4.5 py-3.5 text-sm text-[#18181B] shadow-[0_20px_40px_-20px_rgba(0,0,0,.35)]">
              Itu tidak ada di data saya — mau saya hubungkan ke tim?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
