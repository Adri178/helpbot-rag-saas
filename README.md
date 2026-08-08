# HelpBot — AI Support-Agent Builder

Chatbot RAG multi-tenant: pemilik bisnis kecil upload dokumen (FAQ, katalog,
panduan), dapat chatbot yang menjawab dari dokumen itu — lengkap dengan
kutipan sumber, dan penolakan jujur kalau jawabannya tidak ada — lalu
tempel satu baris `<script>` di website mereka.

**Demo:** _(diisi setelah deploy — lihat [plan.md](plan.md) Fase 7)_
**Coba tanpa daftar:** buka demo di atas, klik bubble chat di pojok kanan
bawah.

---

## Masalah

Bisnis kecil tidak punya waktu/uang untuk customer service 24 jam, dan
pertanyaan pelanggan sering berulang (jam buka, kebijakan retur, cara
pembayaran, dsb). Menjawab manual di WhatsApp/DM setiap saat tidak
scalable.

## Solusi

HelpBot membiarkan pemilik bisnis mengupload dokumen mereka sendiri, lalu
sistem otomatis: ekstrak teks → potong jadi chunk → embed (Gemini) →
simpan sebagai vektor di Postgres (pgvector). Saat pengunjung bertanya,
sistem mencari chunk paling relevan, dan meminta model bahasa menjawab
**hanya** berdasarkan chunk itu — bukan dari pengetahuan umum model.

Dua guardrail inti yang membuat ini bisa dipercaya, bukan cuma "demo yang
kelihatan jalan":

- **Grounding**: kalau tidak ada chunk relevan, bot menjawab "tidak ada di
  data saya" — diverifikasi lewat [skrip evaluasi](#evaluasi) otomatis,
  bukan cuma dicoba manual sekali.
- **Isolasi tenant**: chatbot milik user A tidak pernah bisa mengambil
  chunk milik user B. Dijaga di level database (Row Level Security),
  bukan cuma dicek di kode aplikasi — lihat [Keamanan](#keamanan--isolasi-tenant).

## Arsitektur

```
Pengunjung website ──▶ widget.js (embed) ──▶ /api/public-chat
                                                    │
Pemilik bisnis ──▶ Dashboard (Next.js) ──▶ /api/chat
                                                    │
                                                    ▼
                              embed pertanyaan (Gemini) ──▶ match_chunks() RPC
                                                    │        (pgvector cosine search,
                                                    │         scoped ke satu chatbot_id)
                                                    ▼
                              susun konteks + system prompt ──▶ Gemini Flash
                                                    │
                                                    ▼
                              jawaban + sumber ──▶ disimpan ke conversations/messages
```

**Pipeline ingest** (upload dokumen → siap dijawab):

```
Upload (PDF/teks/FAQ) → ekstrak teks (unpdf) → chunk (paragraf+kalimat,
dengan overlap) → embed batch (Gemini, gemini-embedding-001, 1536 dim)
→ insert ke `chunks` → status dokumen: processing → ready
```

## Tech stack

| Lapisan | Teknologi | Kenapa |
| --- | --- | --- |
| Frontend + API | Next.js 15 (App Router), TypeScript strict, Tailwind | Satu framework untuk UI + Server Actions + Route Handlers |
| Database + Auth + Vector | Supabase (Postgres + pgvector) | Tiga kebutuhan dalam satu layanan, RLS bawaan Postgres |
| Embedding + Generation | Google Gemini (`gemini-embedding-001`, `gemini-3.1-flash-lite`) | Free tier tanpa kartu kredit — lihat [catatan kuota](#catatan-jujur--batasan) |
| Billing | Midtrans SNAP (sandbox) | Diganti dari rencana awal (Stripe) atas permintaan eksplisit saat Fase 6 |
| Widget | Vanilla JS, tanpa dependency | Aman ditempel di website manapun, tidak bentrok CSS/JS host page |
| Deploy | Vercel + Supabase Cloud | — |

## Keamanan / isolasi tenant

- Setiap tabel (`chatbots`, `documents`, `chunks`, `conversations`,
  `messages`, `usage`, `billing_orders`) punya **Row Level Security**
  aktif — user hanya bisa baca/tulis baris yang chatbot-nya dia miliki.
- Endpoint chat publik (`/api/public-chat`, dipakai widget) tidak punya
  sesi Supabase sama sekali (pengunjung anonim), jadi tidak bisa lewat
  RLS. Solusinya **bukan** membuka RLS untuk role `anon` (itu akan
  membiarkan siapapun yang tahu anon key — yang memang publik di widget —
  query tabel `chunks` langsung lewat REST API Supabase dan lihat data
  semua tenant). Endpoint itu pakai **service-role client** (kunci
  server-only, tidak pernah ke browser), dan kode aplikasi sendiri yang
  jadi satu-satunya penjaga isolasi: setiap query selalu difilter eksplisit
  ke satu `chatbot_id`.
- Pencarian similarity (`match_chunks` RPC) dibuat `SECURITY INVOKER` — di
  jalur yang authenticated (dashboard test chat), RLS tetap jadi lapisan
  pertahanan kedua di belakang filter eksplisit.

## Guardrail biaya

- Konteks yang dikirim ke LLM dibatasi ~6000 karakter, output dibatasi 500
  token, `temperature: 0.2` (jawaban faktual, bukan kreatif).
- Similarity di bawah ambang kasar (0.3) langsung dijawab fallback **tanpa
  memanggil LLM sama sekali** — bot yang belum ada dokumennya tidak
  membakar kuota API.
- Rate limit dua lapis di endpoint publik: per `visitor_id` (10
  pesan/5 menit) dan per IP (30 pesan/5 menit, menangkap visitor yang
  clear localStorage untuk reset limit pertama).
- Kuota bulanan per paket (Free: 1 bot / 3 dokumen per bot / 100
  pesan bulan; Pro: 10 / 20 / 2000), dicek **sebelum** memanggil LLM dan
  baru ditambah **setelah** jawaban sukses — request yang gagal/error
  tidak memotong kuota.

## Evaluasi

Diukur dengan [`eval/run.ts`](eval/run.ts) — skrip permanen (bukan
sekali-jalan), 14 pertanyaan (9 in-scope, 5 out-of-scope) terhadap dokumen
FAQ contoh, dijalankan lewat pipeline live (Supabase + Gemini asli).
Jalankan lagi dengan `npm run eval`; hasil detail per pertanyaan ada di
[`eval/results.md`](eval/results.md).

| Metrik | Hasil | Definisi |
| --- | --- | --- |
| Hit rate (retrieval) | **100%** (9 pertanyaan) | Chunk yang mengandung fakta yang ditanya benar-benar terambil |
| Faithfulness | **100%** (9 pertanyaan) | Jawaban benar-benar memuat fakta dari chunk yang terambil |
| Konsistensi penolakan | **100%** (5 pertanyaan) | Pertanyaan di luar dokumen selalu ditolak dengan kalimat baku yang sama |

## Catatan jujur — batasan

Ditulis di sini alih-alih disembunyikan, karena bagian dari mengevaluasi
sistem adalah tahu batasnya:

- **Kuota gratis Gemini berubah-ubah per model.** Ditemukan saat menjalankan
  `eval/run.ts`: alias `gemini-flash-latest` sempat menunjuk ke model
  dengan kuota gratis 20 request/**hari** saja. Model generation dipatok
  eksplisit ke `gemini-3.1-flash-lite` (bukan alias) supaya tidak diam-diam
  bergeser ke model lain yang kuotanya kecil.
- **Rate limit publik bisa dilewati** oleh visitor yang cukup niat clear
  localStorage + ganti IP (mis. lewat VPN) — dua lapis guardrail (visitor +
  IP) menaikkan biaya usaha, bukan menutup celah sepenuhnya.
- **Billing Midtrans di sini one-time payment, bukan subscription
  berulang** — tidak ada downgrade otomatis saat "langganan" berakhir
  (karena memang tidak ada siklus langganan). Cukup untuk kriteria MVP
  "upgrade test membuka kuota", belum untuk billing production sungguhan.
- **Ambang similarity (0.3) belum di-tuning** dari data evaluasi skala
  besar — pertahanan utama terhadap jawaban mengarang tetap instruksi
  grounding di system prompt, bukan angka ambang ini.
- **Free tier Gemini bisa memakai input untuk training model Google** —
  aman untuk demo/portofolio dengan data contoh; pelanggan sungguhan perlu
  pindah ke tier berbayar untuk privasi data.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi Supabase/Gemini/Midtrans keys
npm run dev
```

Migrasi database ada di `supabase/migrations/*.sql`, dijalankan manual di
Supabase Dashboard → SQL Editor secara berurutan (0001 → 0005).

```bash
npm run lint     # ESLint
npm run test     # Vitest — unit test pipeline chunking, retrieval, billing
npm run eval     # evaluasi RAG end-to-end (biaya API sungguhan)
npm run seed:demo  # buat/perbarui chatbot demo no-login
```

## Struktur proyek

```
src/lib/ingest/    ekstraksi PDF, chunking, orkestrasi proses dokumen
src/lib/gemini/    wrapper embedding + generation
src/lib/chat/      retrieval, prompt, orkestrasi jawaban (dipakai dashboard & widget publik)
src/lib/billing/   limit paket + pelacakan kuota bulanan
src/lib/midtrans/  client Snap API + verifikasi signature webhook
src/app/dashboard/ UI pemilik bisnis (buat bot, upload dokumen, uji chat, embed snippet)
src/app/api/       route publik (chat, webhook billing)
public/widget.js   widget embeddable, vanilla JS tanpa dependency
eval/              dataset + skrip evaluasi RAG (permanen, hasil di-commit)
supabase/migrations/  skema database + RLS, urut per fase
```

Lihat [PRD.md](PRD.md) untuk spesifikasi produk lengkap dan
[plan.md](plan.md) untuk urutan pembangunan per fase.
