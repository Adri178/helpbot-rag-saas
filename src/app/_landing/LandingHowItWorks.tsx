const STEPS = [
  {
    n: "01",
    title: "Upload dokumen",
    body: "PDF, teks, atau FAQ yang kamu tempel langsung. Maks 5MB per file.",
  },
  {
    n: "02",
    title: "Diproses otomatis",
    body: "Teks dipotong jadi chunk dan diindeks jadi vektor. Statusnya kelihatan real-time.",
  },
  {
    n: "03",
    title: "Uji di kotak chat",
    body: "Tanya seperti pelanggan. Lihat sumber tiap jawaban sebelum dipublikasikan.",
  },
];

export function LandingHowItWorks() {
  return (
    <div id="cara" className="scroll-mt-24 border-t border-[#F0F0EE] bg-[#FAFAF9]">
      <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-13 lg:flex-row lg:items-end">
          <h2 className="text-pretty m-0 max-w-[640px] text-[34px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px] lg:text-[52px] lg:leading-[1.02] lg:tracking-[-0.04em]">
            Dari dokumen ke bot <em className="italic">dalam 7 menit</em>
          </h2>
          <p className="m-0 max-w-[400px] text-base leading-[1.55] text-[#52525B] sm:text-[17px]">
            Tanpa coding, tanpa training model. Upload, tunggu diproses, uji,
            lalu tempel widget.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex min-h-[220px] flex-col gap-3 rounded-[16px] border border-[#E7E7E4] bg-white p-6"
            >
              <span className="font-mono text-xs text-[#0B7A6E]">{s.n}</span>
              <p className="m-0 text-[19px] font-semibold tracking-[-0.02em]">{s.title}</p>
              <p className="m-0 text-[15px] leading-[1.55] text-[#52525B]">{s.body}</p>
            </div>
          ))}

          <div className="flex min-h-[220px] flex-col gap-3 rounded-[16px] bg-[#111] p-6">
            <span className="font-mono text-xs text-[#5EEAD4]">04</span>
            <p className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-white">
              Tempel widget
            </p>
            <p className="m-0 text-[15px] leading-[1.55] text-white/70">
              Satu baris script sebelum &lt;/body&gt; — jalan di platform
              apa pun.
            </p>
            <div className="mt-auto rounded-[9px] bg-white/8 px-3 py-2.5 font-mono text-[11px] leading-[1.5] break-all whitespace-normal text-white/80">
              &lt;script src=&quot;helpbot.id/widget.js&quot;
              data-chatbot-id=&quot;bot_8f21c4&quot; async&gt;&lt;/script&gt;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
