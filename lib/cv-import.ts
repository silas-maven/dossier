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

const headingToSection = (heading: string): { type: CvSectionType; title: string } | null => {
  const h = cleanHeading(heading).toLowerCase();
  if (
    ["experience", "work experience", "professional experience", "employment", "employment history"].includes(
      h
    )
  ) {
    return { type: "experience", title: "Experience" };
  }
  if (["education", "academic", "academics"].includes(h)) return { type: "education", title: "Education" };
  if (["skills", "technical skills", "core skills"].includes(h)) return { type: "skills", title: "Skills" };
  if (["courses", "coursework", "certificates", "certifications", "certification", "training"].includes(h)) {
    return { type: "certifications", title: "Certificates" };
  }
  if (["projects", "project", "selected projects"].includes(h)) return { type: "projects", title: "Projects" };
  if (h.includes("missing") && h.includes("custom") && h.includes("translation")) {
    return { type: "projects", title: "Projects" };
  }
  if (["summary", "profile", "about"].includes(h)) return { type: "custom", title: "Summary" };
  return null;
};

const looksLikeHeading = (line: string) => {
  if (line.length > 42) return false;
  const alpha = line.replace(/[^A-Za-z]/g, "");
  if (alpha.length < 4) return false;
  const upperRatio = alpha.replace(/[^A-Z]/g, "").length / alpha.length;
  return upperRatio > 0.7 || /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line);
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

export const parseCvText = (text: string): ParsedCv => {
  const lines = normalizeLines(text);
  const basics: ParsedCv["basics"] = {};

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
    .flatMap((l) => l.split("|").map((p) => p.trim()))
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
        return /^[A-Za-z][A-Za-z &/.'-]+$/.test(l);
      });
      if (next) basics.headline = next;
    }
  }

  // Segment lines into sections by headings
  const sections: ParsedCv["sections"] = [];
  let current: ParsedCv["sections"][number] | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!current) return;
    const blocks = splitBlocks(currentLines);
    sections.push({ ...current, blocks });
    current = null;
    currentLines = [];
  };

  for (const line of lines) {
    if (looksLikeHeading(line)) {
      const mapped = headingToSection(line);
      if (mapped) {
        flush();
        current = { ...mapped, blocks: [] };
        continue;
      }
    }
    if (!current) {
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }
  flush();

  // Summary heuristic (fallback): only from intro lines before first recognized section heading.
  if (basics.name) {
    const firstHeadingIndex = lines.findIndex((l) => looksLikeHeading(l) && !!headingToSection(l));
    const introCutoff =
      firstHeadingIndex >= 0 ? firstHeadingIndex : Math.min(lines.length, 18);
    const preHeading = lines.slice(0, introCutoff);
    const summaryLines = preHeading.filter((l) => {
      if (l === basics.name) return false;
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
    .flatMap((l) => l.split("|").map((p) => p.trim()))
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
      const mapped = headingToSection(heading);
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
    .replace(/[,\s–—-]+$/, "")
    .trim();
  const dateRange = match[1].replace(/\s*[–—-]\s*/g, " — ");
  return { main, dateRange };
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

export const profileFromParsedCv = (templateId: string, parsed: ParsedCv): CvProfile => {
  const profile = createEmptyProfile(templateId);
  profile.name = "Imported CV";
  profile.basics = {
    ...profile.basics,
    ...parsed.basics
  };

  // Avoid duplicating summary: if we already inferred basics.summary, drop an explicit Summary section.
  const normalizedSections = parsed.sections.filter((section) => {
    if (section.type !== "custom") return true;
    if (section.title.toLowerCase() !== "summary") return true;
    return !profile.basics.summary;
  });

  // If there is a Summary section but basics.summary is empty, use its first block as summary.
  const summarySection = parsed.sections.find(
    (s) => s.type === "custom" && s.title.toLowerCase() === "summary"
  );
  if (!profile.basics.summary && summarySection?.blocks?.[0]) {
    profile.basics.summary = summarySection.blocks[0].replace(/\n+/g, " ").trim();
  }

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
      const filteredText = filteredLines.join("\n").trim();
      const item = createEmptyItem();
      item.title = "Skills";
      item.description = filteredText;
      item.subtitle = "";
      item.dateRange = "";
      item.tags = [];
      item.visible = true;
      s.items = filteredText ? [item] : [];
      return s;
    }

    if (section.type === "experience") {
      s.items = section.blocks.slice(0, 40).map((block) => {
        const item = createEmptyItem();
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const header = lines[0] ?? "";
        const { main, dateRange } = splitDateTail(header);
        const ts = splitTitleSubtitle(main);
        item.title = ts.title;
        item.subtitle = ts.subtitle;
        item.dateRange = dateRange;
        const bullets = lines
          .slice(1)
          .map((l) => l.replace(/^[-•*]\s+/, "").trim())
          .filter(Boolean);
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
        const header = lines[0] ?? "";
        const { main, dateRange } = splitDateTail(header);
        const ts = splitTitleSubtitle(main);
        item.title = ts.title;
        item.subtitle = lines[1] || ts.subtitle;
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
        const header = lines[0] ?? "";
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
        item.title = lines[0] ?? "";
        item.subtitle = "";
        item.dateRange = "";
        item.description = lines.slice(1).join("\n");
        item.tags = [];
        item.visible = true;
        return item;
      });
      return s;
    }

    s.items = section.blocks.slice(0, 30).map((block) => {
      const item = createEmptyItem();
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      item.title = lines[0] ?? "";
      item.subtitle = lines[1] ?? "";
      item.description = lines.slice(2).join("\n");
      item.visible = true;
      return item;
    });
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
