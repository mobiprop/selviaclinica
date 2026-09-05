-- Selvia Dashboard — initial production schema.
-- Run this once in the Supabase SQL Editor (or `supabase db push`) against a
-- fresh project before running scripts/migrate-seed-data.ts.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  appointment_date date not null,
  treatment text not null,
  price numeric not null default 0,
  reservation numeric not null default 0,
  net_revenue numeric not null default 0,
  status text not null check (status in ('Scheduled', 'Completed', 'Returned')),
  source text not null check (source in ('Marketing', 'Website', 'Instagram', 'Referral', 'Email', 'Social')),
  doctor text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "authenticated can read appointments" on public.appointments
  for select to authenticated using (true);
create policy "authenticated can insert appointments" on public.appointments
  for insert to authenticated with check (true);
create policy "authenticated can update appointments" on public.appointments
  for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- supplies
-- ---------------------------------------------------------------------------
create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default '',
  usage text not null check (usage in ('Estimado', 'Exacto')),
  currency text not null check (currency in ('ARS', 'USD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplies enable row level security;

create policy "authenticated can read supplies" on public.supplies
  for select to authenticated using (true);
create policy "authenticated can insert supplies" on public.supplies
  for insert to authenticated with check (true);
create policy "authenticated can update supplies" on public.supplies
  for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- app_settings — small key/value store (monthly_target today, extensible)
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "authenticated can read settings" on public.app_settings
  for select to authenticated using (true);
create policy "authenticated can upsert settings" on public.app_settings
  for insert to authenticated with check (true);
create policy "authenticated can update settings" on public.app_settings
  for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- integration_connections — what the UI is allowed to read (no secrets)
-- ---------------------------------------------------------------------------
create table if not exists public.integration_connections (
  kind text primary key check (kind in ('mcp', 'google-calendar', 'google-drive', 'meta-ads')),
  connected_by uuid references auth.users (id),
  account_label text,
  connected_at timestamptz not null default now()
);

alter table public.integration_connections enable row level security;

create policy "authenticated can read connections" on public.integration_connections
  for select to authenticated using (true);
-- All writes (insert/update/delete) happen only from server routes using the
-- service role key (which bypasses RLS) — see src/app/api/integrations/**.

-- ---------------------------------------------------------------------------
-- integration_tokens — service-role only, never exposed to the browser
-- ---------------------------------------------------------------------------
create table if not exists public.integration_tokens (
  kind text primary key check (kind in ('google-calendar', 'google-drive', 'meta-ads')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.integration_tokens enable row level security;
-- Intentionally no policies: anon and authenticated get zero access.
-- Only the service-role key (used exclusively in Route Handlers) can touch this table.

-- ---------------------------------------------------------------------------
-- profiles — display name/avatar for the signed-in staff member
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text
);

alter table public.profiles enable row level security;

create policy "authenticated can read profiles" on public.profiles
  for select to authenticated using (true);
create policy "users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "users can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
