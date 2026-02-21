import sanitizeHtml from "sanitize-html";

import type { CvSectionType } from "@/lib/cv-profile";

export type InlineRun = {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export type DescriptionBlock = {
  kind: "heading" | "para" | "bullet" | "numbered";
  runs: InlineRun[];
};

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li"];
const BULLET_INPUT_RE = /^[-•*]\s+/;
const DATE_RANGE_LINE_RE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[—-]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|Present)|\d{4}\s*[—-]\s*(?:\d{4}|Present))/i;
const ROLE_TITLE_LINE_RE = /^[A-Z][A-Za-z .,'&/()-]+,\s*[A-Z][A-Za-z .,'&/()-]+$/;

const decodeHtmlEntities = (value: string) => {
  const decodedNamed = value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return decodedNamed.replace(/&#(\d+);/g, (_, code) => {
    const number = Number.parseInt(code, 10);
    if (Number.isNaN(number)) return _;
    return String.fromCharCode(number);
  });
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const pushRun = (runs: InlineRun[], next: InlineRun) => {
  if (!next.text) return;
  const last = runs[runs.length - 1];
  if (
    last &&
    last.bold === next.bold &&
    last.italic === next.italic &&
    last.underline === next.underline
  ) {
    last.text += next.text;
    return;
  }
  runs.push(next);
};

const runsHaveText = (runs: InlineRun[]) => runs.some((run) => run.text.trim().length > 0);

const blockText = (block: DescriptionBlock) =>
  block.runs
    .map((run) => run.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();

const normalizeInlineSpacing = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

const splitTextLines = (value: string) =>
  value
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeInlineSpacing(line))
    .filter(Boolean);

const isLikelyHeadingLine = (line: string) => {
  if (!line || BULLET_INPUT_RE.test(line)) return false;
  if (ROLE_TITLE_LINE_RE.test(line) || DATE_RANGE_LINE_RE.test(line)) return true;
  if (/[.!?]$/.test(line)) return false;
  if (line.length > 72) return false;
  return /[A-Za-z]/.test(line);
};

const shouldAppendToBullet = (line: string) => {
  if (!line) return false;
  if (ROLE_TITLE_LINE_RE.test(line) || DATE_RANGE_LINE_RE.test(line)) return false;
  if (isLikelyHeadingLine(line)) return false;
  return true;
};

const stripMarkdownInlineMarkers = (text: string) =>
  text
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");

const parseInlineMarkdownRuns = (text: string): InlineRun[] => {
  if (!text) return [];
  const tokenRe = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const runs: InlineRun[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushRun(runs, {
        text: text.slice(lastIndex, match.index),
        bold: false,
        italic: false,
        underline: false
      });
    }
    const token = match[0];
    if (token.startsWith("***")) {
      pushRun(runs, { text: token.slice(3, -3), bold: true, italic: true, underline: false });
    } else if (token.startsWith("**")) {
      pushRun(runs, { text: token.slice(2, -2), bold: true, italic: false, underline: false });
    } else {
      pushRun(runs, { text: token.slice(1, -1), bold: false, italic: true, underline: false });
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    pushRun(runs, {
      text: text.slice(lastIndex),
      bold: false,
      italic: false,
      underline: false
    });
  }
  return runs.filter((run) => run.text.length > 0);
};

const parseInlineHtmlRuns = (html: string): InlineRun[] => {
  const runs: InlineRun[] = [];
  const tokenRe = /<\/?(strong|em|u|b|i)\b[^>]*>|<br\s*\/?>/gi;
  let bold = false;
  let italic = false;
  let underline = false;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(html)) !== null) {
    const chunk = html.slice(lastIndex, match.index);
    const normalized = decodeHtmlEntities(chunk.replace(/\s+/g, " "));
    pushRun(runs, {
      text: normalized,
      bold,
      italic,
      underline
    });

    const token = match[0].toLowerCase();
    const isClosing = token.startsWith("</");
    if (token.startsWith("<br")) {
      pushRun(runs, {
        text: "\n",
        bold,
        italic,
        underline
      });
    } else if (token.includes("strong") || token.includes("<b")) {
      bold = !isClosing;
    } else if (token.includes("em") || token.includes("<i")) {
      italic = !isClosing;
    } else if (token.includes("u")) {
      underline = !isClosing;
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    const tail = decodeHtmlEntities(html.slice(lastIndex).replace(/\s+/g, " "));
    pushRun(runs, {
      text: tail,
      bold,
      italic,
      underline
    });
  }

  return runs.filter((run) => run.text.length > 0);
};

const applyHeadingHeuristics = (blocks: DescriptionBlock[]) =>
  blocks.map((block, index, all) => {
    const text = blockText(block);
    const next = all[index + 1];

    if ((block.kind === "bullet" || block.kind === "numbered") && next) {
      const nextIsList = next.kind === "bullet" || next.kind === "numbered";
      if (nextIsList && isLikelyHeadingLine(text) && !/[.!?]$/.test(text)) {
        return { ...block, kind: "heading" as const };
      }
      return block;
    }

    if (block.kind === "para") {
      if (next && (next.kind === "bullet" || next.kind === "numbered")) {
        return { ...block, kind: "heading" as const };
      }
      if (isLikelyHeadingLine(text)) {
        return { ...block, kind: "heading" as const };
      }
    }

    return block;
  });

const parseLegacyMarkdownBlocks = (value: string): DescriptionBlock[] => {
  const lines = value
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rawBlocks: DescriptionBlock[] = lines.map((line, index, allLines) => {
    const bullet = line.match(/^[-•*]\s+(.*)$/);
    if (bullet?.[1]) {
      const bulletText = bullet[1].trim();
      const nextLine = allLines[index + 1];
      const looksHeading =
        nextLine &&
        /^[-•*]\s+/.test(nextLine) &&
        isLikelyHeadingLine(stripMarkdownInlineMarkers(bulletText)) &&
        !/[.!?]$/.test(stripMarkdownInlineMarkers(bulletText));

      if (looksHeading) {
        return {
          kind: "heading",
          runs: parseInlineMarkdownRuns(bulletText)
        };
      }

      return {
        kind: "bullet",
        runs: parseInlineMarkdownRuns(bulletText)
      };
    }

    return {
      kind: "para",
      runs: parseInlineMarkdownRuns(line)
    };
  });

  return applyHeadingHeuristics(rawBlocks).filter((block) => runsHaveText(block.runs));
};

const parseTopLevelHtmlBlocks = (html: string): DescriptionBlock[] => {
  const blocks: DescriptionBlock[] = [];
  const topLevelRe = /<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushLooseText = (raw: string) => {
    const cleaned = decodeHtmlEntities(raw.replace(/<[^>]+>/g, " "));
    cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        blocks.push({
          kind: "para",
          runs: [{ text: line, bold: false, italic: false, underline: false }]
        });
      });
  };

  while ((match = topLevelRe.exec(html)) !== null) {
    const [full, tag, inner] = match;

    if (match.index > lastIndex) {
      pushLooseText(html.slice(lastIndex, match.index));
    }

    if (tag === "p") {
      const runs = parseInlineHtmlRuns(inner);
      if (runsHaveText(runs)) {
        blocks.push({ kind: "para", runs });
      }
    } else {
      const ordered = tag === "ol";
      const itemRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRe.exec(inner)) !== null) {
        const normalizedItem = itemMatch[1]
          .trim()
          .replace(/<p\b[^>]*>/gi, "")
          .replace(/<\/p>/gi, "")
          .trim();

        const runs = parseInlineHtmlRuns(normalizedItem);
        if (!runsHaveText(runs)) continue;

        blocks.push({
          kind: ordered ? "numbered" : "bullet",
          runs
        });
      }
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < html.length) {
    pushLooseText(html.slice(lastIndex));
  }

  if (blocks.length === 0) {
    const fallback = decodeHtmlEntities(html.replace(/<[^>]+>/g, " "));
    fallback
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        blocks.push({
          kind: "para",
          runs: [{ text: line, bold: false, italic: false, underline: false }]
        });
      });
  }

  return applyHeadingHeuristics(blocks).filter((block) => runsHaveText(block.runs));
};

const blockRunsToHtml = (runs: InlineRun[]) => {
  if (!runs.length) return "<br>";
  return runs
    .map((run) => {
      let text = escapeHtml(run.text).replace(/\n/g, "<br>");
      if (run.underline) text = `<u>${text}</u>`;
      if (run.italic) text = `<em>${text}</em>`;
      if (run.bold) text = `<strong>${text}</strong>`;
      return text;
    })
    .join("");
};

const blocksToHtml = (blocks: DescriptionBlock[]) => {
  let html = "";
  let openList: null | "ul" | "ol" = null;

  const closeList = () => {
    if (!openList) return;
    html += `</${openList}>`;
    openList = null;
  };

  for (const block of blocks) {
    if (!runsHaveText(block.runs)) continue;

    if (block.kind === "bullet" || block.kind === "numbered") {
      const listTag = block.kind === "numbered" ? "ol" : "ul";
      if (openList !== listTag) {
        closeList();
        html += `<${listTag}>`;
        openList = listTag;
      }
      html += `<li>${blockRunsToHtml(block.runs)}</li>`;
      continue;
    }

    closeList();
    html += `<p>${blockRunsToHtml(block.runs)}</p>`;
  }

  closeList();
  return html;
};

const emptyHtml = (value: string) => {
  const compact = value.replace(/\s+/g, "").toLowerCase();
  return compact === "" || compact === "<p></p>" || compact === "<p><br></p>";
};

export const sanitizeDescriptionHtml = (value: string) =>
  sanitizeHtml(value || "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      i: "em",
      div: "p"
    },
    parser: {
      lowerCaseTags: true
    }
  }).trim();

export const isHtmlDescription = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value || "");

export const normalizeStoredDescriptionHtml = (value: string) => {
  const sanitized = sanitizeDescriptionHtml(value);
  if (!sanitized || emptyHtml(sanitized)) return "";
  return sanitized;
};

export const parseDescriptionBlocks = (value: string): DescriptionBlock[] => {
  const raw = (value || "").trim();
  if (!raw) return [];

  if (isHtmlDescription(raw)) {
    const sanitized = sanitizeDescriptionHtml(raw);
    if (!sanitized) return [];
    return parseTopLevelHtmlBlocks(sanitized);
  }

  return parseLegacyMarkdownBlocks(raw);
};

export const descriptionToPlainText = (value: string) =>
  parseDescriptionBlocks(value)
    .map((block) => {
      const text = blockText(block);
      if (!text) return "";
      if (block.kind === "bullet" || block.kind === "numbered") return `- ${text}`;
      return text;
    })
    .filter(Boolean)
    .join("\n")
    .trim();

export const normalizeDescriptionPlainText = (sectionType: CvSectionType, rawText: string) => {
  const lines = splitTextLines(rawText);
  if (lines.length === 0) return "";

  if (sectionType !== "experience" && sectionType !== "projects" && sectionType !== "custom") {
    return lines.join("\n");
  }

  const merged: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] ?? "";
    const bulletBody = line.replace(BULLET_INPUT_RE, "").trim();
    const isBullet = BULLET_INPUT_RE.test(line);

    if (isBullet) {
      if (
        BULLET_INPUT_RE.test(nextLine) &&
        isLikelyHeadingLine(bulletBody) &&
        !/[.!?]$/.test(bulletBody)
      ) {
        merged.push(bulletBody);
        continue;
      }
      merged.push(`- ${bulletBody}`);
      continue;
    }

    const previous = merged[merged.length - 1];
    if (previous?.startsWith("- ") && shouldAppendToBullet(line)) {
      merged[merged.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ").trim();
      continue;
    }

    merged.push(line);
  }

  const output: string[] = [];
  for (const line of merged) {
    const isHeading = isLikelyHeadingLine(line);
    if (isHeading && output.length > 0 && output[output.length - 1] !== "") {
      output.push("");
    }
    output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

export const legacyMarkdownToHtml = (value: string) => {
  const blocks = parseLegacyMarkdownBlocks(value || "");
  if (!blocks.length) return "";
  return normalizeStoredDescriptionHtml(blocksToHtml(blocks));
};

export const descriptionToEditorHtml = (value: string) => {
  const raw = (value || "").trim();
  if (!raw) return "<p></p>";
  if (isHtmlDescription(raw)) {
    const sanitized = sanitizeDescriptionHtml(raw);
    return sanitized || "<p></p>";
  }
  const converted = legacyMarkdownToHtml(raw);
  return converted || "<p></p>";
};

export const normalizeDescriptionToHtml = (sectionType: CvSectionType, rawValue: string) => {
  const plainText = descriptionToPlainText(rawValue);
  const normalizedText = normalizeDescriptionPlainText(sectionType, plainText);
  if (!normalizedText) return "";
  return legacyMarkdownToHtml(normalizedText);
};
