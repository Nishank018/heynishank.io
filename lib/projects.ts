import { asc, eq } from "drizzle-orm";
import { projectSchema, projects as seedProjects, type Project } from "@/content/projects";
import { getDb } from "@/lib/db";
import { projects as projectTable } from "@/lib/db/schema";

function visibleProjects(projects: Project[], includeUnpublished: boolean) {
  return projects.filter(
    (project) =>
      (includeUnpublished || project.published) &&
      (includeUnpublished || Boolean(project.links.live || project.links.github)),
  );
}

export async function getProjects(
  options: { includeUnpublished?: boolean } = {},
): Promise<Project[]> {
  const database = getDb();
  if (!database) return visibleProjects(seedProjects, Boolean(options.includeUnpublished));
  try {
    const query = options.includeUnpublished
      ? database.select().from(projectTable).orderBy(asc(projectTable.order))
      : database
          .select()
          .from(projectTable)
          .where(eq(projectTable.published, true))
          .orderBy(asc(projectTable.order));
    const rows = await query;
    if (rows.length === 0) return visibleProjects(seedProjects, Boolean(options.includeUnpublished));
    const parsed = rows.flatMap((row) => {
      const { result, metrics, badge, cover, ...fields } = row;
      const project = projectSchema.safeParse({
        ...fields,
        result: result ?? undefined,
        metrics: metrics ?? undefined,
        badge: badge ?? undefined,
        cover: cover ?? undefined,
      });
      return project.success ? [project.data] : [];
    });
    return visibleProjects(
      parsed.length > 0 ? parsed : seedProjects,
      Boolean(options.includeUnpublished),
    );
  } catch (error) {
    console.error("Unable to read projects from the database; using content seeds.", error);
    return visibleProjects(seedProjects, Boolean(options.includeUnpublished));
  }
}

export async function getProject(slug: string, includeUnpublished = false) {
  return (await getProjects({ includeUnpublished })).find((project) => project.slug === slug);
}
