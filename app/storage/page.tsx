import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Start Your CV",
  description:
    "Start building an ATS-friendly CV with local browser autosave in Dossier.",
  alternates: {
    canonical: "/templates"
  },
  openGraph: {
    title: "Start your Dossier CV",
    description: "Pick a template and build your CV with local browser autosave.",
    url: "/templates",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Start your Dossier CV",
    description: "Pick a template and build your CV with local browser autosave.",
  }
};

export default function StoragePage() {
  redirect("/templates");
}
