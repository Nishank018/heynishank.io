import { HomePage } from "@/components/sections/home-page";
import { getProjects } from "@/lib/projects";
import { getSiteProfile, getExperiences, getSkillGroups } from "@/lib/site-data";

export const revalidate = 60;

export default async function Page() {
  const [allProjects, profile, experiences, skills] = await Promise.all([
    getProjects(),
    getSiteProfile(),
    getExperiences(),
    getSkillGroups(),
  ]);

  // If projects are marked featured, show them; otherwise take all, up to homeProjectCount
  const featuredOnly = allProjects.filter((p) => p.featured);
  const candidateProjects = featuredOnly.length > 0 ? featuredOnly : allProjects;
  const homeProjects = candidateProjects.slice(0, profile.homeProjectCount || 4);

  return (
    <HomePage
      profile={profile}
      projects={homeProjects}
      experiences={experiences}
      skills={skills}
    />
  );
}
