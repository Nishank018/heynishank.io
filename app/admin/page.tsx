import type { Metadata } from "next";
import Link from "next/link";
import { InnerPage } from "@/components/sections/inner-page";
import { auth, signIn, signOut } from "@/auth";
import { getProjects } from "@/lib/projects";
import { getDb } from "@/lib/db";
import type { Project } from "@/content/projects";
import { deleteProject, saveProject, updateProjectOrder, updateProjectState } from "./actions";

export const metadata: Metadata = {
  title: "Project CMS — Nishank Gupta",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (
    !process.env.AUTH_GITHUB_ID ||
    !process.env.AUTH_GITHUB_SECRET ||
    !process.env.AUTH_GITHUB_ALLOWED_USERNAME
  ) {
    return (
      <InnerPage
        route="admin / setup"
        title="Admin setup required"
        subtitle="Configure the private GitHub account before signing in."
      >
        <div className="admin-notice">
          Set `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GITHUB_ALLOWED_USERNAME`, and
          `AUTH_SECRET` in the server environment.
        </div>
        <Link className="text-action" href="/">
          Back to portfolio
        </Link>
      </InnerPage>
    );
  }
  const session = await auth();
  if (!session?.user)
    return (
      <InnerPage
        route="admin / sign in"
        title="Private project CMS"
        subtitle="Only the configured GitHub account can manage portfolio projects."
      >
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button className="outline-action">Sign in with GitHub</button>
        </form>
      </InnerPage>
    );
  const projects = await getProjects({ includeUnpublished: true });
  const databaseConfigured = Boolean(getDb());
  const params = await searchParams;
  return (
    <InnerPage
      route="admin / projects"
      title="Project CMS"
      subtitle="Create, edit, publish, and order portfolio projects."
    >
      <div className="admin-toolbar">
        <span>SIGNED IN · {session.user.name ?? "GitHub account"}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin" });
          }}
        >
          <button className="text-action">Sign out</button>
        </form>
      </div>
      {params.error === "invalid" && (
        <p className="admin-feedback">
          Some project fields are invalid. Review the values and try again.
        </p>
      )}
      {params.error === "database" && (
        <p className="admin-feedback">DATABASE_URL is required before you can save projects.</p>
      )}
      {params.error === "unauthorized" && (
        <p className="admin-feedback">This account is not authorized.</p>
      )}
      {params.saved && <p className="admin-feedback">Changes saved.</p>}
      {params.deleted && <p className="admin-feedback">Project deleted.</p>}
      {!databaseConfigured && (
        <div className="admin-notice">
          Read-only preview. Set DATABASE_URL, run migrations, and seed the project table to enable
          edits.
        </div>
      )}
      <div className="admin-projects">
        {projects.map((project) => (
          <ProjectEditor key={project.slug} project={project} disabled={!databaseConfigured} />
        ))}
      </div>
      <details className="admin-new">
        <summary>New project</summary>
        <ProjectEditor
          project={newProject(projects.length + 1)}
          disabled={!databaseConfigured}
          isNew
        />
      </details>
    </InnerPage>
  );
}

function ProjectEditor({
  project,
  disabled,
  isNew = false,
}: {
  project: Project;
  disabled: boolean;
  isNew?: boolean;
}) {
  return (
    <details open={isNew} className={`admin-project${isNew ? " admin-project--new" : ""}`}>
      <summary>
        <span>{project.title || "Project fields"}</span>
        <small>
          {project.published ? "PUBLISHED" : "DRAFT"} · #{project.order}
        </small>
      </summary>
      <form action={saveProject} className="admin-form">
        <input type="hidden" name="previousSlug" value={isNew ? "" : project.slug} />
        <fieldset disabled={disabled}>
          <div className="admin-fields">
            <label>
              Slug
              <input
                name="slug"
                defaultValue={isNew ? "" : project.slug}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </label>
            <label>
              Title
              <input name="title" defaultValue={project.title} required maxLength={100} />
            </label>
            <label>
              Tagline
              <input name="tagline" defaultValue={project.tagline} required maxLength={140} />
            </label>
            <label>
              Status
              <select name="status" defaultValue={project.status}>
                <option value="idea">Idea</option>
                <option value="building">Building</option>
                <option value="live">Live</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Categories (comma separated)
              <input
                name="categories"
                defaultValue={project.categories.join(", ")}
                placeholder="ai, fullstack, oss"
              />
            </label>
            <label>
              Stack (comma separated)
              <input name="stack" defaultValue={project.stack.join(", ")} />
            </label>
            <label className="admin-wide">
              Summary
              <input name="summary" defaultValue={project.summary} required maxLength={240} />
            </label>
            <label>
              Problem
              <input name="problem" defaultValue={project.problem} required maxLength={240} />
            </label>
            <label>
              Approach
              <input name="approach" defaultValue={project.approach} required maxLength={240} />
            </label>
            <label>
              Result
              <input name="result" defaultValue={project.result ?? ""} maxLength={240} />
            </label>
            <label>
              Badge
              <input name="badge" defaultValue={project.badge ?? ""} maxLength={80} />
            </label>
            <label>
              Live link
              <input
                name="live"
                defaultValue={project.links.live ?? ""}
                placeholder="https:// or /internal-route"
              />
            </label>
            <label>
              GitHub link
              <input
                name="github"
                defaultValue={project.links.github ?? ""}
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              Cover path
              <input name="cover" defaultValue={project.cover ?? ""} maxLength={500} />
            </label>
            <label>
              Metrics JSON
              <input
                name="metrics"
                defaultValue={JSON.stringify(project.metrics ?? [])}
                placeholder='[{"label":"","value":""}]'
              />
            </label>
            <label>
              Order
              <input name="order" type="number" min="0" max="10000" defaultValue={project.order} />
            </label>
          </div>
          <div className="admin-checks">
            <label>
              <input name="featured" type="checkbox" defaultChecked={project.featured} /> Featured
            </label>
            <label>
              <input name="published" type="checkbox" defaultChecked={project.published} />{" "}
              Published
            </label>
          </div>
          <button className="outline-action" type="submit">
            {isNew ? "Create project" : "Save changes"}
          </button>
        </fieldset>
      </form>
      {!isNew && (
        <div className="admin-secondary">
          <form action={updateProjectState}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="field" value="published" />
            <input type="hidden" name="value" value={project.published ? "false" : "true"} />
            <button disabled={disabled}>{project.published ? "Unpublish" : "Publish"}</button>
          </form>
          <form action={updateProjectOrder}>
            <input type="hidden" name="slug" value={project.slug} />
            <label>
              Set order
              <input name="order" type="number" min="0" max="10000" defaultValue={project.order} />
            </label>
            <button disabled={disabled}>Update order</button>
          </form>
          <form action={deleteProject}>
            <input type="hidden" name="slug" value={project.slug} />
            <button disabled={disabled} className="admin-delete">
              Delete
            </button>
          </form>
        </div>
      )}
    </details>
  );
}

function newProject(order: number): Project {
  return {
    slug: "",
    title: "",
    tagline: "",
    status: "idea",
    categories: ["fullstack"],
    stack: [],
    summary: "",
    problem: "",
    approach: "",
    links: {},
    featured: false,
    order,
    published: false,
  };
}
