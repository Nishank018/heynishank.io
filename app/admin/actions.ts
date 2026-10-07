"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { projectSchema } from "@/content/projects";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";

async function requireDatabaseAndOwner() {
  const session = await auth();
  if (!session?.user || !process.env.AUTH_GITHUB_ALLOWED_USERNAME)
    redirect("/admin?error=unauthorized");
  const database = getDb();
  if (!database) redirect("/admin?error=database");
  return database;
}

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

function refreshProjectViews(slug: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/resume");
  revalidatePath("/sitemap.xml");
}

export async function saveProject(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const parsed = readProject(form);
  if (!parsed.success) redirect("/admin?error=invalid");
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
  refreshProjectViews(project.slug);
  redirect("/admin?saved=1");
}

export async function deleteProject(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const slug = z.string().min(1).safeParse(form.get("slug"));
  if (!slug.success) redirect("/admin?error=invalid");
  await database.delete(projects).where(eq(projects.slug, slug.data));
  refreshProjectViews(slug.data);
  redirect("/admin?deleted=1");
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
  if (!input.success) redirect("/admin?error=invalid");
  await database
    .update(projects)
    .set({ [input.data.field]: input.data.value === "true", updatedAt: new Date() })
    .where(eq(projects.slug, input.data.slug));
  refreshProjectViews(input.data.slug);
  redirect("/admin?saved=1");
}

export async function updateProjectOrder(form: FormData) {
  const database = await requireDatabaseAndOwner();
  const input = z
    .object({ slug: z.string().min(1), order: z.coerce.number().int().nonnegative().max(10000) })
    .safeParse({ slug: form.get("slug"), order: form.get("order") });
  if (!input.success) redirect("/admin?error=invalid");
  await database
    .update(projects)
    .set({ order: input.data.order, updatedAt: new Date() })
    .where(eq(projects.slug, input.data.slug));
  refreshProjectViews(input.data.slug);
  redirect("/admin?saved=1");
}
