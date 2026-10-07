import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return [];
  const projectPaths = (await getProjects()).map((project) => `/projects/${project.slug}`);
  return [
    "/",
    "/projects",
    ...projectPaths,
    "/resume",
    "/uses",
    "/analytics",
    "/support",
    "/contact",
    "/chat",
  ].map((path) => ({ url: new URL(path, origin).toString(), lastModified: new Date() }));
}
