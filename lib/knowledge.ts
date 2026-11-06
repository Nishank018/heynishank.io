import { getSiteProfile, getExperiences, getSkillGroups } from "@/lib/site-data";
import { getProjects } from "@/lib/projects";

export async function getKnowledgeBase() {
  const [profile, experiences, projects, skills] = await Promise.all([
    getSiteProfile(),
    getExperiences(),
    getProjects(),
    getSkillGroups(),
  ]);

  return [
    profile.name,
    profile.location,
    profile.roleLine,
    ...profile.about,
    ...experiences.flatMap((item) => [
      item.organization,
      item.role,
      item.dates,
      ...item.bullets,
      ...item.stack,
    ]),
    ...projects.flatMap((item) => [item.title, item.tagline, item.summary, ...item.stack]),
    ...skills.flatMap((item) => [item.group, ...item.items]),
  ].join("\n");
}
