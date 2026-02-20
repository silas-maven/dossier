import ExperienceHero from "@/components/ui/experience-hero";
import { cvTemplates } from "@/lib/templates";
import { getDossierUserCount } from "@/lib/user-count";

export default async function HomePage() {
  const userCount = await getDossierUserCount();

  return <ExperienceHero ctaHref="/storage" templateCount={cvTemplates.length} userCount={userCount} />;
}
