import { HomePage } from "@/components/sections/home-page";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export default async function Page() {
  const projects = await getProjects();
  return <HomePage projects={projects} />;
}
