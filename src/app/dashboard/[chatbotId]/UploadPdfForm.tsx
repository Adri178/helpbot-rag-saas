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
      className="flex flex-col gap-2 rounded border p-4"
    >
      <label className="text-sm font-medium">Upload PDF (maks 5MB)</label>
      <input type="file" name="file" accept="application/pdf" required />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Upload"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
