"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Eye, FileText, Filter, LayoutTemplate, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import CvPdfDocument from "@/app/editor/cv-pdf-document";
import { seedExampleProfile } from "@/lib/cv-seed";
import type { CvTemplate } from "@/lib/templates";
import { templateIndustryOptions } from "@/lib/templates";
import { cn } from "@/lib/utils";

export type TemplateCarouselProps = {
  templates: CvTemplate[];
  onSelect: (template: CvTemplate) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const atsTone = (atsFit: CvTemplate["atsFit"]) =>
  atsFit === "Strong"
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
    : "border-amber-500/25 bg-amber-500/10 text-amber-200";

const variantThemes: Record<
  CvTemplate["variant"],
  {
    shell: string;
    accent: string;
    glow: string;
  }
> = {
  "banded-grey": {
    shell: "bg-[linear-gradient(180deg,#0b1020_0%,#111827_100%)]",
    accent: "bg-slate-200/90",
    glow: "bg-slate-300/12"
  },
  "gutter-minimal": {
    shell: "bg-[linear-gradient(180deg,#0c1220_0%,#111827_100%)]",
    accent: "bg-slate-300/80",
    glow: "bg-slate-300/12"
  },
  "blue-rules": {
    shell: "bg-[linear-gradient(180deg,#0a1635_0%,#122041_100%)]",
    accent: "bg-blue-500/95",
    glow: "bg-blue-400/18"
  },
  "sidebar-light": {
    shell: "bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]",
    accent: "bg-stone-200/95",
    glow: "bg-stone-200/14"
  },
  "sidebar-navy-right": {
    shell: "bg-[linear-gradient(180deg,#08111f_0%,#10223b_100%)]",
    accent: "bg-cyan-100/95",
    glow: "bg-cyan-200/16"
  },
  "sidebar-icons": {
    shell: "bg-[linear-gradient(180deg,#0f172a_0%,#172033_100%)]",
    accent: "bg-sky-100/95",
    glow: "bg-sky-200/16"
  },
  "sidebar-tan-dots": {
    shell: "bg-[linear-gradient(180deg,#18130f_0%,#201a14_100%)]",
    accent: "bg-amber-200/95",
    glow: "bg-amber-200/14"
  },
  "skills-right-red": {
    shell: "bg-[linear-gradient(180deg,#240b10_0%,#2f1018_100%)]",
    accent: "bg-rose-500/95",
    glow: "bg-rose-400/18"
  },
  "boxed-header-dots": {
    shell: "bg-[linear-gradient(180deg,#111827_0%,#161f33_100%)]",
    accent: "bg-slate-200/95",
    glow: "bg-slate-300/12"
  },
  "skills-right-pink": {
    shell: "bg-[linear-gradient(180deg,#1b1020_0%,#26152b_100%)]",
    accent: "bg-pink-400/95",
    glow: "bg-pink-300/18"
  }
};

function TemplateVisual({ template }: { template: CvTemplate }) {
  const theme = variantThemes[template.variant];
  const formatLabel = template.recommendedFormat.split(",")[0];
  const selectionCue =
    template.atsFit === "Strong" ? "Built for portal-first applications" : "Built for human-first review";

  const motif =
    template.variant === "gutter-minimal" ? (
      <div className="grid h-full grid-cols-[44px_1fr] gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
          <div className="space-y-3">
            <div className={cn("h-8 rounded-xl", theme.accent)} />
            <div className="h-px bg-white/10" />
            <div className={cn("h-3 rounded-full", theme.accent)} />
            <div className={cn("h-3 w-2/3 rounded-full", theme.accent)} />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/6 p-4">
          <div className="h-3 w-4/5 rounded-full bg-white/85" />
          <div className="h-2 w-2/5 rounded-full bg-white/35" />
          <div className="h-px bg-white/10" />
          <div className="h-2 w-full rounded-full bg-white/30" />
          <div className="h-2 w-5/6 rounded-full bg-white/20" />
        </div>
      </div>
    ) : template.variant === "blue-rules" ? (
      <div className="space-y-3 rounded-2xl border border-blue-300/15 bg-white/6 p-4">
        <div className={cn("h-3 w-4/5 rounded-full", theme.accent)} />
        <div className="h-2 w-3/5 rounded-full bg-white/35" />
        <div className="h-px bg-blue-300/45" />
        <div className="h-2 w-full rounded-full bg-white/26" />
        <div className="h-2 w-full rounded-full bg-white/22" />
        <div className="h-px bg-blue-300/45" />
        <div className={cn("h-2 w-10 rounded-full", theme.accent)} />
      </div>
    ) : template.layout === "Split Column" ? (
      <div className="grid h-full grid-cols-[1fr_76px] gap-3">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/6 p-4">
          <div className="h-3 w-4/5 rounded-full bg-white/85" />
          <div className="h-2 w-full rounded-full bg-white/28" />
          <div className="h-2 w-5/6 rounded-full bg-white/20" />
          <div className="h-px bg-white/10" />
          <div className="h-2 w-2/3 rounded-full bg-white/28" />
          <div className="h-2 w-full rounded-full bg-white/20" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          {template.variant.includes("dots") ? (
            <div className="grid grid-cols-2 gap-2 pt-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className={cn("h-2.5 w-2.5 rounded-full", theme.accent)} />
              ))}
            </div>
          ) : template.variant === "sidebar-icons" ? (
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={cn("h-5 w-5 rounded-full", theme.accent)} />
                  <div className="h-2 flex-1 rounded-full bg-white/25" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className={cn("h-10 rounded-2xl", theme.accent)} />
              <div className="h-2 rounded-full bg-white/30" />
              <div className="h-2 rounded-full bg-white/24" />
              <div className="h-2 rounded-full bg-white/18" />
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/6 p-4">
        <div className={cn("h-10 rounded-2xl", theme.accent)} />
        <div className="h-px bg-white/10" />
        <div className="h-3 w-3/4 rounded-full bg-white/85" />
        <div className="h-2 w-2/5 rounded-full bg-white/35" />
        <div className="h-2 w-full rounded-full bg-white/26" />
        <div className="h-2 w-11/12 rounded-full bg-white/20" />
      </div>
    );

  return (
    <div className={cn("relative h-full w-full overflow-hidden", theme.shell)}>
      <div className={cn("absolute -right-16 top-16 h-48 w-48 rounded-full blur-3xl", theme.glow)} />
      <div className={cn("absolute -left-14 bottom-12 h-36 w-36 rounded-full blur-3xl", theme.glow)} />

      <div className="relative flex h-full flex-col p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/52">{template.industry}</p>
            <p className="max-w-[12rem] text-xl font-semibold leading-tight tracking-tight">{template.name}</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/82">
            {template.category}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">ATS</p>
            <p className="mt-2 text-sm font-medium text-white/92">{template.atsFit}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Layout</p>
            <p className="mt-2 text-sm font-medium text-white/92">{template.layout === "Single Column" ? "Single" : "Split"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Format</p>
            <p className="mt-2 text-sm font-medium text-white/92">{formatLabel.startsWith("DOCX") ? "DOCX" : "PDF"}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Selection Cue</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/82">{selectionCue}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {template.bestFor.slice(0, 2).map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-white/76"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">{motif}</div>
      </div>
    </div>
  );
}

export default function TemplateCarousel({
  templates,
  onSelect,
  loading = false,
  error = false,
  onRetry
}: TemplateCarouselProps) {
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>("All");
  const [atsFilter, setAtsFilter] = useState<"All" | CvTemplate["atsFit"]>("All");

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        if (industryFilter !== "All" && template.industry !== industryFilter) return false;
        if (atsFilter !== "All" && template.atsFit !== atsFilter) return false;
        return true;
      }),
    [atsFilter, industryFilter, templates]
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/40 p-6">
        <div className="h-[40rem] animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
        <p className="font-medium text-foreground">Could not load templates.</p>
        <Button className="mt-4" type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
        <p className="font-medium text-foreground">No templates available.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/70 bg-card/70 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Template Library
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Pick the layout that matches the role.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Strong ATS templates are the safest default for online applications. Balanced layouts are better when a
              recruiter or hiring manager is likely to review the document first.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-muted-foreground">
              <LayoutTemplate className="h-3.5 w-3.5" />
              {templates.length} templates
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {templates.filter((template) => template.atsFit === "Strong").length} ATS-strong
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,220px)_auto]">
          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Industry
            </span>
            <select
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="All">All industries</option>
              {templateIndustryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">ATS fit</span>
            <select
              value={atsFilter}
              onChange={(event) => setAtsFilter(event.target.value as "All" | CvTemplate["atsFit"])}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="All">All ATS fits</option>
              <option value="Strong">Strong ATS</option>
              <option value="Balanced">Balanced ATS</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full xl:w-auto"
              onClick={() => {
                setIndustryFilter("All");
                setAtsFilter("All");
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </Button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Showing {filteredTemplates.length} of {templates.length} templates.
        </p>
      </div>

      {!filteredTemplates.length ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
          <p className="font-medium text-foreground">No templates match those filters.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different industry or widen the ATS fit.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article
              key={template.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-[0_12px_30px_rgba(2,6,23,0.08)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden border-b border-border/70">
                <TemplateVisual template={template} />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{template.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                        atsTone(template.atsFit)
                      )}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {template.atsFit} ATS
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      <LayoutTemplate className="h-3.5 w-3.5" />
                      {template.layout}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {template.recommendedFormat}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Best For
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {template.bestFor.slice(0, 3).map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Guidance
                    </p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                      {template.guidance.slice(0, 2).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => onSelect(template)}>
                    Use template
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!previewTemplate} onOpenChange={(open) => (open ? null : setPreviewTemplate(null))}>
        <DialogContent className="h-[92vh] max-w-[96vw] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <DialogHeader>
                <DialogTitle>{previewTemplate?.name ?? "Template Preview"}</DialogTitle>
                <DialogDescription>{previewTemplate?.recommendedFormat ?? ""}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              {previewTemplate ? (
                <div className="h-full overflow-hidden rounded-xl border bg-background">
                  <PDFViewer key={previewTemplate.id} className="h-full w-full">
                    <CvPdfDocument profile={seedExampleProfile(previewTemplate.id)} />
                  </PDFViewer>
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
