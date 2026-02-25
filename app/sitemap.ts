import type { MetadataRoute } from "next";

const resolveAppUrl = () => {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // Fall through.
    }
  }
  return new URL("http://localhost:3000");
};

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = resolveAppUrl();
  const now = new Date();

  return [
    {
      url: new URL("/", appUrl).toString(),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: new URL("/storage", appUrl).toString(),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: new URL("/templates", appUrl).toString(),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    }
  ];
}
