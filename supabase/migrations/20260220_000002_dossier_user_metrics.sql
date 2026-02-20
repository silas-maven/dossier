-- Public app metrics used by landing page counters.
-- Naming rule: all persisted artifacts use dossier_ prefix.

create table if not exists public.dossier_app_metrics (
  id smallint primary key default 1 check (id = 1),
  total_users integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.dossier_app_metrics enable row level security;

drop policy if exists "dossier_app_metrics_read_all" on public.dossier_app_metrics;
create policy "dossier_app_metrics_read_all"
on public.dossier_app_metrics
for select
to anon, authenticated
using (true);

create or replace function public.dossier_refresh_user_metrics()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.dossier_app_metrics (id, total_users, updated_at)
  values (
    1,
    (select count(*)::int from auth.users),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    total_users = excluded.total_users,
    updated_at = excluded.updated_at;

  return null;
end;
$$;

drop trigger if exists dossier_refresh_metrics_on_auth_users on auth.users;
create trigger dossier_refresh_metrics_on_auth_users
after insert or delete on auth.users
for each statement execute function public.dossier_refresh_user_metrics();

insert into public.dossier_app_metrics (id, total_users, updated_at)
values (
  1,
  (select count(*)::int from auth.users),
  timezone('utc', now())
)
on conflict (id) do update
set
  total_users = excluded.total_users,
  updated_at = excluded.updated_at;
