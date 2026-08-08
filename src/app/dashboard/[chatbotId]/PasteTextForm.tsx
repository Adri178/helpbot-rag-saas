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
      className="flex flex-col gap-2 rounded border p-4"
    >
      <label className="text-sm font-medium">Tempel FAQ / teks</label>
      <input
        type="text"
        name="title"
        placeholder="Judul (opsional)"
        className="rounded border px-3 py-2 text-sm"
      />
      <textarea
        name="content"
        required
        rows={6}
        placeholder="Tempel FAQ atau teks lain di sini..."
        className="rounded border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Tambah"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
