import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";

import type { CvItem, CvProfile, CvSection } from "@/lib/cv-profile";
import { parseDescriptionBlocks, type InlineRun } from "@/lib/description-format";
import { skillEvidenceLabels } from "@/lib/skill-levels";

const FONT = "Arial";
const TEXT_COLOR = "111827";
const MUTED_COLOR = "4B5563";
const docxText = (value: string) =>
  value
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u00a0/g, " ");

const runsFromInline = (runs: InlineRun[], prefix = "") => [
  ...(prefix
    ? [
        new TextRun({
          text: docxText(prefix),
          font: FONT,
          size: 20,
          color: TEXT_COLOR
        })
      ]
    : []),
  ...runs.map(
    (run) =>
      new TextRun({
        text: docxText(run.text),
        bold: run.bold,
        italics: run.italic,
        underline: run.underline ? {} : undefined,
        font: FONT,
        size: 20,
        color: TEXT_COLOR
      })
  )
];

const descriptionParagraphs = (item: CvItem) =>
  parseDescriptionBlocks(item.description).map(
    (block) =>
      new Paragraph({
        children: runsFromInline(
          block.runs,
          block.kind === "bullet" || block.kind === "numbered" ? "- " : ""
        ),
        spacing: { after: 70, line: 250 },
        indent:
          block.kind === "bullet" || block.kind === "numbered"
            ? { left: 260, hanging: 180 }
            : undefined,
        keepNext: block.kind === "heading"
      })
  );

const itemParagraphs = (item: CvItem) => {
  const headingParts = [
    item.title.trim(),
    item.subtitle.trim(),
    item.dateRange.trim()
  ].filter(Boolean);
  const output: Paragraph[] = [];

  if (headingParts.length > 0) {
    output.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docxText(headingParts.join(" - ")),
            bold: true,
            font: FONT,
            size: 21,
            color: TEXT_COLOR
          })
        ],
        spacing: { before: 70, after: 50 },
        keepNext: true
      })
    );
  }
  output.push(...descriptionParagraphs(item));

  if (item.tags.length > 0) {
    output.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docxText(item.tags.join(", ")),
            italics: true,
            font: FONT,
            size: 18,
            color: MUTED_COLOR
          })
        ],
        spacing: { after: 70 }
      })
    );
  }
  return output;
};

const isSummarySection = (section: CvSection) =>
  section.type === "custom" && section.title.trim().toLowerCase() === "summary";

const sectionParagraphs = (section: CvSection) => {
  const visibleItems = section.items.filter((item) => item.visible !== false);
  if (visibleItems.length === 0 || isSummarySection(section)) return [];

  const output: Paragraph[] = [
    new Paragraph({
      text: docxText(section.title),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 80 },
      keepNext: true
    })
  ];

  if (section.type === "skills") {
    output.push(
      ...skillEvidenceLabels(visibleItems).map(
        (label) =>
          new Paragraph({
            children: [
              new TextRun({
                text: docxText(label),
                font: FONT,
                size: 20,
                color: TEXT_COLOR
              })
            ],
            spacing: { after: 60, line: 250 }
          })
      )
    );
    return output;
  }

  for (const item of visibleItems) output.push(...itemParagraphs(item));
  return output;
};

export const createAtsDocxDocument = (profile: CvProfile) => {
  const contact = [
    profile.basics.location,
    profile.basics.email,
    profile.basics.phone,
    profile.basics.url
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" | ");

  const children: Paragraph[] = [
    new Paragraph({
      text: docxText(profile.basics.name || "CV"),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 70 }
    })
  ];

  if (profile.basics.headline.trim()) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docxText(profile.basics.headline.trim()),
            bold: true,
            font: FONT,
            size: 22,
            color: MUTED_COLOR
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 }
      })
    );
  }
  if (contact) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: docxText(contact), font: FONT, size: 19, color: TEXT_COLOR })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 }
      })
    );
  }
  if (profile.basics.summary.trim()) {
    children.push(
      new Paragraph({
        text: "Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 80, after: 70 },
        keepNext: true
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: docxText(profile.basics.summary.trim()),
            font: FONT,
            size: 20,
            color: TEXT_COLOR
          })
        ],
        spacing: { after: 90, line: 250 }
      })
    );
  }

  for (const section of profile.sections) children.push(...sectionParagraphs(section));

  return new Document({
    creator: "Dossier CV Builder",
    title: `${docxText(profile.basics.name || "CV")} - ATS CV`,
    description: "Single-column ATS-friendly CV exported by Dossier.",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20, color: TEXT_COLOR },
          paragraph: { spacing: { line: 250 } }
        },
        title: {
          run: { font: FONT, size: 34, bold: true, color: TEXT_COLOR }
        },
        heading2: {
          run: { font: FONT, size: 23, bold: true, color: TEXT_COLOR }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 850, right: 850, bottom: 850, left: 850 }
          }
        },
        children
      }
    ]
  });
};

export const createAtsDocxBlob = (profile: CvProfile) =>
  Packer.toBlob(createAtsDocxDocument(profile));

export const createAtsDocxBuffer = (profile: CvProfile) =>
  Packer.toBuffer(createAtsDocxDocument(profile));
