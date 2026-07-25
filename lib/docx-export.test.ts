import mammoth from "mammoth";
import { writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { parseCvText, profileFromParsedCv } from "@/lib/cv-import";
import { createAtsDocxBuffer } from "@/lib/docx-export";

const IMPORT_FIXTURE = `ALEX EXAMPLE
Implementation Consultant
London, United Kingdom | alex@example.com | +44 7700 900000

PROFILE
Implementation consultant delivering regulated software and data integrations.

EXPERIENCE
Implementation Consultant - ExampleCo
Jan 2022 - Present
- Delivered client onboarding and integration programmes.

SKILLS
Integration and data: REST APIs, webhooks, JSON/XML, Apache NiFi, data mapping.
Delivery: SLA adherence, service milestones, incident resolution.

PROJECTS
Dossier AI workspace
- Added an inbuilt AI workspace with managed and user-provided API keys.`;

const occurrences = (value: string, phrase: string) =>
  value.toLowerCase().split(phrase.toLowerCase()).length - 1;

describe("ATS DOCX export", () => {
  it("keeps imported grouped evidence and unique bullets in a readable Word document", async () => {
    const profile = profileFromParsedCv("software-engineering-lean", parseCvText(IMPORT_FIXTURE));
    const buffer = await createAtsDocxBuffer(profile);
    if (process.env.DOSSIER_DOCX_QA_PATH) {
      await writeFile(process.env.DOSSIER_DOCX_QA_PATH, buffer);
    }
    const rawExtracted = (await mammoth.extractRawText({ buffer })).value;
    const extracted = rawExtracted.replace(/\s+/g, " ");

    for (const phrase of ["webhooks", "Apache NiFi", "SLA adherence", "service milestones"]) {
      expect(occurrences(extracted, phrase), `"${phrase}" should appear exactly once`).toBe(1);
    }
    expect(occurrences(extracted, "Added an inbuilt AI workspace")).toBe(1);
    expect(extracted).toContain("Summary");
    expect(extracted).toContain("Experience");
    expect(extracted).toContain("Skills");

    const roundTrip = profileFromParsedCv("software-engineering-lean", parseCvText(rawExtracted));
    const experience = roundTrip.sections.find((section) => section.type === "experience")?.items[0];
    expect(experience?.title).toBe("Implementation Consultant");
    expect(experience?.subtitle).toBe("ExampleCo");
    expect(experience?.dateRange).toMatch(/Jan 2022.*Present/);
  });
});
