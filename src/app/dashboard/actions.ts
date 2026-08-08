"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateChatbotState = { error: string } | null;

export async function createChatbot(
  _prevState: CreateChatbotState,
  formData: FormData
): Promise<CreateChatbotState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Nama chatbot wajib diisi." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("chatbots")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Gagal membuat chatbot." };
  }

  redirect(`/dashboard/${data.id}`);
}
