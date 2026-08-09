import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-end justify-between gap-4 border-b border-[#F0F0EE] px-5 py-6 sm:px-10 sm:py-7">
      <div className="flex min-w-0 flex-col gap-1.5">
        {backHref && (
          <Link href={backHref} className="text-[13px] font-semibold text-[#0B7A6E]">
            ← {backLabel ?? "Kembali"}
          </Link>
        )}
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.035em] text-[#0A0A0A] sm:text-[32px] lg:text-[36px]">
          {title}
        </h1>
        {subtitle && <p className="m-0 text-[15px] text-[#71717A]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 gap-2.5">{actions}</div>}
    </div>
  );
}
