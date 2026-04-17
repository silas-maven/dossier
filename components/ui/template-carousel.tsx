"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, FileText, Filter, LayoutTemplate, Sparkles } from "lucide-react";

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
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    : "border-amber-500/30 bg-amber-500/10 text-amber-200";

export default function TemplateCarousel({
  templates,
  onSelect,
  loading = false,
  error = false,
  onRetry
}: TemplateCarouselProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(templates[0]?.id ?? null);
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>("All");
  const [atsFilter, setAtsFilter] = useState<"All" | CvTemplate["atsFit"]>("All");

  const filteredTemplates = templates.filter((template) => {
    if (industryFilter !== "All" && template.industry !== industryFilter) return false;
    if (atsFilter !== "All" && template.atsFit !== atsFilter) return false;
    return true;
  });

  const activeTemplate =
    filteredTemplates.find((template) => template.id === activeTemplateId) ?? filteredTemplates[0] ?? null;

  useEffect(() => {
    if (!filteredTemplates.length) {
      setActiveTemplateId(null);
      return;
    }
    if (!activeTemplate) {
      setActiveTemplateId(filteredTemplates[0].id);
    }
  }, [activeTemplate, filteredTemplates]);

  const goPrev = () => {
    if (!activeTemplate || filteredTemplates.length < 2) return;
    const currentIndex = filteredTemplates.findIndex((template) => template.id === activeTemplate.id);
    const nextIndex = (currentIndex - 1 + filteredTemplates.length) % filteredTemplates.length;
    setActiveTemplateId(filteredTemplates[nextIndex].id);
  };

  const goNext = () => {
    if (!activeTemplate || filteredTemplates.length < 2) return;
    const currentIndex = filteredTemplates.findIndex((template) => template.id === activeTemplate.id);
    const nextIndex = (currentIndex + 1) % filteredTemplates.length;
    setActiveTemplateId(filteredTemplates[nextIndex].id);
  };

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
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),linear-gradient(145deg,rgba(3,7,18,0.96),rgba(15,23,42,0.9))] p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/55">Template Control Room</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pick by industry, not guesswork.</h2>
            <p className="mt-2 text-sm text-white/70">
              Filter for ATS-safe layouts, compare guidance side by side, and preview the exact PDF structure before
              you commit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/75">
              <LayoutTemplate className="h-3.5 w-3.5" />
              {templates.length} templates
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/75">
              <Sparkles className="h-3.5 w-3.5" />
              {templates.filter((template) => template.atsFit === "Strong").length} ATS-strong
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/45">
            <Filter className="h-3.5 w-3.5" />
            Industry
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...templateIndustryOptions].map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => setIndustryFilter(industry)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  industryFilter === industry
                    ? "border-white/40 bg-white text-slate-950"
                    : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                )}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["All", "Strong", "Balanced"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAtsFilter(value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  atsFilter === value
                    ? "border-white/40 bg-white text-slate-950"
                    : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                )}
              >
                {value === "All" ? "All ATS fits" : `${value} ATS fit`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!activeTemplate ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
          <p className="font-medium text-foreground">No templates match those filters.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try broadening industry or ATS-fit filters.</p>
        </div>
      ) : (
        <div
          className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goPrev();
              return;
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goNext();
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(activeTemplate);
            }
          }}
        >
          <div className="space-y-4">
            <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#040814] shadow-[0_28px_80px_rgba(2,6,23,0.48)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.24),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.72))]" />
              <div className="relative grid gap-6 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(250px,0.75fr)] lg:p-6">
                <div className="relative min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
                  <Image
                    src={activeTemplate.previewImage}
                    alt={`${activeTemplate.name} preview`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 65vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/88 via-[#020617]/18 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/75">
                      {activeTemplate.category}
                    </span>
                    <span className={cn("rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]", atsTone(activeTemplate.atsFit))}>
                      {activeTemplate.atsFit} ATS fit
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">{activeTemplate.industry}</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight">{activeTemplate.name}</h3>
                    <p className="mt-3 max-w-2xl text-sm text-white/78">{activeTemplate.description}</p>
                  </div>
                </div>

                <div className="flex h-full flex-col justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-white">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Layout</p>
                        <p className="mt-2 text-sm text-white/85">{activeTemplate.layout}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">File Format</p>
                        <p className="mt-2 text-sm text-white/85">{activeTemplate.recommendedFormat}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Best For</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeTemplate.bestFor.map((label) => (
                          <span
                            key={label}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Template Guidance</p>
                      <div className="mt-3 space-y-2">
                        {activeTemplate.guidance.map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/78"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => setPreviewTemplate(activeTemplate)}>
                      <Eye className="h-4 w-4" />
                      Full preview
                    </Button>
                    <Button type="button" onClick={() => onSelect(activeTemplate)}>
                      Use this template
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTemplates.length} of {templates.length} templates
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="icon" onClick={goPrev} aria-label="Previous template">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="secondary" size="icon" onClick={goNext} aria-label="Next template">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4">
                {filteredTemplates.map((template) => {
                  const isActive = template.id === activeTemplate.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setActiveTemplateId(template.id)}
                      className={cn(
                        "group w-[16rem] shrink-0 overflow-hidden rounded-[1.5rem] border text-left transition",
                        isActive
                          ? "border-primary/40 bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                          : "border-border/70 bg-card/70 hover:border-primary/25 hover:bg-card"
                      )}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={template.previewImage}
                          alt={`${template.name} thumbnail`}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="16rem"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
                            {template.industry}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{template.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px]", atsTone(template.atsFit))}>
                            {template.atsFit}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            {template.layout}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border/70 bg-card/80 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">ATS Notes</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Strong ATS templates keep layout simple.
              </h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Single-column layouts remain the safest default for ATS parsing.</p>
                <p>DOCX is still the most conservative submission format unless a posting asks for PDF.</p>
                <p>Use split-column templates mainly for direct-share or human-first review workflows.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/80 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Selection Tip</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Use a strong ATS template for online portals, then keep a more expressive PDF for outreach if needed.</p>
                <p>Pick the template whose guidance matches the role before you start editing, not after.</p>
              </div>
            </div>
          </aside>
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
