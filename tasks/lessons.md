# Lessons Learned

## 1. Next.js Sitemap Conflict & Google Search Console Errors
**Problem:** Google Search Console reported "Couldn't fetch" for `sitemap.xml`. There were two root causes:
1. The project had both a dynamic `app/sitemap.ts` and a static `public/sitemap.xml`, causing edge caching glitches and silent routing conflicts.
2. The `sitemap.xml` included the `/editor` path, which was explicitly blocked in `robots.txt` (`Disallow: /editor`). When Googlebot encounters a blocked URL inside a sitemap, it will often reject the entire sitemap with a "Couldn't fetch" error.
**Fix:** Remove the dynamic route (`app/sitemap.ts`) completely. Use a single static `public/sitemap.xml` and ensure strictly that **no URLs in the sitemap are blocked by `robots.txt`**.

## 2. Postgres Schema Mismatch causing silent failures
**Problem:** The live user counter was stuck because the Postgres table `dossier_visitors` was missing the `visit_count` column, and old timestamp columns hadn't been properly renamed to match the updated application queries. The SQL `INSERT` calls were failing silently.
**Fix:** Whenever updating application query logic, ensure the corresponding database schema migrations are completely executed. Always verify tracking/analytics endpoints by running a manual API simulation script to ensure inserts and upserts work correctly against the live database schema.

## 3. UI Component Clickability
**Problem:** A community metric counter card was accidentally made clickable because it shared a component layout (`MetricCard`) with a template library card that required a link.
**Fix:** Ensure optional props like `href` are carefully applied only to the specific instances that require navigation, rather than globally applying it to all sibling components in a layout.
