-- Track unique app visitors (local + cloud users) via anonymous visitor_id.
-- Naming rule: all persisted artifacts use dossier_ prefix.

alter table public.dossier_app_metrics
add column if not exists total_visitors integer not null default 0;

create table if not exists public.dossier_visitors (
  visitor_id text primary key,
  first_seen timestamptz not null default timezone('utc', now()),
  last_seen timestamptz not null default timezone('utc', now()),
  last_path text,
  user_agent text
);

alter table public.dossier_visitors enable row level security;

create or replace function public.dossier_increment_visitor_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dossier_app_metrics (id, total_users, total_visitors, updated_at)
  values (1, 0, 0, timezone('utc', now()))
  on conflict (id) do nothing;

  update public.dossier_app_metrics
  set
    total_visitors = total_visitors + 1,
    updated_at = timezone('utc', now())
  where id = 1;

  return null;
end;
$$;

drop trigger if exists dossier_increment_metrics_on_visitors on public.dossier_visitors;
create trigger dossier_increment_metrics_on_visitors
after insert on public.dossier_visitors
for each row execute function public.dossier_increment_visitor_metrics();

insert into public.dossier_app_metrics (id, total_users, total_visitors, updated_at)
values (
  1,
  (select count(*)::int from auth.users),
  (select count(*)::int from public.dossier_visitors),
  timezone('utc', now())
)
on conflict (id) do update
set
  total_users = excluded.total_users,
  total_visitors = excluded.total_visitors,
  updated_at = excluded.updated_at;
