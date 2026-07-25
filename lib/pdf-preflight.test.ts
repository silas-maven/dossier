import { describe, expect, it } from "vitest";

import { countPdfPagesFromBytes } from "@/lib/pdf-preflight";

const bytes = (value: string) => new TextEncoder().encode(value);

describe("countPdfPagesFromBytes", () => {
  it("counts page dictionaries without counting the pages tree", () => {
    expect(
      countPdfPagesFromBytes(
        bytes("1 0 obj << /Type /Pages /Count 2 >> 2 0 obj << /Type /Page >> 3 0 obj << /Type/Page >>")
      )
    ).toBe(2);
  });

  it("returns one for a malformed or empty document", () => {
    expect(countPdfPagesFromBytes(bytes(""))).toBe(1);
  });
});
