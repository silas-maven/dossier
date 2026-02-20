export type DateFormatOption = "mon_year" | "slash_month_year" | "year";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const monthMap = new Map(MONTHS_SHORT.map((m, i) => [m.toLowerCase(), i + 1]));

const parseMonthYear = (value: string): { month: number; year: number } | null => {
  const v = value.trim();
  if (!v) return null;

  const shortMonth = v.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (shortMonth) {
    const monthName = shortMonth[1].slice(0, 3).toLowerCase();
    const year = Number(shortMonth[2]);
    const month = monthMap.get(monthName);
    if (month && Number.isFinite(year)) return { month, year };
  }

  const slash = v.match(/^(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const month = Number(slash[1]);
    const year = Number(slash[2]);
    if (month >= 1 && month <= 12 && Number.isFinite(year)) return { month, year };
  }

  const yearOnly = v.match(/^(\d{4})$/);
  if (yearOnly) {
    return { month: 1, year: Number(yearOnly[1]) };
  }

  return null;
};

const formatMonthYear = (value: { month: number; year: number }, format: DateFormatOption) => {
  if (format === "year") return String(value.year);
  if (format === "slash_month_year") return `${String(value.month).padStart(2, "0")}/${value.year}`;
  return `${MONTHS_SHORT[value.month - 1]} ${value.year}`;
};

const formatSingleToken = (value: string, format: DateFormatOption) => {
  const token = value.trim();
  if (!token) return token;
  if (/^present$/i.test(token)) return "Present";
  const parsed = parseMonthYear(token);
  if (!parsed) return token;
  return formatMonthYear(parsed, format);
};

export const formatDateRange = (value: string, format: DateFormatOption) => {
  const input = (value || "").trim();
  if (!input) return "";

  const normalized = input.replace(/\s*[–—-]\s*/g, " — ");
  const parts = normalized.split(" — ").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return input;
  if (parts.length === 1) return formatSingleToken(parts[0], format);

  return `${formatSingleToken(parts[0], format)} — ${formatSingleToken(parts[1], format)}`;
};
