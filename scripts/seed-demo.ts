/**
 * Seeds (idempotently) the public demo chatbot used on the landing page's
 * no-login demo widget (Phase 7 — PRD criterion "mode demo tanpa login").
 * Safe to re-run: finds the existing demo user/chatbot instead of
 * duplicating them.
 *
 * Usage: npx tsx scripts/seed-demo.ts
 * Prints the chatbot id to put in NEXT_PUBLIC_DEMO_CHATBOT_ID.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createAdminClient } from "../src/lib/supabase/admin";
import { processDocument } from "../src/lib/ingest/process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_EMAIL = "demo@helpbot.internal";
const DEMO_CHATBOT_NAME = "HelpBot Demo";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const DEMO_DOCUMENT = `
HelpBot adalah AI SaaS yang membuatkan chatbot customer service untuk pemilik bisnis kecil, tanpa perlu coding. Pemilik bisnis mengupload dokumen (FAQ, katalog, panduan), lalu sistem menghasilkan chatbot yang menjawab pertanyaan pengunjung website berdasarkan dokumen tersebut.

Inti teknis HelpBot adalah RAG (Retrieval-Augmented Generation): pertanyaan pengunjung diubah jadi embedding, dicocokkan dengan potongan dokumen yang paling relevan lewat pgvector, lalu jawaban disusun oleh model bahasa Gemini berdasarkan potongan itu saja — bukan dari pengetahuan umum model.

Setiap jawaban HelpBot menyertakan kutipan sumber, yaitu potongan dokumen asli yang jadi dasar jawaban tersebut. Kamu sedang membaca hasil dari dokumen ini sekarang.

Kalau jawabannya tidak ada di dokumen, HelpBot akan bilang tidak punya informasi itu — bukan mengarang jawaban. Ini disebut grounding, dan diuji lewat skrip evaluasi otomatis di setiap perubahan kode.

HelpBot bersifat multi-tenant: setiap chatbot hanya bisa mengambil dokumen milik pemiliknya sendiri. Isolasi ini dijaga lewat Row Level Security di database, bukan cuma lewat kode aplikasi.

Chatbot HelpBot bisa dipasang di website manapun cukup dengan menempel satu baris kode <script>. Widget-nya berjalan mandiri tanpa dependency tambahan.

HelpBot punya paket Free dan Pro. Paket Free dibatasi 1 chatbot, 3 dokumen per chatbot, dan 100 pesan per bulan. Paket Pro membuka batas yang jauh lebih besar.

Chatbot demo yang sedang kamu ajak bicara ini dibuat otomatis lewat skrip seed, dan berjalan di paket Pro supaya tidak cepat kehabisan kuota pesan bulanan.
`.trim();

async function main() {
  loadEnv();
  const supabase = createAdminClient();

  console.log("--- finding or creating demo user ---");
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw new Error(`Failed to list users: ${listError.message}`);

  let demoUserId = userList.users.find((u) => u.email === DEMO_EMAIL)?.id;

  if (!demoUserId) {
    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: crypto.randomUUID(), // nobody logs in as this account
        email_confirm: true,
      });
    if (createError || !created.user) {
      throw new Error(`Failed to create demo user: ${createError?.message}`);
    }
    demoUserId = created.user.id;
    console.log("created demo user", demoUserId);
  } else {
    console.log("demo user already exists", demoUserId);
  }

  // Pro plan so public landing-page traffic doesn't exhaust the 100
  // msg/month free-tier cap and break the demo for visitors.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", demoUserId);
  if (profileError) throw new Error(`Failed to set demo plan: ${profileError.message}`);

  console.log("--- finding or creating demo chatbot ---");
  const { data: existingChatbot } = await supabase
    .from("chatbots")
    .select("id")
    .eq("user_id", demoUserId)
    .eq("name", DEMO_CHATBOT_NAME)
    .maybeSingle();

  let chatbotId = existingChatbot?.id as string | undefined;

  if (!chatbotId) {
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .insert({
        user_id: demoUserId,
        name: DEMO_CHATBOT_NAME,
        greeting: "Halo! Tanya apa saja soal HelpBot 👋",
      })
      .select("id")
      .single();
    if (chatbotError || !chatbot) {
      throw new Error(`Failed to create demo chatbot: ${chatbotError?.message}`);
    }
    const newChatbotId: string = chatbot.id;
    chatbotId = newChatbotId;
    console.log("created demo chatbot", newChatbotId);

    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        chatbot_id: newChatbotId,
        filename: "tentang-helpbot.txt",
        source_type: "faq",
      })
      .select("id")
      .single();
    if (docError || !document) {
      throw new Error(`Failed to create demo document: ${docError?.message}`);
    }

    await processDocument(supabase, {
      documentId: document.id,
      chatbotId: newChatbotId,
      text: DEMO_DOCUMENT,
    });
    console.log("demo document processed");
  } else {
    console.log("demo chatbot already exists", chatbotId);
  }

  console.log("");
  console.log("Done. Set this in .env.local and Vercel env vars:");
  console.log(`NEXT_PUBLIC_DEMO_CHATBOT_ID=${chatbotId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
