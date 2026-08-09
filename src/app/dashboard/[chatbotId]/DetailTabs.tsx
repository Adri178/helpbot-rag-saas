"use client";

import { useState } from "react";
import { DocsTab, type DocRow } from "./DocsTab";
import { TestChat } from "./TestChat";
import { WidgetTab } from "./WidgetTab";

const TABS = [
  { key: "docs", label: "Dokumen" },
  { key: "test", label: "Uji chat" },
  { key: "widget", label: "Widget" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function DetailTabs({
  chatbotId,
  documents,
  totalChunks,
  accentColor,
  widgetPosition,
  greeting,
  showSources,
}: {
  chatbotId: string;
  documents: DocRow[];
  totalChunks: number;
  accentColor: string;
  widgetPosition: "left" | "right";
  greeting: string;
  showSources: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("docs");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit gap-1.5 rounded-[11px] bg-[#F4F4F3] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-[8px] px-4.5 py-2.5 text-[13px] font-semibold ${
              tab === t.key ? "bg-white text-[#111] shadow-sm" : "text-[#71717A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "docs" && (
        <DocsTab chatbotId={chatbotId} documents={documents} totalChunks={totalChunks} />
      )}
      {tab === "test" && <TestChat chatbotId={chatbotId} />}
      {tab === "widget" && (
        <WidgetTab
          chatbotId={chatbotId}
          initialAccentColor={accentColor}
          initialPosition={widgetPosition}
          initialGreeting={greeting}
          initialShowSources={showSources}
        />
      )}
    </div>
  );
}
