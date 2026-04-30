"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bot,
  KeyRound,
  ShieldCheck,
  Check,
  Pencil,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  profile: CvProfile;
  template: CvTemplate;
  onApplySuggestion: (suggestion: AiCvSuggestion, replacement: string) => void;
  className?: string;
};

type MatchResult = {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
};

type ActiveTab = "match" | "assist";

const assistActions: Array<{ id: AiAssistAction; label: string; hint: string }> = [
  { id: "rewrite_summary", label: "Rewrite summary", hint: "Tighten the profile section." },
  { id: "rewrite_bullets", label: "Rewrite bullets", hint: "Improve weak evidence lines." },
  { id: "tailor_to_job", label: "Tailor to job", hint: "Rewrite with the JD in mind." }
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function TailorPane({
  profile,
  template,
  onApplySuggestion,
  className
}: Props) {
  // ── Shared state ──
  const [activeTab, setActiveTab] = useState<ActiveTab>("match");
  const [showSettings, setShowSettings] = useState(false);
  const [providerId, setProviderId] = useState<AiProviderId>("openai");
  const provider = useMemo(
    () => aiProviders.find((p) => p.id === providerId) ?? aiProviders[0],
    [providerId]
  );
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Load / save provider prefs from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem("dossier-ai-provider") as AiProviderId;
    const savedKey = localStorage.getItem("dossier-ai-key");
    if (savedProvider && aiProviders.some((p) => p.id === savedProvider)) {
      setProviderId(savedProvider);
    }
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    localStorage.setItem("dossier-ai-provider", providerId);
    if (apiKey) localStorage.setItem("dossier-ai-key", apiKey);
  }, [providerId, apiKey]);

  // ── Match Analysis state ──
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  // ── Inline Assist state ──
  const [assistAction, setAssistAction] = useState<AiAssistAction>("rewrite_summary");
  const [jobType, setJobType] = useState(profile.basics.headline);
  const [seniority, setSeniority] = useState("");
  const [market, setMarket] = useState("UK");
  const [assistResult, setAssistResult] = useState<AiCvAssistResponse | null>(null);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // ── Handlers ──
  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim()) {
      setMatchError("Please paste a job description.");
      return;
    }
    if (!apiKey) {
      setMatchError("Set your API key in the settings first.");
      setShowSettings(true);
      return;
    }

    setMatchLoading(true);
    setMatchError("");
    setMatchResult(null);

    const profileText = JSON.stringify({
      basics: profile.basics,
      sections: profile.sections.map((s) => ({
        type: s.type,
        title: s.title,
        items: s.items
          .filter((i) => i.visible !== false)
          .map((i) => ({
            title: i.title,
            subtitle: i.subtitle,
            description: i.description,
            tags: i.tags
          }))
      }))
    }, null, 2);

    try {
      const res = await fetch("/api/ai/match-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, apiKey, jobDescription, profileText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setMatchResult(data);
    } catch (err: unknown) {
      setMatchError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleRunAssist = async () => {
    setAssistError(null);
    setAssistResult(null);
    if (!apiKey.trim()) {
      setAssistError("Set your API key in the settings first.");
      setShowSettings(true);
      return;
    }

    setAssistLoading(true);
    try {
      const res = await fetch("/api/ai/cv-assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerId,
          apiKey,
          model: model.trim() || undefined,
          action: assistAction,
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
      setAssistResult(json);
      setDrafts(
        Object.fromEntries((json.suggestions ?? []).map((s) => [s.id, s.replacement]))
      );
    } catch (err: unknown) {
      setAssistError(err instanceof Error ? err.message : "AI review failed.");
    } finally {
      setAssistLoading(false);
    }
  };

  const dismissSuggestion = (id: string) => {
    if (!assistResult) return;
    setAssistResult({
      ...assistResult,
      suggestions: assistResult.suggestions.filter((s) => s.id !== id)
    });
  };

  const toggleEditing = (id: string) => {
    setEditingIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  };

  // Auto-open settings if no key is set
  const needsSetup = !apiKey.trim();

  // Provider key links
  const providerKeyLinks: Record<string, string> = {
    openai: "https://platform.openai.com/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
    "google-gemini": "https://aistudio.google.com/app/apikey",
    openrouter: "https://openrouter.ai/keys",
    mistral: "https://console.mistral.ai/api-keys",
    groq: "https://console.groq.com/keys",
    together: "https://api.together.ai/settings/api-keys",
    xai: "https://console.x.ai/",
    cohere: "https://dashboard.cohere.com/api-keys",
    deepseek: "https://platform.deepseek.com/api_keys"
  };

  // ── Render ──
  return (
    <div className={cn("flex flex-col h-full bg-card/80 border rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 bg-muted/30">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">AI Workspace</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Analyze job fit &amp; rewrite CV sections with AI.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "gap-1.5 text-xs",
            needsSetup && "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          {needsSetup ? "Setup Required" : "Settings"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          className={cn(
            "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors text-center",
            activeTab === "match"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
          onClick={() => setActiveTab("match")}
        >
          <Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Match Analysis
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors text-center",
            activeTab === "assist"
              ? "border-b-2 border-primary text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
          onClick={() => setActiveTab("assist")}
        >
          <Pencil className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Inline Assist
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-dark">
        {/* Onboarding banner — shown when no key is set */}
        {needsSetup && !showSettings && (
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left transition-colors hover:bg-amber-500/10"
          >
            <div className="flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Connect an AI provider to get started
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Dossier uses your own AI key to analyze your CV. We recommend <strong className="text-foreground">OpenAI</strong> or <strong className="text-foreground">Groq</strong> (free tier available). Click here to set up.
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Settings panel */}
        {(showSettings || needsSetup) && (
          <div className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                AI Provider Setup
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                An <strong className="text-foreground">API key</strong> is a password that lets Dossier connect to an AI service on your behalf.
                Your key stays in your browser and is only sent when you click &quot;Analyze&quot; or &quot;Run AI Assist&quot;.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-medium">1. Pick a provider</span>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value as AiProviderId)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {aiProviders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-medium">Model (optional)</span>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={provider.defaultModel}
                />
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-xs font-medium">2. Paste your API key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="sk-... (stored locally in your browser only)"
                autoComplete="off"
              />
            </label>

            {/* Get your key link */}
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have a key?
              </p>
              <a
                href={providerKeyLinks[providerId] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get your {provider.label} key →
              </a>
            </div>

            {/* Quick-start tips */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                💡 Which provider should I choose?
              </summary>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground leading-relaxed pl-4 border-l border-border">
                <p>
                  <strong className="text-foreground">Groq</strong> — Fastest, free tier available. Great for trying out the feature.
                </p>
                <p>
                  <strong className="text-foreground">OpenAI</strong> — Best overall quality. Costs ~$0.01 per analysis.
                </p>
                <p>
                  <strong className="text-foreground">Google Gemini</strong> — Free tier with generous limits.
                </p>
                <p>
                  <strong className="text-foreground">DeepSeek</strong> — Very affordable, strong quality.
                </p>
              </div>
            </details>

            {apiKey && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Key saved — you&apos;re ready to go!
              </div>
            )}
          </div>
        )}

        {/* Shared Job Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-36 resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground/50"
            placeholder="Paste the target job description here — the AI will compare it against your CV..."
          />
        </div>

        {/* ─── Tab 1: Match Analysis ─── */}
        {activeTab === "match" && (
          <div className="space-y-5">
            {matchError && <p className="text-xs text-red-500 font-medium">{matchError}</p>}
            <Button
              onClick={handleAnalyzeMatch}
              disabled={matchLoading || !jobDescription.trim()}
              className="w-full gap-2"
            >
              {matchLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {matchResult ? "Re-Analyze Match" : "Analyze Match"}
            </Button>

            {matchResult && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Score */}
                <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-background shadow-sm text-center">
                  <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    Match Score
                  </div>
                  <div
                    className={cn(
                      "text-5xl font-bold mb-2 tracking-tighter",
                      matchResult.matchScore >= 80
                        ? "text-emerald-500"
                        : matchResult.matchScore >= 60
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  >
                    {matchResult.matchScore}%
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[250px]">
                    {matchResult.matchScore >= 80
                      ? "Great match! You hit most key requirements."
                      : matchResult.matchScore >= 60
                        ? "Good foundation, but missing some key requirements."
                        : "Significant gaps found. Strong tailoring recommended."}
                  </p>
                </div>

                {/* Missing Keywords */}
                {matchResult.missingKeywords?.length > 0 && (
                  <div className="space-y-3 border rounded-xl p-4 bg-background shadow-sm">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {matchResult.suggestions?.length > 0 && (
                  <div className="space-y-3 border rounded-xl p-4 bg-background shadow-sm">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <Lightbulb className="h-4 w-4" />
                      Tailoring Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {matchResult.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex gap-3 items-start text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 2: Inline Assist ─── */}
        {activeTab === "assist" && (
          <div className="space-y-4">
            {/* Action + context */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium">Action</span>
                <select
                  value={assistAction}
                  onChange={(e) => setAssistAction(e.target.value as AiAssistAction)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {assistActions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium">Target role</span>
                <input
                  type="text"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. Software Engineer"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium">Seniority</span>
                <input
                  type="text"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. Senior, Manager"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium">Market</span>
                <input
                  type="text"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. UK, US"
                />
              </label>
            </div>

            <p className="text-[10px] text-muted-foreground">
              {assistActions.find((a) => a.id === assistAction)?.hint}
            </p>

            {assistError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {assistError}
              </p>
            )}

            <Button
              type="button"
              onClick={() => void handleRunAssist()}
              disabled={assistLoading}
              className="w-full gap-2"
            >
              {assistLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              {assistLoading ? "Generating…" : "Run AI Assist"}
            </Button>

            {/* Results */}
            {assistResult && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Score + summary */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Score: {assistResult.score}/100
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {assistResult.summary}
                  </p>
                </div>

                {/* Findings */}
                {assistResult.findings.length > 0 && (
                  <div className="grid gap-2">
                    {assistResult.findings.map((finding) => (
                      <div
                        key={`${finding.title}-${finding.detail}`}
                        className={cn(
                          "rounded-xl border p-3",
                          finding.severity === "critical"
                            ? "border-red-500/25 bg-red-500/10"
                            : finding.severity === "warning"
                              ? "border-amber-500/25 bg-amber-500/10"
                              : "border-white/10 bg-white/[0.03]"
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">{finding.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {finding.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline suggestions */}
                <div className="space-y-3">
                  {assistResult.suggestions.length > 0 ? (
                    assistResult.suggestions.map((suggestion) => {
                      const isEditing = editingIds.includes(suggestion.id);
                      const draft = drafts[suggestion.id] ?? suggestion.replacement;
                      return (
                        <article
                          key={suggestion.id}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {suggestion.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {suggestion.rationale}
                              </p>
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
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => toggleEditing(suggestion.id)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit first
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => dismissSuggestion(suggestion.id)}
                              >
                                <X className="h-4 w-4" />
                                Skip
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-white/8 bg-black/15 p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Current
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                                {suggestion.current || "(empty)"}
                              </p>
                            </div>
                            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                Suggested
                              </p>
                              {isEditing ? (
                                <textarea
                                  value={draft}
                                  onChange={(e) =>
                                    setDrafts((cur) => ({
                                      ...cur,
                                      [suggestion.id]: e.target.value
                                    }))
                                  }
                                  className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                              ) : (
                                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-emerald-50">
                                  {draft}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                      No directly applyable suggestions were returned. The findings above are still
                      useful for manual edits.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
