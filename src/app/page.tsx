import Link from "next/link";
import Script from "next/script";

const FEATURES = [
  {
    title: "Jawaban dari dokumenmu sendiri",
    body: "Upload FAQ, katalog, atau panduan — bot menjawab berdasarkan itu saja, bukan mengarang dari pengetahuan umum.",
  },
  {
    title: "Kutipan sumber di tiap jawaban",
    body: "Setiap jawaban menyertakan potongan dokumen yang jadi dasarnya, supaya pengunjung (dan kamu) bisa verifikasi.",
  },
  {
    title: "Nolak jujur kalau tidak tahu",
    body: 'Kalau jawabannya tidak ada di dokumen, bot bilang \"tidak ada di data saya\" — bukan mengarang.',
  },
  {
    title: "Tinggal tempel satu baris kode",
    body: "Widget chat embeddable, aman, dan terisolasi per bot — pasang di website manapun tanpa build step.",
  },
];

export default function Home() {
  const demoChatbotId = process.env.NEXT_PUBLIC_DEMO_CHATBOT_ID;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-16 px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">HelpBot</h1>
        <p className="max-w-xl text-lg text-gray-600">
          Chatbot RAG untuk website bisnismu — dijawab dari dokumenmu sendiri,
          lengkap dengan kutipan sumber, tanpa perlu coding.
        </p>
        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Daftar Gratis
          </Link>
          <Link href="/login" className="rounded border px-5 py-3 text-sm font-medium">
            Login
          </Link>
        </div>
        {demoChatbotId && (
          <p className="text-sm text-gray-500">
            Atau coba dulu — klik bubble chat di pojok kanan bawah halaman ini 👇
          </p>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded border p-5">
            <h2 className="font-medium">{f.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t pt-6 text-center text-sm text-gray-500">
        HelpBot — proyek portofolio RAG multi-tenant. Dibangun dengan Next.js,
        Supabase (Postgres + pgvector), dan Gemini.
      </footer>

      {demoChatbotId && (
        <Script
          src="/widget.js"
          data-chatbot-id={demoChatbotId}
          strategy="afterInteractive"
        />
      )}
    </main>
  );
}
