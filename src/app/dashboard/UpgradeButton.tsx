"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/midtrans/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Gagal memulai checkout.");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Gagal terhubung ke server.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Membuka checkout..." : "Upgrade ke Pro"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
