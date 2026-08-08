// Fixture document + question set for eval/run.ts. Each paragraph below
// becomes roughly one chunk (see src/lib/ingest/chunk.ts's paragraph-based
// splitting), which is what lets us check retrieval hit-rate per question
// via a topic-unique substring.

export const FIXTURE_DOCUMENT = `
Toko Baju Keren buka setiap Senin sampai Jumat pukul 09.00 - 17.00 WIB. Kami tutup di hari Sabtu, Minggu, dan hari libur nasional.

Pengiriman hanya melayani wilayah Pulau Jawa, menggunakan kurir JNE reguler dengan estimasi 2-3 hari kerja. Kami belum melayani pengiriman ke luar Jawa.

Metode pembayaran yang kami terima adalah transfer bank BCA, BNI, dan Mandiri, serta QRIS. Kami tidak menerima pembayaran di tempat (COD).

Barang bisa dikembalikan dalam waktu 7 hari sejak diterima, dengan syarat kondisi masih baru dan kemasan asli belum rusak. Ongkos kirim pengembalian ditanggung oleh pembeli.

Kami menjual pakaian pria dan wanita dengan ukuran tersedia dari S sampai XL, berbahan katun yang nyaman dipakai sehari-hari.

Untuk pertanyaan lain, hubungi customer service kami lewat email di cs@tokobajukeren.example atau WhatsApp pada jam kerja.
`.trim();

export type EvalQuestion =
  | {
      type: "in-scope";
      question: string;
      /** Substring (case-insensitive) expected in the retrieved top chunk
       * — the retrieval hit-rate check. */
      expectedChunkContains: string;
      /** Substring (case-insensitive) expected in the generated answer —
       * a faithfulness proxy (did the answer actually use the grounded
       * fact, not just retrieve it). */
      expectedAnswerContains: string;
    }
  | {
      type: "out-of-scope";
      question: string;
    };

export const EVAL_QUESTIONS: EvalQuestion[] = [
  {
    type: "in-scope",
    question: "Jam berapa toko buka?",
    expectedChunkContains: "09.00",
    expectedAnswerContains: "09.00",
  },
  {
    type: "in-scope",
    question: "Apakah toko buka hari Minggu?",
    expectedChunkContains: "Sabtu, Minggu",
    expectedAnswerContains: "tutup",
  },
  {
    type: "in-scope",
    question: "Bisa kirim barang ke luar Pulau Jawa tidak?",
    expectedChunkContains: "luar Jawa",
    expectedAnswerContains: "Jawa",
  },
  {
    type: "in-scope",
    question: "Kurir apa yang dipakai untuk pengiriman?",
    expectedChunkContains: "JNE",
    expectedAnswerContains: "JNE",
  },
  {
    type: "in-scope",
    question: "Apakah bisa bayar COD di tempat?",
    expectedChunkContains: "COD",
    expectedAnswerContains: "tidak",
  },
  {
    type: "in-scope",
    question: "Berapa lama batas waktu pengembalian barang?",
    expectedChunkContains: "7 hari",
    expectedAnswerContains: "7 hari",
  },
  {
    type: "in-scope",
    question: "Kalau retur barang, ongkos kirimnya siapa yang bayar?",
    expectedChunkContains: "ditanggung oleh pembeli",
    expectedAnswerContains: "pembeli",
  },
  {
    type: "in-scope",
    question: "Ukuran baju yang dijual dari apa sampai apa?",
    expectedChunkContains: "S sampai XL",
    expectedAnswerContains: "XL",
  },
  {
    type: "in-scope",
    question: "Kalau mau tanya-tanya lebih lanjut, hubungi lewat mana?",
    expectedChunkContains: "cs@tokobajukeren",
    expectedAnswerContains: "email",
  },
  { type: "out-of-scope", question: "Siapa presiden Indonesia sekarang?" },
  {
    type: "out-of-scope",
    question: "Berapa harga baju yang paling murah di toko ini?",
  },
  {
    type: "out-of-scope",
    question: "Apakah sedang ada promo diskon bulan ini?",
  },
  {
    type: "out-of-scope",
    question: "Bagaimana resep membuat nasi goreng yang enak?",
  },
  {
    type: "out-of-scope",
    question: "Apakah toko ini punya cabang di luar negeri?",
  },
];
