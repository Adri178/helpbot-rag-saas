"use client";

import { useActionState, useState } from "react";
import { createChatbot } from "./actions";

export function CreateChatbotCard({
  disabled,
  limit,
}: {
  disabled: boolean;
  limit: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createChatbot, null);

  if (disabled) {
    return (
      <div className="flex flex-col justify-center gap-2 rounded-[16px] border border-dashed border-[#E7E7E4] p-5">
        <p className="m-0 text-[15px] font-semibold text-[#111]">
          Batas paket tercapai
        </p>
        <p className="m-0 text-[13px] leading-[1.5] text-[#71717A]">
          Paket kamu dibatasi {limit} chatbot. Upgrade ke Pro untuk membuat
          lebih banyak.
        </p>
      </div>
    );
  }

  if (open) {
    return (
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-[16px] border border-[#E7E7E4] bg-[#FAFAF9] p-5"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          Nama chatbot
          <input
            type="text"
            name="name"
            required
            autoFocus
            placeholder="mis. CS Toko Baju"
            className="rounded-[9px] border border-[#DEDEDA] px-3 py-2.5 text-sm outline-none focus:border-[#0B7A6E]"
          />
        </label>
        {state?.error && <p className="m-0 text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-[8px] bg-[#111] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Membuat..." : "Buat chatbot"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-[8px] border border-[#DEDEDA] px-3.5 py-2 text-[13px] font-semibold text-[#111]"
          >
            Batal
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex flex-col items-start justify-center gap-2 rounded-[16px] border border-dashed border-[#D4D4D8] p-5 text-left hover:border-[#0B7A6E] hover:bg-[#FAFAF9]"
    >
      <p className="m-0 text-[15px] font-semibold text-[#111]">Bot baru</p>
      <p className="m-0 text-[13px] leading-[1.5] text-[#71717A]">
        Beri nama, upload dokumen, langsung uji di kotak chat.
      </p>
      <span className="mt-2 rounded-[8px] border border-[#DEDEDA] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111]">
        Buat chatbot
      </span>
    </button>
  );
}
