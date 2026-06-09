import { describe, expect, it } from "vitest";

import { parseCvText, profileFromParsedCv } from "@/lib/cv-import";

// Reproduces the Dow Jones CV bug: a long ALL-CAPS heading was rejected (>50 chars) and
// folded into the summary, taking its bullets with it.
const TXT = `HAMZA NTWARI
Senior Technical Consultant | Implementation & Integration Delivery
London, United Kingdom | 07428628524 | someone@example.com | https://www.linkedin.com/in/x

PROFILE
Senior Technical Consultant with 9 years across enterprise implementation and data integration.

CORE FIT FOR DOW JONES PRODUCT IMPLEMENTATION & INTEGRATION SPECIALIST
- Risk and compliance product implementation - Delivered 40+ implementations.
- SaaS products, feeds, and APIs - Worked across API integration and pipelines.

EXPERIENCE

Senior Technical Consultant - Napier Technologies, London
Apr 2019 - Apr 2025
- Delivered 40+ end-to-end implementation projects.

TECHNICAL SKILLS
AML screening | SaaS implementation | API integration`;

describe("parseCvText — long ALL-CAPS headings", () => {
  it("makes the long heading its own section, not part of the summary", () => {
    const parsed = parseCvText(TXT);
    const titles = parsed.sections.map((s) => s.title.toLowerCase());
    expect(titles.some((t) => t.includes("core fit"))).toBe(true);

    const summary = parsed.sections.find((s) => s.title.toLowerCase() === "summary");
    expect(JSON.stringify(summary?.blocks ?? [])).not.toMatch(/core fit/i);
  });

  it("keeps Core Fit out of the promoted basics.summary and preserves it as a section", () => {
    const profile = profileFromParsedCv("software-engineering-lean", parseCvText(TXT));
    expect(profile.basics.summary.toLowerCase()).not.toContain("core fit");
    expect(profile.sections.some((s) => s.title.toLowerCase().includes("core fit"))).toBe(true);
    // Experience and skills still parse correctly alongside the new section.
    expect(profile.sections.some((s) => s.type === "experience")).toBe(true);
    expect(profile.sections.some((s) => s.type === "skills")).toBe(true);
  });
});
