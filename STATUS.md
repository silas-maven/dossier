# Dossier — Status

## Current State
LIVE. The Next.js local-first CV builder is deployed at your-dossier.xyz. Supports multi-profile management, section-based editing with IndexedDB local storage, and one-click PDF generation via @react-pdf/renderer.

## Session Log
### 2026-06-09 (later) — live verification + Stripe Checkout
- **Managed AI verified against live keys.** Dropped both nemotron models (550b timed out, 120b leaked reasoning in testing); chain is now `openai/gpt-oss-120b:free` (OpenRouter) → `gpt-4o-mini` (OpenAI). Added a 30s per-model timeout and JSON-validity check so a flaky/slow model fails over instead of returning junk. Confirmed live: gpt-oss + gpt-4o-mini both return clean output; runner returns non-empty text and parseable JSON.
- **Credit DB flow verified against live Supabase**: atomic decrement, refund, idempotent top-ups, consume→null at zero. Tables auto-create fine.
- **Switched the buy flow from dashboard Payment Links to programmatic Stripe Checkout Sessions** (operator added API keys, not link URLs; Stripe's recommended path; fewer env vars; supports all 3 bundles). New `app/api/stripe/checkout/route.ts` creates a session with `client_reference_id` + `metadata.credits`; webhook now reads `session.metadata.credits` (price-id fallback retained). `lib/ai/credit-bundles.ts` is now a code catalog (`CREDIT_BUNDLES`) + server price-id resolver. `lib/ai/wallet.ts` `startCreditsCheckout()` POSTs and redirects; `AiModeBar` shows £1/£2.50/£5 buy buttons. Dropped `NEXT_PUBLIC_STRIPE_CREDITS_URL`.
- **Stripe MCP connected to the LIVE account** (`acct_1TgC15…`, "Dossier"). Created the 3 products + prices in **LIVE** via the MCP (the earlier test-mode ones via the sk_test key are stranded/ignorable). Live price IDs now in `.env`: SMALL `price_1TgEElCu1vvTzkOqHE0nbQsm` (£1/10), MEDIUM `price_1TgEEpCu1vvTzkOqK1WbwJYt` (£2.50/30), LARGE `price_1TgEErCu1vvTzkOqz9u0zJBz` (£5/70).
- **Final bundles (live)**: Spark £1/5, Refill £2.50/15, Surge £5/35 (credits cut from 10/30/70 so the top pack runs out within a heavy user's week → drives repeat purchase; £1 is the free→paid on-ramp). Live products renamed + descriptions corrected via MCP; prices (£ amounts) unchanged so `.env` price IDs still valid. Code `CREDIT_BUNDLES` updated to match.
- Verified Checkout Session creation works (test-mode run earlier; identical code path for live).
- Gates: tsc clean, 34/34 tests, 0 lint errors in changed files.
- **COHERENCE BLOCKER**: `.env` STRIPE_SECRET_KEY is still `sk_test_`. The app's checkout route uses the env key to build sessions with the LIVE price IDs — a test key CANNOT use live prices, so checkout will 502 until a **live** secret (or restricted `rk_live_`) key is set wherever the app runs (local .env and/or Vercel). Webhook signing secret also still empty.

### 2026-06-09
- Built the **managed "Dossier AI" tier + PII sanitizer + Trackr handoff** (plan: `~/.claude/plans/nvidia-nemotron-3-ultra-550b-a55b-free-n-stateful-hopper.md`). BYOK stays free/unlimited; managed AI is paid-only via prepaid credits, no user accounts.
- **Trackr handoff** (shippable now): one-time post-download pop-up + always-on side link in the editor preview panel. `components/editor/trackr-promo.tsx`, wired into `app/editor/cv-preview-pane.tsx` (fires once after first download, localStorage-gated `dossier:trackr-promo-seen:v1`) and `components/editor/editor-preview-panel.tsx`. UTM-tagged links to trackr-pro.com. Article deferred.
- **PII sanitizer** `lib/ai/sanitize.ts` (+ shared matcher extracted to `lib/text-match.ts`, re-exported from `lib/ats-readiness.ts`). Seeded redaction of name/email/phone/location/url from `basics`, then redacts those values across the body + a general email/phone/url pattern pass. Name common-word guard (skips Will/Mark/etc.). Runs client-side before fetch and server-side as backstop. **Fixed the real `match-jd` leak** (tailor-pane was sending full `profile.basics`). `flattenProfileForPrompt` now also redacts in-body PII.
- **Managed tier** (server-only, slugs never reach the browser): `lib/ai/managed.ts` = fallback chain `nemotron-3-ultra:free → nemotron-3-super:free → gpt-oss-120b:free` (OpenRouter) → `gpt-4o-mini` (OpenAI). `app/api/ai/run/route.ts` validates a credit token, decrements atomically, sanitizes, runs the chain, returns result-only + `creditsRemaining`; refunds on total failure; all errors generic ("Dossier AI is busy"). Reused/extracted prompt builders in `lib/ai/prompts.ts` (`buildMatchJdPrompt`, `buildGenerateBulletPrompt`) so existing BYOK routes share them. Added `maxTokens` cap to `callOpenAiCompatible`.
- **Credits + Stripe** (no accounts): `lib/ai-credits.ts` (mirrors `user-count.ts` postgres pattern) — `dossier_ai_credits` + `dossier_ai_credit_purchases` tables (lazy `create table if not exists`), atomic single-credit decrement, idempotent `addCredits` keyed on stripe session id. `app/api/ai/credits` (balance), `app/api/stripe/webhook` (verifies signature, maps price→credits via `lib/ai/credit-bundles.ts`, credits the wallet from `client_reference_id`). Client wallet token in `lib/ai/wallet.ts` (localStorage `dossier:ai-token:v1`).
- **UI**: `components/editor/use-managed-ai.ts` hook + `ai-mode-bar.tsx` toggle ("Your API key" vs "Dossier AI" with balance + Buy link), wired into `tailor-pane.tsx` and `evidence-bullet-generator.tsx`. Model identity never shown.
- Added `stripe` dep. New env in `.env.example`: `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `MANAGED_AI_FALLBACK_MODEL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_{SMALL,MEDIUM,LARGE}`, `NEXT_PUBLIC_STRIPE_CREDITS_URL`.
- Gates: `tsc --noEmit` clean, `vitest` 34/34 (added `lib/ai/sanitize.test.ts`, `lib/ai-credits.test.ts`), `eslint` 0 errors across all new/modified files. Managed model slugs confirmed absent from client code.
- **Not yet runtime-tested** (needs operator keys): OpenRouter/OpenAI calls, Stripe webhook, DB credit flows. See Next Steps.

### 2026-06-08
- Hardened `lib/ats-readiness.ts` (the `analyzeAtsReadiness` engine). Correctness fixes (these move reported scores):
  1. Boundary-aware keyword matching (`containsTerm`) replaces `text.includes` — kills false positives like "go" in "category", "is" in "analysis"; still handles c++/c#.
  2. `meaningfulJobTerms`: removed dead acronym branch (now extracts AWS/SQL/ML from the original pre-lowercase text); dropped `it`/`is`/`to` from the short-token whitelist.
  3. `analyzeAtsReadiness` now returns only the active groups (jobMatch omitted when no JD) instead of a phantom 0/20 card.
  4. jobMatch gated on extracted terms, not raw text — a junk/stopword-only paste no longer tanks the score.
  5. `hasBullets` detects list structure from the raw HTML (`<li>`/`<p>`-`<p>`/`<br>`/line-start bullet) before whitespace collapse; hyphen bullets anchored to line start so "well-known" isn't a bullet. Dropped the 3+-sentence paragraph proxy (a paragraph is not bullets).
  6. `metricPattern` no longer counts bare integers — dates like "2019"/"1 year" stop passing as outcomes; requires %, Nx, currency, scale, or an outcome verb.
  7. headline-match normalizes punctuation; jobMatch references checks by id not index; group/headline rounding behavior documented.
- Enhancements: light iterative stemmer + synonym table (js<->javascript, k8s<->kubernetes, etc.) for coverage; skills-section matches weighted above body-only; `AtsReadinessResult` extended with `missingKeywords: string[]`; real format-risk check (single-column vs split/sidebar layout); contact-format validation (email regex + phone heuristic).
- Public type names unchanged except the additive `missingKeywords` field. Disclaimer string preserved verbatim.
- Added vitest (`npm test` / `test:watch`) + `vitest.config.ts` + `lib/ats-readiness.test.ts` (23 tests, all green). `tsc --noEmit` clean.

### 2026-06-02
- Fixed CV import parsing so multi-line experience/project headers keep the correct title, subtitle, date range, and bullet descriptions when imported from tailored CV text.

### 2026-06-01
- Registry backfill: created registry block + STATUS.md from codebase audit.

### 2026-06-09 (SEO + import parser)
- **Sitemap "Couldn't fetch" diagnosed**: not a code bug. `www` sitemap returns 200 XML; the **apex 307-redirects** and Google's sitemap fetcher doesn't follow redirects. Fix is GSC-side: use a Domain property (or a `www` URL-prefix property) and submit `https://www.your-dossier.xyz/sitemap.xml`, never the apex. Sitemap is a static `public/sitemap.xml` (not dynamic).
- **robots dedupe**: removed the redundant `public/robots.txt` (was shadowed by `app/robots.ts`); `app/robots.ts` now disallows `/editor` (the static file intended this; the dynamic one wasn't). Single source of truth.
- **CV import parser bug fixed** (`lib/cv-import.ts`): `looksLikeHeading` rejected any line >50 chars, so a long ALL-CAPS heading like "CORE FIT FOR DOW JONES PRODUCT IMPLEMENTATION & INTEGRATION SPECIALIST" (69 chars) was absorbed into the PROFILE/Summary and its bullets lost. Now ALL-CAPS lines are headings up to 90 chars (title-case keeps the 50 cap). This aligns the `.txt` path with the `.md` path (md headings were always detected via `###`). Regression test added (`lib/cv-import.test.ts`, 2 tests). Note: `.docx` import support not confirmed; PDF/txt/md paths exist.

### 2026-06-09 (blog + polish)
- **Blog system built** (matches the dark `#0a0d14` landing aesthetic): `app/blog/page.tsx` (index), `app/blog/[slug]/page.tsx` (post, Next 16 async params + `generateStaticParams` + `generateMetadata` + BlogPosting JSON-LD), data model `lib/blog/posts.tsx`, shared article components `components/blog/article-parts.tsx`. Entry points: footer "Blog" link (`app/layout.tsx`) + secondary "Read the blog" button in the landing hero CTA row (`components/ui/experience-hero.tsx`). `/blog` added to `public/sitemap.xml` (post URLs to be added on publish — sitemap is still the static file; consider a dynamic `app/sitemap.ts` if the blog grows).
- **First post PUBLISHED**: "You made a CV. Now what?" (`/blog/after-your-cv-land-the-interview`). Written from Kyser's research report (`~/Downloads/Why Job Seekers Now Need a Smart Job Application Management System.md`): structure problem → evidence (UK apps-per-role 47-48, +286% YoY; Greenhouse +400%; LinkedIn +15%) → AI volume (30→10 min, Capterra 58%/26%) → spreadsheet breaks → solution = candidate-side ATS → Trackr Pro. Dofollow links to trackr-pro.com (the backlink goal). UK English, no banned words, no em/en dashes, no interview guarantees. `draft` removed; added to `public/sitemap.xml`.
- **Trackr pop-up**: tagline reworked to "Made your CV? Now what?" + USP bullets (application-strength analysis, live AND mock interviews, browse-and-save extension). Frequency changed from once-ever (localStorage) to **once per browser session** (sessionStorage).
- **AI Workspace discoverability**: button restyled to a blue gradient + "Open AI Workspace" label + a subtle `.ai-pulse` glow (globals.css, respects prefers-reduced-motion); icon removed per request. Note: opening it swaps the PDF preview out, so it is NOT auto-opened.

## Known Issues
- Managed AI / credits / Stripe are code-complete but untested at runtime (no keys in env yet).

## Next Steps (to finish go-live)
1. **Webhook secret (only remaining blocker for the buy flow).** Create a webhook endpoint in the Stripe dashboard → event `checkout.session.completed` → URL `https://www.your-dossier.xyz/api/stripe/webhook` → copy signing secret into `STRIPE_WEBHOOK_SECRET`. For local testing: `stripe listen --forward-to localhost:<port>/api/stripe/webhook` gives a `whsec_`.
2. **Go live**: swap `STRIPE_SECRET_KEY` to `sk_live_` in prod (Vercel), re-run the product/price creation against live, set the live `STRIPE_PRICE_*`. Recommend a restricted key (`rk_`) scoped to Checkout/Prices, per Stripe best practice.
3. Once the webhook secret is set, verify: complete a test checkout → webhook credits the wallet → replay the same event is idempotent (no double-credit).
4. Restart any local `next dev` so it picks up the new `.env` keys (Next reads env at startup).
5. Trackr: write the deferred article (Phase A3).

## Verified live this session
- OpenRouter (gpt-oss-120b:free) + OpenAI (gpt-4o-mini) keys, fallback runner (text + JSON).
- Credit ledger on Supabase (decrement/refund/idempotency/empty→null).
- Stripe Checkout Session creation (price, amount, metadata, token propagation).
- Untested: webhook signature verification (needs `STRIPE_WEBHOOK_SECRET`).
