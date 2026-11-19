-- InstaFlow AI: single-workspace starter schema
-- Run this in Supabase SQL Editor. Keep service-role key server-side only.
create table if not exists public.ig_account (
  id integer primary key check (id = 1),
  ig_user_id text not null,
  username text not null,
  access_token text not null,
  token_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','published','failed')),
  published_at timestamptz,
  instagram_media_id text,
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.ig_account enable row level security;
alter table public.scheduled_posts enable row level security;
-- No public policies: all access is performed by trusted server routes using service role.


-- Threads account and scheduled text posts
create table if not exists public.threads_account (
  id integer primary key check (id = 1),
  threads_user_id text not null,
  username text not null,
  access_token text not null,
  token_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.threads_posts (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) <= 500),
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','published','failed')),
  published_at timestamptz,
  threads_post_id text,
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.threads_account enable row level security;
alter table public.threads_posts enable row level security;
