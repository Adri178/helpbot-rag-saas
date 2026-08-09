import Script from "next/script";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { LandingHeader } from "./_landing/LandingHeader";
import { LandingHero } from "./_landing/LandingHero";
import { LandingFeatureStrip } from "./_landing/LandingFeatureStrip";
import { LandingProducts } from "./_landing/LandingProducts";
import { LandingHowItWorks } from "./_landing/LandingHowItWorks";
import { LandingProof } from "./_landing/LandingProof";
import { LandingPricing } from "./_landing/LandingPricing";
import { LandingFinalCTA } from "./_landing/LandingFinalCTA";
import { LandingFooter } from "./_landing/LandingFooter";

// Scoped to the landing page only (rest of the app keeps the Geist fonts
// from layout.tsx) — this page came from a dedicated design import and
// deliberately has its own type system.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function Home() {
  const demoChatbotId = process.env.NEXT_PUBLIC_DEMO_CHATBOT_ID;

  return (
    <div
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} min-w-[360px] bg-white text-[#0A0A0A] antialiased [font-family:var(--font-instrument-sans),Helvetica,sans-serif] [&_.font-mono]:[font-family:var(--font-jetbrains-mono),monospace]`}
    >
      <LandingHeader />
      <LandingHero />
      <LandingFeatureStrip />
      <LandingProducts />
      <LandingHowItWorks />
      <LandingProof />
      <LandingPricing />
      <LandingFinalCTA />
      <LandingFooter />

      {demoChatbotId && (
        <Script
          src="/widget.js"
          data-chatbot-id={demoChatbotId}
          strategy="afterInteractive"
        />
      )}
    </div>
  );
}
