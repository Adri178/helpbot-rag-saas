# Hasil Evaluasi RAG

Terakhir dijalankan: 2026-08-08T15:23:16.459Z

## Ringkasan

| Metrik | Nilai | Definisi |
| --- | --- | --- |
| Hit rate (retrieval) | 100% (9 pertanyaan in-scope) | Chunk yang benar (mengandung fakta yang dicari) ada di sumber yang diambil |
| Faithfulness | 100% (9 pertanyaan in-scope) | Jawaban benar-benar memuat fakta dari chunk yang diambil (bukan sekadar retrieval-nya benar) |
| Konsistensi penolakan | 100% (5 pertanyaan out-of-scope) | Pertanyaan di luar dokumen selalu ditolak dengan kalimat baku yang sama |

## Detail per pertanyaan

| # | Tipe | Pertanyaan | Hasil | Detail | Jawaban |
| --- | --- | --- | --- | --- | --- |
| 1 | in-scope | Jam berapa toko buka? | ✅ | retrieval hit: ✅, faithful: ✅ | Toko buka setiap Senin sampai Jumat pukul 09.00 - 17.00 WIB. |
| 2 | in-scope | Apakah toko buka hari Minggu? | ✅ | retrieval hit: ✅, faithful: ✅ | Tidak, toko tutup di hari Minggu. |
| 3 | in-scope | Bisa kirim barang ke luar Pulau Jawa tidak? | ✅ | retrieval hit: ✅, faithful: ✅ | Kami belum melayani pengiriman ke luar Jawa. |
| 4 | in-scope | Kurir apa yang dipakai untuk pengiriman? | ✅ | retrieval hit: ✅, faithful: ✅ | Toko Baju Keren menggunakan kurir JNE reguler. |
| 5 | in-scope | Apakah bisa bayar COD di tempat? | ✅ | retrieval hit: ✅, faithful: ✅ | Kami tidak menerima pembayaran di tempat (COD). |
| 6 | in-scope | Berapa lama batas waktu pengembalian barang? | ✅ | retrieval hit: ✅, faithful: ✅ | Barang bisa dikembalikan dalam waktu 7 hari sejak diterima. |
| 7 | in-scope | Kalau retur barang, ongkos kirimnya siapa yang bayar? | ✅ | retrieval hit: ✅, faithful: ✅ | Ongkos kirim pengembalian ditanggung oleh pembeli. |
| 8 | in-scope | Ukuran baju yang dijual dari apa sampai apa? | ✅ | retrieval hit: ✅, faithful: ✅ | Ukuran baju yang tersedia adalah dari S sampai XL. |
| 9 | in-scope | Kalau mau tanya-tanya lebih lanjut, hubungi lewat mana? | ✅ | retrieval hit: ✅, faithful: ✅ | Anda bisa menghubungi customer service melalui email di cs@tokobajukeren.example atau WhatsApp pada jam kerja. |
| 10 | out-of-scope | Siapa presiden Indonesia sekarang? | ✅ | menolak dengan kalimat baku ✅ | Maaf, saya tidak punya informasi itu di data saya. |
| 11 | out-of-scope | Berapa harga baju yang paling murah di toko ini? | ✅ | menolak dengan kalimat baku ✅ | Maaf, saya tidak punya informasi itu di data saya. |
| 12 | out-of-scope | Apakah sedang ada promo diskon bulan ini? | ✅ | menolak dengan kalimat baku ✅ | Maaf, saya tidak punya informasi itu di data saya. |
| 13 | out-of-scope | Bagaimana resep membuat nasi goreng yang enak? | ✅ | menolak dengan kalimat baku ✅ | Maaf, saya tidak punya informasi itu di data saya. |
| 14 | out-of-scope | Apakah toko ini punya cabang di luar negeri? | ✅ | menolak dengan kalimat baku ✅ | Maaf, saya tidak punya informasi itu di data saya. |
