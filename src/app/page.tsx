import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">HelpBot</h1>
      <p className="text-gray-600">
        Chatbot RAG untuk website bisnismu — dari dokumenmu sendiri.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded border px-4 py-2 text-sm"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          Daftar
        </Link>
      </div>
    </main>
  );
}
