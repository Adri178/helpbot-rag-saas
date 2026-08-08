# plan.md — Rencana Build HelpBot

Urutan pengerjaan, dipecah jadi fase. **Kerjakan satu fase sampai selesai dan
teruji, baru lanjut.** Tiap fase adalah "irisan vertikal" — dari database sampai
tampilan — supaya kamu selalu bisa melihat hasil yang berfungsi.

Cara pakai dengan Claude Code: buka satu fase, minta Claude Code menulis
rencananya dulu, konfirmasi, baru eksekusi. Selesai satu fase → commit → fase
berikutnya.

---

## Fase 0 — Setup

**Tujuan:** proyek kosong yang jalan.
- Inisialisasi Next.js 15 + TypeScript + Tailwind.
- Buat proyek Supabase, hubungkan (env: URL + anon key + service key).
- Taruh `PRD.md`, `CLAUDE.md`, `plan.md` di root repo.
- Buat `.env.example`.

**Selesai jika:** `npm run dev` menampilkan halaman kosong tanpa error.

---

## Fase 1 — Auth + Dashboard kosong

**Tujuan:** pengguna bisa login dan melihat dashboard.
- Aktifkan Supabase Auth (email + password).
- Halaman daftar / login / logout.
- Tabel `profiles`; halaman dashboard yang menampilkan "Belum ada chatbot".
- Aktifkan RLS di `profiles`.

**Selesai jika:** bisa daftar, login, lihat dashboard kosong, logout.

---

## Fase 2 — Buat chatbot + upload & proses dokumen

**Tujuan:** pengguna bisa membuat bot dan melatihnya dari dokumen. (Ini inti RAG.)
- Tabel `chatbots`, `documents`, `chunks` (dengan kolom vector pgvector).
- Form buat chatbot (nama).
- Upload dokumen (PDF / teks / tempel FAQ).
- Pipeline proses: ekstrak teks → chunk → embed (Gemini) → simpan ke `chunks`.
- Tampilkan status dokumen (processing → ready).
- RLS + filter `user_id`/`chatbot_id` di semua query.

**Selesai jika:** upload satu PDF menghasilkan baris-baris chunk berisi embedding
di database, dan status berubah jadi "ready". **Tulis tes untuk pipeline ini.**

---

## Fase 3 — Uji chat (jantung produk)

**Tujuan:** bertanya ke bot, dapat jawaban dari dokumen + sumber.
- Endpoint chat: pertanyaan → embed → cari chunk termirip (pgvector) → susun
  konteks → panggil LLM → jawaban.
- Kotak chat di dashboard untuk menguji bot.
- Tampilkan potongan sumber di bawah jawaban.
- Simpan ke `conversations` + `messages`.

**Selesai jika:** pertanyaan yang jawabannya ada di dokumen dijawab benar dengan
sumber; pertanyaan di luar dokumen dijawab "tidak ada di data saya". **Tulis tes
untuk retrieval.**

---

## Fase 4 — Widget embeddable (pembeda "produk")

**Tujuan:** bot bisa dipasang di website lain.
- Endpoint chat publik per bot (aman, terbatas ke bot itu).
- File JS widget kecil + potongan kode `<script>` di dashboard.
- Halaman HTML uji terpisah untuk memastikan widget jalan.

**Selesai jika:** menempel `<script>` di file HTML kosong memunculkan widget yang
bisa chat.

---

## Fase 5 — Guardrails + evaluasi (pembeda portofolio)

**Tujuan:** buktikan sistem andal, bukan cuma jalan.
- Batasi panjang konteks, max token, dan rate-limit pesan per pengunjung.
- Pastikan penolakan out-of-scope konsisten.
- Buat 10–15 pertanyaan uji + jawaban diharapkan; ukur hit rate retrieval &
  faithfulness jawaban. Simpan skrip + hasilnya.

**Selesai jika:** ada tabel angka evaluasi yang bisa ditaruh di README.

---

## Fase 6 — Billing + batas kuota

**Tujuan:** sinyal "berpikir produk".
- Tabel `usage`; hitung pesan per bulan.
- Paket Free vs Pro (Stripe mode test).
- Blokir/lewati sesuai kuota paket.

**Selesai jika:** akun free kena batas kuota; upgrade test membukanya.

---

## Fase 7 — Polish + deploy

**Tujuan:** bisa diklik recruiter.
- Landing page + mode demo tanpa login.
- Deploy ke Vercel + Supabase Cloud.
- README studi kasus: masalah → solusi → arsitektur → angka evaluasi → link demo.
- Pastikan responsif di HP.

**Selesai jika:** ada URL publik yang berfungsi + README lengkap.

---

## Prinsip lintas-fase

- Satu fitur utuh dulu (DB → API → UI), baru fitur berikut.
- Commit tiap fase selesai.
- Kalau ragu, minta Claude Code menulis rencana dan "buktikan ini jalan" sebelum
  menerima kodenya.
