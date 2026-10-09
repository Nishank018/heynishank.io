import { config } from "dotenv";
import { projects as seedProjects } from "@/content/projects";
import { siteContent as seedSite } from "@/content/site";
import { experience as seedExperience } from "@/content/experience";
import { skills as seedSkills } from "@/content/skills";
import { closeDb, getDb } from "@/lib/db";
import {
  experiences,
  projects,
  siteProfile,
  skillGroups,
  type SocialLink,
} from "@/lib/db/schema";
import { count } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

async function seed() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is required to seed the database.");

  // 1. Projects
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

  // 2. Site Profile
  const existingProfile = await db.select().from(siteProfile).limit(1);
  if (existingProfile.length === 0) {
    const socials: SocialLink[] = [
      {
        name: "GitHub",
        href: `https://github.com/${seedSite.handles.github}`,
        detail: `@${seedSite.handles.github}`,
      },
      {
        name: "LinkedIn",
        href: `https://linkedin.com/in/${seedSite.handles.linkedin}`,
        detail: seedSite.handles.linkedin,
      },
      {
        name: "Twitter / X",
        href: seedSite.handles.x ? `https://x.com/${seedSite.handles.x}` : "",
        detail: seedSite.handles.x || "",
      },
      {
        name: "Instagram",
        href: seedSite.handles.instagram ? `https://instagram.com/${seedSite.handles.instagram}` : "",
        detail: seedSite.handles.instagram || "",
      },
      {
        name: "YouTube",
        href: seedSite.handles.youtube || "",
        detail: seedSite.handles.youtube || "",
      },
    ];

    await db.insert(siteProfile).values({
      id: "default",
      name: seedSite.name,
      location: seedSite.location,
      roleLine: seedSite.roleLine,
      bannerText: seedSite.bannerText,
      roleTitles: ["AI Engineer in training", "Full-stack developer", "23 · Builder"],
      pfp1: "/profile.png",
      pfp2: "/profile-real.jpg",
      about: [...seedSite.about],
      quote:
        "“Code is read much more often than it is written, so plan for clarity, ship with discipline, and build things that genuinely help people.”",
      quoteAuthor: "Nishank Gupta",
      resumeUrl: "",
      homeProjectCount: 4,
      socials,
      support: {
        coffee: "",
        github: "",
        upi: "",
        qr: "",
        note: "",
      },
    });
    console.info("Seeded site profile.");
  }

  // 3. Experiences & Education
  const [expCount] = await db.select({ value: count() }).from(experiences);
  if (Number(expCount?.value ?? 0) === 0) {
    let order = 0;
    for (const item of seedExperience) {
      await db.insert(experiences).values({
        organization: item.organization,
        role: item.role,
        location: item.location,
        dates: item.dates,
        status: item.status,
        type: item.status === "Education" ? "education" : "experience",
        bullets: [...item.bullets],
        stack: [...item.stack],
        order: order++,
      });
    }
    console.info(`Seeded ${seedExperience.length} experience/education entries.`);
  }

  // 4. Skills
  const [skillCount] = await db.select({ value: count() }).from(skillGroups);
  if (Number(skillCount?.value ?? 0) === 0) {
    let order = 0;
    for (const item of seedSkills) {
      await db.insert(skillGroups).values({
        number: item.number,
        group: item.group,
        items: [...item.items],
        order: order++,
      });
    }
    console.info(`Seeded ${seedSkills.length} skill groups.`);
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Database seed failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
