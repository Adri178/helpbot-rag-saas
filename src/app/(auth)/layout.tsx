import Link from "next/link";

const POINTS = [
  "Jawaban hanya dari dokumenmu, dengan kutipan sumber",
  "Menolak jujur kalau jawabannya tidak ada",
  "Pasang di website manapun dengan satu baris kode",
];

/**
 * Split-screen shell shared by /login and /register — mirrors the landing
 * hero's layout (form on the left, teal brand panel on the right) so the
 * jump from marketing page to sign-up doesn't feel like a different app.
 * The right panel is hidden below lg: on mobile the form is all that
 * matters.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#0B7A6E] text-[15px] font-bold text-white">
            H
          </div>
          <span className="text-xl font-bold tracking-tight">HelpBot</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>

        <p className="text-center text-[13px] text-[#A1A1A6]">
          © 2026 HelpBot
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-[#0B7A6E] lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg,rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(225deg,rgba(255,255,255,.07) 1px,transparent 1px)",
            backgroundSize: "120px 120px",
          }}
        />
        <div className="relative flex h-full flex-col justify-center gap-8 px-14">
          <h2 className="text-pretty m-0 max-w-[440px] text-[40px] font-bold leading-[1.05] tracking-[-0.035em] text-white">
            Biarkan dokumenmu <em className="italic">menjawab</em> pelanggan
          </h2>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-white/85">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5EEAD4]" />
                <span className="text-[15px] leading-[1.55] whitespace-normal">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
