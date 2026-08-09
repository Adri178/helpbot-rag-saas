import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-[13px] tracking-[.12em] text-[#0B7A6E] uppercase">
        404
      </span>
      <h1 className="text-pretty m-0 max-w-[520px] text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">
        Halaman ini tidak ada di data kami
      </h1>
      <p className="m-0 max-w-[420px] text-[15px] leading-[1.6] text-[#71717A]">
        Mungkin tautannya salah ketik, atau halamannya sudah dipindah.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-[10px] bg-[#111] px-5 py-3 text-sm font-semibold text-white"
        >
          Ke beranda
        </Link>
        <Link
          href="/dashboard"
          className="rounded-[10px] border border-[#DEDEDA] px-5 py-3 text-sm font-semibold text-[#111]"
        >
          Ke dashboard
        </Link>
      </div>
    </main>
  );
}
