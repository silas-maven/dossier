# 48-Hour SEO/AEO/GEO Experiment Runbook

## Objective
Increase unique visitors from baseline and measure source attribution quality over a 48-hour window.

## Experiment Window
- T0 (start): `2026-02-25T22:33:01Z`
- T+48h (end): `2026-02-27T22:33:01Z`

## Locked Baseline
- Baseline unique visitors: `34`
- Source of truth: `public.dossier_visitors`
- Note: `public.dossier_app_metrics.total_visitors` is treated as display cache.

## Snapshot SQL (Run at T0 and T+48h)

### 1) Total unique visitors
```sql
select count(*)::int as total_unique_visitors
from public.dossier_visitors;
```

### 2) New unique visitors during the window
```sql
select count(*)::int as new_unique_visitors
from public.dossier_visitors
where first_seen >= '2026-02-25T22:33:01Z'::timestamptz
  and first_seen <  '2026-02-27T22:33:01Z'::timestamptz;
```

### 3) Top 10 first-touch sources
```sql
select
  coalesce(nullif(first_source_key, ''), 'direct') as source_key,
  count(*)::int as visitors
from public.dossier_visitors
group by 1
order by visitors desc
limit 10;
```

### 4) Top 10 first-touch sources for this experiment window
```sql
select
  coalesce(nullif(first_source_key, ''), 'direct') as source_key,
  count(*)::int as visitors
from public.dossier_visitors
where first_seen >= '2026-02-25T22:33:01Z'::timestamptz
  and first_seen <  '2026-02-27T22:33:01Z'::timestamptz
group by 1
order by visitors desc
limit 10;
```

## Readout Template

### Inputs
- T0 total visitors: `34`
- T+48h total visitors: `<fill>`
- New visitors in window: `<fill>`

### Derived Metrics
- Absolute lift: `T+48h total - 34`
- Percent lift: `((T+48h total - 34) / 34) * 100`

### Success Criteria
- Pass: `>= 25%` lift (`34 -> 43+`)
- Fail: `< 25%` lift

### Notes
- This cycle includes all traffic (no bot filtering).
- Attribution keys expected: `utm:*`, `ref:*`, `direct`.
- If below threshold:
  1. Tune metadata/FAQ copy for search-answer relevance.
  2. Improve campaign UTM discipline for social/referral links.
