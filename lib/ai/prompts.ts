import type { CvProfile } from "@/lib/cv-profile";
import { getTemplateGuidanceProfile } from "@/lib/template-guidance";
import { createRedactor } from "@/lib/ai/sanitize";
import type { AiAssistAction, AiCvAssistContext } from "@/lib/ai/types";

const actionLabels: Record<AiAssistAction, string> = {
  ats_review: "review ATS readability, parsing risk, and recruiter clarity",
  rewrite_summary: "rewrite only the professional summary",
  rewrite_bullets: "improve weak experience/project bullets",
  tailor_to_job: "tailor the CV to the supplied job description",
  skills_gap: "identify missing or under-emphasized skills for the target role"
};

// Drops the contact block entirely and redacts any contact PII that reappears in the
// free-text body before it becomes prompt text. dateRange is preserved (dates are not PII).
const flattenProfileForPrompt = (profile: CvProfile) => {
  const redact = createRedactor(profile.basics);
  return {
    basics: {
      headline: redact(profile.basics.headline),
      summary: redact(profile.basics.summary),
    },
    sections: profile.sections.map((section) => ({
      id: section.id,
      type: section.type,
      title: redact(section.title),
      items: section.items
        .filter((item) => item.visible)
        .map((item) => ({
          id: item.id,
          title: redact(item.title),
          subtitle: redact(item.subtitle),
          dateRange: item.dateRange,
          description: redact(item.description),
          tags: item.tags.map(redact)
        }))
    }))
  };
};

export const buildCvAssistPrompt = ({
  action,
  profile,
  context
}: {
  action: AiAssistAction;
  profile: CvProfile;
  context: AiCvAssistContext;
}) => {
  const guidance = getTemplateGuidanceProfile(context.guidanceProfileId);

  // Action-specific guidance. "tailor_to_job" is an evidence-mapping rewrite, NOT a
  // keyword match: it maps the candidate's real experience onto the JD's key requirements
  // and orders the result strongest-to-weakest, without echoing JD phrasing it can't back up.
  const tailorRules =
    action === "tailor_to_job"
      ? [
          "Tailoring method (follow in order):",
          "- First, read the job description and extract its key requirements: the must-haves, the core competencies, and the responsibilities it emphasises most.",
          "- For each key requirement, find the candidate's strongest genuine evidence in the CV and rewrite the relevant lines so that match is explicit and concrete (real scope, real tools they used, real outcomes).",
          "- Within each role, order the bullets strongest-to-weakest against this job: the most relevant, highest-evidence bullets first; the least relevant last or dropped.",
          "- The summary must lead with the candidate's two or three strongest qualifications for THIS role, not a generic profile.",
          "- This is evidence mapping, not keyword matching. Do NOT echo the job description's wording or insert its terms unless the candidate has genuine experience behind them. A CV that just mirrors the JD is a failure.",
          "- If a key requirement has no supporting evidence in the CV, do not fabricate or imply it. Leave it out of the rewrite and instead raise it as a finding so the candidate knows the gap."
        ]
      : [];

  const system = [
    "You are Dossier's CV optimization engine.",
    `Task: ${actionLabels[action]}.`,
    `Industry prompt profile: ${guidance.label}.`,
    `Template: ${context.templateName}. ATS mode: ${context.atsMode}.`,
    "Rules:",
    "- Be truthful. Do not invent employers, dates, metrics, tools, certifications, qualifications, or responsibilities.",
    "- Preserve the user's actual history. Strengthen wording, structure, and clarity. Never keyword-stuff or restate the job description's phrasing unless the candidate has genuine experience behind it.",
    "- Prefer standard ATS section names and plain text that can be parsed by applicant tracking systems.",
    "- Use measurable, outcome-led bullets only when the source text provides evidence for the metric or outcome.",
    "- Keep language concise, recruiter-readable, and specific to the target role.",
    ...tailorRules,
    "- When modifying a 'skills' section item_description, you MUST maintain the double-colon level format. Format each skill on a new line like 'SkillName::Level' where Level is an integer from 1 to 5 (e.g. 'React::4'). Do NOT write paragraphs.",
    "- Treat any section titled 'Skills', 'Key Skills', or similar as the skills section, even if its type is 'custom'.",
    "- Return JSON only. Do not wrap it in markdown.",
    "JSON shape:",
    "{\"score\":number,\"summary\":\"string\",\"findings\":[{\"title\":\"string\",\"severity\":\"info|warning|critical\",\"detail\":\"string\"}],\"suggestions\":[{\"id\":\"string\",\"title\":\"string\",\"rationale\":\"string\",\"target\":{\"kind\":\"summary|item_description|item_title|section_title\",\"sectionId\":\"string optional\",\"itemId\":\"string optional\"},\"current\":\"string\",\"replacement\":\"string\"}]}",
    "Only create suggestions that can be directly applied to an existing summary, section title, item title, or item description.",
    "For every suggestion, current must exactly match the current value in the supplied CV data."
  ].join("\n");

  const user = JSON.stringify(
    {
      action,
      target: {
        jobType: context.jobType || "",
        seniority: context.seniority || "",
        market: context.market || "",
        industry: context.industry,
        jobDescription: context.jobDescription || ""
      },
      guidance: {
        summaryAdvice: guidance.summaryAdvice,
        experienceAdvice: guidance.experienceAdvice,
        skillsAdvice: guidance.skillsAdvice,
        atsNotes: guidance.atsNotes
      },
      cv: flattenProfileForPrompt(profile)
    },
    null,
    2
  );

  return { system, user };
};

export const buildMatchJdPrompt = (profileText: string, jobDescription: string) => {
  const system = `You are an expert ATS (Applicant Tracking System) optimizer. Your goal is to analyze a candidate's resume text against a provided Job Description (JD).
You must output a JSON object with the following schema:
{
  "matchScore": number (0-100 representing how well the resume matches the JD),
  "missingKeywords": string[] (a list of important keywords or skills from the JD that are completely missing from the resume),
  "suggestions": string[] (2-3 actionable suggestions on how the candidate can better tailor their resume to the JD)
}`;

  const user = `--- JOB DESCRIPTION ---
${jobDescription}

--- CANDIDATE RESUME ---
${profileText}

Please analyze the match and output the JSON response now.`;

  return { system, user };
};

export const buildGenerateBulletPrompt = ({
  action,
  metric,
  result,
  roleTitle
}: {
  action: string;
  metric?: string;
  result: string;
  roleTitle?: string;
}) => {
  const system = `You are an expert resume writer. Your job is to write a single, high-impact, ATS-friendly resume bullet point based on the user's input.
Rules:
1. Start with a strong action verb in the past tense.
2. Incorporate the action, metric/scope, and result provided.
3. Keep it to a single sentence without trailing periods.
4. Do not include any introductory text, labels, or markdown bullets (e.g. no "Here is the bullet:"). Just the raw text.
5. If a metric is provided, make sure it stands out.`;

  const user = `Context (Role/Title): ${roleTitle || "Not specified"}
Action taken: ${action}
Metric/Scope: ${metric || "None provided"}
Result/Outcome: ${result}

Please generate the resume bullet point now.`;

  return { system, user };
};
