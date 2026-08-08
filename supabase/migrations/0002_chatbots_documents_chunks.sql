-- Phase 2: chatbots, documents, chunks (RAG ingestion pipeline).
-- Run this once in Supabase Dashboard -> SQL Editor, after 0001_profiles.sql.

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- chatbots
-- ---------------------------------------------------------------------------
create table if not exists public.chatbots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  system_prompt text,
  greeting text,
  created_at timestamptz not null default now()
);

alter table public.chatbots enable row level security;

create policy "chatbots_select_own"
  on public.chatbots for select
  using (auth.uid() = user_id);

create policy "chatbots_insert_own"
  on public.chatbots for insert
  with check (auth.uid() = user_id);

create policy "chatbots_update_own"
  on public.chatbots for update
  using (auth.uid() = user_id);

create policy "chatbots_delete_own"
  on public.chatbots for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  filename text not null,
  source_type text not null check (source_type in ('pdf', 'text', 'faq')),
  status text not null default 'processing'
    check (status in ('processing', 'ready', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = documents.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

create policy "documents_insert_own"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.chatbots
      where chatbots.id = documents.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

create policy "documents_update_own"
  on public.documents for update
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = documents.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- chunks
-- ---------------------------------------------------------------------------
-- embedding dimension = 1536, matching gemini-embedding-001 truncated via
-- outputDimensionality (see src/lib/gemini/embed.ts). pgvector's HNSW/IVFFlat
-- indexes cap out around 2000 dims, so we can't use the model's raw 3072.
create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  -- Denormalized from documents.chatbot_id so retrieval queries (Phase 3)
  -- and RLS don't need to join through documents on every chat request.
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.chunks enable row level security;

create policy "chunks_select_own"
  on public.chunks for select
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = chunks.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

create policy "chunks_insert_own"
  on public.chunks for insert
  with check (
    exists (
      select 1 from public.chatbots
      where chatbots.id = chunks.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

create index if not exists chunks_embedding_hnsw_idx
  on public.chunks using hnsw (embedding vector_cosine_ops);

create index if not exists chunks_chatbot_id_idx
  on public.chunks (chatbot_id);
