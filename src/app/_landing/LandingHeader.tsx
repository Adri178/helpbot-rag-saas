import Link from "next/link";

export function LandingHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-[#F0F0EE] bg-white/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-6 py-[18px] sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#0B7A6E] text-[15px] font-bold text-white">
            H
          </div>
          <span className="text-xl font-bold tracking-tight">HelpBot</span>
        </div>

        <nav className="hidden items-center gap-[30px] text-[15px] font-medium text-[#3F3F46] md:flex">
          <a href="#produk" className="hover:text-[#0B7A6E]">
            Produk
          </a>
          <a href="#cara" className="hover:text-[#0B7A6E]">
            Cara kerja
          </a>
          <a href="#bukti" className="hover:text-[#0B7A6E]">
            Kutipan sumber
          </a>
          <a href="#harga" className="hover:text-[#0B7A6E]">
            Harga
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[15px] font-medium text-[#3F3F46] hover:text-[#0B7A6E]">
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-[9px] bg-[#111] px-[18px] py-[10px] text-sm font-semibold text-white"
          >
            Coba gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
