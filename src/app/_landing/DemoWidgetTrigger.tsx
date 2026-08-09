"use client";

/** Opens the real widget.js chat bubble (bottom-right) instead of
 * navigating anywhere — "Lihat demo" should show the actual RAG demo bot,
 * not a mockup. */
export function DemoWidgetTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const bubble = document.querySelector<HTMLButtonElement>(".helpbot-bubble");
        bubble?.click();
        bubble?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      {children}
    </button>
  );
}
