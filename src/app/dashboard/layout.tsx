import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/billing/plans";
import { currentMonthKey } from "@/lib/billing/usage";
import { DashboardSidebar, DashboardTopBar } from "./_shell/DashboardSidebar";

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

  const shellProps = {
    email: user?.email ?? "",
    plan,
    messagesUsed: usageRow?.message_count ?? 0,
    messagesLimit: limits.maxMessagesPerMonth,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar {...shellProps} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopBar {...shellProps} />
        {children}
      </div>
    </div>
  );
}
