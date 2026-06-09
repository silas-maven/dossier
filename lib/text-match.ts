// Shared boundary-aware text matching. The character class treats "+" and "#" as
// word characters so tokens like c++ / c# match as whole tokens, while "go" does not
// match inside "category". Used by both the ATS readiness engine and the AI sanitizer.

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const containsTerm = (text: string, term: string) =>
  new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(term)}([^a-z0-9+#]|$)`, "i").test(text);
