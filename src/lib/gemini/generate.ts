import { getGeminiClient } from "./client";

// Discovered the hard way while running eval/run.ts:
// - The "gemini-flash-latest" alias currently resolves to gemini-3.6-flash,
//   whose free tier is capped at just 20 requests/DAY per project — nowhere
//   near enough for a demo product.
// - The older, more generously-quota'd gemini-2.0/2.5-flash models return
//   404 "no longer available to new users" on this (recently-created) API
//   key/project — Google gates them off for newer projects.
// - gemini-3.1-flash-lite is both available to this key AND not the
//   quota-starved newest model, so we pin it directly (not "-latest",
//   to avoid silently drifting onto whatever new model turns out to have
//   the same tiny quota next). Revisit if Google's free-tier quotas change.
export const GENERATION_MODEL = "gemini-3.1-flash-lite";

export interface GenerateAnswerParams {
  systemPrompt: string;
  question: string;
}

/** Calls Gemini Flash for a grounded answer. Kept deliberately low-cost:
 * low temperature (we want factual, not creative) and a modest output cap
 * (a support-bot answer should be short). */
export async function generateAnswer({
  systemPrompt,
  question,
}: GenerateAnswerParams): Promise<string> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: GENERATION_MODEL,
    contents: question,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 500,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini tidak mengembalikan jawaban.");
  }
  return text;
}
