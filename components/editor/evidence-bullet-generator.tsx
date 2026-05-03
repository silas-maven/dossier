"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, RefreshCw, Settings, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiProviders } from "@/lib/ai/providers";
import type { AiProviderId } from "@/lib/ai/types";

type Props = {
  roleTitle?: string;
  onAppend: (bullet: string) => void;
};

export default function EvidenceBulletGenerator({ roleTitle, onAppend }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [providerId, setProviderId] = useState<AiProviderId>("openai");
  const [apiKey, setApiKey] = useState("");

  const [action, setAction] = useState("");
  const [metric, setMetric] = useState("");
  const [result, setResult] = useState("");

  const [generatedBullet, setGeneratedBullet] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load from local storage
  useEffect(() => {
    const savedProvider = localStorage.getItem("dossier-ai-provider") as AiProviderId;
    const savedKey = localStorage.getItem("dossier-ai-key");
    if (savedProvider && aiProviders.some((p) => p.id === savedProvider)) {
      setProviderId(savedProvider);
    }
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("dossier-ai-provider", providerId);
    if (apiKey) localStorage.setItem("dossier-ai-key", apiKey);
  }, [providerId, apiKey]);

  const handleGenerate = async () => {
    if (!action || !result) {
      setError("Action and Result are required.");
      return;
    }
    if (!apiKey) {
      setError("Please set your API key in the settings first.");
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedBullet("");

    try {
      const res = await fetch("/api/ai/generate-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          apiKey,
          action,
          metric,
          result,
          roleTitle
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setGeneratedBullet(data.bullet);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppend = () => {
    if (!generatedBullet) return;
    onAppend(generatedBullet);
    setGeneratedBullet("");
    setAction("");
    setMetric("");
    setResult("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 mb-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary"
      >
        <Sparkles className="h-4 w-4" />
        Generate Bullet with AI
      </Button>
    );
  }

  return (
    <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Evidence-First Bullet Generator
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8 p-0"
            aria-label="Toggle Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
            aria-label="Close"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="space-y-4 rounded-xl bg-background p-4 border shadow-sm">
          <div>
            <h4 className="text-sm font-semibold">AI Provider Setup</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              An <strong className="text-foreground">API key</strong> is a password that lets Dossier connect to an AI service on your behalf.
              Your key stays locally in your browser.
            </p>
          </div>

          <div className="space-y-3">
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
              <span className="text-xs font-medium">2. Paste your API key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Don&apos;t have a key?</p>
            <a
              href={
                (
                  {
                    openai: "https://platform.openai.com/api-keys",
                    anthropic: "https://console.anthropic.com/settings/keys",
                    groq: "https://console.groq.com/keys",
                    "google-gemini": "https://aistudio.google.com/app/apikey",
                    deepseek: "https://platform.deepseek.com/api_keys",
                    cohere: "https://dashboard.cohere.com/api-keys",
                    mistral: "https://console.mistral.ai/api-keys/",
                    together: "https://api.together.xyz/settings/api-keys",
                    openrouter: "https://openrouter.ai/keys",
                    xai: "https://console.x.ai/"
                  } as Record<string, string>
                )[providerId] || "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get your key →
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-muted-foreground">Action <span className="text-red-500">*</span></span>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="min-h-16 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Led a team of 5 engineers"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-muted-foreground">Metric/Scope (Optional)</span>
          <textarea
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="min-h-16 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. $2M budget, 10k users"
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-muted-foreground">Result <span className="text-red-500">*</span></span>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="min-h-16 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Reduced latency by 40%"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !action || !result}
          className="gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generatedBullet ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {generatedBullet && (
        <div className="mt-4 space-y-3 rounded-md bg-background p-4 border shadow-sm">
          <p className="text-sm font-medium leading-relaxed">{generatedBullet}</p>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAppend} className="gap-2">
              <Plus className="h-4 w-4" />
              Add to Description
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
