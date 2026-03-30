import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import VisitorTracker from "@/components/analytics/visitor-tracker";
import "./globals.css";

const resolveMetadataBase = () => {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // Fall through to localhost for local/dev safety.
    }
  }
  return new URL("http://localhost:3000");
};

const metadataBase = resolveMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Dossier CV Builder",
    template: "%s | Dossier CV Builder"
  },
  description:
    "Build ATS-friendly CVs fast with a local-first editor, multiple professional templates, and secure cloud sync.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Dossier CV Builder",
    title: "Dossier CV Builder",
    description:
      "Create and export professional CVs with a fast local-first editor and secure cloud sync options.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier CV Builder",
    description:
      "Free CV builder for fast, structured resume creation with live preview and PDF export.",
  },
  keywords: [
    "cv builder",
    "resume builder",
    "ats resume",
    "free cv generator",
    "professional resume templates"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="min-h-screen flex flex-col">
          <VisitorTracker />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-white/10 bg-background/80 px-4 py-3 text-center text-xs text-muted-foreground">
            Built by{" "}
            <Link
              href="https://hntwari.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
            >
              Hamza Ntwari
            </Link>
          </footer>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
