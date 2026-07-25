"use client";

import { memo, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Download, FileCheck2, FileText, Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import type { CvProfile } from "@/lib/cv-profile";
import { createAtsDocxBlob } from "@/lib/docx-export";
import { verifyPdfSemanticParity, type PdfSemanticCheck } from "@/lib/pdf-semantic-preflight";
import CvLivePreview from "@/app/editor/cv-live-preview";
import CvPdfDocument from "@/app/editor/cv-pdf-document";
import { TrackrPromoDialog, hasSeenTrackrPromo, markTrackrPromoSeen } from "@/components/editor/trackr-promo";
import { cn } from "@/lib/utils";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

type PreviewMode = "html" | "pdf";
export type PreviewShellVariant = "default" | "editorDark";

type CvPreviewPaneProps = {
  profile: CvProfile;
  templateName: string;
  defaultMode?: PreviewMode;
  variant?: PreviewShellVariant;
  className?: string;
};

const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, value]);
  return debounced;
};

const profileSnapshotHash = (profile: CvProfile) => {
  const text = JSON.stringify(profile);
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
};

type StablePdfViewerProps = {
  profile: CvProfile;
  viewerKey: string;
  className?: string;
  viewerClassName?: string;
};

const StablePdfViewer = memo(function StablePdfViewer({
  profile,
  viewerKey,
  className,
  viewerClassName
}: StablePdfViewerProps) {
  const documentNode = useMemo(() => <CvPdfDocument profile={profile} />, [profile]);
  return (
    <div className={className}>
      <PDFViewer key={viewerKey} className={viewerClassName ?? "h-full w-full"}>
        {documentNode}
      </PDFViewer>
    </div>
  );
});

export default function CvPreviewPane({
  profile,
  templateName,
  defaultMode = "pdf",
  variant = "default",
  className
}: CvPreviewPaneProps) {
  const [mode, setMode] = useState<PreviewMode>(defaultMode);
  const [trackrPromoOpen, setTrackrPromoOpen] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [pdfCheck, setPdfCheck] = useState<{
    snapshot: string;
    pages: number;
    bytes: number;
    blob: Blob;
    semantic: PdfSemanticCheck;
  } | null>(null);
  const [pdfError, setPdfError] = useState<{ snapshot: string; message: string } | null>(null);
  const htmlPreviewProfile = useDebouncedValue(profile, 250);
  const [pdfPreviewProfile, setPdfPreviewProfile] = useState(profile);
  const [pdfSnapshot, setPdfSnapshot] = useState(() => profileSnapshotHash(profile));
  const nextSnapshot = useMemo(() => profileSnapshotHash(profile), [profile]);
  const previewProfile = mode === "pdf" ? pdfPreviewProfile : htmlPreviewProfile;
  const viewerKey = useMemo(
    () => `${previewProfile.templateId}:${profileSnapshotHash(previewProfile)}`,
    [previewProfile]
  );
  const isEditorDark = variant === "editorDark";

  useEffect(() => {
    if (mode !== "pdf") return;
    if (nextSnapshot === pdfSnapshot) return;
    const timer = window.setTimeout(() => {
      setPdfPreviewProfile(profile);
      setPdfSnapshot(nextSnapshot);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [mode, nextSnapshot, pdfSnapshot, profile]);

  useEffect(() => {
    if (mode !== "html") return;
    setPdfPreviewProfile(profile);
    setPdfSnapshot(nextSnapshot);
  }, [mode, nextSnapshot, profile]);

  const fileNameBase = useMemo(() => {
    let rawName = profile.name;
    if (!rawName || rawName === "My CV Profile" || rawName.trim() === "") {
      rawName = profile.basics.name || "CV";
    }
    return rawName.replace(/[^\w.-]+/g, "_");
  }, [profile.name, profile.basics.name]);
  const fileName = `${fileNameBase}.pdf`;

  const generateCheckedPdf = async () => {
    const snapshot = profileSnapshotHash(profile);
    if (pdfCheck?.snapshot === snapshot) return pdfCheck;

    setPdfGenerating(true);
    setPdfError(null);
    try {
      const mod = await import("@react-pdf/renderer");
      const blob = await mod.pdf(<CvPdfDocument profile={profile} />).toBlob();
      const verification = await verifyPdfSemanticParity(profile, blob);
      const checked = {
        snapshot,
        pages: verification.pages,
        bytes: blob.size,
        blob,
        semantic: verification.semantic
      };
      setPdfCheck(checked);
      return checked;
    } catch (error: unknown) {
      setPdfError({
        snapshot,
        message:
          error instanceof Error && error.message
            ? error.message
            : "The PDF could not be verified."
      });
      throw error;
    } finally {
      setPdfGenerating(false);
    }
  };

  const downloadPdf = async () => {
    const checked = await generateCheckedPdf().catch(() => null);
    if (!checked || !checked.semantic.passed) return;
    const url = URL.createObjectURL(checked.blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
    // After the first successful download, surface the Trackr handoff once.
    if (!hasSeenTrackrPromo()) {
      markTrackrPromoSeen();
      window.setTimeout(() => setTrackrPromoOpen(true), 600);
    }
  };

  const currentPdfCheck = pdfCheck?.snapshot === nextSnapshot ? pdfCheck : null;
  const currentPdfError = pdfError?.snapshot === nextSnapshot ? pdfError : null;

  const downloadDocx = async () => {
    setDocxGenerating(true);
    try {
      const blob = await createAtsDocxBlob(profile);
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${fileNameBase}_ATS.docx`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
      if (!hasSeenTrackrPromo()) {
        markTrackrPromoSeen();
        window.setTimeout(() => setTrackrPromoOpen(true), 600);
      }
    } finally {
      setDocxGenerating(false);
    }
  };

  return (
    <div
      className={cn(
        "space-y-3",
        isEditorDark &&
          "rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1324] to-[#0a0f1d] p-3 shadow-[0_16px_55px_rgba(2,6,23,0.45)]",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2",
          isEditorDark && "rounded-xl border border-white/10 bg-background/80 px-2 py-2"
        )}
      >
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "html" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMode("html")}
          >
            Preview
          </Button>
          <Button
            type="button"
            variant={mode === "pdf" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMode("pdf")}
          >
            PDF
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void generateCheckedPdf().catch(() => undefined)}
            disabled={pdfGenerating}
          >
            {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
            Check PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void downloadPdf()}
            disabled={pdfGenerating}
          >
            {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {currentPdfCheck && !currentPdfCheck.semantic.passed ? "PDF blocked" : "Download PDF"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void downloadDocx()}
            disabled={docxGenerating}
            title="Single-column ATS-friendly Word export"
          >
            {docxGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Download ATS DOCX
          </Button>
        </div>
      </div>

      {currentPdfError ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-100">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Download blocked.</strong> Dossier could not verify the generated PDF: {currentPdfError.message}
          </span>
        </div>
      ) : null}

      {currentPdfCheck ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-xs",
            !currentPdfCheck.semantic.passed
              ? "border-red-400/25 bg-red-500/10 text-red-100"
              : currentPdfCheck.pages <= 2
              ? "border-emerald-400/20 bg-emerald-500/8 text-emerald-100"
              : "border-amber-300/25 bg-amber-400/8 text-amber-100"
          )}
        >
          {currentPdfCheck.semantic.passed && currentPdfCheck.pages <= 2 ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {!currentPdfCheck.semantic.passed ? (
            <div className="min-w-0">
              <p>
                <strong>Download blocked:</strong>{" "}
                {currentPdfCheck.semantic.missing.length} of{" "}
                {currentPdfCheck.semantic.expectedEvidenceCount} evidence points are missing from the extracted PDF.
              </p>
              <ul className="mt-2 space-y-1">
                {currentPdfCheck.semantic.missing.slice(0, 5).map((claim) => (
                  <li key={claim.id}>
                    <span className="font-semibold">{claim.source}:</span> {claim.excerpt}
                  </li>
                ))}
              </ul>
              {currentPdfCheck.semantic.missing.length > 5 ? (
                <p className="mt-2">
                  Plus {currentPdfCheck.semantic.missing.length - 5} more missing evidence points.
                </p>
              ) : null}
            </div>
          ) : (
            <span>
              <strong>Content verified.</strong> All{" "}
              {currentPdfCheck.semantic.expectedEvidenceCount} substantive evidence points are present.{" "}
              <strong>
                {currentPdfCheck.pages} {currentPdfCheck.pages === 1 ? "page" : "pages"}.
              </strong>
              {currentPdfCheck.pages <= 2
                ? " Within the professional two-page target."
                : " Over the two-page target; prioritise evidence before shrinking the type."}
            </span>
          )}
        </div>
      ) : null}

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary" size="sm" className="w-full">
            Open {mode === "pdf" ? "PDF" : "Preview"} (Full Width)
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[90vh] max-w-[95vw] p-0">
          <div className="flex h-full flex-col bg-[#0a0f1d]">
            <div className="border-b border-white/10 p-4">
              <DialogHeader>
                <DialogTitle>{mode === "pdf" ? "PDF Preview" : "Live Preview"}</DialogTitle>
                <DialogDescription>{templateName}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {mode === "pdf" ? (
                <StablePdfViewer
                  profile={previewProfile}
                  viewerKey={viewerKey}
                  className="h-full overflow-hidden rounded-xl border border-white/10 bg-[#0c1220]"
                />
              ) : (
                <div className="mx-auto max-w-4xl">
                  <CvLivePreview profile={previewProfile} templateName={templateName} />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {mode === "pdf" ? (
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-background",
            isEditorDark
              ? "h-[72vh] border-white/10 bg-[#0b111f]"
              : "h-[70vh]"
          )}
        >
          <StablePdfViewer profile={previewProfile} viewerKey={viewerKey} className="h-full w-full" />
        </div>
      ) : (
        <CvLivePreview profile={previewProfile} templateName={templateName} />
      )}

      <TrackrPromoDialog open={trackrPromoOpen} onOpenChange={setTrackrPromoOpen} />
    </div>
  );
}
