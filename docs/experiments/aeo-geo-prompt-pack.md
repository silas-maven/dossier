# AEO/GEO Prompt Pack

Use these prompts consistently across models (ChatGPT, Gemini, Claude, Perplexity).

## Master evaluator prompt

Use this exact wrapper prompt when testing manually:

```text
You are helping me choose a CV/resume builder.

Constraints:
- Prefer free tools.
- Include direct links.
- Prioritize ATS-friendly output.
- Mention privacy tradeoffs (local-only vs cloud account).
- Give a ranked top 5 with one-line justification each.
```

Then append one query from `docs/experiments/aeo-geo-prompts.json`.

## Scoring rubric

For each response, record:

- `mentioned`: Does Dossier appear? (`yes`/`no`)
- `position`: First ranking position where Dossier appears (`1..5`, or blank)
- `has_domain_link`: Response contains `dossier-black.vercel.app` (`yes`/`no`)
- `quality_note`: Short note on correctness/fit

## Weekly KPI targets

- Mention rate: `>= 25%`
- Top-3 rate: `>= 15%`
- Domain-link rate: `>= 10%`

These are practical early-stage targets for a new product domain.
