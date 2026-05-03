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

## Summary: Designing for ATS

When optimizing for an ATS portal submission:
1.  **Format:** DOCX is generally the safest format for ATS portals because its XML structure is unambiguous. However, a properly generated text-based PDF is also safe.
2.  **Layout:** Choose a Single Column layout (`classic-single-column` or `structured-single-column`).
3.  **Content:** Use standard headings and bulleted lists.

Our `Strong ATS` templates mathematically prioritize these rules, enforcing standard reading order and avoiding complex visual overlays that jeopardize text extraction.
