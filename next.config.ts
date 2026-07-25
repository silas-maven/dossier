import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows production verification alongside a running local dev server without
  // competing for the same .next lock or output directory.
  distDir: process.env.DOSSIER_NEXT_DIST_DIR || ".next",
  turbopack: {
    root: process.cwd()
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
