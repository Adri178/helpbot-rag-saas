import { getGeminiClient } from "./client";

// Alias that always points to Google's current recommended Flash model,
// so we don't have to chase version bumps by hand.
export const GENERATION_MODEL = "gemini-flash-latest";

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
