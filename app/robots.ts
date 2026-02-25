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

export default function robots(): MetadataRoute.Robots {
  const appUrl = resolveAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/storage", "/templates"],
        disallow: ["/editor", "/auth", "/api/"]
      }
    ],
    sitemap: new URL("/sitemap.xml", appUrl).toString(),
    host: appUrl.origin
  };
}
