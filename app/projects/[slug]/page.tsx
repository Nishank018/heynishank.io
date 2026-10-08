import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { InnerPage } from "@/components/sections/inner-page";
import { getProject, getProjects } from "@/lib/projects";

export const revalidate = 60;
export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return {
    title: project ? `${project.title} — Nishank Gupta` : "Project not found",
    description: project?.tagline,
  };
}
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <InnerPage
      route="projects / case-study"
      title={project.title}
      subtitle={project.tagline}
      action={{ label: "View all projects", href: "/projects" }}
    >
      {project.cover && (
        <div className="case-study-hero">
          <Image
            src={project.cover}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="case-study-image"
            priority
          />
        </div>
      )}
      <div className="case-study">
        <div className="case-row">
          <b>Problem</b>
          <span>{project.problem}</span>
        </div>
        <div className="case-row">
          <b>Approach</b>
          <span>{project.approach}</span>
        </div>
        <div className="case-row">
          <b>Stack</b>
          <span>{project.stack.join(" · ")}</span>
        </div>
        {project.result ? (
          <div className="case-row">
            <b>Result</b>
            <span>{project.result}</span>
          </div>
        ) : null}
      </div>
      <div className="project-link-buttons case-links">
        {project.links.live ? (
          <Link href={project.links.live}>
            Live project <ArrowUpRight size={14} />
          </Link>
        ) : null}
        {project.links.github ? (
          <Link href={project.links.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </Link>
        ) : null}
      </div>
    </InnerPage>
  );
}
