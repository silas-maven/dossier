import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.your-dossier.xyz";

  const routes = [
    "",
    "/editor",
    "/templates",
    "/free-cv-builder-uk",
    "/resume-io-alternative",
    "/zety-alternative",
    "/ai-resume-optimizer",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.includes("-alternative") ? 0.8 : 0.9,
  }));
}
