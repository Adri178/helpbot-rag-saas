import Link from "next/link";
import { DemoWidgetTrigger } from "./DemoWidgetTrigger";

export function LandingFinalCTA() {
  return (
    <div className="border-t border-[#F0F0EE]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center sm:px-10 sm:py-24">
        <h2 className="text-balance m-0 max-w-[820px] text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[48px] lg:text-[60px] lg:leading-[1.0] lg:tracking-[-0.045em]">
          Biarkan dokumenmu <em className="italic">menjawab</em> pelanggan
          malam ini
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-[11px] bg-[#111] px-[26px] py-4 text-base font-semibold text-white"
          >
            Mulai gratis
          </Link>
          <DemoWidgetTrigger className="inline-flex items-center justify-center rounded-[11px] border border-[#DEDEDA] bg-white px-[26px] py-4 text-base font-semibold">
            Lihat demo
          </DemoWidgetTrigger>
        </div>
      </div>
    </div>
  );
}
