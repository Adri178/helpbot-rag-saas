import { describe, expect, it } from "vitest";
import { chunkText } from "./chunk";

describe("chunkText", () => {
  it("returns an empty array for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n  ")).toEqual([]);
  });

  it("returns a single chunk when text fits within maxChars", () => {
    const text = "Jam buka toko kami adalah 09.00 - 21.00 setiap hari.";
    const chunks = chunkText(text, { maxChars: 200, overlapChars: 20 });
    expect(chunks).toEqual([text]);
  });

  it("merges short paragraphs into one chunk when they fit together", () => {
    const text = "Paragraf satu.\n\nParagraf dua.\n\nParagraf tiga.";
    const chunks = chunkText(text, { maxChars: 200, overlapChars: 20 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("Paragraf satu.");
    expect(chunks[0]).toContain("Paragraf tiga.");
  });

  it("splits into multiple chunks once paragraphs no longer fit, and every chunk respects maxChars", () => {
    const paragraphs = [
      "Paragraf pertama berisi info toko dan jam operasional lengkap.",
      "Paragraf kedua berisi kebijakan pengembalian barang dalam 7 hari.",
      "Paragraf ketiga berisi info pengiriman ke seluruh Indonesia.",
    ];
    const text = paragraphs.join("\n\n");
    const chunks = chunkText(text, { maxChars: 80, overlapChars: 15 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(80);
    }
  });

  it("carries overlap text from the end of one chunk into the start of the next", () => {
    // maxChars leaves enough headroom above a single paragraph's length for
    // the overlap to actually fit alongside it (see the "drop overlap when
    // it doesn't fit" case covered separately below).
    const paragraphs = [
      "Paragraf pertama berisi info toko dan jam operasional lengkap.",
      "Paragraf kedua berisi kebijakan pengembalian barang dalam 7 hari.",
      "Paragraf ketiga berisi info pengiriman ke seluruh Indonesia.",
    ];
    const text = paragraphs.join("\n\n");
    const chunks = chunkText(text, { maxChars: 100, overlapChars: 15 });

    expect(chunks.length).toBeGreaterThan(1);
    const tailOfFirst = chunks[0].slice(-15);
    expect(chunks[1]).toContain(tailOfFirst);
  });

  it("drops the overlap rather than exceeding maxChars when overlap + next piece would not fit", () => {
    const paragraphs = [
      "Paragraf pertama berisi info toko dan jam operasional lengkap.",
      "Paragraf kedua berisi kebijakan pengembalian barang dalam 7 hari.",
    ];
    const text = paragraphs.join("\n\n");
    const chunks = chunkText(text, { maxChars: 80, overlapChars: 15 });

    expect(chunks.length).toBe(2);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(80);
    }
  });

  it("splits an oversized paragraph (no blank lines) on sentence boundaries", () => {
    const text =
      "Kalimat satu yang cukup panjang untuk diukur. " +
      "Kalimat dua yang juga cukup panjang untuk diukur. " +
      "Kalimat tiga yang juga cukup panjang untuk diukur.";
    const chunks = chunkText(text, { maxChars: 60, overlapChars: 10 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(60);
    }
  });

  it("hard-cuts a single run-on sentence with no punctuation longer than maxChars", () => {
    const text = "kata".repeat(50); // 200 chars, no sentence boundaries
    const chunks = chunkText(text, { maxChars: 50, overlapChars: 0 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
    expect(chunks.join("")).toBe(text);
  });

  it("normalizes CRLF and collapses multiple blank lines between paragraphs", () => {
    const text = "Satu.\r\n\r\n\r\n\r\nDua.";
    const chunks = chunkText(text, { maxChars: 200, overlapChars: 20 });
    expect(chunks).toEqual(["Satu.\n\nDua."]);
  });
});
