import type { Metadata } from "next";

import StorageChoiceClientPage from "@/app/storage/storage-choice-client";

export const metadata: Metadata = {
  title: "Choose Storage Mode",
  description:
    "Choose local browser storage or secure cloud sync before creating your CV in Dossier.",
  alternates: {
    canonical: "/storage"
  },
  openGraph: {
    title: "Dossier Storage Choice",
    description:
      "Pick local mode for browser-only storage or cloud mode for account-based profile sync.",
    url: "/storage",
    images: ["/icon.svg"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier Storage Choice",
    description: "Pick local or cloud mode before choosing your CV template.",
    images: ["/icon.svg"]
  }
};

export default function StoragePage() {
  return <StorageChoiceClientPage />;
}
