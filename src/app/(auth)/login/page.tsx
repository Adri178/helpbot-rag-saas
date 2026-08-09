"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "../actions";
import { AuthError, AuthField, AuthSubmit } from "../AuthField";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[32px] font-bold tracking-[-0.035em]">
          Masuk ke akunmu
        </h1>
        <p className="m-0 text-[15px] text-[#71717A]">
          Kelola chatbot, dokumen, dan widget kamu.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        {state?.error && <AuthError message={state.error} />}
        <AuthSubmit pending={pending} label="Masuk" pendingLabel="Masuk..." />
      </form>

      <p className="m-0 text-sm text-[#71717A]">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[#0B7A6E]">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
