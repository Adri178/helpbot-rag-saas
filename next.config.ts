import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB; PDF uploads need headroom up to our 5MB app-level
      // cap (see MAX_PDF_BYTES in dashboard/[chatbotId]/actions.ts).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
