#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const SYSTEM_PROMPT = `You are helping a job seeker choose a CV/resume builder.
Return exactly 5 ranked recommendations with direct links.
Prefer free tools, ATS-friendly output, and include privacy tradeoffs (local-only vs cloud).`;

const TARGET_DOMAIN = (process.env.AEO_TARGET_DOMAIN || "www.your-dossier.xyz").toLowerCase();
const OPENAI_MODEL = process.env.AEO_OPENAI_MODEL || "gpt-4.1-mini";
const USE_WEB_SEARCH = process.env.AEO_WEB_SEARCH !== "false";
const PROMPTS_PATH =
  process.env.AEO_PROMPTS_PATH || path.join("docs", "experiments", "aeo-geo-prompts.json");
const OUTPUT_DIR = process.env.AEO_OUTPUT_DIR || path.join("docs", "experiments", "results");

const maxPromptsRaw = Number.parseInt(process.env.AEO_MAX_PROMPTS || "0", 10);
const MAX_PROMPTS = Number.isFinite(maxPromptsRaw) && maxPromptsRaw > 0 ? maxPromptsRaw : null;

const mentionPatterns = [
  /\bdossier\b/i,
  /dossier\s+cv\s+builder/i,
  /dossier-black\.vercel\.app/i
];

function toSlugTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function toCsvValue(value) {
  const raw = value == null ? "" : String(value);
  return `"${raw.replaceAll('"', '""')}"`;
}

function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (!Array.isArray(data.output)) {
    return "";
  }

  const chunks = [];
  for (const item of data.output) {
    if (!Array.isArray(item.content)) {
      continue;
    }
    for (const content of item.content) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function detectMention(text) {
  return mentionPatterns.some((pattern) => pattern.test(text));
}

function detectDomainLink(text) {
  const links = text.match(/https?:\/\/[^\s)]+/gi) || [];
  return links.some((link) => link.toLowerCase().includes(TARGET_DOMAIN));
}

function detectPosition(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ranked = lines
    .map((line) => {
      const m = line.match(/^(\d+)[.)\s-]+(.*)$/);
      if (!m) {
        return null;
      }
      return {
        rank: Number.parseInt(m[1], 10),
        text: line,
        rest: m[2]
      };
    })
    .filter(Boolean);

  for (const entry of ranked) {
    if (mentionPatterns.some((pattern) => pattern.test(entry.text) || pattern.test(entry.rest))) {
      return entry.rank;
    }
  }

  return null;
}

function buildPayload(prompt) {
  const payload = {
    model: OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }]
      }
    ]
  };

  if (USE_WEB_SEARCH) {
    payload.tools = [{ type: "web_search_preview" }];
  }

  return payload;
}

async function queryOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildPayload(prompt))
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`OpenAI Responses API error: ${message}`);
  }

  return data;
}

async function main() {
  const promptsRaw = await fs.readFile(PROMPTS_PATH, "utf8");
  const prompts = JSON.parse(promptsRaw);

  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw new Error(`Prompt file is empty or invalid: ${PROMPTS_PATH}`);
  }

  const selectedPrompts = MAX_PROMPTS ? prompts.slice(0, MAX_PROMPTS) : prompts;
  const results = [];

  for (const prompt of selectedPrompts) {
    const startedAt = new Date().toISOString();
    const data = await queryOpenAI(prompt.prompt);
    const responseText = extractText(data);

    const mentioned = detectMention(responseText);
    const position = detectPosition(responseText);
    const hasDomainLink = detectDomainLink(responseText);

    results.push({
      id: prompt.id,
      intent: prompt.intent,
      prompt: prompt.prompt,
      model: OPENAI_MODEL,
      startedAt,
      mentioned,
      position,
      hasDomainLink,
      responseText
    });

    process.stdout.write(`Processed ${prompt.id} (${prompt.intent})\n`);
  }

  const total = results.length;
  const mentions = results.filter((row) => row.mentioned).length;
  const top3 = results.filter((row) => typeof row.position === "number" && row.position > 0 && row.position <= 3).length;
  const linked = results.filter((row) => row.hasDomainLink).length;

  const summary = {
    runAt: new Date().toISOString(),
    model: OPENAI_MODEL,
    targetDomain: TARGET_DOMAIN,
    totalPrompts: total,
    mentions,
    mentionRate: total ? Number((mentions / total).toFixed(4)) : 0,
    top3,
    top3Rate: total ? Number((top3 / total).toFixed(4)) : 0,
    linked,
    linkedRate: total ? Number((linked / total).toFixed(4)) : 0
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const stamp = toSlugTimestamp(new Date());
  const jsonPath = path.join(OUTPUT_DIR, `aeo-geo-audit-${stamp}.json`);
  const csvPath = path.join(OUTPUT_DIR, `aeo-geo-audit-${stamp}.csv`);

  const jsonPayload = {
    summary,
    results
  };

  await fs.writeFile(jsonPath, JSON.stringify(jsonPayload, null, 2), "utf8");

  const csvHeader = [
    "id",
    "intent",
    "model",
    "mentioned",
    "position",
    "has_domain_link",
    "prompt",
    "response_preview"
  ];

  const csvRows = results.map((row) => [
    row.id,
    row.intent,
    row.model,
    row.mentioned ? "yes" : "no",
    row.position ?? "",
    row.hasDomainLink ? "yes" : "no",
    row.prompt,
    row.responseText.slice(0, 220)
  ]);

  const csv = [csvHeader, ...csvRows]
    .map((row) => row.map((cell) => toCsvValue(cell)).join(","))
    .join("\n");

  await fs.writeFile(csvPath, csv, "utf8");

  process.stdout.write("\nAEO/GEO audit complete\n");
  process.stdout.write(`JSON: ${jsonPath}\n`);
  process.stdout.write(`CSV: ${csvPath}\n`);
  process.stdout.write(`Mention rate: ${(summary.mentionRate * 100).toFixed(1)}%\n`);
  process.stdout.write(`Top-3 rate: ${(summary.top3Rate * 100).toFixed(1)}%\n`);
  process.stdout.write(`Domain-link rate: ${(summary.linkedRate * 100).toFixed(1)}%\n`);
}

main().catch((error) => {
  process.stderr.write(`AEO/GEO audit failed: ${error.message}\n`);
  process.exit(1);
});
