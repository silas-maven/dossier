import type { CvProfile } from "@/lib/cv-profile";
import { getTemplateGuidanceProfile } from "@/lib/template-guidance";
import type { AiAssistAction, AiCvAssistContext } from "@/lib/ai/types";

const actionLabels: Record<AiAssistAction, string> = {
  ats_review: "review ATS readability, parsing risk, and recruiter clarity",
  rewrite_summary: "rewrite only the professional summary",
  rewrite_bullets: "improve weak experience/project bullets",
  tailor_to_job: "tailor the CV to the supplied job description",
  skills_gap: "identify missing or under-emphasized skills for the target role"
};

const flattenProfileForPrompt = (profile: CvProfile) => ({
  basics: {
    headline: profile.basics.headline,
    summary: profile.basics.summary,
  },
  sections: profile.sections.map((section) => ({
    id: section.id,
    type: section.type,
    title: section.title,
    items: section.items
      .filter((item) => item.visible)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        dateRange: item.dateRange,
        description: item.description,
        tags: item.tags
      }))
  }))
});

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

  const system = [
    "You are Dossier's CV optimization engine.",
    `Task: ${actionLabels[action]}.`,
    `Industry prompt profile: ${guidance.label}.`,
    `Template: ${context.templateName}. ATS mode: ${context.atsMode}.`,
    "Rules:",
    "- Be truthful. Do not invent employers, dates, metrics, tools, certifications, qualifications, or responsibilities.",
    "- Preserve the user's actual history and only strengthen wording, structure, clarity, and keyword placement.",
    "- Prefer standard ATS section names and plain text that can be parsed by applicant tracking systems.",
    "- Use measurable, outcome-led bullets only when the source text provides evidence for the metric or outcome.",
    "- Keep language concise, recruiter-readable, and specific to the target role.",
    
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
