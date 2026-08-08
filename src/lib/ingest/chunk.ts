const DEFAULT_MAX_CHARS = 1000;
const DEFAULT_OVERLAP_CHARS = 150;

export interface ChunkOptions {
  /** Max characters per chunk. */
  maxChars?: number;
  /** Characters of trailing context repeated at the start of the next chunk. */
  overlapChars?: number;
}

/**
 * Splits `text` into overlapping chunks for embedding, preferring to break
 * on paragraph then sentence boundaries so a chunk reads coherently on its
 * own. Pure function — no I/O — so it's cheap to unit test without hitting
 * the Gemini API.
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const overlapChars = options.overlapChars ?? DEFAULT_OVERLAP_CHARS;

  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pieces: string[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      pieces.push(paragraph);
    } else {
      pieces.push(...splitOversizedParagraph(paragraph, maxChars));
    }
  }

  return mergeWithOverlap(pieces, maxChars, overlapChars);
}

/** Splits a too-long paragraph on sentence boundaries, hard-cutting any
 * single sentence that is itself still too long (e.g. no punctuation). */
function splitOversizedParagraph(text: string, maxChars: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const pieces: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      if (buffer) {
        pieces.push(buffer);
        buffer = "";
      }
      for (let i = 0; i < sentence.length; i += maxChars) {
        pieces.push(sentence.slice(i, i + maxChars));
      }
      continue;
    }

    const candidate = buffer ? `${buffer} ${sentence}` : sentence;
    if (candidate.length > maxChars) {
      pieces.push(buffer);
      buffer = sentence;
    } else {
      buffer = candidate;
    }
  }
  if (buffer) pieces.push(buffer);

  return pieces;
}

/** Greedily packs pieces into chunks up to `maxChars`, carrying the tail of
 * each chunk into the start of the next so context isn't lost at the seam. */
function mergeWithOverlap(
  pieces: string[],
  maxChars: number,
  overlapChars: number
): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current}\n\n${piece}` : piece;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);

    const overlap = current.slice(-overlapChars);
    const withOverlap = overlap ? `${overlap}\n\n${piece}` : piece;
    // If even the overlap + this piece would exceed maxChars (the piece is
    // already close to maxChars on its own), drop the overlap.
    current = withOverlap.length <= maxChars ? withOverlap : piece;
  }
  if (current) chunks.push(current);

  return chunks;
}
