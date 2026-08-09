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
    <div className="flex h-[500px] flex-col overflow-hidden rounded-[16px] border border-[#E7E7E4]">
      <div className="flex items-center gap-2.5 border-b border-[#F0F0EE] bg-[#FAFAF9] px-4.5 py-3.5">
        <span className="h-2 w-2 rounded-full bg-[#0B7A6E]" />
        <span className="text-[13px] font-semibold text-[#111]">
          Kotak uji — jawaban persis seperti di widget
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4.5">
        {messages.length === 0 && (
          <p className="m-0 text-sm text-[#71717A]">
            Belum ada percakapan. Coba tanya sesuatu dari dokumen yang sudah
            diupload.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex max-w-[76%] flex-col gap-1.5">
              <div
                className={`rounded-[14px] px-3.5 py-2.5 text-sm leading-[1.5] ${
                  msg.role === "user"
                    ? "self-end bg-[#111] text-white"
                    : "self-start border border-[#E7E7E4] bg-white text-[#111]"
                }`}
              >
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <details className="text-xs text-[#71717A]">
                  <summary className="cursor-pointer font-medium text-[#0B7A6E]">
                    Sumber ({msg.sources.length})
                  </summary>
                  <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                    {msg.sources.map((s) => (
                      <li key={s.chunkId} className="rounded-[8px] bg-[#F4F4F3] p-2">
                        {s.content}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#F0F0EE] p-3.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya sesuatu ke bot ini…"
          className="flex-1 rounded-full border border-[#DEDEDA] px-3.5 py-2.5 text-sm outline-none focus:border-[#0B7A6E]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "..." : "Kirim"}
        </button>
      </form>
      {error && <p className="m-0 px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
