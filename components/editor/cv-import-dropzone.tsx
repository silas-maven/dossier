"use client";

import { useState } from "react";
import { FileText, LockKeyhole, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CvImportDropzoneProps = {
  loading: boolean;
  onChoose: () => void;
  onFile: (file: File) => void;
};

export default function CvImportDropzone({ loading, onChoose, onFile }: CvImportDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-4 transition-colors",
        dragging
          ? "border-blue-400 bg-blue-500/10"
          : "border-border/80 bg-gradient-to-br from-muted/20 to-background"
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 p-2 text-blue-300">
          <Upload className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Import an existing CV</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Drop a file here, then review how Dossier has allocated every section before applying it.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-emerald-300">
              DOCX · recommended
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
              PDF · selectable text
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
              TXT
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
              Markdown
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
              RTF
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onChoose} disabled={loading}>
              <FileText className="h-4 w-4" />
              {loading ? "Reading locally..." : "Choose CV file"}
            </Button>
            <span className="text-[11px] text-muted-foreground">Maximum 10 MB · PDF maximum 20 pages</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-400/15 bg-emerald-500/5 px-3 py-2 text-[11px] leading-4 text-emerald-200">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Processed in this browser. Your import is not sent to Dossier or Trackr. Scanned or image-only PDFs are not supported.
        </span>
      </div>
    </div>
  );
}
