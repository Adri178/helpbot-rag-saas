import Link from "next/link";
import { PLAN_LIMITS, PRO_PLAN_PRICE_IDR } from "@/lib/billing/plans";

function formatIdr(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function Bullet({ children, dot }: { children: React.ReactNode; dot: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export function LandingPricing() {
  const free = PLAN_LIMITS.free;
  const pro = PLAN_LIMITS.pro;

  return (
    <div id="harga" className="scroll-mt-24 border-t border-[#F0F0EE] bg-[#FAFAF9]">
      <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24">
        <div className="mb-10 flex flex-col items-center gap-3.5 text-center sm:mb-13">
          <h2 className="m-0 text-[34px] font-bold tracking-[-0.035em] sm:text-[44px] lg:text-[52px] lg:tracking-[-0.04em]">
            Harga yang <em className="italic">jujur</em>
          </h2>
          <p className="m-0 max-w-[520px] text-base leading-[1.55] text-[#52525B] sm:text-[17px]">
            Mulai gratis selamanya. Naik ke Pro kalau pelangganmu sudah
            banyak bertanya.
          </p>
        </div>

        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-[20px] border border-[#E7E7E4] bg-white p-8">
            <div>
              <p className="m-0 text-[17px] font-semibold">Free</p>
              <p className="mt-2.5 mb-0 text-[36px] font-bold tracking-[-0.04em] sm:text-[44px]">
                Rp 0
              </p>
              <p className="mt-1.5 mb-0 text-sm text-[#71717A]">selamanya</p>
            </div>
            <div className="flex flex-col gap-2.5 text-[15px] text-[#3F3F46]">
              <Bullet dot="bg-[#0B7A6E]">{free.maxChatbots} chatbot</Bullet>
              <Bullet dot="bg-[#0B7A6E]">{free.maxDocumentsPerChatbot} dokumen per bot</Bullet>
              <Bullet dot="bg-[#0B7A6E]">
                {free.maxMessagesPerMonth.toLocaleString("id-ID")} pesan / bulan
              </Bullet>
              <Bullet dot="bg-[#0B7A6E]">Kutipan sumber lengkap</Bullet>
            </div>
            <Link
              href="/register"
              className="mt-auto inline-flex items-center justify-center rounded-[10px] border border-[#DEDEDA] bg-white py-3.5 text-[15px] font-semibold"
            >
              Mulai gratis
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-[20px] bg-[#111] p-8 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[17px] font-semibold">Pro</p>
                <p className="mt-2.5 mb-0 text-[36px] font-bold tracking-[-0.04em] sm:text-[44px]">
                  {formatIdr(PRO_PLAN_PRICE_IDR)}
                </p>
                <p className="mt-1.5 mb-0 text-sm text-white/60">per bulan</p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-[#0B7A6E] px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
                Paling dipilih
              </span>
            </div>
            <div className="flex flex-col gap-2.5 text-[15px] text-white/82">
              <Bullet dot="bg-[#5EEAD4]">{pro.maxChatbots} chatbot</Bullet>
              <Bullet dot="bg-[#5EEAD4]">{pro.maxDocumentsPerChatbot} dokumen per bot</Bullet>
              <Bullet dot="bg-[#5EEAD4]">
                {pro.maxMessagesPerMonth.toLocaleString("id-ID")} pesan / bulan
              </Bullet>
              <Bullet dot="bg-[#5EEAD4]">Hapus branding widget</Bullet>
            </div>
            <Link
              href="/register"
              className="mt-auto inline-flex items-center justify-center rounded-[10px] bg-white py-3.5 text-[15px] font-semibold text-[#111]"
            >
              Upgrade ke Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
