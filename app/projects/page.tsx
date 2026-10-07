import type { Metadata } from "next";
import { InnerPage } from "@/components/sections/inner-page";
import { ProjectList } from "./project-list";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects — Nishank Gupta",
  description: "Selected AI and full-stack projects by Nishank Gupta.",
};
export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <InnerPage
      route="projects"
      title="Project case studies"
      subtitle="Selected work with a live demo or source repository to explore."
    >
      <ProjectList projects={projects} />
    </InnerPage>
  );
}
