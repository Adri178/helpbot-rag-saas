"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../../(auth)/actions";
import { UpgradeButton } from "../UpgradeButton";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

interface ShellProps {
  email: string;
  plan: string;
  messagesUsed: number;
  messagesLimit: number;
}

function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex-shrink-0 text-[13px] font-medium text-[#71717A] hover:text-[#0B7A6E]"
      >
        Keluar
      </button>
    </form>
  );
}

/** Vertical sidebar — lg and up only. Below that the 248px fixed width
 * left just ~140px of content on a phone, so DashboardTopBar takes over. */
export function DashboardSidebar({ email, plan, messagesUsed, messagesLimit }: ShellProps) {
  const pathname = usePathname() ?? "";
  const usedPct = Math.min(100, Math.round((messagesUsed / messagesLimit) * 100));

  return (
    <div className="hidden h-full w-[248px] flex-shrink-0 flex-col gap-6 border-r border-[#F0F0EE] bg-[#FAFAF9] p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0B7A6E] text-sm font-bold text-white">
          H
        </div>
        <span className="text-lg font-bold tracking-tight text-[#111]">HelpBot</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
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
          <span className="text-[13px] font-semibold text-[#111] capitalize">
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
        <LogoutButton />
      </div>
    </div>
  );
}

/** Compact top bar for below-lg. Mirrors the source design's own "1b"
 * top-nav variant rather than inventing a third navigation pattern. */
export function DashboardTopBar({ email, plan, messagesUsed, messagesLimit }: ShellProps) {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex flex-shrink-0 flex-col border-b border-[#F0F0EE] bg-[#FAFAF9] lg:hidden">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0B7A6E] text-sm font-bold text-white">
            H
          </div>
          <span className="text-lg font-bold tracking-tight text-[#111]">HelpBot</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#E7E7E4] bg-white px-2.5 py-1 font-mono text-[11px] text-[#71717A]">
            <span className="font-sans font-semibold text-[#111] capitalize">{plan}</span>{" "}
            {messagesUsed}/{messagesLimit}
          </span>
          <LogoutButton />
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex-shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                active
                  ? "border border-[#0B7A6E]/30 bg-[#0B7A6E]/10 text-[#0B7A6E]"
                  : "border border-[#E7E7E4] bg-white text-[#52525B]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <span className="sr-only">Masuk sebagai {email}</span>
    </div>
  );
}
