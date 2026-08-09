import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Loaded once at the root so every page — auth, 404, error, as well as
// the landing page and dashboard — shares the design system's type.
// (These used to be declared per-page, which left the auth and error
// pages falling back to Arial.)
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

export const metadata: Metadata = {
  title: "HelpBot — Chatbot dari dokumen bisnismu",
  description:
    "Upload FAQ, katalog, atau panduan. HelpBot menjawab pengunjung websitemu hanya dari dokumen itu — dengan kutipan sumber.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-[#0A0A0A]">
        {children}
      </body>
    </html>
  );
}
