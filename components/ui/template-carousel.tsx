"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, RefreshCw } from "lucide-react";

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

export default function TemplateCarousel({
  templates,
  onSelect,
  loading = false,
  error = false,
  onRetry
}: TemplateCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const update = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const safeActiveIndex = templates.length > 0 ? Math.min(activeIndex, templates.length - 1) : 0;
  const activeTemplate = templates[safeActiveIndex];
  const shiftPercent = isMobile ? 72 : 56;

  const goPrev = () => {
    if (!templates.length) return;
    setActiveIndex((current) => (current - 1 + templates.length) % templates.length);
  };

  const goNext = () => {
    if (!templates.length) return;
    setActiveIndex((current) => (current + 1) % templates.length);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/40 p-6">
        <div className="h-[34rem] animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
        <p className="font-medium text-foreground">Could not load templates.</p>
        <Button className="mt-4" type="button" variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <kbd className="font-mono">Enter</kbd>
            <span>Select template</span>
          </span>
        </div>
      </div>

      <div
        tabIndex={0}
        className="relative h-[34rem] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            if (activeTemplate) onSelect(activeTemplate);
          }
        }}
      >
        {templates.map((template, index) => {
          const offset = index - safeActiveIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          const isVisible = absOffset <= 2;

          return (
            <article
              key={template.id}
              className={cn(
                "absolute left-1/2 top-1/2 h-[30rem] w-[min(82vw,42rem)] -translate-y-1/2 overflow-hidden rounded-3xl border transition-all duration-500 ease-out",
                isActive
                  ? "border-primary/55 shadow-[0_26px_70px_rgba(0,0,0,0.55)]"
                  : "cursor-pointer border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.4)]"
              )}
              style={{
                transform: `translate(-50%, -50%) translateX(${offset * shiftPercent}%) scale(${isActive ? 1 : 0.86})`,
                opacity: isVisible ? (isActive ? 1 : 0.72) : 0,
                zIndex: 30 - absOffset,
                pointerEvents: isVisible ? "auto" : "none"
              }}
              onClick={() => {
                if (!isActive) setActiveIndex(index);
              }}
              aria-hidden={!isVisible}
            >
              <Image
                src={template.previewImage}
                alt={`${template.name} preview`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 82vw, 42rem"
                priority={index <= 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/26 to-black/0" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">{template.category}</p>
                <h3 className="mt-1 text-2xl font-semibold">{template.name}</h3>
                <p className="mt-2 max-w-xl text-sm text-white/88">{template.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    See preview
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(template);
                    }}
                  >
                    Use this style
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={goPrev} aria-label="Previous">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="secondary" size="icon" onClick={goNext} aria-label="Next">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => (open ? null : setPreviewTemplate(null))}>
        <DialogContent className="h-[90vh] max-w-[95vw] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <DialogHeader>
                <DialogTitle>Template Preview</DialogTitle>
                <DialogDescription>{previewTemplate?.name ?? ""}</DialogDescription>
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
