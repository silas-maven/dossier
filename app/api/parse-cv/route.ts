import type { NextRequest } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { parseCvMarkdown, parseCvText, profileFromParsedCv } from "@/lib/cv-import";

export const runtime = "nodejs";

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

    if (!isDocx && !isPdf) {
      return Response.json(
        { error: "Only DOCX and text-based PDF files are supported for import." },
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
      const parser = new PDFParse({ data: buf });
      try {
        const result = await parser.getText();
        text = result.text.trim();
      } finally {
        await parser.destroy();
      }
    }

    if (!markdown && !text) {
      return Response.json(
        {
          error: isPdf
            ? "No extractable text found in this PDF. Try a text-based export instead of a scanned PDF."
            : "No extractable text found in this DOCX."
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

    return Response.json({ profile }, { status: 200 });
  } catch (err: unknown) {
    const details =
      err instanceof Error
        ? { name: err.name, message: err.message }
        : { name: "Unknown", message: "Non-Error thrown" };
    console.error("parse-cv failed", details);
    return Response.json({ error: "Failed to parse CV file." }, { status: 500 });
  }
}
