"use client";

import { useActionState, useRef } from "react";
import { addTextDocument } from "./actions";

export function PasteTextForm({ chatbotId }: { chatbotId: string }) {
  const action = addTextDocument.bind(null, chatbotId);
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2 rounded-[12px] border border-dashed border-[#D4D4D8] p-4"
    >
      <label className="text-[13px] font-semibold text-[#111]">Tempel FAQ / teks</label>
      <input
        type="text"
        name="title"
        placeholder="Judul (opsional)"
        className="rounded-[8px] border border-[#DEDEDA] px-3 py-2 text-sm outline-none focus:border-[#0B7A6E]"
      />
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Tempel FAQ atau teks lain di sini..."
        className="rounded-[8px] border border-[#DEDEDA] px-3 py-2 text-sm outline-none focus:border-[#0B7A6E]"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-[8px] bg-[#111] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Tambah"}
      </button>
      {state?.error && <p className="m-0 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
