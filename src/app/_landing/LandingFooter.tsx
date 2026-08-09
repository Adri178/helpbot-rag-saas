const COLUMNS = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#produk" },
      { label: "Harga", href: "#harga" },
      { label: "Widget", href: "#cara" },
    ],
  },
  {
    title: "Sumber daya",
    links: [
      { label: "Dokumentasi", href: "https://github.com/Adri178/helpbot#readme" },
      { label: "Evaluasi RAG", href: "#bukti" },
      { label: "Keamanan", href: "https://github.com/Adri178/helpbot#keamanan--isolasi-tenant" },
    ],
  },
];

export function LandingFooter() {
  return (
    <div className="border-t border-[#F0F0EE] bg-[#FAFAF9]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-10 px-6 py-14 sm:px-10 sm:flex-row">
        <div className="flex max-w-[300px] flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#0B7A6E] text-[13px] font-bold text-white">
              H
            </div>
            <span className="text-[17px] font-bold tracking-tight">HelpBot</span>
          </div>
          <p className="m-0 text-sm leading-[1.55] text-[#71717A]">
            Chatbot customer service dari dokumenmu sendiri — dengan kutipan
            sumber.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 text-sm sm:gap-16">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <span className="font-semibold">{col.title}</span>
              {col.links.map((l) => (
                <a key={l.label} href={l.href} className="text-[#71717A] hover:text-[#0B7A6E]">
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 pb-10 sm:px-10">
        <p className="m-0 text-[13px] text-[#A1A1A6]">
          © 2026 HelpBot. Dibangun dengan Next.js, Supabase, dan Gemini.
        </p>
      </div>
    </div>
  );
}
