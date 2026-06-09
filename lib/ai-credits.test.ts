import { describe, expect, it } from "vitest";

import { isValidCreditToken } from "@/lib/ai-credits";

// The wallet token is a bearer credential validated server-side before any credit
// operation. crypto.randomUUID() output must pass; anything malformed must be rejected
// so a tampered/garbage token can never reach a SQL query.
describe("isValidCreditToken", () => {
  it("accepts a crypto.randomUUID() token", () => {
    expect(isValidCreditToken(crypto.randomUUID())).toBe(true);
  });

  it("accepts allowed characters within the length bounds", () => {
    expect(isValidCreditToken("abcDEF0123456789_-")).toBe(true);
  });

  it("rejects empty, short, overlong, or illegal-character tokens", () => {
    expect(isValidCreditToken(undefined)).toBe(false);
    expect(isValidCreditToken("")).toBe(false);
    expect(isValidCreditToken("tooshort")).toBe(false);
    expect(isValidCreditToken("x".repeat(81))).toBe(false);
    expect(isValidCreditToken("has spaces and $ymbols!")).toBe(false);
    expect(isValidCreditToken("'; drop table dossier_ai_credits;--")).toBe(false);
  });
});
