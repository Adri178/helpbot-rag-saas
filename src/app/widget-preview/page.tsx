import Script from "next/script";

/**
 * Bare canvas meant to be embedded in an <iframe> (see WidgetTab.tsx) so
 * the dashboard's widget customization preview is the *real* widget.js
 * running against real settings — not a mockup that could drift from
 * what actually ships to a visitor's site.
 */
export default async function WidgetPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ chatbotId?: string }>;
}) {
  const { chatbotId } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-[#F4F4F3] p-4.5">
      <div className="h-3.5 w-3/5 rounded-full bg-[#E7E7E4]" />
      <div className="h-2.5 w-4/5 rounded-full bg-[#EDEDEA]" />
      <div className="h-2.5 w-3/4 rounded-full bg-[#EDEDEA]" />
      <div className="mt-1.5 h-[120px] rounded-[10px] bg-[#EDEDEA]" />

      {chatbotId && (
        <Script src="/widget.js" data-chatbot-id={chatbotId} strategy="afterInteractive" />
      )}
    </div>
  );
}
