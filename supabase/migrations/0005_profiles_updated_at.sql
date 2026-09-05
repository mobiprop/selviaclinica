-- profiles is missing updated_at, which src/components/settings/profile-panel.tsx
-- and preferences-panel.tsx have always sent on every save — PostgREST rejects
-- the whole upsert when a payload references a column that doesn't exist, so
-- every Settings > Profile/Preferences save has been failing outright with
-- "Could not find the 'updated_at' column of 'profiles' in the schema cache".
-- Run this in the Supabase SQL Editor against the same project as 0001-0004.

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();
