-- Core Dossier schema (multi-user ready, Supabase RLS-first).
-- Naming rule: all persisted artifacts use dossier_ prefix.

create extension if not exists pgcrypto;

create or replace function public.dossier_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.dossier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_name text not null default 'My CV Profile',
  template_id text not null,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists dossier_profiles_user_id_idx on public.dossier_profiles (user_id);
create index if not exists dossier_profiles_template_id_idx on public.dossier_profiles (template_id);

drop trigger if exists dossier_profiles_set_updated_at on public.dossier_profiles;
create trigger dossier_profiles_set_updated_at
before update on public.dossier_profiles
for each row execute function public.dossier_set_updated_at();

create table if not exists public.dossier_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.dossier_profiles(id) on delete cascade,
  bucket_id text not null default 'dossier_cv_exports',
  file_path text not null,
  mime_type text not null default 'application/pdf',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists dossier_exports_user_id_idx on public.dossier_exports (user_id);
create index if not exists dossier_exports_profile_id_idx on public.dossier_exports (profile_id);

alter table public.dossier_profiles enable row level security;
alter table public.dossier_exports enable row level security;

drop policy if exists "dossier_profiles_select_own" on public.dossier_profiles;
create policy "dossier_profiles_select_own"
on public.dossier_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "dossier_profiles_insert_own" on public.dossier_profiles;
create policy "dossier_profiles_insert_own"
on public.dossier_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "dossier_profiles_update_own" on public.dossier_profiles;
create policy "dossier_profiles_update_own"
on public.dossier_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "dossier_profiles_delete_own" on public.dossier_profiles;
create policy "dossier_profiles_delete_own"
on public.dossier_profiles
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "dossier_exports_select_own" on public.dossier_exports;
create policy "dossier_exports_select_own"
on public.dossier_exports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "dossier_exports_insert_own" on public.dossier_exports;
create policy "dossier_exports_insert_own"
on public.dossier_exports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "dossier_exports_delete_own" on public.dossier_exports;
create policy "dossier_exports_delete_own"
on public.dossier_exports
for delete
to authenticated
using (auth.uid() = user_id);

-- Storage buckets (dossier_ prefix enforced).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'dossier_cv_exports',
    'dossier_cv_exports',
    false,
    10485760,
    array['application/pdf']
  ),
  (
    'dossier_cv_imports',
    'dossier_cv_imports',
    false,
    10485760,
    array[
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
  )
on conflict (id) do nothing;

drop policy if exists "dossier_cv_exports_objects_own_all" on storage.objects;
create policy "dossier_cv_exports_objects_own_all"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'dossier_cv_exports'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'dossier_cv_exports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "dossier_cv_imports_objects_own_all" on storage.objects;
create policy "dossier_cv_imports_objects_own_all"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'dossier_cv_imports'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'dossier_cv_imports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

