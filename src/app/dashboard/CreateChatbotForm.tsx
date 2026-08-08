"use client";

import { useActionState } from "react";
import { createChatbot } from "./actions";

export function CreateChatbotForm() {
  const [state, formAction, pending] = useActionState(createChatbot, null);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <label className="flex flex-col gap-1 text-sm">
        Nama chatbot
        <input
          type="text"
          name="name"
          required
          placeholder="mis. CS Toko Baju"
          className="rounded border px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Membuat..." : "Buat Chatbot"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
