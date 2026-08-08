# PRD — HelpBot (AI Support-Agent Builder)

> Product Requirements Document. Ini blueprint utama proyek. Serahkan file ini
> ke Claude Code sebagai konteks utama. Nama "HelpBot" hanya sementara — ganti
> sesukamu.

---

## 1. Ringkasan (apa & kenapa)

HelpBot adalah **AI SaaS** tempat pemilik bisnis kecil membuat chatbot customer
service untuk website mereka sendiri, **tanpa coding**. Mereka upload dokumen
(FAQ, katalog, panduan), lalu sistem menghasilkan chatbot yang menjawab
pertanyaan pengunjung **berdasarkan dokumen itu**, lengkap dengan kutipan sumber.

Masalah yang diselesaikan: bisnis kecil tidak punya waktu/uang untuk customer
service 24 jam, dan pertanyaan pelanggan sering berulang. HelpBot menjawab
otomatis dari dokumen mereka.

Inti teknisnya adalah **RAG** (Retrieval-Augmented Generation) — sama seperti
proyek #1, tapi kali ini dikemas jadi produk multi-pengguna.

---

## 2. Target pengguna

- **Pengguna utama (pembuat bot):** pemilik UMKM / toko online / freelancer yang
  ingin chatbot di website mereka.
- **Pengguna akhir (pemakai bot):** pengunjung website milik pengguna utama yang
  bertanya lewat widget chat.

---

## 3. Fitur MVP

Fokus MVP hanya pada alur inti. Fitur ekstra masuk "Non-goals" (bagian 7).

- **a. Autentikasi** — daftar & login akun (email + password via Supabase Auth).
- **b. Dashboard** — daftar chatbot milik pengguna; tombol buat chatbot baru.
- **c. Buat & latih chatbot** — beri nama bot, upload dokumen (PDF / teks / tempel
  FAQ). Sistem memproses: ekstrak teks → potong (chunk) → embed → simpan.
- **d. Uji chat** — kotak chat di dashboard untuk menguji bot menjawab dari
  dokumen, dengan **kutipan sumber** di tiap jawaban.
- **e. Widget embeddable** — pengguna dapat potongan kode `<script>` untuk
  ditempel di website mereka; pengunjung bisa chat dari sana.
- **f. Riwayat percakapan** — pengguna melihat percakapan yang terjadi di bot-nya.
- **g. Billing sederhana** — paket Free vs Pro (Stripe mode test), dengan batas
  jumlah bot / dokumen / pesan per bulan.

---

## 4. Alur pengguna (happy path)

1. Pengguna daftar → login → masuk dashboard (kosong).
2. Klik "Buat Chatbot" → beri nama → upload 1–3 dokumen.
3. Sistem memproses dokumen (tampilkan status: memproses → siap).
4. Pengguna menguji bot di kotak chat dashboard; jawaban muncul + sumber.
5. Pengguna menyalin kode widget → menempelnya di website mereka.
6. Pengunjung website membuka widget → bertanya → bot menjawab dari dokumen.
7. Pengguna melihat riwayat percakapan & sisa kuota di dashboard.

---

## 5. Model data (tabel database)

Database: **Supabase (Postgres)** dengan ekstensi **pgvector** untuk embedding.

- **profiles** — `id` (FK ke auth.users), `email`, `plan` (free/pro), `created_at`
- **chatbots** — `id`, `user_id`, `name`, `system_prompt`, `greeting`, `created_at`
- **documents** — `id`, `chatbot_id`, `filename`, `source_type` (pdf/text/faq),
  `status` (processing/ready/error), `created_at`
- **chunks** — `id`, `document_id`, `chatbot_id`, `content`, `embedding`
  (vector — samakan dimensinya dengan model embedding Gemini), `metadata` (jsonb)
- **conversations** — `id`, `chatbot_id`, `visitor_id`, `created_at`
- **messages** — `id`, `conversation_id`, `role` (user/assistant), `content`,
  `sources` (jsonb), `created_at`
- **usage** — `user_id`, `month`, `message_count` (untuk batas paket)

**Aturan keamanan wajib:** data antar-pengguna harus terisolasi. Bot pengguna A
hanya boleh mengambil chunk milik pengguna A. Gunakan Row Level Security (RLS)
Supabase, dan selalu filter query berdasarkan `user_id` / `chatbot_id`.

---

## 6. Tech stack

- **Frontend + API:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database + Auth + Vector:** Supabase (Postgres + Auth + pgvector) — satu
  layanan untuk tiga kebutuhan, memudahkan build solo
- **Embedding:** Google Gemini (model embedding Gemini) — free tier, tanpa kartu
  kredit. Dimensi vektor mengikuti model embedding Gemini yang dipakai (cek
  dokumen resmi Gemini saat setup)
- **LLM (generasi jawaban):** Google Gemini Flash — free tier, satu API key yang
  sama dengan embedding. (Cadangan cepat untuk demo: Groq, gratis juga.)
- **Catatan privasi:** free tier Gemini bisa memakai input untuk melatih model
  Google — aman untuk demo/portofolio dengan data contoh. Untuk pelanggan
  sungguhan nanti, pindah ke tier berbayar demi privasi data.
- **Billing:** Stripe (mode test)
- **Deploy:** Vercel (app) + Supabase Cloud (database)
- **Widget:** file JavaScript kecil yang di-embed lewat `<script>`

---

## 7. Non-goals (yang TIDAK dibangun di MVP)

Penting untuk membatasi ruang lingkup — ini mencegah proyek membengkak:

- Bukan multi-bahasa rumit (cukup dukung Indonesia + Inggris apa adanya).
- Belum ada tim/kolaborasi (satu akun = satu pemilik).
- Belum ada integrasi WhatsApp/Instagram (hanya widget web).
- Belum ada custom domain untuk widget.
- Billing cukup mode test — bukan pembayaran sungguhan.

---

## 8. Fitur pembeda (ini yang menaikkan nilai portofolio)

Jangan berhenti di "chatbot yang jawab". Tumpuk lapisan ini:

- **Sitasi sumber:** tiap jawaban menampilkan potongan dokumen yang jadi dasar.
- **Penolakan out-of-scope:** kalau jawaban tidak ada di dokumen, bot bilang
  "maaf, tidak ada di data saya" — bukan mengarang.
- **Guardrails biaya:** batasi panjang konteks, jumlah token, dan pesan per menit
  supaya biaya API tidak meledak.
- **Evaluasi:** siapkan 10–15 pertanyaan uji + jawaban yang diharapkan; ukur
  apakah retrieval mengambil chunk yang benar (hit rate) dan apakah jawaban
  benar-benar bersumber dari dokumen (faithfulness). Tampilkan angka ini di
  README.

---

## 9. Kriteria sukses (MVP dianggap selesai jika)

- Pengguna bisa daftar, buat bot, upload dokumen, dan mendapat jawaban yang benar
  dari dokumen tersebut dengan sumber.
- Widget bisa ditempel di halaman HTML lain dan berfungsi.
- Data antar-pengguna terisolasi (diverifikasi).
- Ter-deploy di URL publik dengan mode demo tanpa login.
- Ada README studi kasus + angka evaluasi.
