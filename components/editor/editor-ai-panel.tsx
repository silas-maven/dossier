"use client";

import { useMemo, useRef, useState } from "react";
import { Bot, Check, KeyRound, Pencil, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiProviders } from "@/lib/ai/providers";
import type {
  AiAssistAction,
  AiCvAssistResponse,
  AiCvSuggestion,
  AiProviderId
} from "@/lib/ai/types";
import type { CvProfile } from "@/lib/cv-profile";
import type { CvTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type EditorAiPanelProps = {
  profile: CvProfile;
  template: CvTemplate;
  onApplySuggestion: (suggestion: AiCvSuggestion, replacement: string) => void;
};

const actionOptions: Array<{ id: AiAssistAction; label: string; hint: string }> = [
  { id: "ats_review", label: "ATS review", hint: "Score parsing risk and clarity." },
  { id: "tailor_to_job", label: "Tailor to job", hint: "Use the job description for fit." },
  { id: "rewrite_summary", label: "Rewrite summary", hint: "Tighten the profile section." },
  { id: "rewrite_bullets", label: "Rewrite bullets", hint: "Improve weak evidence lines." },
  { id: "skills_gap", label: "Skills gap", hint: "Find missing keywords and skills." }
];

const providerDefault = aiProviders[0];

export default function EditorAiPanel({ profile, template, onApplySuggestion }: EditorAiPanelProps) {
  const [providerId, setProviderId] = useState<AiProviderId>(providerDefault.id);
  const provider = useMemo(
    () => aiProviders.find((candidate) => candidate.id === providerId) ?? providerDefault,
    [providerId]
  );
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState("");
  const [action, setAction] = useState<AiAssistAction>("ats_review");
  const [jobType, setJobType] = useState(profile.basics.headline);
  const [seniority, setSeniority] = useState("");
  const [market, setMarket] = useState("UK");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AiCvAssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const runReview = async () => {
    setError(null);
    setResult(null);
    const currentApiKey = apiKeyRef.current?.value || "";
    if (!currentApiKey.trim()) {
      setError("Add a provider key for this session before running AI review.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/cv-assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerId,
          apiKey: currentApiKey,
          model: model.trim() || undefined,
          action,
          profile,
          context: {
            templateId: template.id,
            templateName: template.name,
            guidanceProfileId: template.guidanceProfileId,
            industry: template.industry,
            atsMode: template.atsMode,
            jobType,
            seniority,
            market,
            jobDescription
          }
        })
      });
      const json = (await res.json().catch(() => ({}))) as AiCvAssistResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "AI review failed.");
      setResult(json);
      setDrafts(
        Object.fromEntries((json.suggestions ?? []).map((suggestion) => [suggestion.id, suggestion.replacement]))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI review failed.");
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = (id: string) => {
    if (!result) return;
    setResult({
      ...result,
      suggestions: result.suggestions.filter((suggestion) => suggestion.id !== id)
    });
  };

  const toggleEditing = (id: string) => {
    setEditingIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]
    );
  };

  return (
    <Card className="border-[#5ea4ff]/30 bg-[#0b1324]/90">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#9fc8ff]" />
              AI Review
            </CardTitle>
            <CardDescription>
              Bring your own provider key for this session. Suggestions never apply automatically.
            </CardDescription>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Session-only key
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Provider and target role
          </summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Provider</span>
              <select
                value={providerId}
                onChange={(event) => setProviderId(event.target.value as AiProviderId)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {aiProviders.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Model</span>
              <input
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={provider.defaultModel}
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="h-4 w-4" />
                Provider API key
              </span>
              <input
                ref={apiKeyRef}
                type="password"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Only kept in memory for this tab"
                autoComplete="off"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Target role</span>
              <input
                type="text"
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Technical Support Engineer"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Seniority</span>
              <input
                type="text"
                value={seniority}
                onChange={(event) => setSeniority(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Senior, Manager, Entry-level"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Market</span>
              <input
                type="text"
                value={market}
                onChange={(event) => setMarket(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. UK, US, EMEA"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Action</span>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value as AiAssistAction)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {actionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block space-y-1">
            <span className="text-sm font-medium">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Paste the job description for stronger tailoring and keyword review."
            />
          </label>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void runReview()} disabled={loading}>
            {loading ? "Reviewing..." : "Run AI review"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Key is sent to Dossier server only for this request and is not stored.
          </p>
        </div>

        {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

        {result ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-foreground">ATS / job-fit score: {result.score}/100</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.summary}</p>
            </div>

            {result.findings.length ? (
              <div className="grid gap-2 md:grid-cols-2">
                {result.findings.map((finding) => (
                  <div
                    key={`${finding.title}-${finding.detail}`}
                    className={cn(
                      "rounded-2xl border p-3",
                      finding.severity === "critical"
                        ? "border-red-500/25 bg-red-500/10"
                        : finding.severity === "warning"
                          ? "border-amber-500/25 bg-amber-500/10"
                          : "border-white/10 bg-white/[0.03]"
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground">{finding.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{finding.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-3">
              {result.suggestions.length ? (
                result.suggestions.map((suggestion) => {
                  const isEditing = editingIds.includes(suggestion.id);
                  const draft = drafts[suggestion.id] ?? suggestion.replacement;
                  return (
                    <article key={suggestion.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{suggestion.rationale}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              onApplySuggestion(suggestion, draft);
                              dismissSuggestion(suggestion.id);
                            }}
                          >
                            <Check className="h-4 w-4" />
                            Apply
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => toggleEditing(suggestion.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit first
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => dismissSuggestion(suggestion.id)}>
                            <X className="h-4 w-4" />
                            Skip
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current</p>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">{suggestion.current || "(empty)"}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">Suggested</p>
                          {isEditing ? (
                            <textarea
                              value={draft}
                              onChange={(event) =>
                                setDrafts((current) => ({ ...current, [suggestion.id]: event.target.value }))
                              }
                              className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-emerald-50">{draft}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                  No directly applyable suggestions were returned. The findings above are still useful for manual edits.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
