-- Phase "Dashboard redesign": widget customization + account name.
-- Run this once in Supabase Dashboard -> SQL Editor, after 0005.

alter table public.chatbots
  add column if not exists accent_color text not null default '#0B7A6E';

alter table public.chatbots
  add column if not exists widget_position text not null default 'right'
    check (widget_position in ('left', 'right'));

alter table public.chatbots
  add column if not exists show_sources boolean not null default true;

alter table public.profiles
  add column if not exists name text;

-- documents had select/insert/update policies (0002) but no delete policy,
-- so the new "Hapus" button in the Dokumen tab would silently no-op under
-- RLS (default deny) without this.
drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
  on public.documents for delete
  using (
    exists (
      select 1 from public.chatbots
      where chatbots.id = documents.chatbot_id
        and chatbots.user_id = auth.uid()
    )
  );
