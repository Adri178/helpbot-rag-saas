"use client";

import { useState } from "react";

export function EmbedSnippet({ chatbotId }: { chatbotId: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/widget.js" data-chatbot-id="${chatbotId}" async><\/script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 rounded border p-4">
      <h2 className="text-lg font-medium">Pasang widget di websitemu</h2>
      <p className="text-sm text-gray-600">
        Tempel kode ini sebelum tag <code>&lt;/body&gt;</code> di halaman
        websitemu.
      </p>
      <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
        <code>{snippet}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="w-fit rounded border px-3 py-2 text-sm"
      >
        {copied ? "Tersalin!" : "Salin kode"}
      </button>
    </div>
  );
}
