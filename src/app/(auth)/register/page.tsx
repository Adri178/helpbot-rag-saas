"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "../actions";
import { AuthError, AuthField, AuthSubmit } from "../AuthField";
import { PLAN_LIMITS } from "@/lib/billing/plans";

export default function RegisterPage() {
  const free = PLAN_LIMITS.free;

  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-bold tracking-[-0.035em]">
          Buat akun gratis
        </h1>
        <p className="m-0 text-[15px] text-[#71717A]">
          {free.maxChatbots} chatbot · {free.maxDocumentsPerChatbot} dokumen ·{" "}
          {free.maxMessagesPerMonth} pesan/bulan. Tanpa kartu kredit.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          hint="Minimal 6 karakter."
        />
        {state?.error && <AuthError message={state.error} />}
        <AuthSubmit
          pending={pending}
          label="Daftar gratis"
          pendingLabel="Mendaftar..."
        />
      </form>

      <p className="m-0 text-sm text-[#71717A]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[#0B7A6E]">
          Masuk
        </Link>
      </p>
    </div>
  );
}
