const DOT_GRID = {
  backgroundImage:
    "linear-gradient(#F0F0EE 1px,transparent 1px),linear-gradient(90deg,#F0F0EE 1px,transparent 1px)",
  backgroundSize: "38px 38px",
  opacity: 0.7,
};

function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[1/0.82] overflow-hidden rounded-[14px] border border-[#F0F0EE] bg-[#FAFAF9] p-8">
      <div className="absolute inset-0" style={DOT_GRID} />
      {children}
    </div>
  );
}

const PRODUCTS = [
  {
    title: "Bot support",
    body: "Menjawab pertanyaan pelanggan dari FAQ dan panduanmu, dengan kutipan yang bisa diverifikasi.",
    mock: (
      <div className="relative flex h-full flex-col justify-center gap-3.5">
        <div className="h-[38px] w-[58%] self-end rounded-[14px] rounded-br-[4px] bg-[#111]" />
        <div className="flex w-[74%] flex-col gap-2 self-start">
          <div className="h-[52px] rounded-[14px] rounded-bl-[4px] border border-[#E7E7E4] bg-white" />
          <div className="flex h-[26px] w-[80%] items-center gap-2 rounded-[8px] border border-[#E7E7E4] bg-white px-2.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0B7A6E]" />
            <span className="h-[5px] flex-1 rounded-full bg-[#EDEDEA]" />
          </div>
        </div>
        <div className="h-[30px] w-[34%] self-end rounded-[14px] rounded-br-[4px] bg-[#0B7A6E]" />
      </div>
    ),
  },
  {
    title: "Bot katalog",
    body: "Upload katalog produk — pengunjung tanya harga, stok, atau ongkir dan dapat jawaban yang benar.",
    mock: (
      <div className="relative flex h-full flex-col justify-center gap-2.5">
        {[
          { chip: "bg-[#0B7A6E]", pill: "bg-[#111]", shift: "" },
          { chip: "bg-[#111]", pill: "bg-[#EDEDEA]", shift: "translate-x-4" },
          { chip: "bg-[#D9D9D4]", pill: "bg-[#EDEDEA]", shift: "" },
        ].map((row, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-[12px] border border-[#E7E7E4] bg-white p-3 ${row.shift}`}
          >
            <span className={`inline-block h-8 w-8 rounded-[9px] ${row.chip}`} />
            <span className="h-1.5 flex-1 rounded-full bg-[#EDEDEA]" />
            <span className={`inline-block h-[18px] w-11 rounded-full ${row.pill}`} />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Bot panduan",
    body: "Bantu pengguna baru memahami produkmu dari dokumen internal, tanpa menulis ulang isinya.",
    mock: (
      <div className="relative flex h-full items-center justify-center">
        <div className="flex w-[64%] flex-col gap-2.5 rounded-[12px] border border-[#E7E7E4] bg-white p-4.5 shadow-[0_18px_34px_-22px_rgba(0,0,0,.35)]">
          <span className="h-[9px] w-[52%] rounded-full bg-[#111]" />
          <span className="h-1.5 w-full rounded-full bg-[#EDEDEA]" />
          <span className="h-1.5 w-[88%] rounded-full bg-[#EDEDEA]" />
          <span className="h-1.5 w-full rounded-full bg-[#EDEDEA]" />
          <span className="h-1.5 w-[70%] rounded-full bg-[#0B7A6E]" />
          <span className="h-1.5 w-[94%] rounded-full bg-[#EDEDEA]" />
        </div>
        <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-[10px] bg-[#111] px-3 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
          <span className="inline-block h-[5px] w-[46px] rounded-full bg-white/55" />
        </div>
      </div>
    ),
  },
];

export function LandingProducts() {
  return (
    <div id="produk" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 sm:px-10">
      <div className="pt-24 pb-8 sm:pt-28">
        <h2 className="text-pretty m-0 max-w-[1000px] text-[34px] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[44px] lg:text-[56px] lg:leading-[1.05] lg:tracking-[-0.04em]">
          Satu bot untuk setiap pertanyaan berulang,{" "}
          <span className="whitespace-normal text-[#A1A1A6]">
            menjawab jam buka, kebijakan retur, dan cara bayar 24/7
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-8 pt-6 pb-20 sm:grid-cols-2 lg:grid-cols-3 lg:pb-25">
        {PRODUCTS.map((p) => (
          <div key={p.title} className="flex flex-col gap-4.5">
            <MockCard>{p.mock}</MockCard>
            <div>
              <p className="m-0 text-[22px] font-bold tracking-[-0.02em]">{p.title}</p>
              <p className="mt-2 mb-0 text-base leading-[1.55] text-[#52525B]">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
