import { describe, expect, it } from "vitest";

import { createRedactor, sanitizeProfileForAi, scrubFreeText } from "@/lib/ai/sanitize";
import { createEmptyProfile, createEmptySection, createEmptyItem, type CvProfile } from "@/lib/cv-profile";

const profileWith = (overrides: {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  url?: string;
  headline?: string;
  summary?: string;
  bullet?: string;
}): CvProfile => {
  const profile = createEmptyProfile("software-engineering-lean");
  profile.basics.name = overrides.name ?? "Jane Doe";
  profile.basics.email = overrides.email ?? "jane.doe@example.com";
  profile.basics.phone = overrides.phone ?? "+44 7123 456789";
  profile.basics.location = overrides.location ?? "London, UK";
  profile.basics.url = overrides.url ?? "linkedin.com/in/janedoe";
  profile.basics.headline = overrides.headline ?? "Senior Engineer";
  profile.basics.summary = overrides.summary ?? "Engineer based in London.";
  const section = createEmptySection("experience");
  section.items = [
    {
      ...createEmptyItem(),
      title: "Engineer",
      description: overrides.bullet ?? "As Jane, I led the team."
    }
  ];
  profile.sections = [section];
  return profile;
};

describe("sanitizeProfileForAi", () => {
  it("strips the contact block to placeholders", () => {
    const clean = sanitizeProfileForAi(profileWith({}));
    expect(clean.basics.name).toBe("[NAME]");
    expect(clean.basics.email).toBe("[EMAIL]");
    expect(clean.basics.phone).toBe("[PHONE]");
    expect(clean.basics.location).toBe("[LOCATION]");
    expect(clean.basics.url).toBe("[URL]");
  });

  it("redacts the first name where it reappears in the body", () => {
    const clean = sanitizeProfileForAi(profileWith({ bullet: "As Jane, I led the team." }));
    const desc = clean.sections[0].items[0].description;
    expect(desc).not.toContain("Jane");
    expect(desc).toContain("[NAME]");
  });

  it("redacts the location in the summary but leaves the rest intact", () => {
    const clean = sanitizeProfileForAi(profileWith({ summary: "Engineer based in London, UK." }));
    expect(clean.basics.summary).not.toContain("London");
    expect(clean.basics.summary).toContain("Engineer based in");
  });

  it("produces no leftover raw PII anywhere in the serialized output", () => {
    const clean = sanitizeProfileForAi(
      profileWith({ bullet: "Reach me at jane.doe@example.com or +44 7123 456789." })
    );
    const serialized = JSON.stringify(clean);
    expect(serialized).not.toContain("jane.doe@example.com");
    expect(serialized).not.toContain("7123");
    expect(serialized).not.toContain("Jane");
  });

  it("preserves empty fields as empty (no stray placeholders)", () => {
    const profile = createEmptyProfile("software-engineering-lean");
    const clean = sanitizeProfileForAi(profile);
    expect(clean.basics.name).toBe("");
    expect(clean.basics.email).toBe("");
  });
});

describe("name common-word guard", () => {
  it("does not over-redact a first name that is a common English word", () => {
    const redact = createRedactor({
      name: "Will Smith",
      headline: "",
      email: "",
      phone: "",
      url: "",
      summary: "",
      location: ""
    });
    // "will" as a verb must survive; the surname (distinctive) is still redacted.
    expect(redact("I will deliver projects for Smith & Co")).toContain("will deliver");
    expect(redact("worked at Smith Industries")).toContain("[NAME]");
  });
});

describe("general pattern pass", () => {
  it("redacts a different email/phone/url typed in the body", () => {
    const redact = createRedactor({
      name: "Jane Doe",
      headline: "",
      email: "jane@primary.com",
      phone: "",
      url: "",
      summary: "",
      location: ""
    });
    const out = redact("Side project at https://side.dev, contact other@thing.io or +1 (415) 555 0100");
    expect(out).toContain("[EMAIL]");
    expect(out).toContain("[URL]");
    expect(out).toContain("[PHONE]");
    expect(out).not.toContain("other@thing.io");
  });

  it("does not redact bare integers or formatted metrics as phone numbers", () => {
    expect(scrubFreeText("Grew revenue to 1,000,000 and cut latency to 1200ms")).toBe(
      "Grew revenue to 1,000,000 and cut latency to 1200ms"
    );
    expect(scrubFreeText("Shipped 250000 events per day")).toBe("Shipped 250000 events per day");
  });
});
