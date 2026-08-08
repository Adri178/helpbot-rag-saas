"use client";

import { useState } from "react";

interface Source {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export function TestChat({ chatbotId }: { chatbotId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || pending) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatbotId, conversationId, question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pesan.");
        return;
      }

      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded border p-4">
      <h2 className="text-lg font-medium">Uji Chat</h2>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Belum ada percakapan. Coba tanya sesuatu dari dokumen yang sudah
            diupload.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded px-3 py-2 text-sm ${
              msg.role === "user"
                ? "self-end bg-black text-white"
                : "self-start bg-gray-100 text-black"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.sources && msg.sources.length > 0 && (
              <details className="mt-2 text-xs text-gray-600">
                <summary className="cursor-pointer">
                  Sumber ({msg.sources.length})
                </summary>
                <ul className="mt-1 flex flex-col gap-1">
                  {msg.sources.map((s) => (
                    <li key={s.chunkId} className="rounded bg-white p-2">
                      {s.content}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya sesuatu..."
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "..." : "Kirim"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
