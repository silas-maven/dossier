import { createEmptyItem, createEmptyProfile, createEmptySection, type CvProfile, type CvSectionType } from "@/lib/cv-profile";

export type ParsedCv = {
  basics: Partial<CvProfile["basics"]>;
  sections: Array<{
    type: CvSectionType;
    title: string;
    blocks: string[];
  }>;
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const URL_TOKEN_RE =
  /(https?:\/\/\S+)|(www\.\S+)|(\b(?:linkedin|github|gitlab)\.[a-z]{2,}\S*\b)|(\b[a-z0-9-]+\.[a-z]{2,}\b)/gi;
const URL_RE = URL_TOKEN_RE;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const TARGET_ROLE_RE = /^target role\s*:\s*(.+)$/i;

const digitsCount = (value: string) => value.replace(/\D/g, "").length;

const normalizeUrl = (value: string) => {
  const v = value.trim().replace(/[),.;]+$/, "");
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("www.")) return `https://${v}`;
  if (/^(linkedin|github|gitlab)\./i.test(v)) return `https://${v}`;
  if (/^[a-z0-9-]+\.[a-z]{2,}$/i.test(v)) return `https://${v}`;
  return v;
};

const EMAIL_PROVIDER_DENYLIST = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com"
]);

const normalizeLines = (text: string) =>
  text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const normalizeMarkdownLine = (line: string) =>
  line
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*]\s+/, "- ")
    .replace(/^__|__$/g, "")
    .replace(/\\([.[\]()*_])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const cleanHeading = (heading: string) =>
  heading
    .trim()
    .replace(/^[•*-]\s+/, "")
    .replace(/[:–—-]+$/g, "")
    .trim();

const prettifyHeadingTitle = (heading: string) => {
  const cleaned = cleanHeading(heading);
  const alpha = cleaned.replace(/[^A-Za-z]/g, "");
  if (!alpha) return cleaned;
  const upperRatio = alpha.replace(/[^A-Z]/g, "").length / alpha.length;
  if (upperRatio < 0.75) return cleaned;
  return cleaned
    .toLowerCase()
    .replace(/\b(api|saas|sql|uk|gmt|bst|crm|erp|bi|aml)\b/g, (token) => token.toUpperCase())
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\b(And|Or|For|Of|The|To|In|On|At)\b/g, (word) => word.toLowerCase())
    .replace(/\b(Api|Saas|Sql|Uk|Gmt|Bst|Crm|Erp|Bi|Aml)\b/g, (token) => token.toUpperCase());
};

const headingToSection = (heading: string): { type: CvSectionType; title: string } | null => {
  const h = cleanHeading(heading).toLowerCase();
  if (
    ["experience", "work experience", "professional experience", "employment", "employment history", "career history"].includes(
      h
    )
  ) {
    return { type: "experience", title: "Experience" };
  }
  if (["education", "academic", "academics", "academic history"].includes(h)) return { type: "education", title: "Education" };
  if (
    ["skills", "technical skills", "core skills", "key skills", "expertise", "core competencies", "tools", "technologies", "tools & methods"].includes(h) ||
    h.includes("skills") || h.includes("competencies")
  ) {
    return { type: "skills", title: "Skills" };
  }
  if (["courses", "coursework", "certificates", "certifications", "certification", "training"].includes(h)) {
    return { type: "certifications", title: "Certificates" };
  }
  if (["projects", "project", "selected projects", "project highlights", "highlighted projects"].includes(h)) {
    return { type: "projects", title: "Projects" };
  }
  if (h.includes("missing") && h.includes("custom") && h.includes("translation")) {
    return { type: "projects", title: "Projects" };
  }
  if (["summary", "profile", "about", "professional summary", "executive summary", "personal profile"].includes(h)) {
    return { type: "custom", title: "Summary" };
  }
  return null;
};

const customHeadingToSection = (heading: string): { type: CvSectionType; title: string } | null => {
  const title = prettifyHeadingTitle(heading);
  if (!title) return null;
  return {
    type: "custom",
    title
  };
};

const looksLikeCustomSectionHeading = (line: string) => {
  const cleaned = cleanHeading(line);
  const alpha = cleaned.replace(/[^A-Za-z]/g, "");
  if (alpha.length < 4) return false;
  const upperRatio = alpha.replace(/[^A-Z]/g, "").length / alpha.length;
  return upperRatio > 0.75;
};

const looksLikeHeading = (line: string) => {
  if (line.length > 50) return false;
  const alpha = line.replace(/[^A-Za-z]/g, "");
  if (alpha.length < 4) return false;
  const upperRatio = alpha.replace(/[^A-Z]/g, "").length / alpha.length;
  return upperRatio > 0.7 || /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line);
};

const looksLikeLocationDateLine = (line: string) => {
  const cleaned = line.trim();
  if (!cleaned) return false;
  if (DATE_TAIL_RE.test(cleaned)) return true;
  return /^[A-Za-z][A-Za-z /.'-]+(?:,\s*[A-Za-z][A-Za-z /.'-]+)?\s+\|\s+.*\d{4}/.test(cleaned);
};

const looksLikeExperienceHeaderStart = (line: string, nextLine = "") => {
  const cleaned = stripListMarker(line);
  if (!cleaned || /^[-•*]\s+/.test(line)) return false;
  if (headingToSection(cleaned)) return false;
  if (cleaned.length > 120) return false;
  const hasRoleSeparator = /\s+\|\s+|\s+at\s+| @ |,\s+/i.test(cleaned);
  if (looksLikeLocationDateLine(cleaned)) return true;
  return hasRoleSeparator && looksLikeLocationDateLine(nextLine);
};

const looksLikeProjectTitleLine = (line: string) => {
  const cleaned = stripListMarker(line);
  if (!cleaned || /^[-•*]\s+/.test(line)) return false;
  if (headingToSection(cleaned)) return false;
  if (looksLikeLocationDateLine(cleaned)) return false;
  if (cleaned.length > 90) return false;
  return /[A-Za-z]/.test(cleaned);
};

const splitBlocks = (lines: string[]) => {
  const blocks: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    // pdf text often uses hard wraps; treat bullet starts as new-ish blocks when buffer already has content
    const isBullet = /^[-•*]\s+/.test(line);
    if (isBullet && buf.length > 0) {
      blocks.push(buf.join("\n"));
      buf = [line];
      continue;
    }
    buf.push(line);
  }
  if (buf.length > 0) blocks.push(buf.join("\n"));
  return blocks.map((b) => b.trim()).filter(Boolean);
};

const splitExperienceBlocks = (lines: string[]) => {
  const blocks: string[] = [];
  let buf: string[] = [];
  let seenBullet = false;

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = /^[-•*]\s+/.test(line);
    const nextLine = lines[index + 1]?.trim() ?? "";
    const startsNewRole =
      buf.length > 0 &&
      seenBullet &&
      !isBullet &&
      looksLikeExperienceHeaderStart(line, nextLine);

    if (startsNewRole) {
      blocks.push(buf.join("\n"));
      buf = [line];
      seenBullet = false;
      continue;
    }

    buf.push(line);
    if (isBullet) seenBullet = true;
  }

  if (buf.length > 0) blocks.push(buf.join("\n"));
  return blocks.map((block) => block.trim()).filter(Boolean);
};

const splitProjectBlocks = (lines: string[]) => {
  const blocks: string[] = [];
  let buf: string[] = [];
  let seenBullet = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = /^[-•*]\s+/.test(line);
    const startsNewProject = buf.length > 0 && seenBullet && !isBullet && looksLikeProjectTitleLine(line);

    if (startsNewProject) {
      blocks.push(buf.join("\n"));
      buf = [line];
      seenBullet = false;
      continue;
    }

    buf.push(line);
    if (isBullet) seenBullet = true;
  }

  if (buf.length > 0) blocks.push(buf.join("\n"));
  return blocks.map((block) => block.trim()).filter(Boolean);
};

const isSummaryHeading = (title: string) => {
  const normalized = cleanHeading(title).toLowerCase();
  return normalized === "summary" || normalized === "professional summary" || normalized === "profile";
};

export const parseCvText = (text: string): ParsedCv => {
  const lines = normalizeLines(text);
  const basics: ParsedCv["basics"] = {};
  const targetRoleLine = lines.find((line) => TARGET_ROLE_RE.test(line));
  const targetRoleMatch = targetRoleLine?.match(TARGET_ROLE_RE);
  if (targetRoleMatch?.[1]) {
    basics.headline = targetRoleMatch[1].trim();
  }

  // Prefer extracting contact details from the header-ish region to avoid picking up random URLs in body text.
  const headerText = lines.slice(0, Math.min(lines.length, 40)).join(" ");

  const emailMatch = headerText.match(EMAIL_RE);
  if (emailMatch?.[0]) basics.email = emailMatch[0];

  const phoneMatch = headerText.match(PHONE_RE);
  if (phoneMatch?.[0] && digitsCount(phoneMatch[0]) >= 9) {
    basics.phone = phoneMatch[0]
      .trim()
      .replace(/[^\d+().\s-]/g, "")
      .replace(/\s+/g, " ");
  }

  // Extract URLs from header region (DOCX often puts all contact data on one line).
  const tokens = Array.from(headerText.matchAll(URL_TOKEN_RE))
    .map((m) => m[0])
    .filter(Boolean);
  const emailDomain = basics.email?.split("@")[1]?.toLowerCase();
  const candidates = tokens
    .map(normalizeUrl)
    .map((u) => u.replace(/[|]+$/g, ""))
    .filter(Boolean)
    .filter((u) => {
      const host = u.replace(/^https?:\/\//i, "").split("/")[0]?.toLowerCase() ?? "";
      if (!host) return false;
      if (EMAIL_PROVIDER_DENYLIST.has(host)) return false;
      if (emailDomain && host === emailDomain) return false;
      return true;
    });
  // Prefer personal/portfolio site if present; otherwise fall back to common profiles.
  const best =
    candidates.find((u) => !/(linkedin|github|gitlab)\./i.test(u)) ??
    candidates.find((u) => /linkedin\./i.test(u)) ??
    candidates.find((u) => /github\./i.test(u)) ??
    candidates[0];
  if (best) basics.url = best;

  // Location heuristic: often appears in DOCX header line, separated with pipes.
  const headerParts = lines
    .slice(0, Math.min(lines.length, 16))
    .flatMap((l) => l.split(/[|•]/).map((p) => p.trim()))
    .filter(Boolean);
  const locationCandidate = headerParts.find((part) => {
    if (EMAIL_RE.test(part) || PHONE_RE.test(part) || URL_RE.test(part)) return false;
    if (part.length < 5 || part.length > 44) return false;
    return /^[A-Za-z][A-Za-z .'-]+,\s*[A-Za-z][A-Za-z .'-]+$/.test(part);
  });
  if (locationCandidate) basics.location = locationCandidate;

  // Name heuristic: first non-contact line, shortish
  const nameCandidate = lines.find((l, idx) => {
    if (idx > 6) return false;
    if (EMAIL_RE.test(l) || PHONE_RE.test(l) || URL_RE.test(l)) return false;
    if (l.length > 50) return false;
    return /^[A-Za-z][A-Za-z .'-]+$/.test(l);
  });
  if (nameCandidate) basics.name = nameCandidate;

  // Headline heuristic: short non-contact line immediately after name.
  if (basics.name) {
    const nameIndex = lines.findIndex((l) => l === basics.name);
    if (nameIndex >= 0) {
      const next = lines.slice(nameIndex + 1, nameIndex + 4).find((l) => {
        if (EMAIL_RE.test(l) || PHONE_RE.test(l) || URL_RE.test(l)) return false;
        if (looksLikeHeading(l) && headingToSection(l)) return false;
        if (l.length < 4 || l.length > 60) return false;
        return /^[A-Za-z][A-Za-z0-9 &,/|().:'-]+$/.test(l);
      });
      if (next && !basics.headline) basics.headline = next.split("|")[0]?.trim() ?? next;
    }
  }

  // Segment lines into sections by headings
  const sections: ParsedCv["sections"] = [];
  let current: ParsedCv["sections"][number] | null = null;
  let currentLines: string[] = [];
  const preambleLines: string[] = [];

  const flush = () => {
    if (!current) return;
    const blocks =
      current.type === "experience"
        ? splitExperienceBlocks(currentLines)
        : current.type === "projects"
          ? splitProjectBlocks(currentLines)
          : current.type === "certifications"
            ? currentLines.map((line) => stripListMarker(line)).filter(Boolean)
            : splitBlocks(currentLines);
    sections.push({ ...current, blocks });
    current = null;
    currentLines = [];
  };

  for (const [index, line] of lines.entries()) {
    if (looksLikeHeading(line)) {
      const mapped =
        headingToSection(line) ??
        (index >= 3 && looksLikeCustomSectionHeading(line) ? customHeadingToSection(line) : null);
      if (mapped && (index >= 3 || mapped.title === "Summary")) {
        flush();
        currentLines = [];
        current = { ...mapped, blocks: [] };
        continue;
      }
    }

    if (current) {
      currentLines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  flush();

  // Summary heuristic (fallback): only from intro lines before first recognized section heading.
  if (basics.name) {
    const firstHeadingIndex = lines.findIndex((l) => looksLikeHeading(l) && !!headingToSection(l));
    const introCutoff =
      firstHeadingIndex >= 0 ? firstHeadingIndex : Math.min(lines.length, 18);
    const preHeading = (preambleLines.length > 0 ? preambleLines : lines.slice(0, introCutoff)).slice(0, introCutoff);
    const summaryLines = preHeading.filter((l) => {
      if (l === basics.name) return false;
      if (basics.headline && (l === basics.headline || l.startsWith(`${basics.headline} |`))) return false;
      if (TARGET_ROLE_RE.test(l)) return false;
      if (EMAIL_RE.test(l) || PHONE_RE.test(l) || URL_RE.test(l)) return false;
      if (looksLikeHeading(l) && headingToSection(l)) return false;
      return l.length > 20;
    });
    if (summaryLines.length > 0 && summaryLines.length <= 6) {
      basics.summary = summaryLines.join(" ");
    }
  }

  // If no headings were recognized, put everything into a single custom section
  const hasRealSections = sections.some((s) => s.type !== "custom");
  if (!hasRealSections) {
    return {
      basics,
      sections: [
        {
          type: "custom",
          title: "Content",
          blocks: splitBlocks(lines.slice(0, 200))
        }
      ]
    };
  }

  return { basics, sections };
};

export const parseCvMarkdown = (markdown: string): ParsedCv => {
  const rawLines = markdown.replace(/\r/g, "\n").split("\n");
  const basics: ParsedCv["basics"] = {};

  const h1 = rawLines.find((l) => l.trim().startsWith("# "));
  if (h1) basics.name = normalizeMarkdownLine(h1);
  const h2 = rawLines.find((l) => l.trim().startsWith("## "));
  if (h2) basics.headline = normalizeMarkdownLine(h2);

  const firstSectionIdx = rawLines.findIndex((l) => l.trim().startsWith("### "));
  const headerLines = rawLines
    .slice(0, firstSectionIdx >= 0 ? firstSectionIdx : rawLines.length)
    .map(normalizeMarkdownLine)
    .filter(Boolean)
    .filter((l) => !/^#/.test(l));
  const headerText = headerLines.join(" ");

  const emailMatch = headerText.match(EMAIL_RE);
  if (emailMatch?.[0]) basics.email = emailMatch[0].replace(/\\\./g, ".");

  const phoneMatch = headerText.match(PHONE_RE);
  if (phoneMatch?.[0] && digitsCount(phoneMatch[0]) >= 9) {
    basics.phone = phoneMatch[0]
      .trim()
      .replace(/[^\d+().\s-]/g, "")
      .replace(/\s+/g, " ");
  }

  const tokens = Array.from(headerText.matchAll(URL_TOKEN_RE))
    .map((m) => m[0])
    .filter(Boolean);
  const emailDomain = basics.email?.split("@")[1]?.toLowerCase();
  const candidates = tokens
    .map((u) => normalizeUrl(u.replace(/\\\./g, ".")))
    .filter((u) => {
      const host = u.replace(/^https?:\/\//i, "").split("/")[0]?.toLowerCase() ?? "";
      if (!host) return false;
      if (EMAIL_PROVIDER_DENYLIST.has(host)) return false;
      if (emailDomain && host === emailDomain) return false;
      return true;
    });
  const best =
    candidates.find((u) => !/(linkedin|github|gitlab)\./i.test(u)) ??
    candidates.find((u) => /linkedin\./i.test(u)) ??
    candidates.find((u) => /github\./i.test(u)) ??
    candidates[0];
  if (best) basics.url = best;

  const headerParts = headerLines
    .flatMap((l) => l.split(/[|•]/).map((p) => p.trim()))
    .filter(Boolean);
  const locationCandidate = headerParts.find((part) => {
    if (EMAIL_RE.test(part) || PHONE_RE.test(part) || URL_RE.test(part)) return false;
    if (part.length < 5 || part.length > 44) return false;
    return /^[A-Za-z][A-Za-z .'-]+,\s*[A-Za-z][A-Za-z .'-]+$/.test(part);
  });
  if (locationCandidate) basics.location = locationCandidate;

  const sections: ParsedCv["sections"] = [];
  let current: ParsedCv["sections"][number] | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!current) return;
    const blocks: string[] = [];

    // Split by explicit subheadings (#### ...), preserving bullets and body lines.
    if (currentLines.some((l) => l.startsWith("__ITEM__ "))) {
      let buf: string[] = [];
      for (const line of currentLines) {
        if (line.startsWith("__ITEM__ ")) {
          if (buf.length > 0) blocks.push(buf.join("\n").trim());
          buf = [line.replace("__ITEM__ ", "").trim()];
        } else {
          buf.push(line);
        }
      }
      if (buf.length > 0) blocks.push(buf.join("\n").trim());
    } else if (current.type === "projects") {
      // Heuristic for imported custom project section with title/description pairs.
      const clean = currentLines.map((l) => l.trim()).filter(Boolean);
      let i = 0;
      while (i < clean.length) {
        const title = clean[i] ?? "";
        const next = clean[i + 1] ?? "";
        if (!title) {
          i += 1;
          continue;
        }
        if (next && /[.!?]$/.test(next)) {
          blocks.push(`${title}\n${next}`);
          i += 2;
        } else {
          blocks.push(title);
          i += 1;
        }
      }
    } else if (current.type === "skills") {
      blocks.push(currentLines.join("\n").trim());
    } else {
      blocks.push(...splitBlocks(currentLines));
    }

    sections.push({ ...current, blocks: blocks.filter(Boolean) });
    current = null;
    currentLines = [];
  };

  for (const raw of rawLines) {
    const t = raw.trim();
    if (!t) continue;

    if (t.startsWith("### ")) {
      flush();
      const heading = normalizeMarkdownLine(t.slice(4));
      const mapped = headingToSection(heading) ?? customHeadingToSection(heading);
      current = mapped ? { ...mapped, blocks: [] } : null;
      continue;
    }

    if (!current) continue;

    if (t.startsWith("#### ")) {
      currentLines.push(`__ITEM__ ${normalizeMarkdownLine(t.slice(5))}`);
      continue;
    }

    currentLines.push(normalizeMarkdownLine(t));
  }
  flush();

  // Fallback summary from explicit profile/summary section when present.
  if (!basics.summary) {
    const summarySection = sections.find(
      (section) => section.type === "custom" && section.title.toLowerCase() === "summary"
    );
    const summary = summarySection?.blocks?.[0]?.replace(/\n+/g, " ").trim();
    if (summary) basics.summary = summary;
  }

  return { basics, sections };
};

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
const DATE_TAIL_RE = new RegExp(
  `((?:${MONTH}\\s+\\d{4}(?:\\s*[—-]\\s*(?:${MONTH}\\s+\\d{4}|Present))?)|(?:\\d{4}\\s*[—-]\\s*(?:\\d{4}|Present)))$`,
  "i"
);

const splitDateTail = (value: string) => {
  const text = value.replace(/\s+/g, " ").trim();
  const match = text.match(DATE_TAIL_RE);
  if (!match || match.index == null) {
    return { main: text, dateRange: "" };
  }
  const main = text
    .slice(0, match.index)
    .replace(/[|,\s–—-]+$/, "")
    .trim();
  const dateRange = match[1].replace(/\s*[–—-]\s*/g, " — ");
  return { main, dateRange };
};

const stripListMarker = (value: string) => value.replace(/^[-•*]\s+/, "").trim();

const collapseBulletLines = (lines: string[]) => {
  const merged: string[] = [];
  let current = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const isBullet = /^[-•*]\s+/.test(line);
    const content = stripListMarker(line);
    if (!content) continue;

    if (isBullet) {
      if (current) merged.push(current);
      current = content;
      continue;
    }

    if (current) {
      current = `${current} ${content}`.replace(/\s+/g, " ").trim();
    } else {
      current = content;
    }
  }

  if (current) merged.push(current);
  return merged;
};

const splitTitleSubtitle = (value: string) => {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return { title: value.trim(), subtitle: "" };
  return {
    title: parts[0] ?? value.trim(),
    subtitle: parts.slice(1).join(", ")
  };
};

const parseExperienceHeader = (lines: string[]) => {
  const first = stripListMarker(lines[0] ?? "");
  const second = stripListMarker(lines[1] ?? "");

  if (second && !/^[-•*]\s+/.test(lines[1] ?? "")) {
    const secondSplit = splitDateTail(second);
    if (secondSplit.dateRange) {
      return {
        title: first,
        subtitle: secondSplit.main,
        dateRange: secondSplit.dateRange,
        detailStartIndex: 2
      };
    }
  }

  const firstSplit = splitDateTail(first);
  const firstParts = splitTitleSubtitle(firstSplit.main);
  return {
    title: firstParts.title,
    subtitle: second || firstParts.subtitle,
    dateRange: firstSplit.dateRange,
    detailStartIndex: second && second !== firstParts.subtitle ? 2 : 1
  };
};

const parseCustomBlock = (block: string) => {
  const lines = collapseBulletLines(block.split("\n"));
  const text = lines.join(" ").trim();
  if (!text) {
    return { title: "", description: "" };
  }

  return {
    title: "",
    description: text
  };
};

export const profileFromParsedCv = (templateId: string, parsed: ParsedCv): CvProfile => {
  const profile = createEmptyProfile(templateId);
  profile.name = "Imported CV";
  profile.basics = {
    ...profile.basics,
    ...parsed.basics
  };

  // If there is a Summary section but basics.summary is empty, use its first block as summary.
  const summarySection = parsed.sections.find(
    (s) => s.type === "custom" && isSummaryHeading(s.title)
  );
  if (!profile.basics.summary && summarySection?.blocks?.[0]) {
    profile.basics.summary = summarySection.blocks[0].replace(/\n+/g, " ").trim();
  } else if (summarySection?.blocks?.[0]) {
    const explicitSummary = summarySection.blocks[0].replace(/\n+/g, " ").trim();
    if (explicitSummary.length > profile.basics.summary.length + 20) {
      profile.basics.summary = explicitSummary;
    }
  }

  // Avoid duplicating summary: once promoted into basics.summary, hide the custom section.
  const normalizedSections = parsed.sections.filter((section) => {
    if (section.type !== "custom") return true;
    if (!isSummaryHeading(section.title)) return true;
    return !profile.basics.summary;
  });

  const sections = normalizedSections.map((section) => {
    const s = createEmptySection(section.type);
    s.title = section.title;

    if (section.type === "skills") {
      // Skills import: keep compact. Prefer a small number of items with multiline lists.
      const text = section.blocks.join("\n").trim();
      const filteredLines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        // Occasionally headings like "COURSES:" bleed into the previous section; drop them from skills.
        .filter((l) => {
          const mapped = looksLikeHeading(l) ? headingToSection(l) : null;
          if (!mapped) return true;
          return mapped.type === "skills";
        });
      const groupedItems = filteredLines
        .map((line) => stripListMarker(line))
        .map((line) => {
          const dividerIndex = line.indexOf(":");
          if (dividerIndex <= 0 || dividerIndex >= 42) {
            return { title: "", description: line.trim() };
          }
          return {
            title: line.slice(0, dividerIndex).trim(),
            description: line.slice(dividerIndex + 1).trim()
          };
        })
        .filter((entry) => entry.description);

      s.style.skillsColumns = groupedItems.some((entry) => entry.title) ? 2 : 1;
      s.items = groupedItems.map((entry) => {
        const item = createEmptyItem();
        item.title = entry.title;
        item.description = entry.description;
        item.subtitle = "";
        item.dateRange = "";
        item.tags = [];
        item.visible = true;
        return item;
      });
      return s;
    }

    if (section.type === "experience") {
      s.items = section.blocks.slice(0, 40).map((block) => {
        const item = createEmptyItem();
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const parsedHeader = parseExperienceHeader(lines);
        item.title = parsedHeader.title;
        item.subtitle = parsedHeader.subtitle;
        item.dateRange = parsedHeader.dateRange;
        const bullets = collapseBulletLines(lines.slice(parsedHeader.detailStartIndex));
        item.description = bullets.map((l) => `- ${l}`).join("\n");
        item.tags = [];
        item.visible = true;
        return item;
      });
      return s;
    }

    if (section.type === "education") {
      s.items = section.blocks.slice(0, 20).map((block) => {
        const item = createEmptyItem();
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const header = stripListMarker(lines[0] ?? "");
        const { main, dateRange } = splitDateTail(header);
        const ts = splitTitleSubtitle(main);
        item.title = ts.title;
        item.subtitle = stripListMarker(lines[1] || ts.subtitle);
        item.dateRange = dateRange;
        item.description = lines.slice(item.subtitle ? 2 : 1).join("\n");
        item.visible = true;
        return item;
      });
      return s;
    }

    if (section.type === "certifications") {
      s.items = section.blocks.slice(0, 30).map((block) => {
        const item = createEmptyItem();
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const header = stripListMarker(lines[0] ?? "");
        const { main, dateRange } = splitDateTail(header);
        const ts = splitTitleSubtitle(main);
        item.title = ts.title;
        item.subtitle = ts.subtitle;
        item.dateRange = dateRange;
        item.description = lines.slice(1).join("\n");
        item.visible = true;
        return item;
      });
      return s;
    }

    if (section.type === "projects") {
      s.items = section.blocks.slice(0, 30).map((block) => {
        const item = createEmptyItem();
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const title = stripListMarker(lines[0] ?? "");
        const maybeMeta = stripListMarker(lines[1] ?? "");
        const { main, dateRange } = splitDateTail(maybeMeta);
        const detailStartIndex = maybeMeta ? 2 : 1;
        const rawDetailLines = lines.slice(detailStartIndex);
        const summaryLines: string[] = [];
        const bulletLines: string[] = [];

        for (const raw of rawDetailLines) {
          if (/^[-•*]\s+/.test(raw)) {
            bulletLines.push(stripListMarker(raw));
          } else {
            summaryLines.push(stripListMarker(raw));
          }
        }

        item.title = title;
        item.subtitle = main;
        item.dateRange = dateRange;
        item.description = [
          ...summaryLines,
          ...bulletLines.map((line) => `- ${line}`)
        ]
          .filter(Boolean)
          .join("\n");
        item.tags = [];
        item.visible = true;
        return item;
      });
      return s;
    }

    const item = createEmptyItem();
    item.title = "";
    item.subtitle = "";
    item.description = section.blocks
      .slice(0, 30)
      .map((block) => stripListMarker(block))
      .filter(Boolean)
      .map((text) => `- ${text.replace(/\n+/g, " ")}`)
      .join("\n");
    item.visible = true;
    s.items = item.description ? [item] : [];
    return s;
  });

  // Ensure expected core sections exist (even if empty) for editing
  const ensure = (type: CvSectionType, title: string) => {
    if (sections.some((s) => s.type === type)) return;
    const s = createEmptySection(type);
    s.title = title;
    s.items = [];
    sections.push(s);
  };
  ensure("experience", "Experience");
  ensure("education", "Education");
  ensure("skills", "Skills");
  ensure("certifications", "Certificates");

  profile.sections = sections;
  return profile;
};
