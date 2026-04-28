import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.your-dossier.xyz";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/editor/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
