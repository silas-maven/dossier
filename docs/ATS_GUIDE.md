# ATS Compatibility Guide

When building or selecting a resume template, understanding exactly how Applicant Tracking Systems (ATS) parse documents is critical. This guide explains the technical characteristics that make a template "Strong ATS" versus "Balanced" or purely human-focused.

## The Core Problem: How ATS Parses Resumes

Most Applicant Tracking Systems work by stripping all formatting from a submitted document (PDF or DOCX) to extract the raw text. They then use natural language processing (NLP) to categorize that text into structured data fields: Contact Info, Experience, Education, and Skills.

If the raw text extraction happens out of order, or if critical text is embedded in images, the ATS fails to categorize the data correctly. This leads to broken applicant profiles.

## What Makes a Template "Strong ATS"

A "Strong ATS" template is designed so that when an ATS strips away the layout, the resulting text stream remains in a logical, top-to-bottom reading order, and no text is hidden from the parser.

### 1. Single Column Layouts
The most significant factor in ATS parsing is column structure. When an ATS strips a PDF to text, it generally reads from left to right, top to bottom.
*   **The Issue with Multi-Column:** If a resume has a left sidebar for skills and a right main column for experience, the ATS often reads straight across the page. It might read "JavaScript (from the left column) Senior Developer (from the right column)", scrambling the context.
*   **The "Strong ATS" Solution:** Templates like `classic-single-column` and `structured-single-column` use a strict single-column layout. The parser reads exactly as a human would: Contact Info -> Summary -> Experience -> Education -> Skills.

### 2. Standard Semantic Headings
ATS systems rely on recognized section headings to know when one section ends and another begins.
*   **Strong ATS Characteristic:** Headings should be standard terms like "Experience", "Work History", "Education", and "Skills". 
*   **Avoid:** "What I've Been Up To", "My Journey", or putting headings in graphics.

### 3. Native Text Rendering
All text must be selectable and natively rendered by the document generation engine.
*   **Strong ATS Characteristic:** No text embedded in images, charts, or complex vector graphics.
*   **Icons:** While icons (like a phone or email symbol) are fine as visual flair, they should be implemented via SVG or fonts that ATS systems either ignore or skip safely, without substituting them for garbage characters.

### 4. Simple Tables (or No Tables)
Older ATS systems struggle with complex table structures, especially nested tables or tables used purely for layout positioning.
*   **Strong ATS Characteristic:** Data like skills are presented in comma-separated lists or simple bullet points rather than complex grid tables that might confuse the parser's reading order.

## What Makes a Template "Balanced"

A "Balanced" template (like the `hybrid-header-two-zone` family) attempts to provide the visual hierarchy of a modern, multi-column design while using underlying document structure (like flexbox ordering in PDF generation or proper XML structure in DOCX) to attempt to force the ATS to read the zones sequentially.

*   **Pros:** Much better for direct human review (e.g., emailing a hiring manager directly).
*   **Cons:** Older or less sophisticated ATS parsers might still struggle to serialize the text correctly.

## Content Fit Is Part of ATS Readiness

Parser-safe formatting cannot rescue an unfocused CV. Dossier therefore treats content fit as a separate deterministic check:

- Up to 900 visible words for a normal professional CV.
- Up to 24 evidence bullets.
- Up to 16 role-relevant skills.
- A concise profile of up to 120 words.
- No duplicated or synonymous skill entries.
- A two-page target, verified against the generated PDF before download.

These are professional defaults, not universal rules. Academic, research, and specialist CVs can require a longer format. The editor reports the exception instead of silently shrinking the type.

Skills mentioned in a list are not scored as strongly as skills supported by experience or project evidence. This prevents keyword stuffing from improving the readiness estimate.

## Local Import, Checks, and Optional AI

PDF, DOCX, TXT, Markdown, and RTF imports are parsed in the browser. The file is validated, converted into detected sections, and held for review before it can replace the current editor content. Import files are not sent through a Dossier API or to Trackr. Scanned or image-only PDFs require OCR and are not supported by the local importer.

The deterministic ATS and job-description checks also run locally and do not require an account, API key, or AI provider. AI rewriting is a separate optional workspace and never blocks editing, checking, PDF export, or DOCX export. Content is sent to an AI provider only when the user explicitly runs an AI action.

## Export Choices

- The designed PDF preserves the selected template and is best when an employer requests PDF or a person will review the document directly.
- Before a PDF can download, Dossier extracts its text in the browser and compares it with the profile's substantive summaries, role and organisation names, bullets, certifications, projects, tags, and individual skill evidence. A missing evidence point blocks the download and identifies the affected section.
- The ATS DOCX export deliberately uses a conservative single-column structure, standard headings, native text, ASCII list markers, and no layout tables. It prioritizes reliable parsing over reproducing an expressive template.
- Both export paths preserve grouped skill evidence rather than exporting category headings alone.

## Summary: Designing for ATS

When optimizing for an ATS portal submission:
1.  **Format:** Follow the employer's requested format. Use Dossier's ATS DOCX for strict portals; use the designed text-based PDF when PDF is accepted.
2.  **Layout:** Choose a Single Column layout (`classic-single-column` or `structured-single-column`).
3.  **Content:** Use standard headings and bulleted lists.

Our parser-friendly templates prioritize these rules. Dossier's score is a transparent readiness estimate, not a score produced by Workday, Greenhouse, Lever, Taleo, iCIMS, Ashby, or an employer.
