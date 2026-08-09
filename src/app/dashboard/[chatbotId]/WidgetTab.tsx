"use client";

import { useState } from "react";
import { updateWidgetSettings } from "./actions";

const ACCENT_OPTIONS = ["#0B7A6E", "#0A3D38", "#6D3BEB", "#B42318"];

export function WidgetTab({
  chatbotId,
  initialAccentColor,
  initialPosition,
  initialGreeting,
  initialShowSources,
}: {
  chatbotId: string;
  initialAccentColor: string;
  initialPosition: "left" | "right";
  initialGreeting: string;
  initialShowSources: boolean;
}) {
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const [position, setPosition] = useState<"left" | "right">(initialPosition);
  const [greeting, setGreeting] = useState(initialGreeting);
  const [showSources, setShowSources] = useState(initialShowSources);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/widget.js" data-chatbot-id="${chatbotId}" async><\/script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updateWidgetSettings(chatbotId, null, formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    // Preview is the real widget.js in an iframe fetching real saved
    // settings — remount it so it reflects what was just persisted.
    setPreviewVersion((v) => v + 1);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-col gap-3.5 rounded-[16px] border border-[#E7E7E4] p-5.5">
          <div className="flex items-center justify-between">
            <p className="m-0 text-[15px] font-semibold text-[#111]">Kode embed</p>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-[8px] bg-[#111] px-3.5 py-2 text-xs font-semibold text-white"
            >
              {copied ? "Tersalin!" : "Salin"}
            </button>
          </div>
          <pre className="m-0 overflow-x-auto rounded-[11px] bg-[#0A0A0A] p-4 font-mono text-xs leading-[1.7] whitespace-pre-wrap break-all text-[#8FE3D6]">
            {snippet}
          </pre>
          <p className="m-0 text-xs text-[#8A8A94]">
            Tempel sebelum &lt;/body&gt;. Widget muncul otomatis di semua
            halaman.
          </p>
        </div>

        <form action={handleSave} className="flex flex-col gap-4.5 rounded-[16px] border border-[#E7E7E4] p-5.5">
          <p className="m-0 text-[15px] font-semibold text-[#111]">Tampilan widget</p>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#52525B]">Warna aksen</span>
            <div className="flex gap-2.5">
              {ACCENT_OPTIONS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccentColor(hex)}
                  className="h-[34px] w-[34px] rounded-[10px]"
                  style={{
                    background: hex,
                    boxShadow:
                      accentColor === hex ? `0 0 0 2px #fff, 0 0 0 4px ${hex}` : "none",
                  }}
                  aria-label={hex}
                  aria-pressed={accentColor === hex}
                />
              ))}
            </div>
            <input type="hidden" name="accentColor" value={accentColor} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#52525B]">Posisi</span>
            <div className="flex w-fit gap-1.5 rounded-[10px] bg-[#F4F4F3] p-1">
              {(["left", "right"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={`rounded-[7px] px-4 py-2 text-[13px] font-semibold ${
                    position === p ? "bg-white text-[#111] shadow-sm" : "text-[#71717A]"
                  }`}
                >
                  {p === "left" ? "Kiri" : "Kanan"}
                </button>
              ))}
            </div>
            <input type="hidden" name="widgetPosition" value={position} />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#52525B]">Sapaan pembuka</span>
            <input
              type="text"
              name="greeting"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Halo! Ada yang bisa dibantu?"
              className="rounded-[9px] border border-[#DEDEDA] px-3.5 py-2.5 text-sm outline-none focus:border-[#0B7A6E]"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="m-0 text-sm text-[#111]">Tampilkan sumber jawaban</p>
              <p className="m-0 mt-0.5 text-xs text-[#8A8A94]">
                Baris kecil berisi kutipan dokumen di bawah tiap jawaban.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="flex h-[26px] w-[44px] flex-shrink-0 items-center rounded-full p-[3px]"
              style={{
                background: showSources ? accentColor : "#DEDEDA",
                justifyContent: showSources ? "flex-end" : "flex-start",
              }}
              aria-pressed={showSources}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow" />
            </button>
            <input type="hidden" name="showSources" value={showSources ? "on" : ""} />
          </div>

          {error && <p className="m-0 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-[9px] bg-[#111] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E7E7E4] bg-[#F4F4F3]">
        <div className="flex items-center gap-2 border-b border-[#F0F0EE] bg-white px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E7E4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E7E4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E7E4]" />
          <span className="ml-2 font-mono text-[11px] text-[#A1A1A6]">preview.helpbot</span>
        </div>
        <div className="h-[520px]">
          <iframe
            key={previewVersion}
            src={`/widget-preview?chatbotId=${chatbotId}`}
            className="h-full w-full border-0"
            title="Preview widget"
          />
        </div>
      </div>
    </div>
  );
}
