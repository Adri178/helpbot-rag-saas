import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";
import { CreateChatbotForm } from "./CreateChatbotForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded border px-3 py-2 text-sm">
            Logout
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Chatbot kamu</h2>
        <CreateChatbotForm />

        {chatbots && chatbots.length > 0 ? (
          <ul className="divide-y rounded border">
            {chatbots.map((bot) => (
              <li key={bot.id}>
                <Link
                  href={`/dashboard/${bot.id}`}
                  className="block px-4 py-3 hover:bg-gray-50"
                >
                  {bot.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded border border-dashed py-16 text-center text-gray-600">
            Belum ada chatbot.
          </div>
        )}
      </section>
    </main>
  );
}
