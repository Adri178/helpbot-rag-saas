import Script from "next/script";
import { LandingHeader } from "./_landing/LandingHeader";
import { LandingHero } from "./_landing/LandingHero";
import { LandingFeatureStrip } from "./_landing/LandingFeatureStrip";
import { LandingProducts } from "./_landing/LandingProducts";
import { LandingHowItWorks } from "./_landing/LandingHowItWorks";
import { LandingProof } from "./_landing/LandingProof";
import { LandingPricing } from "./_landing/LandingPricing";
import { LandingFinalCTA } from "./_landing/LandingFinalCTA";
import { LandingFooter } from "./_landing/LandingFooter";

export default function Home() {
  const demoChatbotId = process.env.NEXT_PUBLIC_DEMO_CHATBOT_ID;

  return (
    <div className="min-w-[360px]">
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
