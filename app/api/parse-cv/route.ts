import type { NextRequest } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { parseCvMarkdown, parseCvText, profileFromParsedCv } from "@/lib/cv-import";

export const runtime = "nodejs";

const textDecoder = new TextDecoder("utf-8");

declare global {
  // pdfjs reads this global when it falls back to main-thread parsing.
  var pdfjsWorker:
    | {
        WorkerMessageHandler: unknown;
      }
    | undefined;
}

const extractPdfText = async (buf: Buffer) => {
  const parser = new PDFParse({ data: buf });
  try {
    const result = await parser.getText({
      lineEnforce: true,
      pageJoiner: ""
    });
    return result.text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
  } finally {
    await parser.destroy();
  }
};

const decodeTextFile = (buf: Buffer) => textDecoder.decode(buf).replace(/\u0000/g, "").trim();

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const templateId = String(formData.get("templateId") ?? "");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "Missing file upload." }, { status: 400 });
    }
    if (!templateId) {
      return Response.json({ error: "Missing templateId." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const fileName = file.name?.toLowerCase?.() ?? "";
    const isDocx =
      fileName.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isPdf = fileName.endsWith(".pdf") || file.type === "application/pdf";
    const isMarkdown =
      fileName.endsWith(".md") || fileName.endsWith(".markdown") || file.type === "text/markdown";
    const isPlainText = fileName.endsWith(".txt") || file.type === "text/plain";
    const isRtf =
      fileName.endsWith(".rtf") || file.type === "application/rtf" || file.type === "text/rtf";

    if (!isDocx && !isPdf && !isMarkdown && !isPlainText && !isRtf) {
      return Response.json(
        { error: "Supported imports: PDF, DOCX, TXT, Markdown, and RTF." },
        { status: 415 }
      );
    }

    let text = "";
    let markdown = "";

    if (isDocx) {
      const markdownResult = await (
        mammoth as unknown as {
          convertToMarkdown?: (input: { buffer: Buffer }) => Promise<{ value: string }>;
        }
      ).convertToMarkdown?.({ buffer: buf });
      markdown = markdownResult?.value?.trim() ?? "";
      text = (await mammoth.extractRawText({ buffer: buf })).value.trim();
    }

    if (isPdf) {
      text = await extractPdfText(buf);
    }

    if (isMarkdown) {
      markdown = decodeTextFile(buf);
      text = markdown;
    }

    if (isPlainText) {
      text = decodeTextFile(buf);
    }

    if (isRtf) {
      text = stripRtf(decodeTextFile(buf));
    }

    if (!markdown && !text) {
      return Response.json(
        {
          error: isPdf
            ? "No extractable text found in this PDF. Try a text-based export instead of a scanned PDF."
            : "No extractable text found in this file."
        },
        { status: 422 }
      );
    }

    // Prefer markdown extraction to preserve headings and bullet structure from DOCX.
    const parsedFromMarkdown = markdown ? parseCvMarkdown(markdown) : null;
    const parsed =
      parsedFromMarkdown && parsedFromMarkdown.sections.length > 0
        ? parsedFromMarkdown
        : parseCvText(text);
    const profile = profileFromParsedCv(templateId, parsed);
    const warnings: string[] = [];

    if (isPdf) {
      const skillEntryCount = profile.sections
        .filter((section) => section.type === "skills")
        .reduce((count, section) => count + section.items.length, 0);
      const mentionsTechnicalSkills = /technical skills/i.test(text);
      const missingHeaderSignals = !profile.basics.location || !profile.basics.headline;

      if ((mentionsTechnicalSkills && skillEntryCount <= 1) || missingHeaderSignals) {
        warnings.push(
          "This PDF's embedded text layer looks incomplete. Import used the extractable text that was available, but some sections may be missing or partial. TXT or DOCX import is more reliable for this file."
        );
      }
    }

    return Response.json({ profile, warnings }, { status: 200 });
  } catch (err: unknown) {
    const details =
      err instanceof Error
        ? { name: err.name, message: err.message }
        : { name: "Unknown", message: "Non-Error thrown" };
    console.error("parse-cv failed", details);
    return Response.json({ error: "Failed to parse CV file." }, { status: 500 });
  }
}
