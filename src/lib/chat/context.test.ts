import { describe, expect, it } from "vitest";
import {
  buildContext,
  buildSystemPrompt,
  hasUsableContext,
  type RetrievedChunk,
} from "./context";

function chunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    id: "chunk-1",
    documentId: "doc-1",
    content: "Jam buka toko 09.00-21.00.",
    similarity: 0.8,
    ...overrides,
  };
}

describe("hasUsableContext", () => {
  it("is false when there are no chunks", () => {
    expect(hasUsableContext([])).toBe(false);
  });

  it("is false when the best similarity is below the threshold", () => {
    expect(hasUsableContext([chunk({ similarity: 0.1 })])).toBe(false);
  });

  it("is true when the best similarity meets the threshold", () => {
    expect(hasUsableContext([chunk({ similarity: 0.3 })])).toBe(true);
  });
});

describe("buildContext", () => {
  it("returns an empty string for no chunks", () => {
    expect(buildContext([])).toBe("");
  });

  it("includes all chunks when they fit within maxChars", () => {
    const chunks = [chunk({ content: "A" }), chunk({ content: "B" })];
    const context = buildContext(chunks, 1000);
    expect(context).toContain("A");
    expect(context).toContain("B");
    expect(context).toContain("[Sumber 1]");
    expect(context).toContain("[Sumber 2]");
  });

  it("stops adding chunks once maxChars would be exceeded", () => {
    const chunks = [
      chunk({ content: "x".repeat(50) }),
      chunk({ content: "y".repeat(50) }),
      chunk({ content: "z".repeat(50) }),
    ];
    const context = buildContext(chunks, 80);
    expect(context).toContain("x");
    expect(context).not.toContain("y");
    expect(context).not.toContain("z");
  });

  it("always includes at least the first chunk, even if it alone exceeds maxChars", () => {
    const chunks = [chunk({ content: "x".repeat(200) })];
    const context = buildContext(chunks, 50);
    expect(context).toContain("x".repeat(200));
  });
});

describe("buildSystemPrompt", () => {
  it("includes the grounding instruction by default", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/tidak punya informasi/);
  });

  it("appends the chatbot owner's custom instructions when provided", () => {
    const prompt = buildSystemPrompt("Selalu sebut nama toko: Toko Baju Keren.");
    expect(prompt).toContain("Toko Baju Keren");
    expect(prompt).toMatch(/tidak punya informasi/);
  });

  it("ignores a blank custom prompt", () => {
    const prompt = buildSystemPrompt("   ");
    expect(prompt).not.toContain("Instruksi tambahan");
  });
});
