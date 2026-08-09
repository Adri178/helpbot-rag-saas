const ITEMS = [
  {
    title: "Kutipan sumber",
    body: "Setiap jawaban membawa potongan dokumen aslinya.",
  },
  {
    title: "Nolak kalau tidak tahu",
    body: "Di luar dokumen? Bot bilang tidak tahu, bukan mengarang.",
  },
  {
    title: "Satu baris kode",
    body: "Tempel script sebelum </body>, selesai.",
  },
];

export function LandingFeatureStrip() {
  return (
    <div className="grid grid-cols-1 gap-px border-y border-[#F0F0EE] bg-[#F0F0EE] sm:grid-cols-3">
      {ITEMS.map((item) => (
        <div key={item.title} className="bg-white px-6 py-8 sm:px-10">
          <p className="m-0 mb-1.5 text-base font-semibold">{item.title}</p>
          <p className="m-0 text-[15px] leading-[1.5] text-[#52525B]">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
