"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "../actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Daftar</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded border px-3 py-2"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Mendaftar..." : "Daftar"}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
