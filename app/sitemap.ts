import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let origin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!origin) return [];
  if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
    origin = `https://${origin}`;
  }
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
