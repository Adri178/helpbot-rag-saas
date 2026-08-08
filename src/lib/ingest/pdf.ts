import { extractText } from "unpdf";

/**
 * Extracts plain text from a PDF's raw bytes, with all pages merged into
 * one string. Uses `unpdf` (a serverless-friendly PDF.js build with no
 * native dependencies) so it works on Vercel without extra config.
 */
export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const { text } = await extractText(bytes, { mergePages: true });
  return text;
}
