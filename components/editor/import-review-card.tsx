"use client";

import { Check, FileSearch, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { defaultSectionTitle, cvSectionTypes, type CvSectionType } from "@/lib/cv-profile";
import type { BrowserCvImport } from "@/lib/client-cv-import";

type ImportReviewCardProps = {
  candidate: BrowserCvImport;
  onCancel: () => void;
  onApply: () => void;
  onSectionChange: (index: number, type: CvSectionType, title: string) => void;
};

const sectionTypeLabel = (type: CvSectionType) => {
  if (type === "custom") return "Custom / other";
  if (type === "certifications") return "Certifications";
  return defaultSectionTitle(type);
};

const compactPreview = (blocks: string[]) =>
  blocks
    .join(" ")
    .replace(/^[-*•]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

export default function ImportReviewCard({
  candidate,
  onCancel,
  onApply,
  onSectionChange
}: ImportReviewCardProps) {
  return (
    <div className="rounded-xl border border-blue-400/25 bg-blue-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-500/15 p-2 text-blue-300">
          <FileSearch className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Review detected content</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {candidate.fileName} · {candidate.format} · {candidate.parsed.sections.length} detected sections
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/45 p-3">
          <span className="text-muted-foreground">Name</span>
          <p className="mt-1 font-medium text-foreground">{candidate.parsed.basics.name || "Not detected"}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/45 p-3">
          <span className="text-muted-foreground">Contact</span>
          <p className="mt-1 truncate font-medium text-foreground">
            {candidate.parsed.basics.email || candidate.parsed.basics.phone || "Not detected"}
          </p>
        </div>
      </div>

      {candidate.warnings.map((warning) => (
        <p key={warning} className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-200">
          {warning}
        </p>
      ))}

      <div className="mt-4 space-y-2">
        {candidate.parsed.sections.map((section, index) => (
          <div key={`${index}-${section.title}`} className="rounded-lg border border-border/70 bg-background/45 p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
              <label className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Section title
                </span>
                <input
                  value={section.title}
                  onChange={(event) => onSectionChange(index, section.type, event.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
                  aria-label={`Detected section ${index + 1} title`}
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Allocate as
                </span>
                <select
                  value={section.type}
                  onChange={(event) => {
                    const nextType = event.target.value as CvSectionType;
                    const nextTitle =
                      section.title === defaultSectionTitle(section.type)
                        ? defaultSectionTitle(nextType)
                        : section.title;
                    onSectionChange(index, nextType, nextTitle);
                  }}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  aria-label={`Allocate ${section.title}`}
                >
                  {cvSectionTypes.map((type) => (
                    <option key={type} value={type}>
                      {sectionTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              {section.blocks.length} {section.blocks.length === 1 ? "entry" : "entries"}
              {compactPreview(section.blocks) ? ` · ${compactPreview(section.blocks)}${compactPreview(section.blocks).length >= 180 ? "…" : ""}` : ""}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onApply}>
          <Check className="h-4 w-4" />
          Apply reviewed import
        </Button>
      </div>
    </div>
  );
}
