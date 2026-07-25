import { describe, expect, it } from "vitest";

import {
  getTemplateIndustryGroup,
  publicCvTemplates,
  templateIndustryGroups
} from "@/lib/templates";

describe("public template catalogue", () => {
  it("does not expose the same visual variant under multiple public names", () => {
    const variants = publicCvTemplates.map((template) => template.variant);
    expect(new Set(variants).size).toBe(variants.length);
  });

  it("gives every public template its own rendered preview", () => {
    const previews = publicCvTemplates.map((template) => template.previewImage);
    expect(new Set(previews).size).toBe(previews.length);
    expect(previews.every((preview) => preview.startsWith("/template-previews/"))).toBe(true);
  });

  it("places every public template in an industry territory", () => {
    for (const template of publicCvTemplates) {
      expect(templateIndustryGroups).toContain(getTemplateIndustryGroup(template));
    }
  });

  it("publishes legal and creative-specific formats", () => {
    expect(publicCvTemplates.some((template) => template.industry === "Legal")).toBe(true);
    expect(publicCvTemplates.some((template) => template.industry === "Design & Creative")).toBe(true);
  });
});
