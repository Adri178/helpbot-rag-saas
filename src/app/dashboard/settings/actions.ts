"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SettingsFormState = { error: string } | null;

export async function updateName(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const { error } = await supabase
    .from("profiles")
    .update({ name: name || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return null;
}

/**
 * Real and destructive: deletes the auth user via the admin API (RLS
 * doesn't apply to auth.users at all — this is the GoTrue admin endpoint,
 * separate from Postgres). The id being deleted always comes from the
 * caller's own verified session, never from client input, so this can
 * only ever delete the signed-in user's own account. Cascades to every
 * chatbot/document/chunk/conversation/message/usage row via the FKs set
 * up back in Phase 1-6's migrations.
 */
export async function deleteAccount(): Promise<SettingsFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  redirect("/");
}
