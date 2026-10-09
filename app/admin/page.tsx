import type { Metadata } from "next";
import Link from "next/link";
import { InnerPage } from "@/components/sections/inner-page";
import { auth, signIn, signOut } from "@/auth";
import { getProjects } from "@/lib/projects";
import { getSiteProfile, getExperiences, getSkillGroups } from "@/lib/site-data";
import { getDb } from "@/lib/db";
import { AdminPanel } from "./admin-panel";

export const metadata: Metadata = {
  title: "Portfolio CMS — Nishank Gupta",
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

  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.error("Auth session check error in AdminPage:", err);
    session = null;
  }
  if (!session?.user) {
    return (
      <InnerPage
        route="admin / sign in"
        title="Private Portfolio CMS"
        subtitle="Only the configured GitHub account can manage portfolio content."
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
  }

  const [projects, profile, experiences, skills] = await Promise.all([
    getProjects({ includeUnpublished: true }),
    getSiteProfile(),
    getExperiences(),
    getSkillGroups(),
  ]);

  const databaseConfigured = Boolean(getDb());
  const params = await searchParams;
  const initialTab = typeof params.tab === "string" ? params.tab : "profile";

  return (
    <InnerPage
      route="admin / cms"
      title="Portfolio CMS"
      subtitle="Manage your profile, bio, projects, skills, experience, connects, and resume."
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
        <p className="admin-feedback">Some fields are invalid. Review your input and try again.</p>
      )}
      {params.error === "database" && (
        <p className="admin-feedback">DATABASE_URL is required to save changes.</p>
      )}
      {params.error === "unauthorized" && (
        <p className="admin-feedback">This account is not authorized.</p>
      )}
      {params.saved && <p className="admin-feedback">✓ Changes successfully saved to database.</p>}
      {params.deleted && <p className="admin-feedback">✓ Item deleted.</p>}

      {!databaseConfigured && (
        <div className="admin-notice">
          Read-only preview. DATABASE_URL is not connected.
        </div>
      )}

      <AdminPanel
        profile={profile}
        projects={projects}
        experiences={experiences}
        skills={skills}
        initialTab={initialTab}
        disabled={!databaseConfigured}
      />
    </InnerPage>
  );
}
