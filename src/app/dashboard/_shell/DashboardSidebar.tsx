"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../../(auth)/actions";
import { UpgradeButton } from "../UpgradeButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Chatbot" },
  { href: "/dashboard/conversations", label: "Percakapan" },
  { href: "/dashboard/usage", label: "Penggunaan" },
  { href: "/dashboard/settings", label: "Pengaturan" },
];

export function DashboardSidebar({
  email,
  plan,
  messagesUsed,
  messagesLimit,
}: {
  email: string;
  plan: string;
  messagesUsed: number;
  messagesLimit: number;
}) {
  const pathname = usePathname();
  const usedPct = Math.min(100, Math.round((messagesUsed / messagesLimit) * 100));

  function isActive(href: string) {
    if (href === "/dashboard") {
      // Chatbot list AND chatbot detail pages both count as "Chatbot".
      return (
        pathname === "/dashboard" ||
        (pathname?.startsWith("/dashboard/") &&
          !["/dashboard/conversations", "/dashboard/usage", "/dashboard/settings"].some((p) =>
            pathname.startsWith(p)
          ))
      );
    }
    return pathname === href;
  }

  return (
    <div className="flex h-full w-[248px] flex-shrink-0 flex-col gap-6 border-r border-[#F0F0EE] bg-[#FAFAF9] p-4">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0B7A6E] text-sm font-bold text-white">
          H
        </div>
        <span className="text-lg font-bold tracking-tight text-[#111]">HelpBot</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm font-medium ${
                active
                  ? "border border-[#0B7A6E]/25 bg-[#0B7A6E]/8 text-[#0B7A6E]"
                  : "border border-transparent text-[#3F3F46] hover:bg-white"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  active ? "bg-[#0B7A6E]" : "bg-[#D4D4D8]"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 rounded-[14px] border border-[#E7E7E4] bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold capitalize text-[#111]">
            Paket {plan}
          </span>
          <span className="font-mono text-[11px] text-[#71717A]">
            {messagesUsed}/{messagesLimit}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F0F0EE]">
          <div className="h-full bg-[#0B7A6E]" style={{ width: `${usedPct}%` }} />
        </div>
        {plan === "free" && (
          <UpgradeButton className="inline-flex items-center justify-center rounded-[8px] bg-[#111] px-3 py-[9px] text-[13px] font-semibold text-white disabled:opacity-50" />
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E7E7E4] text-xs font-semibold text-[#52525B]">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-[13px] text-[#52525B]">{email}</span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex-shrink-0 text-[13px] font-medium text-[#71717A] hover:text-[#0B7A6E]"
          >
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}
