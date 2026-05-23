# ATS Logic and Template Fixes

## 1. Redesign `credentials-top` (Healthcare Delivery)
- It currently mimics `banded-grey` with its filled-background section headers.
- I will redesign both `cv-live-preview.tsx` and `cv-pdf-document.tsx` to use clean, clinical typography (e.g., bottom borders for sections, clean header layout) without filled background blocks.

## 2. Fix `mission-impact` (Nonprofit Mission Delivery) Sidebar
- If a dark sidebar color is used, the text becomes unreadable because it's hardcoded to `#111827` (dark gray).
- I will enforce a high-contrast dark-mode sidebar by using the `accent` color for the background and `#FFFFFF` (white/off-white) for text within the sidebar. 
- I will also update the skills section in the sidebar to properly map over `item.tags` instead of just the empty title.

## 3. Fix `ats-readiness.ts` Accuracy
- **Keyword length bug:** The current job match logic filters out words `<= 3` chars, which destroys matching for "AWS", "SQL", "API", "Go", "UX", etc. I will fix the filter to keep short uppercase acronyms or standard tech keywords, or just lower the length threshold and expand the stop-word list.
- **HTML parsing bug for bullets:** `textFromHtml` strips `<li>` tags into spaces, making the bullet detection logic fail (it also currently incorrectly matches any string starting with a letter). I will replace `<li>` with a literal bullet character before stripping HTML, and fix the bullet detection regex.
- **Section names bug:** `standard-headings` checks if length `<= 32`, allowing literally any short name to pass as "standard". I will remove this loophole and expand the `standardSectionNames` dictionary to include a comprehensive set of actual standard resume sections (e.g., Awards, Volunteering, Languages, etc.).

