-- Visitor attribution sources and stricter signal capture.
-- Excludes noisy local/vercel hosts at API ingestion time; this migration
-- adds per-visitor attribution fields and a source aggregate table.

alter table public.dossier_visitors
add column if not exists first_source_key text,
add column if not exists first_source_label text,
add column if not exists first_referrer text,
add column if not exists last_source_key text,
add column if not exists last_source_label text,
add column if not exists last_referrer text;

create table if not exists public.dossier_visitor_sources (
  source_key text primary key,
  source_label text not null,
  visitor_count integer not null default 0,
  last_seen timestamptz not null default timezone('utc', now())
);

alter table public.dossier_visitor_sources enable row level security;

drop policy if exists "dossier_visitor_sources_read_all" on public.dossier_visitor_sources;
create policy "dossier_visitor_sources_read_all"
on public.dossier_visitor_sources
for select
to anon, authenticated
using (true);

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

  if new.first_source_key is not null and length(new.first_source_key) > 0 then
    insert into public.dossier_visitor_sources (source_key, source_label, visitor_count, last_seen)
    values (
      new.first_source_key,
      coalesce(new.first_source_label, new.first_source_key),
      1,
      timezone('utc', now())
    )
    on conflict (source_key) do update
    set
      source_label = excluded.source_label,
      visitor_count = public.dossier_visitor_sources.visitor_count + 1,
      last_seen = excluded.last_seen;
  end if;

  return null;
end;
$$;

insert into public.dossier_visitor_sources (source_key, source_label, visitor_count, last_seen)
select
  coalesce(nullif(first_source_key, ''), 'direct') as source_key,
  coalesce(nullif(first_source_label, ''), 'direct') as source_label,
  count(*)::int as visitor_count,
  max(last_seen) as last_seen
from public.dossier_visitors
group by 1, 2
on conflict (source_key) do update
set
  source_label = excluded.source_label,
  visitor_count = excluded.visitor_count,
  last_seen = excluded.last_seen;
