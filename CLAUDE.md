# CLAUDE.md — HelpBot

Instructions for Claude Code. Read `PRD.md` for the full product spec and
`plan.md` for the build order. Keep this file lean.

## What we're building

A multi-tenant AI SaaS: business owners upload documents and get an embeddable
RAG chatbot widget for their website. See PRD.md.

## Tech stack (do not swap without asking)

- Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS
- Supabase: Postgres + Auth + pgvector
- Google Gemini (free tier) for BOTH embeddings and generation (Gemini Flash),
  one API key. Match the `embedding` vector column dimension to the Gemini
  embedding model you choose. (Optional fast backup for generation: Groq.)
- Stripe (test mode) for billing
- Deploy: Vercel + Supabase Cloud

## Working rules

- **Plan before coding.** For any non-trivial task, write the plan first and wait
  for my confirmation. If you can't write the plan clearly, you're not ready to
  code it.
- **Build in vertical slices.** Complete one feature end-to-end (DB → API → UI)
  before starting the next. Do not build all DB, then all API, then all UI.
- **One phase at a time.** Follow the phases in `plan.md`. Do not jump ahead.
- **Keep it simple.** Prefer the simplest solution that works. No premature
  abstraction. No dependencies we don't need.
- **File size limit.** No file over ~300 lines. Split before it grows past that.
- **Write tests** for the ingestion pipeline and the chat/retrieval logic.
- **Explain trade-offs** briefly when you make a non-obvious choice.

## Security (critical — this is multi-tenant)

- Enforce tenant isolation everywhere. A user's bot must only retrieve chunks
  belonging to that user's `chatbot_id`.
- Use Supabase Row Level Security (RLS) on every table.
- Never trust `chatbot_id` from the client without checking ownership.
- Keep all API keys server-side. Never expose them to the browser or the widget.

## AI feature guardrails

- Ground every answer in retrieved chunks. If nothing relevant is retrieved, the
  bot must say it doesn't have that information — never invent an answer.
- Every answer returns its source chunks.
- Cap context length, max tokens, and rate-limit messages per visitor to control
  cost.

## Commands

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run test` — run tests
- `npm run lint` — lint

## Conventions

- TypeScript strict mode on.
- Group code by feature, not by type.
- Environment variables in `.env.local` (never commit); document new ones in
  `.env.example`.
