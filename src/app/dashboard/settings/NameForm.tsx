"use client";

import { useActionState } from "react";
import { updateName } from "./actions";

export function NameForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(updateName, null);

  return (
    <form action={formAction} className="grid grid-cols-[160px_1fr] items-center gap-x-4 gap-y-3">
      <span className="text-[13px] text-[#71717A]">Nama</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="name"
          defaultValue={initialName}
          placeholder="Nama kamu"
          className="flex-1 rounded-[9px] border border-[#DEDEDA] px-3.5 py-2.5 text-sm outline-none focus:border-[#0B7A6E]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[8px] bg-[#111] px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {pending ? "..." : "Simpan"}
        </button>
      </div>
      {state?.error && <p className="col-span-2 m-0 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
