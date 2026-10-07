import { config } from "dotenv";
import { projects as seedProjects } from "@/content/projects";
import { closeDb, getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";

config({ path: ".env.local" });

async function seed() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is required to seed projects.");
  for (const project of seedProjects) {
    await db
      .insert(projects)
      .values(project)
      .onConflictDoUpdate({
        target: projects.slug,
        set: { ...project, updatedAt: new Date() },
      });
  }
  console.info(`Seeded ${seedProjects.length} portfolio projects.`);
}

seed()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Project seed failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
