import type { NextRequest } from "next/server";
import mammoth from "mammoth";

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

    if (!isDocx) {
      return Response.json(
        { error: "Only DOCX is supported for import (PDF import is disabled)." },
        { status: 415 }
      );
    }

    const markdownResult = await (
      mammoth as unknown as {
        convertToMarkdown?: (input: { buffer: Buffer }) => Promise<{ value: string }>;
      }
    ).convertToMarkdown?.({ buffer: buf });
    const markdown = markdownResult?.value?.trim() ?? "";
    const text = (await mammoth.extractRawText({ buffer: buf })).value.trim();

    if (!markdown && !text) {
      return Response.json(
        {
          error: "No extractable text found in this DOCX."
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
    return Response.json({ error: "Failed to parse CV DOCX." }, { status: 500 });
  }
}
