"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { projectSchema } from "@/content/projects";
import { siteContent as fallbackSite } from "@/content/site";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import {
  experiences,
  projects,
  siteProfile,
  skillGroups,
  type SocialLink,
  type SupportConfig,
} from "@/lib/db/schema";

async function requireDatabaseAndOwner() {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.error("Auth check error in action:", err);
    redirect("/admin?error=unauthorized");
  }
  if (!session?.user || !process.env.AUTH_GITHUB_ALLOWED_USERNAME)
    redirect("/admin?error=unauthorized");
  const database = getDb();
  if (!database) redirect("/admin?error=database");
  return database;
}

function refreshAllViews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/resume");
  revalidatePath("/support");
  revalidatePath("/sitemap.xml");
}

/* ========================================================
   PROJECT ACTIONS
   ======================================================== */

function readProject(form: FormData) {
  const metricsText = String(form.get("metrics") ?? "").trim();
  let metrics: unknown;
  try {
    metrics = metricsText ? (JSON.parse(metricsText) as unknown) : undefined;
  } catch {
    metrics = null;
  }
  const live = String(form.get("live") ?? "").trim();
  const github = String(form.get("github") ?? "").trim();
  const cover = String(form.get("cover") ?? "").trim();
  return projectSchema.safeParse({
    slug: String(form.get("slug") ?? "").trim(),
    title: String(form.get("title") ?? "").trim(),
    tagline: String(form.get("tagline") ?? "").trim(),
    status: String(form.get("status") ?? ""),
    categories: String(form.get("categories") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    stack: String(form.get("stack") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    summary: String(form.get("summary") ?? "").trim(),
    problem: String(form.get("problem") ?? "").trim(),
    approach: String(form.get("approach") ?? "").trim(),
    result: String(form.get("result") ?? "").trim() || undefined,
    metrics,
    badge: String(form.get("badge") ?? "").trim() || undefined,
    links: { live: live || undefined, github: github || undefined },
    cover: cover || undefined,
    featured: form.get("featured") === "on",
    order: Number(form.get("order")),
    published: form.get("published") === "on",
  });
}

export async function saveProject(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const parsed = readProject(form);
  if (!parsed.success) redirect("/admin?tab=projects&error=invalid");
  const project = parsed.data;
  const oldSlug = String(form.get("previousSlug") ?? project.slug).trim();
  await database.transaction(async (tx) => {
    await tx
      .insert(projects)
      .values(project)
      .onConflictDoUpdate({ target: projects.slug, set: { ...project, updatedAt: new Date() } });
    if (oldSlug && oldSlug !== project.slug)
      await tx.delete(projects).where(eq(projects.slug, oldSlug));
  });
  refreshAllViews(project.slug);
  redirect("/admin?tab=projects&saved=1");
}

export async function deleteProject(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const slug = z.string().min(1).safeParse(form.get("slug"));
  if (!slug.success) redirect("/admin?tab=projects&error=invalid");
  await database.delete(projects).where(eq(projects.slug, slug.data));
  refreshAllViews(slug.data);
  redirect("/admin?tab=projects&deleted=1");
}

export async function updateProjectState(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const input = z
    .object({
      slug: z.string().min(1),
      field: z.enum(["published", "featured"]),
      value: z.enum(["true", "false"]),
    })
    .safeParse({ slug: form.get("slug"), field: form.get("field"), value: form.get("value") });
  if (!input.success) redirect("/admin?tab=projects&error=invalid");
  await database
    .update(projects)
    .set({ [input.data.field]: input.data.value === "true", updatedAt: new Date() })
    .where(eq(projects.slug, input.data.slug));
  refreshAllViews(input.data.slug);
  redirect("/admin?tab=projects&saved=1");
}

export async function updateProjectOrder(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const input = z
    .object({ slug: z.string().min(1), order: z.coerce.number().int().nonnegative().max(10000) })
    .safeParse({ slug: form.get("slug"), order: form.get("order") });
  if (!input.success) redirect("/admin?tab=projects&error=invalid");
  await database
    .update(projects)
    .set({ order: input.data.order, updatedAt: new Date() })
    .where(eq(projects.slug, input.data.slug));
  refreshAllViews(input.data.slug);
  redirect("/admin?tab=projects&saved=1");
}

export async function moveProject(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const slug = String(form.get("slug") ?? "").trim();
  const direction = String(form.get("direction") ?? "").trim();
  if (!slug || !direction) redirect("/admin?tab=projects&error=invalid");

  const allProjects = await database.select().from(projects).orderBy(asc(projects.order));
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  if (currentIndex === -1) redirect("/admin?tab=projects&error=invalid");

  const reordered = [...allProjects];
  const [target] = reordered.splice(currentIndex, 1);

  if (direction === "up") {
    const newIndex = Math.max(0, currentIndex - 1);
    reordered.splice(newIndex, 0, target);
  } else if (direction === "down") {
    const newIndex = Math.min(allProjects.length - 1, currentIndex + 1);
    reordered.splice(newIndex, 0, target);
  } else if (direction === "top") {
    reordered.unshift(target);
  } else if (direction === "bottom") {
    reordered.push(target);
  }

  await database.transaction(async (tx) => {
    for (let i = 0; i < reordered.length; i++) {
      await tx
        .update(projects)
        .set({ order: i, updatedAt: new Date() })
        .where(eq(projects.slug, reordered[i].slug));
    }
  });

  refreshAllViews(slug);
  redirect("/admin?tab=projects&saved=1");
}

/* ========================================================
   PROFILE ACTIONS (Bio, PFPs, Quote, Support, Resume)
   ======================================================== */

export async function saveSiteProfile(form: FormData) {
  const database = await requireDatabaseAndOwner();

  const name = String(form.get("name") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const roleLine = String(form.get("roleLine") ?? "").trim();
  const bannerText = String(form.get("bannerText") ?? "").trim();
  const pfp1 = String(form.get("pfp1") ?? "").trim() || "/profile.png";
  const pfp2 = String(form.get("pfp2") ?? "").trim() || "/profile-real.jpg";
  const quote = String(form.get("quote") ?? "").trim();
  const quoteAuthor = String(form.get("quoteAuthor") ?? "").trim();
  const resumeUrl = String(form.get("resumeUrl") ?? "").trim();
  const homeProjectCount = Math.max(1, Number(form.get("homeProjectCount") || 4));

  // Role titles for typewriter effect
  const roleTitlesRaw = String(form.get("roleTitles") ?? "");
  const roleTitles = roleTitlesRaw
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // About bullets / bio points
  const aboutRaw = String(form.get("about") ?? "");
  let about: string[] = [];
  try {
    const parsed = JSON.parse(aboutRaw);
    if (Array.isArray(parsed)) {
      about = parsed
        .flatMap((item: unknown) =>
          typeof item === "string" ? item.split(/\r?\n+/) : [],
        )
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } catch {
    about = aboutRaw
      .split(/\r?\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Social links JSON
  let socials: SocialLink[] = [];
  try {
    const socialsJson = String(form.get("socials") ?? "");
    if (socialsJson) socials = JSON.parse(socialsJson);
  } catch {
    socials = [];
  }

  // Support config
  const support: SupportConfig = {
    coffee: String(form.get("supportCoffee") ?? "").trim(),
    github: String(form.get("supportGithub") ?? "").trim(),
    upi: String(form.get("supportUpi") ?? "").trim(),
    qr: String(form.get("supportQr") ?? "").trim(),
    note: String(form.get("supportNote") ?? "").trim(),
  };

  const currentTab = String(form.get("tab") ?? "profile");

  await database
    .insert(siteProfile)
    .values({
      id: "default",
      name: name || "Nishank Gupta",
      location: location || "Lucknow, India",
      roleLine: roleLine || "AI Engineer in training · Full Stack Developer",
      bannerText: bannerText || "Open to AI engineering roles",
      roleTitles: roleTitles.length ? roleTitles : ["AI Engineer in training", "Full-stack developer"],
      pfp1,
      pfp2,
      about: about.length ? about : [...fallbackSite.about],
      quote,
      quoteAuthor,
      resumeUrl,
      homeProjectCount,
      socials,
      support,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteProfile.id,
      set: {
        name: name || "Nishank Gupta",
        location: location || "Lucknow, India",
        roleLine: roleLine || "AI Engineer in training · Full Stack Developer",
        bannerText: bannerText || "Open to AI engineering roles",
        roleTitles: roleTitles.length ? roleTitles : ["AI Engineer in training", "Full-stack developer"],
        pfp1,
        pfp2,
        about: about.length ? about : [...fallbackSite.about],
        quote,
        quoteAuthor,
        resumeUrl,
        homeProjectCount,
        socials,
        support,
        updatedAt: new Date(),
      },
    });

  refreshAllViews();
  redirect(`/admin?tab=${currentTab}&saved=1`);
}

/* ========================================================
   EXPERIENCE & EDUCATION ACTIONS
   ======================================================== */

export async function saveExperience(form: FormData) {
  const database = await requireDatabaseAndOwner();

  const id = String(form.get("id") ?? "").trim();
  const type = (String(form.get("type") ?? "experience") as "experience" | "education") || "experience";
  const organization = String(form.get("organization") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const dates = String(form.get("dates") ?? "").trim();
  const status = String(form.get("status") ?? "Active").trim();
  const order = Number(form.get("order") ?? 0);

  const bulletsRaw = String(form.get("bullets") ?? "");
  const bullets = bulletsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const stackRaw = String(form.get("stack") ?? "");
  const stack = stackRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!organization || !role || !dates) {
    redirect("/admin?tab=experience&error=invalid");
  }

  const isNew = !id || id.startsWith("new");
  const targetId = isNew ? crypto.randomUUID() : id;

  await database
    .insert(experiences)
    .values({
      id: targetId,
      type,
      organization,
      role,
      location,
      dates,
      status,
      bullets,
      stack,
      order,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: experiences.id,
      set: {
        type,
        organization,
        role,
        location,
        dates,
        status,
        bullets,
        stack,
        order,
        updatedAt: new Date(),
      },
    });

  refreshAllViews();
  redirect("/admin?tab=experience&saved=1");
}

export async function deleteExperience(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const id = String(form.get("id") ?? "").trim();
  if (!id) redirect("/admin?tab=experience&error=invalid");

  await database.delete(experiences).where(eq(experiences.id, id));
  refreshAllViews();
  redirect("/admin?tab=experience&deleted=1");
}

/* ========================================================
   SKILLS ACTIONS
   ======================================================== */

export async function saveSkillGroup(form: FormData) {
  const database = await requireDatabaseAndOwner();

  const id = String(form.get("id") ?? "").trim();
  const number = String(form.get("number") ?? "01").trim();
  const group = String(form.get("group") ?? "").trim();
  const order = Number(form.get("order") ?? 0);

  const itemsRaw = String(form.get("items") ?? "");
  const items = itemsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!group) redirect("/admin?tab=skills&error=invalid");

  const isNew = !id || id.startsWith("new");
  const targetId = isNew ? crypto.randomUUID() : id;

  await database
    .insert(skillGroups)
    .values({
      id: targetId,
      number,
      group,
      items,
      order,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: skillGroups.id,
      set: {
        number,
        group,
        items,
        order,
        updatedAt: new Date(),
      },
    });

  refreshAllViews();
  redirect("/admin?tab=skills&saved=1");
}

export async function deleteSkillGroup(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const id = String(form.get("id") ?? "").trim();
  if (!id) redirect("/admin?tab=skills&error=invalid");

  await database.delete(skillGroups).where(eq(skillGroups.id, id));
  refreshAllViews();
  redirect("/admin?tab=skills&deleted=1");
}
