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
  return "https://www.your-dossier.xyz";
};

export async function GET() {
  const baseUrl = resolveBaseUrl();

  const body = [
    "# Dossier",
    "",
    "> Dossier is a browser-based resume builder that lets users create and edit professional CVs with data stored locally on their device.",
    "",
    "The tool provides industry‑specific templates and lets users download finished resumes as PDF or DOCX files.",
    "",
    "## Product",
    `- [Home](${baseUrl}): overview of the resume builder service.`,
    `- [Editor](${baseUrl}/editor): web interface for creating and editing resumes.`,
    `- [Templates](${baseUrl}/templates): collection of industry‑specific resume templates.`,
    "",
    "## Alternatives",
    `- [Resume.io alternative](${baseUrl}/resume-io-alternative): comparison of Dossier with Resume.io.`,
    `- [Zety alternative](${baseUrl}/zety-alternative): comparison of Dossier with Zety.`,
    "",
    "## Features",
    `- [AI resume optimizer](${baseUrl}/ai-resume-optimizer): description of AI‑based resume improvement tool.`,
    `- [ATS readiness engine](${baseUrl}/ats-readiness-engine): details on applicant‑tracking‑system compatibility checks.`,
    `- [Free CV builder UK](${baseUrl}/free-cv-builder-uk): free version of the resume builder for UK users.`,
    "",
    "## Documentation",
    `- [Storage](${baseUrl}/storage): information on local storage of resume data.`,
    "",
    "## Optional",
    `- [Sitemap](${baseUrl}/sitemap.xml): XML sitemap listing site pages.`
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}
