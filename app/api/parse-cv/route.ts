import type { NextRequest } from "next/server";
import mammoth from "mammoth";

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

const joinPdfLine = (parts: string[]) => parts.join(" ").replace(/\s+/g, " ").trim();

const extractPdfText = async (buf: Buffer) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!globalThis.pdfjsWorker?.WorkerMessageHandler) {
    const workerModule = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    globalThis.pdfjsWorker = {
      WorkerMessageHandler: workerModule.WorkerMessageHandler
    };
  }
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buf),
    useWorkerFetch: false,
    isEvalSupported: false
  });

  try {
    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let currentBaseline: number | null = null;
      let currentLine: string[] = [];

      const flushLine = () => {
        const nextLine = joinPdfLine(currentLine);
        if (nextLine) lines.push(nextLine);
        currentLine = [];
      };

      for (const item of content.items) {
        if (!("str" in item) || typeof item.str !== "string") continue;

        const fragment = item.str.replace(/\s+/g, " ").trim();
        if (!fragment) continue;

        const baseline = Array.isArray(item.transform) && typeof item.transform[5] === "number" ? item.transform[5] : 0;
        const startsNewLine = currentBaseline !== null && Math.abs(baseline - currentBaseline) > 4;

        if (startsNewLine) {
          flushLine();
        }

        currentLine.push(fragment);
        currentBaseline = baseline;

        if ("hasEOL" in item && item.hasEOL) {
          flushLine();
          currentBaseline = null;
        }
      }

      flushLine();
      page.cleanup();

      if (lines.length > 0) {
        pages.push(lines.join("\n"));
      }
    }

    return pages.join("\n\n").trim();
  } finally {
    await loadingTask.destroy();
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
