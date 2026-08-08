import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/** Lazily-created singleton so we don't read env vars at module-eval time
 * (breaks Next.js build tracing) or re-instantiate per call. */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}
