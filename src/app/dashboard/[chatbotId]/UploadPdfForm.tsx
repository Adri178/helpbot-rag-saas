"use client";

import { useActionState, useRef } from "react";
import { uploadPdfDocument } from "./actions";

export function UploadPdfForm({ chatbotId }: { chatbotId: string }) {
  const action = uploadPdfDocument.bind(null, chatbotId);
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
      <label className="text-[13px] font-semibold text-[#111]">
        Upload PDF (maks 5MB)
      </label>
      <input type="file" name="file" accept="application/pdf" required className="text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-[8px] bg-[#111] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Upload"}
      </button>
      {state?.error && <p className="m-0 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
