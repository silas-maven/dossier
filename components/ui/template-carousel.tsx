"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  Eye,
  FileText,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";

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
import {
  templateExperienceLevelOptions,
  templateFamilyDefinitions,
  templateFamilyOptions,
  templateLayoutOptions,
  templateThemeLabels
} from "@/lib/templates";
import { cn } from "@/lib/utils";

export type TemplateCarouselProps = {
  templates: CvTemplate[];
  onSelect: (template: CvTemplate) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

type ViewMode = "grid" | "list";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const compactMetaTone: Record<CvTemplate["atsFit"], string> = {
  Strong: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Balanced: "border-amber-500/25 bg-amber-500/10 text-amber-200"
};

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function matchesSearch(template: CvTemplate, query: string) {
  if (!query) return true;

  const haystack = [
    template.name,
    template.category,
    template.industry,
    template.shelf,
    template.experienceLevel,
    template.description,
    template.atsFit,
    template.layout,
    template.family,
    template.theme,
    ...template.bestFor
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function FamilyCard({
  family,
  active,
  count,
  onClick
}: {
  family: CvTemplate["family"];
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  const meta = templateFamilyDefinitions[family];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[24px] border p-4 text-left transition",
        active
          ? "border-[#5ea4ff]/60 bg-[#5ea4ff]/10"
          : "border-white/8 bg-[#0d1526]/70 hover:border-white/14 hover:bg-[#10192d]"
      )}
    >
      <p className="text-sm font-semibold tracking-tight text-foreground">{meta.label}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{meta.focus}</span>
        <span>{count} templates</span>
      </div>
    </button>
  );
}

function TemplatePreviewImage({
  template,
  priority = false
}: {
  template: CvTemplate;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0">
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(180deg,#172235_0%,#0d1524_100%)]" />
      ) : null}
      <Image
        src={template.previewImage}
        alt={`${template.name} preview`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 84vw, (max-width: 1280px) 34vw, 22vw"
        className={cn(
          "object-cover object-top transition duration-500",
          loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onToggle
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.02] px-3 py-2.5 transition hover:border-white/12 hover:bg-white/[0.04]">
      <span className="text-sm text-foreground">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#5ea4ff]"
      />
    </label>
  );
}

function TemplateCard({
  template,
  onPreview,
  onSelect,
  priority = false
}: {
  template: CvTemplate;
  onPreview: (template: CvTemplate) => void;
  onSelect: (template: CvTemplate) => void;
  priority?: boolean;
}) {
  return (
    <article className="group relative min-w-[280px] max-w-[320px] flex-1 snap-start">
      <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0c1424] shadow-[0_18px_40px_rgba(1,6,16,0.35)] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/14 group-hover:shadow-[0_24px_48px_rgba(1,6,16,0.45)]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <TemplatePreviewImage template={template} priority={priority} />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,20,0.04)_0%,rgba(7,12,20,0.18)_55%,rgba(7,12,20,0.9)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="inline-flex rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/78 backdrop-blur-sm">
              {template.category}
            </span>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{template.name}</h3>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.24)_0%,rgba(4,8,16,0.72)_48%,rgba(4,8,16,0.94)_100%)] opacity-100 transition duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100" />
          <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-100 transition duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  compactMetaTone[template.atsFit]
                )}
              >
                {template.atsFit} ATS
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] font-medium text-white/82">
                {template.layout}
              </span>
            </div>

            <div className="space-y-3">
              <p className="max-w-[18rem] text-sm leading-6 text-white/80">{template.description}</p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1 bg-white/12 text-white hover:bg-white/18" onClick={() => onPreview(template)}>
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button type="button" className="flex-1" onClick={() => onSelect(template)}>
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplateRow({
  template,
  onPreview,
  onSelect
}: {
  template: CvTemplate;
  onPreview: (template: CvTemplate) => void;
  onSelect: (template: CvTemplate) => void;
}) {
  return (
    <article className="grid gap-4 rounded-[28px] border border-white/8 bg-[#0d1526]/85 p-4 shadow-[0_14px_32px_rgba(1,6,16,0.22)] md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-white/8 bg-[#101b30]">
        <TemplatePreviewImage template={template} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,20,0)_0%,rgba(7,12,20,0.24)_100%)]" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{template.name}</h3>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {template.category}
          </span>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{template.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
              compactMetaTone[template.atsFit]
            )}
          >
            {template.atsFit} ATS
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground">
            {template.layout}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground">
            {template.experienceLevel}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground">
            {template.industry}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {template.bestFor.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-[#0b1324] px-2.5 py-1 text-xs text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 md:flex-col">
        <Button type="button" variant="secondary" className="flex-1 md:min-w-[9rem]" onClick={() => onPreview(template)}>
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button type="button" className="flex-1 md:min-w-[9rem]" onClick={() => onSelect(template)}>
          Use Template
        </Button>
      </div>
    </article>
  );
}

function GallerySkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="h-fit rounded-[28px] border border-white/8 bg-[#0c1424] p-5 lg:sticky lg:top-6">
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-2xl bg-white/6" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex h-14 animate-pulse items-center rounded-[24px] border border-white/8 bg-[#0c1424]" />
        {Array.from({ length: 2 }).map((_, shelfIndex) => (
          <div key={shelfIndex} className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/8" />
            <div className={cn("gap-5", viewMode === "grid" ? "flex overflow-hidden" : "grid")}>
              {Array.from({ length: viewMode === "grid" ? 3 : 4 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "animate-pulse rounded-[28px] bg-[#0d1526]",
                    viewMode === "grid" ? "min-w-[280px] aspect-[4/5]" : "h-[15rem]"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("All");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLayouts, setSelectedLayouts] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const templateIndustryOptions = useMemo(
    () => Array.from(new Set(templates.map((template) => template.industry))).sort(),
    [templates]
  );

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        if (selectedFamily !== "All" && template.family !== selectedFamily) return false;
        if (selectedIndustries.length && !selectedIndustries.includes(template.industry)) return false;
        if (selectedLayouts.length && !selectedLayouts.includes(template.layout)) return false;
        if (selectedExperienceLevels.length && !selectedExperienceLevels.includes(template.experienceLevel)) {
          return false;
        }
        return matchesSearch(template, normalizedQuery);
      }),
    [normalizedQuery, selectedExperienceLevels, selectedFamily, selectedIndustries, selectedLayouts, templates]
  );

  const familySections = useMemo(
    () =>
      templateFamilyOptions
        .map((family) => ({
          family,
          templates: filteredTemplates.filter((template) => template.family === family)
        }))
        .filter((section) => section.templates.length > 0),
    [filteredTemplates]
  );

  const activeFilters = [
    ...(selectedFamily !== "All" ? [{ group: "family" as const, value: templateFamilyDefinitions[selectedFamily as CvTemplate["family"]].label }] : []),
    ...selectedLayouts.map((value) => ({ group: "layout" as const, value })),
    ...selectedExperienceLevels.map((value) => ({ group: "experience" as const, value })),
    ...selectedIndustries.map((value) => ({ group: "industry" as const, value }))
  ];

  const clearFilter = (group: "family" | "layout" | "experience" | "industry", value: string) => {
    if (group === "family") {
      setSelectedFamily("All");
      return;
    }
    if (group === "layout") {
      setSelectedLayouts((current) => current.filter((entry) => entry !== value));
      return;
    }
    if (group === "experience") {
      setSelectedExperienceLevels((current) => current.filter((entry) => entry !== value));
      return;
    }
    setSelectedIndustries((current) => current.filter((entry) => entry !== value));
  };

  if (loading) {
    return <GallerySkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/12 bg-[#0c1424] p-8 text-center">
        <p className="font-medium text-foreground">Could not load templates.</p>
        <Button className="mt-4" type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/12 bg-[#0c1424] p-8 text-center">
        <p className="font-medium text-foreground">No templates available.</p>
      </div>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[28px] border border-white/8 bg-[#0c1424] p-5 shadow-[0_18px_40px_rgba(1,6,16,0.24)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-3 scrollbar-dark">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Refine</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Filter the gallery</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setSelectedFamily("All");
              setSelectedIndustries([]);
              setSelectedLayouts([]);
              setSelectedExperienceLevels([]);
              setSearchQuery("");
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Family</p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFamily("All")}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition",
                  selectedFamily === "All"
                    ? "border-[#5ea4ff]/60 bg-[#5ea4ff]/10 text-foreground"
                    : "border-white/6 bg-white/[0.02] text-foreground hover:border-white/12 hover:bg-white/[0.04]"
                )}
              >
                <span>All families</span>
              </button>
              {templateFamilyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedFamily(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                    selectedFamily === option
                      ? "border-[#5ea4ff]/60 bg-[#5ea4ff]/10 text-foreground"
                      : "border-white/6 bg-white/[0.02] text-foreground hover:border-white/12 hover:bg-white/[0.04]"
                  )}
                >
                  <span>{templateFamilyDefinitions[option].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layout</p>
            <div className="mt-3 space-y-2">
              {templateLayoutOptions.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={selectedLayouts.includes(option)}
                  onToggle={() => setSelectedLayouts((current) => toggleValue(current, option))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Experience Level
            </p>
            <div className="mt-3 space-y-2">
              {templateExperienceLevelOptions.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={selectedExperienceLevels.includes(option)}
                  onToggle={() => setSelectedExperienceLevels((current) => toggleValue(current, option))}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Industry</p>
            <div className="mt-3 space-y-2">
              {templateIndustryOptions.map((option) => (
                <FilterCheckbox
                  key={option}
                  label={option}
                  checked={selectedIndustries.includes(option)}
                  onToggle={() => setSelectedIndustries((current) => toggleValue(current, option))}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div className="rounded-[28px] border border-white/8 bg-[#0c1424]/92 p-4 shadow-[0_18px_40px_rgba(1,6,16,0.2)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by role, industry, or style"
                className="h-11 w-full rounded-2xl border border-white/8 bg-[#09111f] pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-[#5ea4ff]/70"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/8 bg-[#09111f] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    viewMode === "grid" ? "bg-[#5ea4ff] text-slate-950" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Large Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    viewMode === "list" ? "bg-[#5ea4ff] text-slate-950" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                  Compact List
                </button>
              </div>

              <div className="hidden rounded-2xl border border-white/8 bg-[#09111f] px-3 py-2 text-sm text-muted-foreground sm:block">
                {filteredTemplates.length} templates
              </div>
            </div>
          </div>

          {activeFilters.length || normalizedQuery ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {normalizedQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-full border border-[#5ea4ff]/20 bg-[#5ea4ff]/10 px-3 py-1.5 text-xs font-medium text-[#b6d5ff]"
                >
                  Search: {searchQuery}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {activeFilters.map((filter) => (
                <button
                  key={`${filter.group}-${filter.value}`}
                  type="button"
                  onClick={() => clearFilter(filter.group, filter.value)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {filter.value}
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layout Families</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Browse by family first</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Pick the layout engine first, then compare its theme variants and industry guidance.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {templateFamilyOptions.map((family) => (
              <FamilyCard
                key={family}
                family={family}
                active={selectedFamily === family}
                count={templates.filter((template) => template.family === family).length}
                onClick={() => setSelectedFamily(family)}
              />
            ))}
          </div>
        </section>

        {!filteredTemplates.length ? (
          <div className="rounded-[28px] border border-dashed border-white/12 bg-[#0c1424] p-10 text-center">
            <p className="font-medium text-foreground">No templates match those filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">Widen the search or remove a few filter constraints.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {familySections.map((section) => (
              <section key={section.family} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                      {templateFamilyDefinitions[section.family].label}
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {templateFamilyDefinitions[section.family].description}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.templates.length} {section.templates.length === 1 ? "template" : "templates"}
                  </p>
                </div>

                {viewMode === "grid" ? (
                  <div className="template-rail flex snap-x gap-5 overflow-x-auto pb-3">
                    {section.templates.map((template, index) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        priority={index < 2}
                        onPreview={setPreviewTemplate}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {section.templates.map((template) => (
                      <TemplateRow key={template.id} template={template} onPreview={setPreviewTemplate} onSelect={onSelect} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => (open ? null : setPreviewTemplate(null))}>
        <DialogContent className="max-h-[92vh] max-w-[96vw] overflow-hidden border-white/10 bg-[#08101d] p-0 text-foreground xl:max-w-6xl">
          {previewTemplate ? (
            <div className="grid h-full min-h-[78vh] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="border-b border-white/8 p-4 xl:border-b-0 xl:border-r">
                <div className="h-full overflow-hidden rounded-[24px] border border-white/8 bg-background">
                  <PDFViewer key={previewTemplate.id} className="h-full w-full">
                    <CvPdfDocument profile={seedExampleProfile(previewTemplate.id)} />
                  </PDFViewer>
                </div>
              </div>

              <div className="flex flex-col p-6">
                <DialogHeader>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {previewTemplate.category}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        compactMetaTone[previewTemplate.atsFit]
                      )}
                    >
                      {previewTemplate.atsFit} ATS
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {templateFamilyDefinitions[previewTemplate.family].label}
                    </span>
                  </div>
                  <DialogTitle className="mt-4 text-2xl tracking-tight">{previewTemplate.name}</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                    {previewTemplate.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layout</p>
                    <p className="mt-2 text-sm text-foreground">{previewTemplate.layout}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Experience Level
                    </p>
                    <p className="mt-2 text-sm text-foreground">{previewTemplate.experienceLevel}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Theme</p>
                    <p className="mt-2 text-sm text-foreground">{templateThemeLabels[previewTemplate.theme]}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Industry</p>
                    <p className="mt-2 text-sm text-foreground">{previewTemplate.industry}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Recommended Format
                    </p>
                    <p className="mt-2 text-sm text-foreground">{previewTemplate.recommendedFormat}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best For</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {previewTemplate.bestFor.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Guidance
                  </p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                    {previewTemplate.guidance.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5ea4ff]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-8">
                  <Button type="button" className="w-full" onClick={() => onSelect(previewTemplate)}>
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
