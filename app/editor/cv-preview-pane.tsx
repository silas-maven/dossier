"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";

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
import CvLivePreview from "@/app/editor/cv-live-preview";
import CvPdfDocument from "@/app/editor/cv-pdf-document";
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

export default function CvPreviewPane({
  profile,
  templateName,
  defaultMode = "pdf",
  variant = "default",
  className
}: CvPreviewPaneProps) {
  const [mode, setMode] = useState<PreviewMode>(defaultMode);
  const htmlPreviewProfile = useDebouncedValue(profile, 250);
  const [pdfPreviewProfile, setPdfPreviewProfile] = useState(profile);
  const [pdfSnapshot, setPdfSnapshot] = useState(() => profileSnapshotHash(profile));
  const nextSnapshot = useMemo(() => profileSnapshotHash(profile), [profile]);
  const previewProfile = mode === "pdf" ? pdfPreviewProfile : htmlPreviewProfile;
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

  const fileName = useMemo(() => {
    const safeName = (profile.basics.name || "CV").replace(/[^\w.-]+/g, "_");
    return `${safeName}_${profile.templateId}.pdf`;
  }, [profile.basics.name, profile.templateId]);

  const downloadPdf = async () => {
    const mod = await import("@react-pdf/renderer");
    const blob = await mod.pdf(<CvPdfDocument profile={profile} />).toBlob();
    const url = URL.createObjectURL(blob);
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

        <Button type="button" variant="secondary" size="sm" onClick={downloadPdf}>
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

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
                <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-[#0c1220]">
                  <PDFViewer className="h-full w-full">
                    <CvPdfDocument profile={previewProfile} />
                  </PDFViewer>
                </div>
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
          <PDFViewer className="h-full w-full">
            <CvPdfDocument profile={previewProfile} />
          </PDFViewer>
        </div>
      ) : (
        <CvLivePreview profile={previewProfile} templateName={templateName} />
      )}
    </div>
  );
}
