import { parseCvText, profileFromParsedCv } from "./lib/cv-import.ts";

const cvText = `
HAMZA NTWARI
AI Consultant
London, UK | 07428628524 | Open to Full-time Remote Roles

PROFILE
AI-focused technical consultant with nearly 10 years of client-facing delivery experience across regulated and high-stakes environments. Strong track record turning ambiguous business problems into practical technology programmes, from discovery and architecture through implementation and adoption. Experienced in advising leadership, running workshops, building pilot solutions, and communicating executive-ready recommendations that drive measurable outcomes.

CORE FIT FOR THIS ROLE
- 5+ years in technology consulting and implementation across enterprise clients
- Strong experience translating strategy into practical delivery plans and working systems
- Delivered complex client engagements from discovery to go-live under tight timelines
- Hands-on background in automation, data workflows, API integration, and AI-enabled tooling
- Comfortable operating at both executive strategy level and tactical implementation level
- Strong communication across C-level, business, and engineering stakeholders in remote/hybrid settings

KEY SKILLS
AI Strategy & Use-Case Prioritisation | Discovery Workshops | Solution Architecture | Executive Communication
Proof-of-Concept Delivery | AI/Automation Workflows | Governance, Risk & Adoption Planning | Stakeholder Management
Python Automation | API Integration | Data Migration & Transformation | Agile Delivery (Scrum/Kanban)

PROFESSIONAL EXPERIENCE

Senior Implementation Consultant (Technical Delivery Lead)
Napier Technologies, London | Apr 2019 - Present
- Led 100+ enterprise AML technology implementations across discovery, architecture alignment, configuration, data migration, and go-live
- Facilitated client workshops to identify business pain points, define high-value opportunities, and align technical scope with ROI goals
- Designed and implemented process automation using Python for extraction, transformation, reporting, and UAT support
- Managed up to 20 concurrent delivery workstreams, coordinating engineering, product, compliance, and client leadership stakeholders
- Drove delivery process improvements that reduced implementation timelines by ~15%
- Produced executive-ready status updates, risk summaries, and recommendation outputs for decision-makers
- Contributed to internal AI knowledge initiatives to improve delivery quality, speed, and team enablement

Technical Consultant
CGI Group | Jun 2016 - Feb 2019
- Supported deployment and upgrades of Galileo ground-segment systems across European client sites
- Led technical coordination on-site, managing stakeholder communication, issue resolution, and implementation readiness
- Designed and delivered monitoring and security configuration improvements in mission-critical environments
- Managed integration dependencies across complex infrastructure components under strict reliability requirements
- Authored technical documentation and operational playbooks to improve repeatability and governance across teams

EDUCATION
BSc (Hons) Computer Science (Artificial Intelligence), 2:1
University of Kent

CERTIFICATIONS
- Cisco: Introduction to Cybersecurity (2024)
- Cisco: Cybersecurity Pathway (2024)

SELECTED PROJECT HIGHLIGHTS
- Built and shipped full-stack analytical products using React + Python APIs + PostgreSQL
- Designed data-driven tooling with reporting, visualisation, and export workflows
- Delivered technical solutions in regulated domains where traceability, risk controls, and stakeholder trust were mandatory
- Applied AI-assisted workflows to improve delivery efficiency and decision support in client-facing contexts

TOOLS & METHODS
Jira/Confluence | Agile delivery | Python | JavaScript | SQL | API/JSON/XML integration
Apache NiFi | Process mapping | Delivery governance | Risk and dependency management | Executive reporting

AVAILABILITY
Available for full-time remote AI Consultant roles across global teams and time zones.
`;

const parsed = parseCvText(cvText);
const profile = profileFromParsedCv("test-template", parsed);

console.log(JSON.stringify(profile.sections, null, 2));
