import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/billing/plans";
import { currentMonthKey } from "@/lib/billing/usage";
import { DashboardSidebar } from "./_shell/DashboardSidebar";

// Same design-import fonts as the landing page (src/app/page.tsx),
// scoped here too so the dashboard doesn't mix with the rest of the app's
// Geist fonts from the root layout.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user?.id ?? "")
    .single();
  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const { data: usageRow } = await supabase
    .from("usage")
    .select("message_count")
    .eq("user_id", user?.id ?? "")
    .eq("month", currentMonthKey())
    .maybeSingle();

  return (
    <div
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} flex h-screen overflow-hidden bg-white text-[#0A0A0A] antialiased [font-family:var(--font-instrument-sans),Helvetica,sans-serif] [&_.font-mono]:[font-family:var(--font-jetbrains-mono),monospace]`}
    >
      <DashboardSidebar
        email={user?.email ?? ""}
        plan={plan}
        messagesUsed={usageRow?.message_count ?? 0}
        messagesLimit={limits.maxMessagesPerMonth}
      />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
