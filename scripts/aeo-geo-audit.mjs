#!/usr/bin/env node

/**
 * AEO/GEO audit — multi-LLM citation tracker
 *
 * Queries multiple LLM providers with a project-specific prompt pack,
 * detects whether the project is mentioned + ranked + linked, and emits
 * per-run JSON+CSV plus an append-only history file.
 *
 * Cron-safe: single-instance lockfile, hard timeouts, never blocks on TTY,
 * unique exit codes, incremental result persistence.
 *
 * Usage:
 *   node scripts/aeo-geo-audit.mjs --project dossier
 *   node scripts/aeo-geo-audit.mjs --project dossier --providers openai,anthropic
 *   node scripts/aeo-geo-audit.mjs --project dossier --max-prompts 5
 *
 * Provider auth:
 *   openai      OPENAI_API_KEY (required)
 *   anthropic   ANTHROPIC_API_KEY (preferred) OR `claude` CLI (fallback)
 *   perplexity  PERPLEXITY_API_KEY (required — no public CLI; skipped if missing)
 *   gemini      GEMINI_API_KEY (preferred) OR `gemini` CLI (fallback)
 *
 * Optional env overrides:
 *   AEO_OPENAI_MODEL          default: gpt-4.1-mini
 *   AEO_ANTHROPIC_MODEL       default: claude-sonnet-4-5
 *   AEO_PERPLEXITY_MODEL      default: sonar
 *   AEO_GEMINI_MODEL          default: gemini-2.0-flash
 *   AEO_WEB_SEARCH            default: true (set "false" to disable web tools)
 *   AEO_PROVIDER_TIMEOUT_MS   default: 180000 (3 min per provider call)
 *   AEO_FORCE_CLI             comma-separated: anthropic,gemini  (skip API even if key set)
 *
 * Cron example (every Monday 9am, log to file, mail on non-zero exit):
 *   0 9 * * 1 cd /Users/you/dossier && /usr/local/bin/node scripts/aeo-geo-audit.mjs \
 *     --project dossier --providers openai,anthropic,gemini \
 *     >> /var/log/aeo-audit.log 2>&1
 */

import fs from "node:fs/promises";
import { openSync, closeSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Open /dev/null once and reuse — claude CLI's stdin probe isn't satisfied by
// Node's "ignore" stdio (it needs a real readable fd pointing at /dev/null).
const DEV_NULL_FD = openSync("/dev/null", "r");
process.on("exit", () => {
  try { closeSync(DEV_NULL_FD); } catch { /* ignore */ }
});

// Exit codes
const EXIT_OK = 0;
const EXIT_LOCKED = 10;          // another run in progress
const EXIT_CONFIG_ERROR = 20;    // bad config / missing prompts
const EXIT_NO_PROVIDERS = 30;    // every provider missing auth
const EXIT_RUNTIME_ERROR = 1;

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { providers: null, project: null, maxPrompts: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--project") {
      args.project = argv[++i];
    } else if (arg === "--providers") {
      args.providers = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg === "--max-prompts") {
      args.maxPrompts = Number.parseInt(argv[++i], 10);
    }
  }
  return args;
}

const cliArgs = parseArgs(process.argv);

const PROJECT = cliArgs.project || process.env.AEO_PROJECT || "dossier";
const PROVIDERS = cliArgs.providers || (process.env.AEO_PROVIDERS || "openai").split(",").map((s) => s.trim()).filter(Boolean);
const USE_WEB_SEARCH = process.env.AEO_WEB_SEARCH !== "false";
const PROVIDER_TIMEOUT_MS = Number.parseInt(process.env.AEO_PROVIDER_TIMEOUT_MS || "180000", 10);
const FORCE_CLI = new Set((process.env.AEO_FORCE_CLI || "").split(",").map((s) => s.trim()).filter(Boolean));

const maxPromptsRaw = cliArgs.maxPrompts ?? Number.parseInt(process.env.AEO_MAX_PROMPTS || "0", 10);
const MAX_PROMPTS = Number.isFinite(maxPromptsRaw) && maxPromptsRaw > 0 ? maxPromptsRaw : null;

const MODELS = {
  openai: process.env.AEO_OPENAI_MODEL || "gpt-4.1-mini",
  anthropic: process.env.AEO_ANTHROPIC_MODEL || "claude-sonnet-4-5",
  perplexity: process.env.AEO_PERPLEXITY_MODEL || "sonar",
  gemini: process.env.AEO_GEMINI_MODEL || "gemini-2.5-flash"
};

// ---------------------------------------------------------------------------
// Cron lockfile — prevents overlapping runs
// ---------------------------------------------------------------------------

const LOCK_PATH = path.join("/tmp", `aeo-audit-${PROJECT}.lock`);

async function acquireLock() {
  try {
    const existing = await fs.readFile(LOCK_PATH, "utf8");
    const pid = Number.parseInt(existing.trim(), 10);
    if (Number.isFinite(pid)) {
      try {
        process.kill(pid, 0); // signal 0 = check if alive
        return false; // lock held by live process
      } catch {
        // stale lock, fall through to overwrite
      }
    }
  } catch {
    // no existing lock, fall through
  }
  await fs.writeFile(LOCK_PATH, String(process.pid), "utf8");
  return true;
}

async function releaseLock() {
  try {
    await fs.unlink(LOCK_PATH);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Config loader
// ---------------------------------------------------------------------------

async function loadProjectConfig(projectName) {
  const configPath = path.join("scripts", "aeo-configs", `${projectName}.json`);
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw);

  for (const required of ["name", "domain", "systemPrompt", "mentionPatterns", "promptsPath", "outputDir"]) {
    if (!(required in config)) {
      throw new Error(`Project config ${configPath} missing required key: ${required}`);
    }
  }

  return {
    name: config.name,
    domain: config.domain.toLowerCase(),
    systemPrompt: config.systemPrompt,
    mentionPatterns: config.mentionPatterns.map((s) => new RegExp(s, "i")),
    promptsPath: config.promptsPath,
    outputDir: config.outputDir
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlugTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function toCsvValue(value) {
  const raw = value == null ? "" : String(value);
  return `"${raw.replaceAll('"', '""')}"`;
}

function detectMention(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function detectDomainLink(text, domain) {
  const links = text.match(/https?:\/\/[^\s)]+/gi) || [];
  return links.some((link) => link.toLowerCase().includes(domain));
}

function detectPosition(text, patterns) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const ranked = lines
    .map((line) => {
      const m = line.match(/^(?:#+\s*)?\**\s*(\d+)[.)\s-]+(.*)$/);
      if (!m) return null;
      return { rank: Number.parseInt(m[1], 10), text: line, rest: m[2] };
    })
    .filter(Boolean);

  for (const entry of ranked) {
    if (patterns.some((p) => p.test(entry.text) || p.test(entry.rest))) {
      return entry.rank;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider adapters — each returns plain text given (prompt, systemPrompt)
// ---------------------------------------------------------------------------

async function queryOpenAI(prompt, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const payload = {
    model: MODELS.openai,
    input: [
      { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: prompt }] }
    ]
  };
  if (USE_WEB_SEARCH) payload.tools = [{ type: "web_search_preview" }];

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI: ${data?.error?.message || res.status}`);

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (typeof c.text === "string") chunks.push(c.text);
    }
  }
  return chunks.join("\n").trim();
}

async function queryAnthropicAPI(prompt, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const payload = {
    model: MODELS.anthropic,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }]
  };
  if (USE_WEB_SEARCH) {
    payload.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Anthropic: ${data?.error?.message || res.status}`);

  const chunks = [];
  for (const block of data.content || []) {
    if (block.type === "text" && typeof block.text === "string") chunks.push(block.text);
  }
  return chunks.join("\n").trim();
}

async function queryAnthropicCLI(prompt, systemPrompt) {
  // Uses `claude -p` non-interactive mode.
  // We deliberately do NOT pass --bare: --bare requires ANTHROPIC_API_KEY env var,
  // which defeats the purpose of CLI fallback. Without --bare, claude reads OAuth
  // from keychain (set up by `claude login`).
  // --system-prompt replaces Claude Code's default coding-agent prompt with ours.
  // --add-dir / -- skipped: we don't want to allow filesystem access for AEO runs.
  const args = [
    "-p", prompt,
    "--system-prompt", systemPrompt,
    "--dangerously-skip-permissions"
  ];
  if (USE_WEB_SEARCH) {
    args.push("--allowedTools", "WebSearch", "WebFetch");
  }
  const { stdout } = await execFileAsync("claude", args, {
    timeout: PROVIDER_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
    stdio: [DEV_NULL_FD, "pipe", "pipe"]
  });
  return stdout.trim();
}

async function queryAnthropic(prompt, systemPrompt) {
  if (FORCE_CLI.has("anthropic") || !process.env.ANTHROPIC_API_KEY) {
    return queryAnthropicCLI(prompt, systemPrompt);
  }
  return queryAnthropicAPI(prompt, systemPrompt);
}

async function queryPerplexity(prompt, systemPrompt) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("Missing PERPLEXITY_API_KEY (no public CLI fallback)");

  // Perplexity's online models always do retrieval; USE_WEB_SEARCH is implicit.
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELS.perplexity,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Perplexity: ${data?.error?.message || res.status}`);

  return (data.choices?.[0]?.message?.content || "").trim();
}

async function queryGeminiAPI(prompt, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };
  if (USE_WEB_SEARCH) payload.tools = [{ google_search: {} }];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini: ${data?.error?.message || res.status}`);

  const chunks = [];
  for (const cand of data.candidates || []) {
    for (const part of cand.content?.parts || []) {
      if (typeof part.text === "string") chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

async function queryGeminiCLI(prompt, systemPrompt) {
  // Gemini CLI's -p mode takes a single prompt; combine system + user.
  // --approval-mode yolo is non-interactive (mutually exclusive with -y, so we use only one).
  // stdio[0]='ignore' so the CLI doesn't try to read stdin under cron.
  const combined = `${systemPrompt}\n\n---\n\nUser query: ${prompt}`;
  const { stdout } = await execFileAsync(
    "gemini",
    ["-p", combined, "-m", MODELS.gemini, "--approval-mode", "yolo"],
    {
      timeout: PROVIDER_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
      stdio: [DEV_NULL_FD, "pipe", "pipe"]
    }
  );
  return stdout.trim();
}

async function queryGemini(prompt, systemPrompt) {
  if (FORCE_CLI.has("gemini") || !process.env.GEMINI_API_KEY) {
    return queryGeminiCLI(prompt, systemPrompt);
  }
  return queryGeminiAPI(prompt, systemPrompt);
}

const PROVIDER_REGISTRY = {
  openai: queryOpenAI,
  anthropic: queryAnthropic,
  perplexity: queryPerplexity,
  gemini: queryGemini
};

async function queryProvider(provider, prompt, systemPrompt) {
  const fn = PROVIDER_REGISTRY[provider];
  if (!fn) throw new Error(`Unknown provider: ${provider}`);
  return fn(prompt, systemPrompt);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function describeProviderAuth(provider) {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY ? "api" : "MISSING";
    case "anthropic":
      if (FORCE_CLI.has("anthropic")) return "cli (forced)";
      return process.env.ANTHROPIC_API_KEY ? "api" : "cli (fallback)";
    case "perplexity":
      return process.env.PERPLEXITY_API_KEY ? "api" : "MISSING";
    case "gemini":
      if (FORCE_CLI.has("gemini")) return "cli (forced)";
      return process.env.GEMINI_API_KEY ? "api" : "cli (fallback)";
    default:
      return "unknown";
  }
}

async function main() {
  const startedAt = Date.now();

  // Lockfile guard for cron
  const acquired = await acquireLock();
  if (!acquired) {
    process.stderr.write(`Lock held at ${LOCK_PATH} — another run in progress. Exiting.\n`);
    process.exit(EXIT_LOCKED);
  }

  let config;
  try {
    config = await loadProjectConfig(PROJECT);
  } catch (err) {
    await releaseLock();
    process.stderr.write(`Config error: ${err.message}\n`);
    process.exit(EXIT_CONFIG_ERROR);
  }

  // Pre-flight: surface missing auth cleanly (don't waste a cron slot)
  const authStatus = Object.fromEntries(PROVIDERS.map((p) => [p, describeProviderAuth(p)]));
  const usableProviders = PROVIDERS.filter((p) => authStatus[p] !== "MISSING");
  const skipped = PROVIDERS.filter((p) => authStatus[p] === "MISSING");

  process.stdout.write(`Project: ${config.name} (domain: ${config.domain})\n`);
  process.stdout.write(`Providers: ${PROVIDERS.map((p) => `${p}=${authStatus[p]}`).join(", ")}\n`);
  if (skipped.length) {
    process.stdout.write(`Skipping (no auth): ${skipped.join(", ")}\n`);
  }
  if (usableProviders.length === 0) {
    await releaseLock();
    process.stderr.write(`No usable providers — every provider requested is missing auth.\n`);
    process.exit(EXIT_NO_PROVIDERS);
  }

  const promptsRaw = await fs.readFile(config.promptsPath, "utf8");
  const prompts = JSON.parse(promptsRaw);
  if (!Array.isArray(prompts) || prompts.length === 0) {
    await releaseLock();
    process.stderr.write(`Prompt file is empty or invalid: ${config.promptsPath}\n`);
    process.exit(EXIT_CONFIG_ERROR);
  }

  const selectedPrompts = MAX_PROMPTS ? prompts.slice(0, MAX_PROMPTS) : prompts;
  process.stdout.write(`Running ${selectedPrompts.length} of ${prompts.length} prompts\n\n`);

  await fs.mkdir(config.outputDir, { recursive: true });
  const stamp = toSlugTimestamp(new Date());
  const jsonPath = path.join(config.outputDir, `aeo-geo-audit-${stamp}.json`);
  const csvPath = path.join(config.outputDir, `aeo-geo-audit-${stamp}.csv`);
  const historyPath = path.join(config.outputDir, "aeo-history.jsonl");

  const results = [];

  for (const prompt of selectedPrompts) {
    for (const provider of usableProviders) {
      const startedAt = new Date().toISOString();
      let responseText = "";
      let error = null;
      try {
        responseText = await queryProvider(provider, prompt.prompt, config.systemPrompt);
      } catch (err) {
        error = err.message;
      }

      const mentioned = error ? false : detectMention(responseText, config.mentionPatterns);
      const position = error ? null : detectPosition(responseText, config.mentionPatterns);
      const hasDomainLink = error ? false : detectDomainLink(responseText, config.domain);

      results.push({
        id: prompt.id,
        intent: prompt.intent,
        prompt: prompt.prompt,
        provider,
        model: MODELS[provider],
        startedAt,
        mentioned,
        position,
        hasDomainLink,
        responseText,
        error
      });

      // Incremental persistence — survives crashes
      await fs.writeFile(jsonPath, JSON.stringify({ inProgress: true, results }, null, 2), "utf8");

      const status = error ? `ERROR (${error})` : `mention=${mentioned} pos=${position ?? "-"} link=${hasDomainLink}`;
      process.stdout.write(`  [${provider}] ${prompt.id} → ${status}\n`);
    }
  }

  // ---- Per-provider summary ----
  const perProvider = {};
  for (const provider of usableProviders) {
    const rows = results.filter((r) => r.provider === provider && !r.error);
    const total = rows.length;
    const mentions = rows.filter((r) => r.mentioned).length;
    const top3 = rows.filter((r) => typeof r.position === "number" && r.position > 0 && r.position <= 3).length;
    const linked = rows.filter((r) => r.hasDomainLink).length;
    const errors = results.filter((r) => r.provider === provider && r.error).length;

    perProvider[provider] = {
      model: MODELS[provider],
      totalPrompts: total,
      errors,
      mentions,
      mentionRate: total ? Number((mentions / total).toFixed(4)) : 0,
      top3,
      top3Rate: total ? Number((top3 / total).toFixed(4)) : 0,
      linked,
      linkedRate: total ? Number((linked / total).toFixed(4)) : 0
    };
  }

  const summary = {
    runAt: new Date().toISOString(),
    durationSec: Math.round((Date.now() - startedAt) / 1000),
    project: config.name,
    targetDomain: config.domain,
    providers: usableProviders,
    skippedProviders: skipped,
    totalPrompts: selectedPrompts.length,
    perProvider
  };

  // ---- Write final JSON ----
  await fs.writeFile(jsonPath, JSON.stringify({ summary, results }, null, 2), "utf8");

  // ---- Write CSV ----
  const csvHeader = ["id", "intent", "provider", "model", "startedAt", "mentioned", "position", "has_domain_link", "error", "prompt", "response_preview"];
  const csvRows = results.map((row) => [
    row.id,
    row.intent,
    row.provider,
    row.model,
    row.startedAt,
    row.mentioned ? "yes" : "no",
    row.position ?? "",
    row.hasDomainLink ? "yes" : "no",
    row.error || "",
    row.prompt,
    (row.responseText || "").slice(0, 220)
  ]);
  const csv = [csvHeader, ...csvRows].map((row) => row.map(toCsvValue).join(",")).join("\n");
  await fs.writeFile(csvPath, csv, "utf8");

  // ---- Append to history (one summary per line) ----
  await fs.appendFile(historyPath, JSON.stringify(summary) + "\n", "utf8");

  // ---- Console report ----
  process.stdout.write("\nAEO/GEO audit complete\n");
  process.stdout.write(`JSON:    ${jsonPath}\n`);
  process.stdout.write(`CSV:     ${csvPath}\n`);
  process.stdout.write(`History: ${historyPath}\n\n`);
  for (const provider of usableProviders) {
    const s = perProvider[provider];
    process.stdout.write(`[${provider}] mention=${(s.mentionRate * 100).toFixed(1)}%  top3=${(s.top3Rate * 100).toFixed(1)}%  link=${(s.linkedRate * 100).toFixed(1)}%  errors=${s.errors}\n`);
  }

  // Single-line summary for cron log scanners
  const oneLine = usableProviders
    .map((p) => `${p}=${(perProvider[p].mentionRate * 100).toFixed(0)}%`)
    .join(" ");
  process.stdout.write(`\nSUMMARY ${config.name} ${summary.runAt} ${summary.durationSec}s ${oneLine}\n`);
}

let exitCode = EXIT_OK;
try {
  await main();
} catch (error) {
  process.stderr.write(`AEO/GEO audit failed: ${error.message}\n`);
  exitCode = EXIT_RUNTIME_ERROR;
} finally {
  await releaseLock();
  process.exit(exitCode);
}
