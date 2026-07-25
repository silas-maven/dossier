import path from "node:path";

import { renderToBuffer } from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CvLivePreview from "@/app/editor/cv-live-preview";
import CvPdfDocument from "@/app/editor/cv-pdf-document";
import { parseCvText, profileFromParsedCv } from "@/lib/cv-import";
import { createEmptyItem, createEmptyProfile, createEmptySection } from "@/lib/cv-profile";
import { ensurePdfFonts } from "@/lib/pdf-fonts";
import { compareProfileEvidenceToPdfText } from "@/lib/pdf-semantic-preflight";
import { cvTemplates } from "@/lib/templates";

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
- Added an inbuilt AI workspace with managed and user-provided API keys.

EDUCATION
BSc Computer Science - Example University
2016 - 2020`;

const REQUIRED_PHRASES = [
  "webhooks",
  "apache nifi",
  "sla adherence",
  "service milestones"
] as const;
const UNIQUE_PROJECT_PHRASE = "added an inbuilt ai workspace";

const countOccurrences = (value: string, phrase: string) =>
  value.toLowerCase().replace(/\s+/g, " ").split(phrase.toLowerCase()).length - 1;

const extractPdfText = async (buffer: Buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    return (await parser.getText({ lineEnforce: false, pageJoiner: " " })).text;
  } finally {
    await parser.destroy();
  }
};

const extractPdfPages = async (buffer: Buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    return (await parser.getText({ lineEnforce: false })).pages.map((page) => page.text);
  } finally {
    await parser.destroy();
  }
};

const renderProfilePdf = async (profile: ReturnType<typeof createEmptyProfile>) => {
  const documentNode = createElement(CvPdfDocument, { profile }) as unknown as Parameters<
    typeof renderToBuffer
  >[0];
  return renderToBuffer(documentNode);
};

const longDataLedgerProfile = () => {
  const profile = createEmptyProfile("data-analytics-clarity");
  profile.name = "Data ledger pagination regression";
  profile.basics = {
    name: "Alex Example",
    headline: "Senior Technical Consultant and Product Founder",
    email: "alex@example.com",
    phone: "+44 7700 900000",
    url: "example.com",
    location: "London, United Kingdom",
    summary: Array.from(
      { length: 75 },
      (_, index) => `evidence-led summary term ${index + 1}`
    ).join(" ")
  };

  const evidence = createEmptySection("custom");
  evidence.title = "Evidence Snapshot";
  const evidenceItem = createEmptyItem();
  evidenceItem.description = Array.from(
    { length: 9 },
    (_, index) =>
      `- Evidence snapshot result ${index + 1} covering delivery scope, reliability improvements, adoption, and measurable outcomes.`
  ).join("\n");
  evidence.items = [evidenceItem];

  const experience = createEmptySection("experience");
  const trackr = createEmptyItem();
  trackr.title = "Founder and Product Engineer";
  trackr.subtitle = "Trackr Pro";
  trackr.dateRange = "Apr 2025 - Present";
  trackr.description = Array.from(
    { length: 8 },
    (_, index) =>
      `- Trackr delivery result ${index + 1} spanning product architecture, workflow automation, customer discovery, analytics, and launch execution.`
  ).join("\n");

  const consulting = createEmptyItem();
  consulting.title = "SENIOR-CONSULTING-CONTINUATION-MARKER";
  consulting.subtitle = "Example Consulting";
  consulting.dateRange = "Apr 2019 - Apr 2025";
  consulting.description = Array.from(
    { length: 28 },
    (_, index) =>
      `- Enterprise implementation result ${index + 1} across regulated platforms, data integration, stakeholder delivery, and service improvement.`
  ).join("\n");
  experience.items = [trackr, consulting];

  const skills = createEmptySection("skills");
  const skill = createEmptyItem();
  skill.title = "Stack";
  skill.description = "TypeScript, Next.js, Postgres, Supabase, Apache NiFi, REST APIs";
  skills.items = [skill];

  profile.sections = [evidence, experience, skills];
  return profile;
};

ensurePdfFonts(path.resolve("public"));

describe("semantic CV export parity", () => {
  it(
    "preserves grouped skill evidence exactly once in every PDF template",
    async () => {
      for (const template of cvTemplates) {
        const profile = profileFromParsedCv(template.id, parseCvText(IMPORT_FIXTURE));
        const documentNode = createElement(CvPdfDocument, { profile }) as unknown as Parameters<
          typeof renderToBuffer
        >[0];
        const buffer = await renderToBuffer(documentNode);
        const text = await extractPdfText(buffer);
        const semanticCheck = compareProfileEvidenceToPdfText(profile, text);

        for (const phrase of REQUIRED_PHRASES) {
          expect(
            countOccurrences(text, phrase),
            `${template.id} PDF should contain "${phrase}" exactly once.\nExtracted text:\n${text}`
          ).toBe(1);
        }
        expect(
          countOccurrences(text, UNIQUE_PROJECT_PHRASE),
          `${template.id} PDF should not duplicate the project bullet`
        ).toBe(1);
        expect(
          semanticCheck.missing,
          `${template.id} PDF should contain every substantive profile evidence point`
        ).toEqual([]);
      }
    },
    60_000
  );

  it("keeps the same grouped evidence in every live-preview template", () => {
    for (const template of cvTemplates) {
      const profile = profileFromParsedCv(template.id, parseCvText(IMPORT_FIXTURE));
      const html = renderToStaticMarkup(
        createElement(CvLivePreview, { profile, templateName: template.name })
      );
      const text = html.replace(/<[^>]+>/g, " ");

      for (const phrase of REQUIRED_PHRASES) {
        expect(
          countOccurrences(text, phrase),
          `${template.id} live preview should contain "${phrase}" exactly once`
        ).toBe(1);
      }
    }
  });

  it("keeps Data Analytics Clarity sections in the editor-defined order", async () => {
    const profile = profileFromParsedCv("data-analytics-clarity", parseCvText(IMPORT_FIXTURE));
    const experience = profile.sections.find((section) => section.type === "experience");
    const skills = profile.sections.find((section) => section.type === "skills");
    const projects = profile.sections.find((section) => section.type === "projects");
    expect(experience).toBeDefined();
    expect(skills).toBeDefined();
    expect(projects).toBeDefined();
    experience!.title = "ORDER-EXPERIENCE";
    skills!.title = "ORDER-SKILLS";
    projects!.title = "ORDER-PROJECTS";
    profile.sections = [experience!, skills!, projects!];

    const buffer = await renderProfilePdf(profile);
    const pdfText = await extractPdfText(buffer);
    const liveText = renderToStaticMarkup(
      createElement(CvLivePreview, { profile, templateName: "Data Analytics Clarity" })
    ).replace(/<[^>]+>/g, " ");

    for (const [surface, output] of [["PDF", pdfText], ["live preview", liveText]] as const) {
      const normalizedOutput = output.replace(/\s+/g, "");
      const experienceIndex = normalizedOutput.indexOf("ORDER-EXPERIENCE");
      const skillsIndex = normalizedOutput.indexOf("ORDER-SKILLS");
      const projectsIndex = normalizedOutput.indexOf("ORDER-PROJECTS");
      expect(experienceIndex, `${surface} output:\n${output}`).toBeGreaterThanOrEqual(0);
      expect(skillsIndex, `${surface} output:\n${output}`).toBeGreaterThan(experienceIndex);
      expect(projectsIndex, `${surface} output:\n${output}`).toBeGreaterThan(skillsIndex);
    }
  });

  it(
    "lets long Data Analytics Clarity experience entries continue into remaining page space",
    async () => {
      const buffer = await renderProfilePdf(longDataLedgerProfile());
      const pages = await extractPdfPages(buffer);

      expect(pages.length).toBeGreaterThan(1);
      expect(pages[0]).toContain("SENIOR-CONSULTING-CONTINUATION-MARKER");
      expect(pages.slice(1).join(" ")).toContain("Enterprise implementation result 28");
    },
    30_000
  );
});
