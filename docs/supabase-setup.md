# Supabase Setup (Dossier)

## Environment keys
Expected keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

## Naming convention
All persisted artifacts must use the `dossier_` prefix:
- Tables: `dossier_profiles`, `dossier_exports`
- Buckets: `dossier_cv_exports`, `dossier_cv_imports`

## Migration
Apply:
- `supabase/migrations/20260219_000001_dossier_core.sql`

This migration creates:
- Profile storage table (`dossier_profiles`)
- Export artifact table (`dossier_exports`)
- Storage buckets with `dossier_` prefix
- RLS policies scoped to `auth.uid()` for multi-user segregation

## Notes for next auth phase
- Keep every row keyed by `user_id`.
- Store files under `/{user_id}/...` paths in the `dossier_` buckets.
- Do not use service role key on the client.

