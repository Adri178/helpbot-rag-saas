import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "../_shell/PageHeader";
import { NameForm } from "./NameForm";
import { DeleteAccountForm } from "./DeleteAccountForm";

const TOGGLES = [
  { label: "Ringkasan mingguan lewat email", hint: "Rekap pertanyaan yang ditolak, tiap Senin." },
  { label: "Peringatan kuota hampir habis", hint: "Email saat pesan bulanan tersisa 10%." },
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Akun dan preferensi." />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-7">
        <div className="flex max-w-[720px] flex-col gap-4.5">
          <div className="flex flex-col gap-4 rounded-[16px] border border-[#E7E7E4] p-6">
            <p className="m-0 text-[15px] font-semibold text-[#111]">Akun</p>
            <NameForm initialName={profile?.name ?? ""} />
            <div className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 sm:grid-cols-[160px_1fr]">
              <span className="text-[13px] text-[#71717A]">Email</span>
              <span className="rounded-[9px] border border-[#F0F0EE] bg-[#FAFAF9] px-3.5 py-2.5 text-sm text-[#8A8A94]">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 rounded-[16px] border border-[#E7E7E4] p-6">
            <p className="m-0 text-[15px] font-semibold text-[#111]">Notifikasi</p>
            {TOGGLES.map((t) => (
              <div key={t.label} className="flex items-center justify-between gap-5">
                <div>
                  <p className="m-0 text-sm text-[#111]">{t.label}</p>
                  <p className="m-0 mt-0.5 text-xs text-[#8A8A94]">{t.hint}</p>
                </div>
                <span
                  title="Segera hadir"
                  className="flex-shrink-0 rounded-full bg-[#F0F0EE] px-2.5 py-1 text-[11px] font-semibold text-[#A1A1A6]"
                >
                  Segera hadir
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-5 rounded-[16px] border border-[#F0D9D9] bg-[#FDF7F7] p-6">
            <div>
              <p className="m-0 text-sm font-semibold text-[#9F1239]">Hapus akun</p>
              <p className="m-0 mt-0.5 text-xs text-[#B45B6B]">
                Semua chatbot, dokumen, dan riwayat percakapan ikut terhapus.
              </p>
            </div>
            <DeleteAccountForm />
          </div>
        </div>
      </div>
    </>
  );
}
