import Link from "next/link";
import { DemoWidgetTrigger } from "./DemoWidgetTrigger";

export function LandingHero() {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex flex-col items-start gap-7 px-6 py-16 sm:px-10 lg:py-26">
        <div className="flex items-center gap-2.5 rounded-full border border-[#E7E7E4] py-1.5 pr-3 pl-2">
          <span className="inline-block h-5 w-5 flex-shrink-0 rounded-[6px] bg-[#0B7A6E]" />
          <span className="text-[13px] font-medium text-[#3F3F46]">
            Dipakai 400+ toko online di Indonesia
          </span>
        </div>

        <h1 className="text-pretty text-[46px] font-bold leading-[0.98] tracking-[-0.04em] sm:text-[58px] lg:text-[70px] lg:leading-[0.96] lg:tracking-[-0.045em]">
          Chatbot yang <em className="italic">tahu</em> isi dokumen bisnismu
        </h1>

        <p className="text-pretty max-w-[470px] text-lg leading-[1.55] text-[#52525B] sm:text-[19px]">
          Upload FAQ, katalog, atau panduan. HelpBot menjawab pengunjung
          websitemu hanya dari dokumen itu — dengan kutipan sumber, dan
          berkata jujur kalau jawabannya tidak ada.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-[11px] bg-[#111] px-[26px] py-4 text-base font-semibold text-white"
          >
            Mulai gratis
          </Link>
          <DemoWidgetTrigger className="inline-flex items-center justify-center rounded-[11px] border border-[#DEDEDA] bg-white px-[26px] py-4 text-base font-semibold text-[#111]">
            Lihat demo
          </DemoWidgetTrigger>
        </div>

        <p className="text-sm text-[#8A8A94]">
          Gratis 1 chatbot · tanpa kartu kredit · pasang 1 baris kode
        </p>
      </div>

      <div className="relative min-h-[420px] overflow-hidden bg-[#0B7A6E] lg:min-h-[660px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg,rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(225deg,rgba(255,255,255,.07) 1px,transparent 1px)",
            backgroundSize: "120px 120px",
          }}
        />

        <div className="absolute inset-x-6 top-10 overflow-hidden rounded-[20px] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.45)] sm:inset-x-12 sm:top-[70px] sm:right-7">
          <div className="flex items-center gap-2.5 border-b border-[#F0F0EE] px-5 py-4">
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#0B7A6E] text-[13px] font-bold text-white">
              H
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Toko Sinar Jaya</span>
              <span className="text-xs font-medium text-[#0B7A6E]">
                Online · dijawab dari 3 dokumen
              </span>
            </div>
          </div>
          <div className="flex min-h-[220px] flex-col gap-3.5 px-5 py-5 sm:min-h-[270px]">
            <div className="max-w-[74%] self-end rounded-[16px] rounded-br-[4px] bg-[#111] px-4 py-3 text-sm leading-[1.45] text-white">
              Retur barang bisa berapa hari?
            </div>
            <div className="flex max-w-[82%] flex-col gap-2 self-start">
              <div className="rounded-[16px] rounded-bl-[4px] bg-[#F4F4F3] px-4 py-3 text-sm leading-[1.5] text-[#18181B]">
                Retur diterima maksimal 7 hari setelah barang sampai, dengan
                kemasan asli dan bukti pembelian.
              </div>
              <div className="flex items-center gap-2 rounded-[10px] border border-[#E7E7E4] bg-white px-3 py-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0B7A6E]" />
                <span className="overflow-hidden text-ellipsis font-mono text-[11px] text-[#52525B]">
                  Sumber: kebijakan-retur.pdf · hlm 2
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#F0F0EE] px-5 py-3.5">
            <span className="text-sm text-[#A1A1A6]">Tanya sesuatu…</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#111] text-sm text-white">
              ↑
            </span>
          </div>
        </div>

        <div className="absolute bottom-20 left-6 hidden whitespace-nowrap rounded-[14px] bg-white px-4 py-3 text-sm font-medium text-[#18181B] shadow-[0_20px_40px_-20px_rgba(0,0,0,.4)] sm:block sm:left-14">
          Jam buka hari Minggu?
        </div>
        <div className="absolute bottom-8 left-6 hidden whitespace-nowrap rounded-[14px] bg-[#0A0A0A] px-4 py-3 text-sm font-medium text-white shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)] sm:block sm:left-[56px]">
          Itu tidak ada di data saya.
        </div>
      </div>
    </div>
  );
}
