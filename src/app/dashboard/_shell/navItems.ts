export const NAV_ITEMS = [
  { href: "/dashboard", label: "Chatbot" },
  { href: "/dashboard/conversations", label: "Percakapan" },
  { href: "/dashboard/usage", label: "Penggunaan" },
  { href: "/dashboard/settings", label: "Pengaturan" },
] as const;

const SECTION_PREFIXES = [
  "/dashboard/conversations",
  "/dashboard/usage",
  "/dashboard/settings",
];

/** Pure so it can be unit-tested: /dashboard/[chatbotId] must highlight
 * "Chatbot", not fall through to no active item. */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    if (pathname === "/dashboard") return true;
    return (
      pathname.startsWith("/dashboard/") &&
      !SECTION_PREFIXES.some((p) => pathname.startsWith(p))
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}
