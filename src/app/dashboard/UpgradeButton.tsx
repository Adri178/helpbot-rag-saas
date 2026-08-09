"use client";

import { useState } from "react";

export function UpgradeButton({
  className,
  label = "Upgrade ke Pro",
  pendingLabel = "Membuka checkout...",
}: {
  className?: string;
  label?: string;
  pendingLabel?: string;
}) {
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
    <div className="flex flex-col gap-1">
      <button type="button" onClick={handleUpgrade} disabled={pending} className={className}>
        {pending ? pendingLabel : label}
      </button>
      {error && <p className="m-0 text-xs text-red-600">{error}</p>}
    </div>
  );
}
