import type { Metadata } from "next";
import Link from "next/link";
import { Bot, ShieldCheck, Target, Sparkles, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Resume Optimizer & ATS Review",
  description:
    "Optimize your CV for Applicant Tracking Systems. Dossier's AI analyzes your resume for parsing risks, tailoring gaps, and keyword optimization while keeping your data secure.",
  alternates: {
    canonical: "/ai-resume-optimizer"
  },
  openGraph: {
    title: "AI Resume Optimizer & ATS Review: Dossier",
    description: "Secure, BYOK AI resume optimization. Tailor your CV and run ATS checks.",
    url: "/ai-resume-optimizer",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Optimizer & ATS Review: Dossier",
    description: "Analyze parsing risks, tailor bullet points, and check skills gaps securely.",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dossier AI Resume Optimizer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "An AI-powered tool for applicant tracking system (ATS) review, CV tailoring, and skill gap analysis. Uses a Bring-Your-Own-Key model for maximum security.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  author: { "@type": "Person", name: "Hamza Ntwari", url: "https://hntwari.vercel.app" },
  publisher: { "@type": "Organization", name: "Dossier CV Builder" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.your-dossier.xyz/ai-resume-optimizer" },
};

export default function AiResumeOptimizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen w-full overflow-hidden bg-[#030509] text-white">
        {/* Subtle Geometric Background */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-[0.10]">
          <svg
            viewBox="0 0 100 100"
            className="absolute -right-[20%] top-[20%] h-[100vw] min-h-[600px] w-[100vw] min-w-[600px] -translate-y-1/2 animate-[spin_120s_linear_infinite]"
            fill="currentColor"
          >
            <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
          </svg>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030509] via-transparent to-[#030509]" />
        </div>

        <div className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12 xl:px-20">
          <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                AI Optimization
              </span>
            </div>

            <div className="mt-12 flex flex-col">
              <h1 className="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.85] tracking-tight text-white">
                Hack The
              </h1>
              <h1 
                className="mt-2 text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.85] tracking-tight"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,255,255,0.6)",
                }}
              >
                ATS System
              </h1>
            </div>

            <p className="mt-14 max-w-xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
              Go beyond simple spellchecking. Integrate intelligent
              <br className="hidden sm:block" />
              AI review workflows to ensure your CV is successfully
              <br className="hidden sm:block" />
              parsed by Enterprise Applicant Tracking Systems.
            </p>

            {/* Features Grid */}
            <div className="mt-24 grid gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                    001 // ATS Check
                  </span>
                  <Bot className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-white uppercase tracking-tight">Readability Score</h3>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">
                  Simulate enterprise ATS parsing. Flag structural issues, complex formatting, and missing standard headers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                    002 // Precision
                  </span>
                  <Target className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-white uppercase tracking-tight">Tailor To Job</h3>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">
                  Rewrite experience bullets to maximize keyword overlap with the target job description. No hallucinations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                    003 // Analytics
                  </span>
                  <Sparkles className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-white uppercase tracking-tight">Skills Gap Analysis</h3>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">
                  Compare your listed skills against industry requirements. Identify critical missing keywords.
                </p>
              </div>
            </div>

            {/* How it Works & Security section */}
            <div className="mt-24 grid gap-16 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">Execution Flow</h2>
                <div className="mt-10 flex flex-col gap-8">
                  <div className="flex gap-6 border-l border-white/10 pl-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">STEP 1</span>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Select Provider</h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">Choose OpenAI or Anthropic and supply your session API key.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 border-l border-white/10 pl-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">STEP 2</span>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Define Target</h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">Input target role, seniority, and paste the job description.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 border-l border-white/10 pl-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">STEP 3</span>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Review & Apply</h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 leading-relaxed">You maintain complete control to edit or dismiss AI suggestions.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Box */}
              <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.02] p-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-white" />
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-white" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">BYOK Architecture</h2>
                </div>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/50 leading-relaxed">
                  Strict security protocols enforced.
                </p>
                <div className="mt-8 flex flex-col gap-6">
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white">01 / No Data Collection</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase text-white/40 leading-relaxed">We do not store your CV. Processing is ephemeral via your chosen provider.</p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white">02 / PII Protection</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase text-white/40 leading-relaxed">Personal Identifiable Information (Name, Email, Phone, Location) is actively stripped from the payload prior to AI transmission.</p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white">03 / Key Isolation</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase text-white/40 leading-relaxed">API keys are kept strictly in-memory and hidden from the DOM. Note: You remain responsible for the safe handling of your own keys.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-32 flex flex-col items-center justify-center text-center">
              <Link
                href="/templates"
                className="group flex h-20 w-20 items-center justify-center rounded-full border border-white/20 transition-all hover:bg-white hover:text-black"
                aria-label="Initialize Core"
              >
                <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href="/templates"
                className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-white/70"
              >
                Initialize Core
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
