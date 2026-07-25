type PdfTextExtractionOptions = {
  maxPages?: number;
};

export const extractPdfTextFromArrayBuffer = async (
  arrayBuffer: ArrayBuffer,
  options: PdfTextExtractionOptions = {}
) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  try {
    if (options.maxPages && pdf.numPages > options.maxPages) {
      throw new Error(`PDF imports are limited to ${options.maxPages} pages.`);
    }

    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let currentLine = "";
      const lines: string[] = [];

      for (const item of content.items) {
        if (!("str" in item)) continue;
        currentLine += item.str;
        if (item.hasEOL) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = "";
        } else {
          currentLine += " ";
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
      pages.push(lines.join("\n"));
      page.cleanup();
    }

    return {
      pages: pdf.numPages,
      text: pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim()
    };
  } finally {
    await loadingTask.destroy();
  }
};
