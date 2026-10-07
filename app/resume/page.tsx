import type { Metadata } from "next";
import { InnerPage } from "@/components/sections/inner-page";
import { experience } from "@/content/experience";
import { getProjects } from "@/lib/projects";
import { skills } from "@/content/skills";
import { siteContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume — Nishank Gupta",
  description: "Experience, projects, and technical skills for Nishank Gupta.",
};
export const revalidate = 60;
export default async function ResumePage() {
  const projects = await getProjects();
  return (
    <InnerPage
      route="resume"
      title="Resume"
      subtitle="Experience, selected work, and technical skills."
    >
      <article className="resume-sheet">
        <header>
          <h2>{siteContent.name}</h2>
          <p>{siteContent.roleLine}</p>
          <span>{siteContent.location}</span>
        </header>
        <ResumeSection title="Experience">
          {experience.map((item) => (
            <div className="resume-item" key={item.organization}>
              <div className="resume-item__top">
                <b>{item.organization}</b>
                <time>{item.dates}</time>
              </div>
              <p>
                {item.role} · {item.location}
              </p>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </ResumeSection>
        <ResumeSection title="Projects">
          {projects.map((project) => (
            <div className="resume-item" key={project.slug}>
              <div className="resume-item__top">
                <b>{project.title}</b>
                <span>{project.status}</span>
              </div>
              <p>{project.tagline}</p>
              <small>{project.stack.join(" · ")}</small>
            </div>
          ))}
        </ResumeSection>
        <ResumeSection title="Skills">
          {skills.map((group) => (
            <div className="resume-skill" key={group.number}>
              <b>{group.group}</b>
              <span>{group.items.join(" · ")}</span>
            </div>
          ))}
        </ResumeSection>
        <ResumeSection title="Education">
          {experience
            .filter((item) => item.status === "Education")
            .map((item) => (
              <div className="resume-item" key={item.organization}>
                <div className="resume-item__top">
                  <b>{item.organization}</b>
                  <time>{item.dates}</time>
                </div>
                <p>{item.role}</p>
              </div>
            ))}
        </ResumeSection>
      </article>
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
