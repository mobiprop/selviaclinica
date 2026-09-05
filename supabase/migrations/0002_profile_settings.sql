-- Settings page: profile fields, preferences, and avatar storage.
-- Run this in the Supabase SQL Editor against the same project as 0001_init.sql.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists language text not null default 'en',
  add column if not exists timezone text not null default 'America/Argentina/Buenos_Aires',
  add column if not exists date_format text not null default 'MM/DD/YYYY';

-- Auto-create a profiles row for every new auth user, so Settings always has
-- something to read/upsert into even before the user ever saves anything.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users created before this trigger existed.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Avatar storage — each user can only write inside their own "<user_id>/"
-- folder; avatars are publicly readable (needed to display them without a
-- signed-URL round trip).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public can view avatars" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

create policy "authenticated can upload own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "authenticated can update own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "authenticated can delete own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
