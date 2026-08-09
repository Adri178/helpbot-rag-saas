"use client";

import { useActionState } from "react";
import { deleteAccount } from "./actions";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            "Hapus akun secara permanen? Semua chatbot, dokumen, dan riwayat percakapan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-[8px] border border-[#E4BCBC] px-4 py-2.5 text-[13px] font-semibold text-[#9F1239] disabled:opacity-50"
      >
        {pending ? "Menghapus..." : "Hapus"}
      </button>
      {state?.error && <p className="m-0 mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
