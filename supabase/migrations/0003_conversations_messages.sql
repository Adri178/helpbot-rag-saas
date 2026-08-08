-- Phase 3: conversations, messages, and the vector similarity RPC.
-- Run this once in Supabase Dashboard -> SQL Editor, after 0002.

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  -- Free-form for now (dashboard test box uses a fixed value). Phase 4's
  -- public widget will populate this with a real per-browser visitor id.
  visitor_id text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "conversations_select_own"
  on public.conversations for select
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = conversations.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (
    exists (
      select 1 from public.chatbots
      where chatbots.id = conversations.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      join public.chatbots on chatbots.id = conversations.chatbot_id
      where conversations.id = messages.conversation_id
        and chatbots.user_id = auth.uid()
    )
  );

create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      join public.chatbots on chatbots.id = conversations.chatbot_id
      where conversations.id = messages.conversation_id
        and chatbots.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- match_chunks: nearest-neighbour search scoped to one chatbot.
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER (the default, stated explicitly): runs as the calling
-- role, so RLS on `chunks` still applies. The match_chatbot_id filter below
-- is defense-in-depth, not a substitute for RLS as the source of truth on
-- tenant isolation.
create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_chatbot_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    chunks.metadata,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from public.chunks
  where chunks.chatbot_id = match_chatbot_id
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
