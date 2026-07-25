import { parseCvMarkdown, parseCvText, type ParsedCv } from "@/lib/cv-import";
import { extractPdfTextFromArrayBuffer } from "@/lib/client-pdf-text";

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_PAGES = 20;

export type CvImportFormat = "PDF" | "DOCX" | "TXT" | "Markdown" | "RTF";

export type BrowserCvImport = {
  fileName: string;
  format: CvImportFormat;
  parsed: ParsedCv;
  warnings: string[];
};

const FORMAT_BY_EXTENSION: Record<string, CvImportFormat> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  md: "Markdown",
  markdown: "Markdown",
  rtf: "RTF"
};

const extensionFromName = (name: string) => name.trim().toLowerCase().split(".").pop() ?? "";

const hasPdfSignature = (bytes: Uint8Array) =>
  bytes.length >= 5 &&
  bytes[0] === 0x25 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x44 &&
  bytes[3] === 0x46 &&
  bytes[4] === 0x2d;

const hasZipSignature = (bytes: Uint8Array) =>
  bytes.length >= 4 &&
  bytes[0] === 0x50 &&
  bytes[1] === 0x4b &&
  ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
    (bytes[2] === 0x05 && bytes[3] === 0x06) ||
    (bytes[2] === 0x07 && bytes[3] === 0x08));

export const validateCvImportBytes = (
  fileName: string,
  fileSize: number,
  bytes: Uint8Array
): CvImportFormat => {
  if (!fileName.trim()) throw new Error("Choose a named CV file.");
  if (fileSize <= 0) throw new Error("This file is empty.");
  if (fileSize > MAX_IMPORT_BYTES) throw new Error("CV imports must be 10 MB or smaller.");

  const format = FORMAT_BY_EXTENSION[extensionFromName(fileName)];
  if (!format) {
    throw new Error("Supported imports: PDF, DOCX, TXT, Markdown, and RTF.");
  }

  if (format === "PDF" && !hasPdfSignature(bytes)) {
    throw new Error("This file does not contain a valid PDF signature.");
  }
  if (format === "DOCX" && !hasZipSignature(bytes)) {
    throw new Error("This file does not contain a valid DOCX package.");
  }
  if ((format === "TXT" || format === "Markdown" || format === "RTF") && (hasPdfSignature(bytes) || hasZipSignature(bytes))) {
    throw new Error(`This file's contents do not match its .${extensionFromName(fileName)} extension.`);
  }

  return format;
};

const stripRtf = (value: string) =>
  value
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => String.fromCharCode(Number.parseInt(match.slice(2), 16)))
    .replace(/\\u-?\d+\??/g, " ")
    .replace(/\\[a-z]+-?\d* ?/gi, " ")
    .replace(/[{}]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const warningsForImport = (format: CvImportFormat, parsed: ParsedCv, sourceText: string) => {
  const warnings: string[] = [];
  if (format === "PDF") {
    const skillEntryCount = parsed.sections
      .filter((section) => section.type === "skills")
      .reduce((count, section) => count + section.blocks.length, 0);
    const mentionsTechnicalSkills = /technical skills/i.test(sourceText);
    const missingHeaderSignals = !parsed.basics.location || !parsed.basics.headline;

    if ((mentionsTechnicalSkills && skillEntryCount <= 1) || missingHeaderSignals) {
      warnings.push(
        "This PDF's text layer may be incomplete. Review every detected section before applying it; DOCX or TXT is more reliable for this file."
      );
    }
  }
  return warnings;
};

export const parseCvFileInBrowser = async (file: File): Promise<BrowserCvImport> => {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const format = validateCvImportBytes(file.name, file.size, bytes.subarray(0, 16));
  const decoder = new TextDecoder("utf-8");
  let text = "";
  let markdown = "";

  if (format === "DOCX") {
    const mammothModule = await import("mammoth");
    const mammoth = (mammothModule.default || mammothModule) as unknown as {
      convertToMarkdown: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
      extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    };
    const markdownResult = await mammoth.convertToMarkdown({ arrayBuffer });
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    markdown = markdownResult.value.trim();
    text = textResult.value.trim();
  } else if (format === "PDF") {
    text = (await extractPdfTextFromArrayBuffer(arrayBuffer, { maxPages: MAX_PDF_PAGES })).text;
  } else {
    text = decoder.decode(bytes).replace(/\u0000/g, "").trim();
    if (format === "Markdown") markdown = text;
    if (format === "RTF") text = stripRtf(text);
  }

  if (!markdown && !text) {
    throw new Error(
      format === "PDF"
        ? "No selectable text was found. Scanned or image-only PDFs are not supported yet; use DOCX or TXT."
        : "No readable CV text was found in this file."
    );
  }

  const markdownParsed = markdown ? parseCvMarkdown(markdown) : null;
  const parsed =
    markdownParsed && markdownParsed.sections.length > 0
      ? markdownParsed
      : parseCvText(text);

  if (parsed.sections.length === 0) {
    throw new Error("No CV sections could be detected. Try DOCX or a clearly headed TXT file.");
  }

  return {
    fileName: file.name,
    format,
    parsed,
    warnings: warningsForImport(format, parsed, text || markdown)
  };
};
