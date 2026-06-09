import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.your-dossier.xyz").replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /editor is the app surface, not indexable content (this also covers /editor/api/).
      disallow: ["/api/", "/editor"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
