import { describe, expect, it } from "vitest";

import { parseCvText, profileFromParsedCv } from "@/lib/cv-import";
import {
  collectPdfSemanticClaims,
  compareProfileEvidenceToPdfText
} from "@/lib/pdf-semantic-preflight";

const FIXTURE = `ALEX EXAMPLE
Implementation Consultant
London, United Kingdom | alex@example.com

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

describe("PDF semantic preflight", () => {
  const profile = profileFromParsedCv("software-engineering-lean", parseCvText(FIXTURE));

  it("passes when every substantive profile claim is present", () => {
    const result = compareProfileEvidenceToPdfText(profile, FIXTURE);
    expect(result.expectedEvidenceCount).toBeGreaterThan(8);
    expect(result.missing).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("identifies the source and excerpt of evidence lost from PDF text", () => {
    const result = compareProfileEvidenceToPdfText(
      profile,
      FIXTURE.replace("service milestones", "")
    );

    expect(result.passed).toBe(false);
    expect(result.missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "Skills: Delivery",
          excerpt: "service milestones"
        })
      ])
    );
  });

  it("does not create duplicate claims for repeated structured values", () => {
    const claims = collectPdfSemanticClaims(profile);
    const normalized = claims.map((claim) => claim.text.toLowerCase());
    expect(new Set(normalized).size).toBe(normalized.length);
  });
});
