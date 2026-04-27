import type { Metadata } from "next";

import TemplatesPickClient from "@/app/templates/templates-pick-client";

export const metadata: Metadata = {
  title: "CV Templates",
  description:
    "Browse professional CV templates and start editing instantly with live preview and PDF export.",
  alternates: {
    canonical: "/templates"
  },
  openGraph: {
    title: "Dossier CV Templates",
    description: "Compare resume layouts and pick the best template for your role.",
    url: "/templates",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier CV Templates",
    description: "Choose from multiple ATS-friendly CV templates.",
  }
};

export default function TemplatesPage() {
  return <TemplatesPickClient />;
}
