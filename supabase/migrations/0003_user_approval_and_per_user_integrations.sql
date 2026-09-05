-- Self-serve registration + admin approval, and per-user Google integrations.
-- Run this in the Supabase SQL Editor against the same project as 0001/0002.

-- ---------------------------------------------------------------------------
-- profiles: role + approval status
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists role text not null default 'staff' check (role in ('admin', 'staff')),
  add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'denied'));

-- Existing accounts were created by hand by the admin before self-serve
-- registration existed — they're already vetted, so grandfather them in
-- instead of locking everyone (including the admin) out.
update public.profiles set status = 'approved' where status = 'pending';

update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'matiasulrich96@gmail.com');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text := new.raw_user_meta_data ->> 'full_name';
begin
  insert into public.profiles (id, full_name, first_name, last_name)
  values (
    new.id,
    full_name,
    split_part(full_name, ' ', 1),
    nullif(substr(full_name, length(split_part(full_name, ' ', 1)) + 2), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Prevents self-approval / self-promotion: only a request made with the
-- service-role key (i.e. our admin approve/deny Route Handlers) may change
-- status or role. The normal "users can update own profile" policy still
-- lets people save their own name/phone/bio/avatar — this only blocks the
-- two privileged columns from being touched by anyone else.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.status is distinct from old.status or new.role is distinct from old.role)
     and auth.role() <> 'service_role' then
    raise exception 'Only an admin action can change status or role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ---------------------------------------------------------------------------
-- Require approval to read/write clinic data — closes the gap where a
-- freshly-registered, not-yet-approved user already holds a valid session
-- and could otherwise call Supabase directly, bypassing the app's UI gate.
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated can read appointments" on public.appointments;
drop policy if exists "authenticated can insert appointments" on public.appointments;
drop policy if exists "authenticated can update appointments" on public.appointments;

create policy "approved users can read appointments" on public.appointments
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can insert appointments" on public.appointments
  for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can update appointments" on public.appointments
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));

drop policy if exists "authenticated can read supplies" on public.supplies;
drop policy if exists "authenticated can insert supplies" on public.supplies;
drop policy if exists "authenticated can update supplies" on public.supplies;

create policy "approved users can read supplies" on public.supplies
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can insert supplies" on public.supplies
  for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can update supplies" on public.supplies
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));

drop policy if exists "authenticated can read settings" on public.app_settings;
drop policy if exists "authenticated can upsert settings" on public.app_settings;
drop policy if exists "authenticated can update settings" on public.app_settings;

create policy "approved users can read settings" on public.app_settings
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can upsert settings" on public.app_settings
  for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));
create policy "approved users can update settings" on public.app_settings
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved'));

-- ---------------------------------------------------------------------------
-- Per-user Google Calendar/Drive: integration_tokens + integration_connections
-- move from one shared row per `kind` to a personal row per (kind, user_id)
-- for google-calendar/google-drive, while mcp/meta-ads stay shared
-- (user_id is null).
-- ---------------------------------------------------------------------------
-- Every row always carries a real user_id — for google-calendar/google-drive
-- that's the person who personally connected it; for the shared kinds (mcp,
-- meta-ads) it's just whoever happened to set it up, since those two are
-- treated as clinic-wide regardless of owner (see the RLS policy below,
-- which keys shared-vs-personal off `kind`, not off user_id being null).
-- Plain (kind, user_id) is enough as the natural key — no partial indexes,
-- since PostgREST's upsert `on_conflict` can't target those reliably.
alter table public.integration_tokens
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

update public.integration_tokens t
set user_id = coalesce(
  (select c.connected_by from public.integration_connections c where c.kind = t.kind),
  (select p.id from public.profiles p where p.role = 'admin' limit 1)
)
where t.user_id is null;

alter table public.integration_tokens alter column user_id set not null;
alter table public.integration_tokens drop constraint if exists integration_tokens_pkey;
alter table public.integration_tokens add primary key (id);
alter table public.integration_tokens drop constraint if exists integration_tokens_kind_user_key;
alter table public.integration_tokens add constraint integration_tokens_kind_user_key unique (kind, user_id);

alter table public.integration_connections
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

update public.integration_connections set user_id = connected_by where user_id is null;
update public.integration_connections c
set user_id = (select p.id from public.profiles p where p.role = 'admin' limit 1)
where c.user_id is null;

alter table public.integration_connections alter column user_id set not null;
alter table public.integration_connections drop constraint if exists integration_connections_pkey;
alter table public.integration_connections add primary key (id);
alter table public.integration_connections drop column if exists connected_by;
alter table public.integration_connections drop constraint if exists integration_connections_kind_user_key;
alter table public.integration_connections add constraint integration_connections_kind_user_key unique (kind, user_id);

drop policy if exists "authenticated can read connections" on public.integration_connections;
create policy "users can read own or shared connections" on public.integration_connections
  for select to authenticated
  using (kind in ('mcp', 'meta-ads') or user_id = auth.uid());
