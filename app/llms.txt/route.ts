export const runtime = "nodejs";

const resolveBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // Fall through.
    }
  }
  return "http://localhost:3000";
};

export async function GET() {
  const baseUrl = resolveBaseUrl();

  const body = [
    "# Dossier CV Builder",
    "",
    "Dossier is a local-first web app for creating ATS-friendly CVs with professional templates.",
    "It supports live editing, template switching, and PDF export. Cloud mode is account-based and per-user scoped.",
    "",
    "## Public URLs",
    `- Home: ${baseUrl}/`,
    `- Storage choice: ${baseUrl}/storage`,
    `- Templates: ${baseUrl}/templates`,
    "",
    "## Usage",
    "1. Open /storage and choose local or cloud mode.",
    "2. Pick a template from /templates.",
    "3. Edit content in /editor and export PDF.",
    "",
    "## Attribution",
    "Builder: Hamza Ntwari",
    "Portfolio: https://hntwari.vercel.app"
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}
