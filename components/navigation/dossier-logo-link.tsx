"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type DossierLogoLinkProps = {
  className?: string;
};

export default function DossierLogoLink({ className }: DossierLogoLinkProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label="Go to landing page">
      <span className="relative inline-flex h-3 w-3 rounded-full bg-foreground">
        <span className="absolute inset-0 rounded-full bg-foreground/40 animate-ping" />
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground">
        DOSSIER CV BUILDER
      </span>
    </Link>
  );
}
