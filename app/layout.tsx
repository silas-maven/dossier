import type { Metadata } from "next";
import Link from "next/link";
import VisitorTracker from "@/components/analytics/visitor-tracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dossier",
  description: "Local-first CV builder"
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
      </body>
    </html>
  );
}
