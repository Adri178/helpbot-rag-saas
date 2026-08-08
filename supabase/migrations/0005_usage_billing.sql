-- Phase 6: usage tracking + Midtrans billing.
-- Run this once in Supabase Dashboard -> SQL Editor, after 0004.

-- ---------------------------------------------------------------------------
-- usage
-- ---------------------------------------------------------------------------
create table if not exists public.usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null, -- 'YYYY-MM', UTC
  message_count int not null default 0,
  primary key (user_id, month)
);

alter table public.usage enable row level security;

drop policy if exists "usage_select_own" on public.usage;
create policy "usage_select_own"
  on public.usage for select
  using (auth.uid() = user_id);

-- No direct insert/update policy: rows are only ever written through
-- increment_usage() below, which is SECURITY INVOKER — the authenticated
-- owner's client can call it for their own user_id, and the public
-- widget's service-role client bypasses RLS entirely for the visitor's
-- bot owner's usage. Either way, application code always passes the
-- chatbot owner's id, never a caller-supplied one for someone else.
drop policy if exists "usage_insert_own" on public.usage;
create policy "usage_insert_own"
  on public.usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "usage_update_own" on public.usage;
create policy "usage_update_own"
  on public.usage for update
  using (auth.uid() = user_id);

create or replace function public.increment_usage(p_user_id uuid, p_month text)
returns int
language sql
security invoker
set search_path = public
as $$
  insert into public.usage (user_id, month, message_count)
  values (p_user_id, p_month, 1)
  on conflict (user_id, month)
  do update set message_count = public.usage.message_count + 1
  returning message_count;
$$;

-- ---------------------------------------------------------------------------
-- billing_orders: one row per Midtrans Snap transaction we create, so the
-- webhook can look up "which of our users does this order_id belong to"
-- without parsing anything out of the order_id string itself.
-- ---------------------------------------------------------------------------
create table if not exists public.billing_orders (
  order_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount int not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_orders enable row level security;

drop policy if exists "billing_orders_select_own" on public.billing_orders;
create policy "billing_orders_select_own"
  on public.billing_orders for select
  using (auth.uid() = user_id);

-- Created by the authenticated user's own client when starting checkout
-- (checkMessageQuota-style: auth.uid() = user_id). Updated afterwards only
-- by the webhook via the service-role client, which bypasses RLS.
drop policy if exists "billing_orders_insert_own" on public.billing_orders;
create policy "billing_orders_insert_own"
  on public.billing_orders for insert
  with check (auth.uid() = user_id);
