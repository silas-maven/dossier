"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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

type ExpandCardsProps = {
  templates: CvTemplate[];
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onSelect?: (template: CvTemplate) => void;
};

const INACTIVE_WIDTH = "6.5rem";
const ACTIVE_WIDTH = "34rem";
const FIXED_HEIGHT = "30rem";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const sampleTemplates: CvTemplate[] = [
  {
    id: "sample-classic",
    name: "Sample Classic",
    category: "Sample",
    description: "Starter preset for immediate editing.",
    previewImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1400&q=80"
  }
];

export default function ExpandCards({
  templates,
  loading = false,
  disabled = false,
  error = false,
  onRetry,
  onSelect
}: ExpandCardsProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [useSampleTemplates, setUseSampleTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const cards = useMemo(() => {
    if (useSampleTemplates) return sampleTemplates;
    return templates;
  }, [templates, useSampleTemplates]);

  const handleExpandOrSelect = (index: number) => {
    if (disabled) return;

    const card = cards[index];
    if (!card) return;

    if (expandedIndex !== index) {
      setExpandedIndex(index);
      return;
    }

    setSelectedId(card.id);
    onSelect?.(card);
  };

  const handleKeySelectDiv = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleExpandOrSelect(index);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < max - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [cards.length]);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(420, Math.round(el.clientWidth * 0.7));
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex w-full gap-1 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-96 flex-none animate-pulse rounded-3xl bg-muted"
            style={{
              width: idx === 0 ? ACTIVE_WIDTH : INACTIVE_WIDTH
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-3xl border border-dashed bg-muted/40 p-6 text-center">
        <div className="space-y-3">
          <p className="font-medium">Could not load template previews.</p>
          <Button type="button" variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-3xl border border-dashed bg-muted/40 p-6 text-center">
        <div className="space-y-3">
          <p className="font-medium">No templates available yet.</p>
          <p className="text-sm text-muted-foreground">
            Seed sample templates to continue your CV setup.
          </p>
          <Button type="button" onClick={() => setUseSampleTemplates(true)}>
            Use sample templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-background to-transparent md:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-background to-transparent md:block" />

        <div className="absolute inset-y-0 left-2 z-20 hidden items-center md:flex">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!canScrollLeft}
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous templates"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-2 z-20 hidden items-center md:flex">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!canScrollRight}
            onClick={() => scrollByAmount(1)}
            aria-label="Next templates"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={scrollerRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 pt-2 scroll-px-4 md:px-16 md:scroll-px-16"
        >
          {cards.map((template, idx) => {
            const isExpanded = idx === expandedIndex;
            const isSelected = selectedId === template.id;

            return (
              <div
                key={template.id}
                data-card
                role="button"
                aria-pressed={isSelected}
                aria-disabled={disabled}
                aria-label={`Select ${template.name} template`}
                tabIndex={disabled ? -1 : 0}
                className={cn(
                  "group relative h-96 flex-none snap-start overflow-hidden rounded-3xl border text-left transition-[width,border-color,box-shadow] duration-500 ease-in-out motion-reduce:transition-none motion-reduce:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
                    : "border-transparent",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                style={{
                  width: isExpanded ? ACTIVE_WIDTH : INACTIVE_WIDTH,
                  height: FIXED_HEIGHT
                }}
                onMouseEnter={() => setExpandedIndex(idx)}
                onFocus={() => setExpandedIndex(idx)}
                onClick={() => handleExpandOrSelect(idx)}
                onKeyDown={(event) => handleKeySelectDiv(event, idx)}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-white/85 text-foreground opacity-100 shadow-sm backdrop-blur transition-opacity hover:bg-white",
                    "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPreviewTemplate(template);
                  }}
                  aria-label={`Preview ${template.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Image
                  src={template.previewImage}
                  alt={`${template.name} CV template preview`}
                  fill
                  sizes="(max-width: 768px) 80vw, 34rem"
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-5 text-white transition-opacity duration-500 ease-in-out",
                    isExpanded ? "opacity-100" : "opacity-0"
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/80">{template.category}</p>
                  <h3 className="mt-1 text-xl font-semibold">{template.name}</h3>
                  <p className="mt-2 text-sm text-white/90">{template.description}</p>
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
                        setSelectedId(template.id);
                        onSelect?.(template);
                      }}
                    >
                      Use this style
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-white/85">
                      {isSelected ? "Selected" : "Or tap/click card twice"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Desktop: hover to expand, click to select. Mobile: first tap expands, second tap selects.
      </p>

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
    </div>
  );
}
