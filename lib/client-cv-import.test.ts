import { describe, expect, it } from "vitest";

import { MAX_IMPORT_BYTES, validateCvImportBytes } from "@/lib/client-cv-import";

describe("browser CV import validation", () => {
  it("accepts supported formats only when binary signatures match", () => {
    expect(validateCvImportBytes("cv.pdf", 12, new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe("PDF");
    expect(validateCvImportBytes("cv.docx", 12, new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe("DOCX");
    expect(validateCvImportBytes("cv.txt", 12, new TextEncoder().encode("Hamza"))).toBe("TXT");
  });

  it("rejects extension spoofing, unsupported files, empty files, and oversized files", () => {
    expect(() =>
      validateCvImportBytes("cv.pdf", 12, new TextEncoder().encode("plain text"))
    ).toThrow("valid PDF signature");
    expect(() =>
      validateCvImportBytes("cv.txt", 12, new Uint8Array([0x50, 0x4b, 0x03, 0x04]))
    ).toThrow("do not match");
    expect(() => validateCvImportBytes("cv.pages", 12, new Uint8Array([1]))).toThrow("Supported imports");
    expect(() => validateCvImportBytes("cv.txt", 0, new Uint8Array())).toThrow("empty");
    expect(() =>
      validateCvImportBytes("cv.txt", MAX_IMPORT_BYTES + 1, new Uint8Array([1]))
    ).toThrow("10 MB");
  });
});
