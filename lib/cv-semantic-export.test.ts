import path from "node:path";

import { renderToBuffer } from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CvLivePreview from "@/app/editor/cv-live-preview";
import CvPdfDocument from "@/app/editor/cv-pdf-document";
import { parseCvText, profileFromParsedCv } from "@/lib/cv-import";
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
});
