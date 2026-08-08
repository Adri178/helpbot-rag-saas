/**
 * Retrieval + faithfulness evaluation for the RAG pipeline (plan.md
 * Phase 5). Spins up a throwaway chatbot + document from the fixture,
 * asks every question in EVAL_QUESTIONS through the real pipeline
 * (Supabase + Gemini — this costs real API calls, so it's not part of
 * `npm run test`), scores the results, writes eval/results.md, then
 * deletes everything it created.
 *
 * Usage: npm run eval
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createAdminClient } from "../src/lib/supabase/admin";
import { processDocument } from "../src/lib/ingest/process";
import { answerQuestion } from "../src/lib/chat/answer";
import { OUT_OF_SCOPE_ANSWER } from "../src/lib/chat/context";
import { EVAL_QUESTIONS, FIXTURE_DOCUMENT } from "./fixture";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

interface QuestionResult {
  question: string;
  type: "in-scope" | "out-of-scope";
  answer: string;
  pass: boolean;
  detail: string;
}

async function main() {
  loadEnv();
  const supabase = createAdminClient();

  console.log("--- setting up eval fixture ---");
  const { data: user, error: userError } =
    await supabase.auth.admin.createUser({
      email: `eval-${Date.now()}@example.com`,
      password: crypto.randomUUID(),
      email_confirm: true,
    });
  if (userError || !user.user) {
    throw new Error(`Failed to create eval user: ${userError?.message}`);
  }

  try {
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .insert({ user_id: user.user.id, name: "Eval Bot" })
      .select("id")
      .single();
    if (chatbotError || !chatbot) {
      throw new Error(`Failed to create eval chatbot: ${chatbotError?.message}`);
    }

    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        chatbot_id: chatbot.id,
        filename: "fixture.txt",
        source_type: "faq",
      })
      .select("id")
      .single();
    if (docError || !document) {
      throw new Error(`Failed to create eval document: ${docError?.message}`);
    }

    await processDocument(supabase, {
      documentId: document.id,
      chatbotId: chatbot.id,
      text: FIXTURE_DOCUMENT,
    });

    console.log(`--- asking ${EVAL_QUESTIONS.length} questions ---`);
    const results: QuestionResult[] = [];

    for (const q of EVAL_QUESTIONS) {
      const { answer, sources } = await answerQuestion(supabase, {
        chatbotId: chatbot.id,
        question: q.question,
      });

      if (q.type === "in-scope") {
        const hit = sources.some((s) =>
          s.content.toLowerCase().includes(q.expectedChunkContains.toLowerCase())
        );
        const faithful = answer
          .toLowerCase()
          .includes(q.expectedAnswerContains.toLowerCase());
        results.push({
          question: q.question,
          type: q.type,
          answer,
          pass: hit && faithful,
          detail: `retrieval hit: ${hit ? "✅" : "❌"}, faithful: ${faithful ? "✅" : "❌"}`,
        });
      } else {
        const refused = answer.trim() === OUT_OF_SCOPE_ANSWER;
        results.push({
          question: q.question,
          type: q.type,
          answer,
          pass: refused,
          detail: refused ? "menolak dengan kalimat baku ✅" : "TIDAK menolak dengan kalimat baku ❌",
        });
      }
      console.log(`  [${results.at(-1)!.pass ? "PASS" : "FAIL"}] ${q.question}`);
    }

    writeReport(results);
  } finally {
    console.log("--- cleaning up eval fixture ---");
    await supabase.auth.admin.deleteUser(user.user.id);
  }
}

function writeReport(results: QuestionResult[]) {
  const inScope = results.filter((r) => r.type === "in-scope");
  const outOfScope = results.filter((r) => r.type === "out-of-scope");

  const hitRate =
    inScope.length === 0
      ? 0
      : (inScope.filter((r) => r.detail.includes("retrieval hit: ✅")).length /
          inScope.length) *
        100;
  const faithfulness =
    inScope.length === 0
      ? 0
      : (inScope.filter((r) => r.pass).length / inScope.length) * 100;
  const refusalConsistency =
    outOfScope.length === 0
      ? 0
      : (outOfScope.filter((r) => r.pass).length / outOfScope.length) * 100;

  const lines: string[] = [];
  lines.push("# Hasil Evaluasi RAG");
  lines.push("");
  lines.push(`Terakhir dijalankan: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Ringkasan");
  lines.push("");
  lines.push("| Metrik | Nilai | Definisi |");
  lines.push("| --- | --- | --- |");
  lines.push(
    `| Hit rate (retrieval) | ${hitRate.toFixed(0)}% (${inScope.length} pertanyaan in-scope) | Chunk yang benar (mengandung fakta yang dicari) ada di sumber yang diambil |`
  );
  lines.push(
    `| Faithfulness | ${faithfulness.toFixed(0)}% (${inScope.length} pertanyaan in-scope) | Jawaban benar-benar memuat fakta dari chunk yang diambil (bukan sekadar retrieval-nya benar) |`
  );
  lines.push(
    `| Konsistensi penolakan | ${refusalConsistency.toFixed(0)}% (${outOfScope.length} pertanyaan out-of-scope) | Pertanyaan di luar dokumen selalu ditolak dengan kalimat baku yang sama |`
  );
  lines.push("");
  lines.push("## Detail per pertanyaan");
  lines.push("");
  lines.push("| # | Tipe | Pertanyaan | Hasil | Detail | Jawaban |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  results.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | ${r.type} | ${r.question} | ${r.pass ? "✅" : "❌"} | ${r.detail} | ${r.answer.replace(/\|/g, "\\|").replace(/\n/g, " ")} |`
    );
  });
  lines.push("");

  const outPath = path.join(__dirname, "results.md");
  fs.writeFileSync(outPath, lines.join("\n"));

  console.log("");
  console.log(`Hit rate: ${hitRate.toFixed(0)}%`);
  console.log(`Faithfulness: ${faithfulness.toFixed(0)}%`);
  console.log(`Konsistensi penolakan: ${refusalConsistency.toFixed(0)}%`);
  console.log(`Laporan ditulis ke ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
