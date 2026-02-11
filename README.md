# CV Builder (Local-First)

A privacy-focused resume builder for managing multiple profiles and templates.

## Core Philosophy
1.  **Separation of Content & Presentation:** Edit your career data once; generate infinite resume variations.
2.  **Local-First:** All data lives on your machine (LocalStorage/SQLite/JSON). No cloud lock-in.
3.  **Strictly Assistive AI:** AI suggests improvements but *never* writes for you.

## Key Features
- **Multi-Profile Management:** Create tailored versions for different roles (e.g., "Full Stack Dev" vs "Engineering Manager").
- **Template Engine:** Swap between single-column (ATS-friendly) and modern two-column layouts instantly.
- **Structured Data:** Edit sections (Experience, Projects, Education) independently.
- **Live Preview:** See changes in real-time.
- **One-Click Export:** Clean PDF generation (Puppeteer/React-PDF).

## Tech Stack
- **Framework:** Next.js (App Router)
- **State/Storage:** Zustand + IDB (IndexedDB)
- **Styling:** Tailwind CSS + shadcn/ui
- **PDF Generation:** @react-pdf/renderer
- **AI Integration:** OpenAI/Anthropic API (optional, on-demand only)

## Roadmap
1.  **Core Data Model:** Define the JSON schema for a resume.
2.  **Editor UI:** Section-based editing with drag-and-drop reordering.
3.  **Template System:** Implement "Modern" and "Classic" templates.
4.  **Export Pipeline:** PDF rendering.
