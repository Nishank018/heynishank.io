"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/projects";

const filters = ["All", "AI", "Full-stack", "Open source"] as const;
type Filter = (typeof filters)[number];
export function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = projects.filter(
    (project) =>
      filter === "All" ||
      (filter === "AI" && project.categories.includes("ai")) ||
      (filter === "Full-stack" && project.categories.includes("fullstack")) ||
      (filter === "Open source" && project.categories.includes("oss")),
  );
  return (
    <>
      <div className="filter-tabs" role="tablist" aria-label="Filter projects">
        {filters.map((item) => (
          <button
            aria-selected={filter === item}
            className={filter === item ? "is-selected" : ""}
            key={item}
            onClick={() => setFilter(item)}
            role="tab"
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="project-list">
          {visible.map((project) => (
            <article className="inner-project" key={project.slug}>
              <div className="inner-project__cover">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={`${project.title} preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="project-visual-image"
                  />
                ) : (
                  <>
                    <span className="project-window">
                      <i />
                      <i />
                      <i />
                    </span>
                    <b>{project.title}</b>
                  </>
                )}
                {project.badge && <span className="cover-badge">{project.badge}</span>}
              </div>
              <div className="inner-project__body">
                <div className="inner-project__heading">
                  <div>
                    <span className={`status ${project.status === "live" ? "status--active" : ""}`}>
                      ● {project.status}
                    </span>
                    <h2>
                      <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    </h2>
                  </div>
                  <div className="project-link-buttons">
                    {project.links.live ? (
                      <Link
                        href={project.links.live}
                        target={project.links.live.startsWith("http") ? "_blank" : undefined}
                      >
                        Live <ArrowUpRight size={13} />
                      </Link>
                    ) : null}
                    {project.links.github ? (
                      <Link href={project.links.github} target="_blank" rel="noreferrer">
                        GitHub <ArrowUpRight size={13} />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <p className="inner-project__tagline">{project.tagline}</p>
                <p className="inner-project__summary">{project.summary}</p>
                <div className="technology-row">
                  <b>Technologies Used:</b>
                  <div className="chip-list">
                    {project.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">No projects in this category yet.</p>
      )}
    </>
  );
}
