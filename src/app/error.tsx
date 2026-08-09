"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-[13px] tracking-[.12em] text-[#9F1239] uppercase">
        Error
      </span>
      <h1 className="text-pretty m-0 max-w-[520px] text-[32px] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[40px]">
        Ada yang bermasalah di sisi kami
      </h1>
      <p className="m-0 max-w-[440px] text-[15px] leading-[1.6] text-[#71717A]">
        Coba muat ulang halaman ini. Kalau masih gagal, tunggu sebentar lalu
        coba lagi.
      </p>
      {/* Next.js's error digest — the only safe identifier to surface, and
          the one to quote when checking server logs. Never render
          error.message here: it can carry upstream API text. */}
      {error.digest && (
        <p className="font-mono m-0 text-xs text-[#A1A1A6]">
          Kode: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[10px] bg-[#111] px-5 py-3 text-sm font-semibold text-white"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="rounded-[10px] border border-[#DEDEDA] px-5 py-3 text-sm font-semibold text-[#111]"
        >
          Ke beranda
        </Link>
      </div>
    </main>
  );
}
