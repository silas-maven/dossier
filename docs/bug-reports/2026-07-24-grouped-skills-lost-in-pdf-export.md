# P0 Bug Report: Grouped skill evidence lost between CV import and PDF export

Date: 2026-07-24
Status: Reproducible from a real exported CV; root cause not yet confirmed
Severity: P0 data-integrity / application-risk defect

## Summary

A CV imported into Dossier contained detailed grouped skills, including explicit evidence for `webhooks` and delivery against `service milestones`. The PDF exported from Dossier retained only the group titles, such as `Integration and data` and `Delivery`, while omitting their detailed contents.

A downstream application-strength analysis therefore reported that the candidate had no explicit webhook experience and only weak evidence of SLA-related delivery. The user does have this experience, and the source CV supplied it explicitly. Dossier's generated PDF did not preserve it.

This is materially worse than a visual formatting issue: Dossier changed the semantic content available to recruiters and downstream ATS/analysis systems.

## User impact

- Relevant evidence silently disappears from the final application document.
- The exported PDF looks complete at a glance because the skill-category headings remain.
- ATS and CV-matching tools receive incomplete evidence and can produce false gaps or lower scores.
- The defect undermines Dossier's ATS-friendly export claim.
- A user could submit a weakened CV without noticing that the detailed skills were removed.

Observed downstream effect in Trackr Pro:

- Application Strength: `79/100`
- JD keyword coverage: `90%`
- False/avoidable reported gap: `No explicit mention of experience with Webhooks integration.`
- Reported weakness: limited explicit evidence around SLAs/performance guarantees.

The Trackr result is not the primary bug here. Trackr analysed the text present in the exported PDF; the expected webhook and service-milestone text was absent from that PDF.

## Evidence files

Input sources:

- `/Users/hn52/Documents/My docs/CV/Tailored/Hamza_Ntwari_LexisNexis_Risk_Solutions_RiskNarrative_Implementation_Consultant_2026.md`
- `/Users/hn52/Documents/My docs/CV/Tailored/Hamza_Ntwari_LexisNexis_Risk_Solutions_RiskNarrative_Implementation_Consultant_2026_dossier.txt`

Exported PDF analysed by Trackr:

- `/Users/hn52/Downloads/Hamza_Ntwari_LexisNexis_Risk_Solutions_RiskNarrative_Implementation_Consultant_2026.pdf`

Trackr feedback screenshot:

- `/Users/hn52/.hermes/image_cache/img_75956302b943.jpg`

## Expected source content

The parser-safe source contains these grouped skill lines:

```text
Integration and data: REST APIs, webhooks, JSON/XML, Apache NiFi, data mapping, SQL/PostgreSQL and data-quality controls.
Delivery: concurrent workstreams, stakeholder management, RFP/RFI support, service milestones, incident resolution and cross-functional coordination.
```

The Markdown source also explicitly contains:

```text
Implemented signed Stripe and Clerk webhook flows for billing and account lifecycle events, with signature verification, persisted event status, duplicate handling and clear failure responses.
```

Expected PDF behaviour:

- Preserve `webhooks` and the surrounding integration evidence as extractable text.
- Preserve `service milestones` and the surrounding delivery evidence as extractable text.
- Preserve all other grouped-skill descriptions, not just their category titles.

## Actual PDF content

Text extraction from the two-page PDF produced only these skill-category labels:

```text
SKILLS
Customer implementation
Financial crime
Integration and data
Customer enablement
Delivery
Product engineering
```

The extracted PDF contains no occurrence of:

- `webhook`
- `service milestones`
- the detailed REST/API/NiFi skill line
- the detailed delivery/SLA-adjacent skill line

The PDF still contains other sections and is text-extractable, so this is not a general PDF OCR or extraction failure.

## Reproduction already performed

### 1. Confirm the source carries the missing evidence

Read the Markdown or Dossier-safe text file and verify the grouped skills above.

### 2. Run the current Dossier parser

Using the current working tree:

```bash
npx --no-install tsx -e '
import { readFileSync } from "node:fs";
import { parseCvText, profileFromParsedCv } from "./lib/cv-import";
const path = "/Users/hn52/Documents/My docs/CV/Tailored/Hamza_Ntwari_LexisNexis_Risk_Solutions_RiskNarrative_Implementation_Consultant_2026_dossier.txt";
const profile = profileFromParsedCv("sidebar-light", parseCvText(readFileSync(path, "utf8")));
console.log(JSON.stringify(profile.sections.find(section => section.type === "skills"), null, 2));
'
```

Current parser result retains the data correctly:

- `Integration and data` is the item title.
- Its description includes `REST APIs, webhooks, JSON/XML, Apache NiFi...`.
- `Delivery` is the item title.
- Its description includes `service milestones...`.

This narrows the fault to one of the following:

1. the persisted profile was created by an older importer that discarded descriptions;
2. a template-specific preview/export path renders only `item.title`;
3. the editor state contains descriptions but stale or transformed state is passed into PDF generation;
4. the deployed build differs from the current local importer/export implementation.

### 3. Extract the actual exported PDF

The PDF was checked with `/usr/bin/python3` and `pypdf`. It has two pages and extractable text, but no `webhook` or `service milestones` tokens.

## Relevant code paths to inspect

### Import mapping

`lib/cv-import.ts:703-740`

The current importer splits grouped lines at the first colon and maps them into:

- `item.title`: category name
- `item.description`: detailed skills

This current mapping appears correct in isolation.

### Skill parsing

`lib/skill-levels.ts:48-80`

`parseSkillEntries` expands comma-, pipe-, or semicolon-separated descriptions. Confirm this is used consistently by every PDF template and does not receive blank/stale descriptions.

### PDF export

`app/editor/cv-pdf-document.tsx`

Audit every template branch. There are many separate skills renderers. Verify that each renders description-derived skill entries rather than category titles alone.

In particular, confirm the exact template ID used by the affected PDF and trace its skills branch end to end.

### Live preview

`app/editor/cv-live-preview.tsx:657-735`

The `legal-formal` live-preview branch currently renders skills using only:

```tsx
section.items
  .filter(item => item.visible !== false)
  .map(item => (item.title || "").trim())
  .filter(Boolean)
  .join(", ")
```

That is a confirmed template-specific omission in live preview: it ignores `item.description` and `item.tags`. Even if this is not the affected PDF template, it demonstrates that template branches can silently discard structured skill detail.

## Secondary anomaly: duplicated project bullet

The exported PDF contains the Dossier AI project bullet twice. The duplicate starts immediately after the first copy without a clean paragraph boundary:

```text
...support for both managed AI and user-provided API keys.- Added an inbuilt AI workspace...
```

Determine whether this duplication originated during:

- text import;
- editor state updates;
- AI suggestion application;
- manual editing; or
- PDF rendering.

Treat this as a separate reproduction until the shared source is proven.

## Required investigation

1. Identify the exact `templateId`, theme and deployed commit used for the affected export.
2. Capture the complete serialized `CvProfile` immediately after import.
3. Capture it again immediately before `CvPdfDocument` is rendered.
4. Compare `skills.items[].title`, `description`, `tags` and `visible` at both boundaries.
5. Compare live preview text with generated PDF text.
6. Determine whether the profile was persisted under an older schema/import path.
7. Reproduce using the supplied Dossier-safe text on the same template.
8. Audit all template-specific skills renderers for title-only output.
9. Trace the duplicated Dossier project bullet separately.

Do not patch only the affected template before identifying where the descriptions disappear. The failure may affect multiple templates or persisted profiles.

## Required regression tests

Add an end-to-end import/export fixture containing:

```text
SKILLS
Integration and data: REST APIs, webhooks, JSON/XML, Apache NiFi, data mapping.
Delivery: SLA adherence, service milestones, incident resolution.
```

For every exportable template:

1. Parse the source.
2. Build the profile.
3. Render the PDF.
4. Extract PDF text.
5. Assert the output contains:
   - `webhooks`
   - `Apache NiFi`
   - `SLA adherence`
   - `service milestones`
6. Assert each expected phrase appears exactly once.
7. Assert the category titles also remain present where the template design uses them.

Add a preview parity test that verifies semantically relevant text shown in profile state is present in both live preview and PDF output.

## Acceptance criteria

- No skill description or tag is silently omitted from any exportable template.
- The affected source exports with `webhooks` and `service milestones` as extractable PDF text.
- Live preview and PDF contain the same substantive CV evidence.
- Existing browser-saved profiles are migrated or safely normalised if they contain title-only grouped skills from an older import path.
- No project or experience bullet is duplicated during import, editing or export.
- Regression tests cover every template, not only the template used in this incident.
- A PDF text-diff/preflight check warns or blocks export when substantive source content disappears.

## Recommended severity rationale

Classify this as P0/P1 rather than cosmetic. The output is a job-application document, and the defect silently removes role-relevant evidence while leaving a visually plausible PDF. That can directly reduce interview conversion and cause users to submit inaccurate representations of their experience.
