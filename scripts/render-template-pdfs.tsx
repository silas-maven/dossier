import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";

import CvPdfDocument from "@/app/editor/cv-pdf-document";
import { seedExampleProfile } from "@/lib/cv-seed";
import { ensurePdfFonts } from "@/lib/pdf-fonts";
import { getTemplateById, publicCvTemplates } from "@/lib/templates";

// Bundle this TSX entry with esbuild, then run it with:
// node <bundle> --output tmp/pdfs --previews public/template-previews
const args = process.argv.slice(2);
const outputFlagIndex = args.indexOf("--output");
const previewFlagIndex = args.indexOf("--previews");
const outputDirectory =
  outputFlagIndex >= 0 && args[outputFlagIndex + 1]
    ? path.resolve(args[outputFlagIndex + 1]!)
    : path.resolve("tmp/pdfs");
const previewDirectory =
  previewFlagIndex >= 0
    ? path.resolve(args[previewFlagIndex + 1] ?? "public/template-previews")
    : null;
const requestedIds = args.filter(
  (arg, index) =>
    arg !== "--output" &&
    arg !== "--previews" &&
    index !== outputFlagIndex + 1 &&
    index !== previewFlagIndex + 1
);
const templates = requestedIds.length
  ? requestedIds.map((id) => getTemplateById(id))
  : publicCvTemplates;

ensurePdfFonts(process.env.DOSSIER_FONT_BASE_URL ?? path.resolve("public"));
await mkdir(outputDirectory, { recursive: true });
if (previewDirectory) {
  await mkdir(previewDirectory, { recursive: true });
  Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
}

for (const template of templates) {
  const profile = seedExampleProfile(template.id);
  const buffer = await renderToBuffer(<CvPdfDocument profile={profile} />);
  const filePath = path.join(outputDirectory, `${template.id}.pdf`);
  await writeFile(filePath, buffer);
  process.stdout.write(`${filePath}\n`);

  if (previewDirectory) {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const document = await getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true
    }).promise;
    const page = await document.getPage(1);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport
    }).promise;

    const previewPath = path.join(previewDirectory, `${template.id}.webp`);
    await sharp(canvas.toBuffer("image/png"))
      .resize({ width: 560, withoutEnlargement: true })
      .webp({ quality: 88, effort: 5 })
      .toFile(previewPath);
    process.stdout.write(`${previewPath}\n`);
    await document.destroy();
  }
}
