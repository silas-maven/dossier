# Dossier - Technical Specification

**Code Name:** Dossier (formerly CV Builder)
**Mission:** A local-first, privacy-focused resume builder for managing multiple professional identities.
**Vibe:** Surgical. Minimalist. Brutalist. No-nonsense.

## Core Philosophy
1.  **Content Separation:** Your career history is a database, not a document. Edit once, deploy anywhere.
2.  **Identity Management:** Maintain distinct "Personas" (e.g., "Frontend Engineer", "Engineering Manager", "Technical Writer").
3.  **Local Sovereignty:** Zero cloud dependencies. Your data lives in `IndexedDB` on your machine.
4.  **Instant Polish:** Apply templates like CSS themes.

## Tech Stack
-   **Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript
-   **State:** Zustand (global store) + Nuqs (URL state)
-   **Storage:** Dexie.js (IndexedDB wrapper) for local persistence.
-   **Styling:** Tailwind CSS + shadcn/ui.
-   **PDF Engine:** `@react-pdf/renderer` (Client-side generation).
-   **Icons:** Lucide React.

## Data Model (Schema Concept)

### `Profile` (The Persona)
-   `id`: UUID
-   `name`: string (e.g., "Full Stack Dev 2024")
-   `basics`: { name, email, phone, url, summary, location }
-   `sections`: Array of Section IDs (ordered)
-   `templateId`: string (e.g., "minimalist-mono", "classic-serif")

### `Section` (Modular Blocks)
-   `id`: UUID
-   `type`: "experience" | "education" | "skills" | "projects" | "custom"
-   `title`: string
-   `items`: Array of Item IDs

### `Item` (The Granular Data)
-   `id`: UUID
-   `title`: string (Role/Degree)
-   `subtitle`: string (Company/School)
-   `dateRange`: string
-   `description`: string (Markdown/Bullet points)
-   `tags`: string[] (Skills used)
-   `visible`: boolean (Toggle per profile)

## MVP Features (v1)
1.  **Dashboard:** List of Profiles. "Create New" from blank or clone.
2.  **Editor:**
    *   Split view: Form on Left, Live PDF Preview on Right.
    *   Drag-and-drop section reordering (`dnd-kit`).
    *   Rich text for descriptions (minimal tap-to-edit).
3.  **Templates:**
    *   **"The Swiss":** Clean, sans-serif, grid-based.
    *   **"The Times":** Traditional serif, authoritative.
4.  **Export:** Download PDF with sensible filename (`{Name}_{Profile}_{Date}.pdf`).

## "Assistive AI" (Optional v1.5)
-   **Role:** Editor-in-Chief.
-   **Action:** "Tighten this bullet point." "Make this sound more active."
-   **Implementation:** Direct call to OpenRouter/Anthropic with current text selection. No auto-apply.

## Project Structure
```
/src
  /app          (Routes)
  /components
    /editor     (The form UI)
    /preview    (The PDF renderer)
    /ui         (shadcn primitives)
  /lib
    /store      (Zustand + Dexie)
    /templates  (React-PDF layouts)
  /types        (Zod schemas)
```
