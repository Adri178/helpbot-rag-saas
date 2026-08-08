import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded border px-3 py-2 text-sm"
          >
            Logout
          </button>
        </form>
      </header>

      <section className="flex flex-col items-center gap-3 rounded border border-dashed py-16 text-center">
        <p className="text-gray-600">Belum ada chatbot.</p>
        <button
          type="button"
          disabled
          title="Segera hadir di Fase 2"
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Buat Chatbot
        </button>
      </section>
    </main>
  );
}
