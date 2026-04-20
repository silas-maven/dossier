import type { CvProfile, CvSectionType } from "@/lib/cv-profile";
import { getTemplateGuidanceProfile } from "@/lib/template-guidance";
import { getTemplateById } from "@/lib/templates";

type SuggestionItem = {
  label: string;
  content: string;
};

export type SectionSuggestionPack = {
  heading: string;
  advice: string[];
  starters: SuggestionItem[];
};

const inferRoleTrack = (profile: CvProfile, templateId: string) => {
  const template = getTemplateById(templateId);
  const headline = profile.basics.headline.toLowerCase();
  const summary = profile.basics.summary.toLowerCase();
  const combined = `${headline} ${summary} ${template.industry.toLowerCase()}`;

  if (combined.includes("support") || combined.includes("api") || combined.includes("saas")) {
    return "support";
  }
  if (combined.includes("product")) return "product";
  if (combined.includes("program") || combined.includes("project") || combined.includes("delivery")) {
    return "delivery";
  }
  if (combined.includes("finance") || combined.includes("analyst")) return "finance";
  if (combined.includes("consult")) return "consulting";
  if (combined.includes("engineer") || combined.includes("developer") || combined.includes("data")) {
    return "engineering";
  }
  return template.guidanceProfileId;
};

const summaryStarterByTrack = (track: string): SuggestionItem[] => {
  switch (track) {
    case "support":
      return [
        {
          label: "Customer-facing technical summary",
          content:
            "Technical support professional with experience resolving complex SaaS and integration issues, communicating clearly with customers, and partnering with Product and Engineering to close issues fast."
        },
        {
          label: "Incident and escalation focus",
          content:
            "Client-facing technical specialist with a background in troubleshooting APIs, managing escalations, and turning ambiguous support issues into clear, actionable next steps."
        }
      ];
    case "product":
      return [
        {
          label: "Outcome-led PM summary",
          content:
            "Product manager focused on discovery, prioritization, and launch execution across B2B SaaS products, with a track record of improving adoption, activation, and roadmap clarity."
        },
        {
          label: "Platform and cross-functional summary",
          content:
            "Cross-functional product leader experienced in shaping platform roadmaps, aligning engineering and design, and translating user needs into measurable product outcomes."
        }
      ];
    case "delivery":
      return [
        {
          label: "Programme delivery summary",
          content:
            "Technical delivery lead with experience coordinating cross-functional programmes, maintaining governance, and delivering implementation work across multiple workstreams and stakeholders."
        },
        {
          label: "Implementation summary",
          content:
            "Project and implementation professional focused on rollout planning, stakeholder alignment, and measurable delivery outcomes across software and operations environments."
        }
      ];
    case "finance":
      return [
        {
          label: "Finance summary",
          content:
            "Finance professional with experience in forecasting, reporting, and performance analysis, supporting decision-making with clear models, reporting cadence, and commercial insight."
        }
      ];
    case "consulting":
      return [
        {
          label: "Consulting summary",
          content:
            "Consulting professional experienced in structured problem solving, stakeholder communication, and translating analysis into practical recommendations and measurable client outcomes."
        }
      ];
    default:
      return [
        {
          label: "Engineering summary",
          content:
            "Technical professional with experience delivering production systems, improving reliability and performance, and turning complex work into measurable business and user impact."
        }
      ];
  }
};

const sectionStartersByTrack = (track: string, sectionType: CvSectionType): SuggestionItem[] => {
  if (sectionType === "skills") {
    switch (track) {
      case "support":
        return [
          { label: "Support category", content: "Support & Troubleshooting" },
          { label: "API category", content: "API & Web Fundamentals" },
          { label: "Workflow category", content: "Ways of Working" }
        ];
      case "product":
        return [
          { label: "Product stack", content: "Product Discovery & Delivery" },
          { label: "Analytics tools", content: "Analytics & Experimentation" }
        ];
      default:
        return [
          { label: "Core stack", content: "Languages & Tooling" },
          { label: "Platform skills", content: "Platform & Infrastructure" }
        ];
    }
  }

  if (sectionType === "custom") {
    switch (track) {
      case "support":
      case "delivery":
        return [
          { label: "Role-fit section", content: "Core Fit for This Role" },
          { label: "Additional section", content: "Additional" }
        ];
      default:
        return [
          { label: "Highlights section", content: "Selected Highlights" },
          { label: "Additional section", content: "Additional" }
        ];
    }
  }

  if (sectionType === "experience") {
    switch (track) {
      case "support":
        return [
          {
            label: "Support impact bullet",
            content:
              "- Resolved complex SaaS and API issues by isolating root causes, coordinating internal teams, and keeping customers updated through to resolution."
          },
          {
            label: "Escalation bullet",
            content:
              "- Managed high-priority escalations with clear written updates, technical investigation, and tight follow-through across support and engineering."
          }
        ];
      case "delivery":
        return [
          {
            label: "Delivery outcome bullet",
            content:
              "- Coordinated cross-functional delivery across multiple workstreams, maintaining risks, dependencies, and stakeholder communication to keep milestones on track."
          },
          {
            label: "Governance bullet",
            content:
              "- Built reporting and governance routines that improved delivery visibility, escalated blockers earlier, and reduced schedule slippage."
          }
        ];
      case "product":
        return [
          {
            label: "Product impact bullet",
            content:
              "- Defined priorities across research, design, and engineering and shipped roadmap work that improved adoption, activation, or retention."
          },
          {
            label: "Discovery bullet",
            content:
              "- Turned user and business signals into a focused backlog, aligning stakeholders around clear tradeoffs and measurable product outcomes."
          }
        ];
      case "finance":
        return [
          {
            label: "Reporting bullet",
            content:
              "- Owned recurring reporting and analysis that improved visibility into performance, forecast variance, and commercial decision-making."
          }
        ];
      case "consulting":
        return [
          {
            label: "Client impact bullet",
            content:
              "- Structured analysis, stakeholder workshops, and recommendations that clarified the problem, accelerated decisions, and supported measurable client outcomes."
          }
        ];
      default:
        return [
          {
            label: "Systems bullet",
            content:
              "- Delivered technical work that improved system reliability, speed, or delivery quality, with measurable impact on users or internal teams."
          }
        ];
    }
  }

  if (sectionType === "projects") {
    return [
      {
        label: "Project framing",
        content:
          "- Built a focused project that demonstrates technical depth, measurable outcomes, and direct relevance to the target role."
      }
    ];
  }

  if (sectionType === "certifications") {
    return [
      { label: "Certificate title", content: "Relevant professional certification" }
    ];
  }

  return [
    {
      label: "Section starter",
      content: "- Add concise, outcome-led content that supports the target role."
    }
  ];
};

export const getSummarySuggestionPack = (templateId: string, profile: CvProfile): SuggestionItem[] =>
  summaryStarterByTrack(inferRoleTrack(profile, templateId));

export const getSectionSuggestionPack = (
  templateId: string,
  profile: CvProfile,
  sectionType: CvSectionType
): SectionSuggestionPack => {
  const template = getTemplateById(templateId);
  const guidance = getTemplateGuidanceProfile(template.guidanceProfileId);
  const track = inferRoleTrack(profile, templateId);

  const advice =
    sectionType === "skills"
      ? guidance.skillsAdvice
      : sectionType === "custom"
        ? guidance.atsNotes
        : guidance.experienceAdvice;

  return {
    heading: `${guidance.label} guidance`,
    advice,
    starters: sectionStartersByTrack(track, sectionType)
  };
};
