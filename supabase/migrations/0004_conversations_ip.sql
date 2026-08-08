-- Phase 5: add an IP column for a second rate-limit layer.
-- Run this once in Supabase Dashboard -> SQL Editor, after 0003.

-- visitor_id (Phase 3/4) is client-generated and lives in localStorage, so
-- a determined visitor can bypass its rate limit by clearing storage. IP
-- is a second, independent signal for the public widget endpoint — not
-- foolproof either (shared/office networks, VPNs), but raises the bar.
-- Nullable: the authenticated dashboard test endpoint doesn't set it.
alter table public.conversations add column if not exists ip text;

create index if not exists conversations_chatbot_ip_idx
  on public.conversations (chatbot_id, ip);
