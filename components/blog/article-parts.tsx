import Link from "next/link";
import type { ReactNode } from "react";

// Shared, styled building blocks for blog article bodies. Server components, dark theme,
// readable long-form typography. External links stay dofollow (rel="noopener" only) so
// outbound links pass link equity.

export function Lede({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-8 text-white/80">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-7 text-white/65">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-12 text-2xl font-semibold tracking-tight text-white">{children}</h2>;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-semibold text-white">{children}</h3>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="space-y-2.5">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[15px] leading-7 text-white/65">
      <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/70" />
      <span>{children}</span>
    </li>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className="font-medium text-blue-300 underline decoration-blue-400/40 underline-offset-4 transition-colors hover:text-blue-200 hover:decoration-blue-300"
    >
      {children}
    </Link>
  );
}

// End-of-article call-to-action card (e.g. pointing to Trackr Pro).
export function CalloutCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  const external = /^https?:\/\//.test(href);
  return (
    <div className="mt-12 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-6">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-[15px] leading-7 text-white/65">{body}</p>
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-500/25 hover:text-white"
      >
        {cta}
      </Link>
    </div>
  );
}
