export type SkillEntry = {
  name: string;
  level: number;
};

export const DEFAULT_SKILL_LEVEL = 4;
export const MIN_SKILL_LEVEL = 1;
export const MAX_SKILL_LEVEL = 5;

const clampLevel = (value: number) =>
  Math.max(MIN_SKILL_LEVEL, Math.min(MAX_SKILL_LEVEL, Math.round(value)));

const normalizeSkillName = (value: string) =>
  value
    .replace(/^[-•*]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();

const parseLevelFromLine = (line: string): SkillEntry | null => {
  const lineWithLevel = line.match(/^(.*?)(?:::{1,2}|\|)\s*([1-5])\s*$/);
  if (lineWithLevel) {
    const name = normalizeSkillName(lineWithLevel[1] ?? "");
    if (!name) return null;
    return {
      name,
      level: clampLevel(Number(lineWithLevel[2]))
    };
  }

  const lineWithFraction = line.match(/^(.*?)\s*\((\d)\s*\/\s*5\)\s*$/i);
  if (lineWithFraction) {
    const name = normalizeSkillName(lineWithFraction[1] ?? "");
    if (!name) return null;
    return {
      name,
      level: clampLevel(Number(lineWithFraction[2]))
    };
  }

  const plain = normalizeSkillName(line);
  if (!plain) return null;
  return { name: plain, level: DEFAULT_SKILL_LEVEL };
};

export const parseSkillEntries = (description: string): SkillEntry[] => {
  const text = (description || "").trim();
  if (!text) return [];

  const rawLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const expandedLines =
    rawLines.length === 1 && !rawLines[0]!.includes("::") && rawLines[0]!.includes(",")
      ? rawLines[0]!
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : rawLines;

  const parsed = expandedLines
    .map((line) => parseLevelFromLine(line))
    .filter((entry): entry is SkillEntry => !!entry);

  // Keep original order while de-duping by skill name.
  const seen = new Set<string>();
  return parsed.filter((entry) => {
    const key = entry.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const serializeSkillEntries = (entries: SkillEntry[]) =>
  entries
    .map((entry) => {
      const name = normalizeSkillName(entry.name);
      if (!name) return "";
      return `${name}::${clampLevel(entry.level)}`;
    })
    .filter(Boolean)
    .join("\n");

