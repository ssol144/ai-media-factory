-- AI Media Factory workspace foundation (Supabase SQL Editor)
-- This schema creates multi-workspace tables with user-scoped RLS.
-- Do not store social access tokens in browser/localStorage.
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key(workspace_id,user_id)
);
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('instagram','threads','tiktok','youtube','naver')),
  account_name text not null,
  handle text,
  owner_type text not null default 'self' check (owner_type in ('self','client')),
  external_account_id text,
  connection_status text not null default 'pending' check (connection_status in ('pending','connected','expired','revoked')),
  token_ciphertext text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  platform text not null check (platform in ('instagram','threads','tiktok','youtube','naver')),
  niche text,
  title text,
  body text not null,
  hashtags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','scheduled','published','failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  duration_seconds numeric,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  metric_date date not null,
  followers bigint,
  views bigint,
  reach bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  link_clicks bigint,
  created_at timestamptz not null default now(),
  unique(social_account_id,metric_date)
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.workspace_members wm where wm.workspace_id=target_workspace and wm.user_id=auth.uid());
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.social_accounts enable row level security;
alter table public.content_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.analytics_snapshots enable row level security;

drop policy if exists workspace_member_read on public.workspaces;
create policy workspace_member_read on public.workspaces for select using (public.is_workspace_member(id));
drop policy if exists workspace_owner_insert on public.workspaces;
create policy workspace_owner_insert on public.workspaces for insert with check (created_by=auth.uid());
drop policy if exists member_read on public.workspace_members;
create policy member_read on public.workspace_members for select using (public.is_workspace_member(workspace_id));
drop policy if exists member_manage on public.workspace_members;
create policy member_manage on public.workspace_members for all using (exists(select 1 from public.workspace_members m where m.workspace_id=workspace_members.workspace_id and m.user_id=auth.uid() and m.role in ('owner','admin'))) with check (exists(select 1 from public.workspace_members m where m.workspace_id=workspace_members.workspace_id and m.user_id=auth.uid() and m.role in ('owner','admin')));

do $$ declare t text; begin
  foreach t in array array['social_accounts','content_items','media_assets','analytics_snapshots'] loop
    execute format('drop policy if exists workspace_member_all on public.%I',t);
    execute format('create policy workspace_member_all on public.%I for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))',t);
  end loop;
end $$;

-- Storage bucket creation is done in Supabase Dashboard: Storage > New bucket > media.
-- Set bucket private. Add authenticated policies scoped to a workspace path after auth UI is implemented.
