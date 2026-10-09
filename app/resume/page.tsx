import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";
import { InnerPage } from "@/components/sections/inner-page";
import { getProjects } from "@/lib/projects";
import { getSiteProfile, getExperiences, getSkillGroups } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Resume — Nishank Gupta",
  description: "Official resume and qualifications for Nishank Gupta.",
};
export const revalidate = 60;

export default async function ResumePage() {
  const [projects, profile, experiences, skills] = await Promise.all([
    getProjects(),
    getSiteProfile(),
    getExperiences(),
    getSkillGroups(),
  ]);

  const workExperience = experiences.filter((e) => e.type === "experience");
  const education = experiences.filter((e) => e.type === "education");

  const downloadFileName = `${(profile.name || "Nishank_Gupta").replace(/\s+/g, "_")}_Resume.pdf`;

  return (
    <InnerPage
      route="resume"
      title="Resume"
      subtitle="Official resume, technical background, and project experience."
    >
      {profile.resumeUrl ? (
        /* ========================================================
           OFFICIAL UPLOADED PDF RESUME EMBED
           ======================================================== */
        <div>
          <div className="resume-toolbar">
            <div className="resume-toolbar-left">
              <a
                href={profile.resumeUrl}
                download={downloadFileName}
                className="outline-action"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  textDecoration: "none",
                  padding: "8px 16px",
                  fontWeight: 600,
                }}
              >
                <Download size={14} />
                <span>Download Resume (PDF)</span>
              </a>

              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-action"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  textDecoration: "none",
                }}
              >
                <span>Open in new tab</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <span
              style={{
                font: "10px var(--font-geist-mono)",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              OFFICIAL PDF DOCUMENT
            </span>
          </div>

          <div className="resume-pdf-container">
            <object
              data={`${profile.resumeUrl}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="resume-pdf-frame"
            >
              <iframe
                src={`${profile.resumeUrl}#toolbar=1&navpanes=0`}
                title={`${profile.name} Resume`}
                className="resume-pdf-frame"
              >
                <div style={{ padding: 24, textAlign: "center" }}>
                  <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
                  <p style={{ marginBottom: 12 }}>
                    Your browser does not support embedded PDF viewing.
                  </p>
                  <a
                    href={profile.resumeUrl}
                    download={downloadFileName}
                    className="outline-action"
                  >
                    Download Resume PDF
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        </div>
      ) : (
        /* ========================================================
           FALLBACK HTML RESUME SHEET (WHEN NO PDF UPLOADED YET)
           ======================================================== */
        <div>
          <div className="admin-notice" style={{ marginBottom: 20 }}>
            Upload your custom PDF resume in the{" "}
            <Link href="/admin?tab=support" className="text-action">
              Admin CMS (Resume &amp; Support tab)
            </Link>{" "}
            to display your official PDF document directly here.
          </div>

          <article className="resume-sheet">
            <header>
              <h2>{profile.name}</h2>
              <p>{profile.roleLine}</p>
              <span>{profile.location}</span>
            </header>

            {workExperience.length > 0 && (
              <ResumeSection title="Experience">
                {workExperience.map((item) => (
                  <div className="resume-item" key={item.id}>
                    <div className="resume-item__top">
                      <b>{item.organization}</b>
                      <time>{item.dates}</time>
                    </div>
                    <p>
                      {item.role} {item.location ? `· ${item.location}` : ""}
                    </p>
                    {item.bullets.length > 0 && (
                      <ul>
                        {item.bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </ResumeSection>
            )}

            {projects.length > 0 && (
              <ResumeSection title="Selected Projects">
                {projects.map((project) => (
                  <div className="resume-item" key={project.slug}>
                    <div className="resume-item__top">
                      <b>{project.title}</b>
                      <span>{project.status}</span>
                    </div>
                    <p>{project.tagline}</p>
                    {project.stack.length > 0 && <small>{project.stack.join(" · ")}</small>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {skills.length > 0 && (
              <ResumeSection title="Skills & Technologies">
                {skills.map((group) => (
                  <div className="resume-skill" key={group.id}>
                    <b>{group.group}</b>
                    <span>{group.items.join(" · ")}</span>
                  </div>
                ))}
              </ResumeSection>
            )}

            {education.length > 0 && (
              <ResumeSection title="Education">
                {education.map((item) => (
                  <div className="resume-item" key={item.id}>
                    <div className="resume-item__top">
                      <b>{item.organization}</b>
                      <time>{item.dates}</time>
                    </div>
                    <p>
                      {item.role} {item.location ? `· ${item.location}` : ""}
                    </p>
                  </div>
                ))}
              </ResumeSection>
            )}
          </article>
        </div>
      )}
    </InnerPage>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
