import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
