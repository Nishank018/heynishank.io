"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronsUpDown,
  Code2,
  GraduationCap,
  Github,
  Instagram,
  Linkedin,
  MapPin,
  Sparkles,
  X,
  Youtube,
  Facebook,
} from "lucide-react";
import { siteContent } from "@/content/site";
import { experience } from "@/content/experience";
import type { Project } from "@/content/projects";
import { skills } from "@/content/skills";
import { Container } from "@/components/ui/primitives";
import { ProfileViews } from "@/components/sections/profile-views";

function RuleTitle({ n, children, id }: { n: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="home-rule" id={id}>
      <span>{n} /</span>
      <h2>{children}</h2>
      <i />
    </div>
  );
}

const roleTitles = ["AI Engineer in training", "Full-stack developer", "23 · Builder"];

export function HomePage({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [ask, setAsk] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleText, setRoleText] = useState("");
  const [deletingRole, setDeletingRole] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRoleText(roleTitles[roleIndex]);
      setDeletingRole(false);
      return;
    }

    const currentRole = roleTitles[roleIndex];
    let timeout: number;

    if (!deletingRole && roleText === currentRole) {
      timeout = window.setTimeout(() => setDeletingRole(true), 1400);
    } else if (deletingRole && roleText.length === 0) {
      timeout = window.setTimeout(() => {
        setRoleIndex((current) => (current + 1) % roleTitles.length);
        setDeletingRole(false);
      }, 300);
    } else {
      timeout = window.setTimeout(
        () => {
          setRoleText(
            deletingRole ? roleText.slice(0, -1) : currentRole.slice(0, roleText.length + 1),
          );
        },
        deletingRole ? 38 : 72,
      );
    }

    return () => window.clearTimeout(timeout);
  }, [roleIndex, roleText, deletingRole]);

  const socialLinks = [
    {
      name: "GitHub",
      href: `https://github.com/${siteContent.handles.github}`,
      detail: `@${siteContent.handles.github}`,
      icon: <Github />,
    },
    {
      name: "Twitter",
      href: siteContent.handles.x || undefined,
      detail: siteContent.handles.x || "",
      icon: <X />,
    },
    {
      name: "LinkedIn",
      href: `https://linkedin.com/in/${siteContent.handles.linkedin}`,
      detail: siteContent.handles.linkedin,
      icon: <Linkedin />,
    },
    {
      name: "Instagram",
      href: siteContent.handles.instagram || undefined,
      detail: siteContent.handles.instagram || "",
      icon: <Instagram />,
    },
    {
      name: "Medium",
      href: siteContent.handles.medium || undefined,
      detail: siteContent.handles.medium || "",
      icon: <span className="social-medium-mark">M</span>,
    },
    {
      name: "YouTube",
      href: siteContent.handles.youtube || undefined,
      detail: siteContent.handles.youtube || "",
      icon: <Youtube />,
    },
    {
      name: "Facebook",
      href: siteContent.handles.facebook || undefined,
      detail: siteContent.handles.facebook || "",
      icon: <Facebook />,
    },
  ];
  return (
    <main className="home-main">
      <Container>
        <div aria-hidden="true" className="profile-banner" />
        <section className="profile-row">
          <div className="avatar-monogram">
            <Image
              src="/profile.png"
              alt="Stylized portrait of Nishank Gupta"
              fill
              priority
              sizes="(max-width: 600px) 88px, 116px"
              className="profile-avatar-image"
            />
          </div>
          <div className="profile-copy">
            <div className="eyebrow">
              PERSONAL PORTFOLIO <span>·</span> 2025—26
            </div>
            <h1 className="profile-name">
              {siteContent.name}
              <span
                className="profile-check"
                title="Portfolio profile"
                aria-label="Portfolio profile"
              >
                <BadgeCheck aria-hidden="true" size={26} fill="currentColor" />
              </span>
            </h1>
            <p className="profile-role-line">
              <span className="sr-only">{roleTitles[roleIndex]}</span>
              <span className="profile-role" aria-hidden="true">
                {roleText}
                <i className="profile-role__cursor" />
              </span>
            </p>
            <div className="profile-location">
              <MapPin size={13} /> {siteContent.location}
              {siteContent.featureFlags.showViewCounter && <ProfileViews />}
            </div>
          </div>
          <a className="resume-icon" href="/resume" aria-label="View resume">
            <ArrowUpRight size={17} />
          </a>
        </section>
        <button className="ask-bar" onClick={() => document.getElementById("ask-input")?.focus()}>
          <Sparkles size={15} />
          <span>Ask anything about me...</span>
          <kbd>↵</kbd>
        </button>
        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (ask.trim()) router.push(`/chat?q=${encodeURIComponent(ask.trim())}`);
          }}
        >
          <input
            id="ask-input"
            aria-label="Ask about Nishank"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask about my work, projects, or experience"
          />
          <button aria-label="Send question">
            <ArrowUpRight size={15} />
          </button>
        </form>

        <motion.section
          className="home-section"
          id="about"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <RuleTitle n="01">About</RuleTitle>
          <ul className="about-list">
            {siteContent.about.map((line) => (
              <li key={line}>
                <span aria-hidden="true">•</span>
                {line}
              </li>
            ))}
          </ul>
        </motion.section>
        <section className="home-section contact-section" id="contact">
          <RuleTitle n="02">Connect</RuleTitle>
          <div className="contact-socials">
            {socialLinks.map((item) =>
              item.href ? (
                <a
                  className="contact-social"
                  href={item.href}
                  key={item.name}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={item.name}
                  title={item.name}
                >
                  <span className="contact-social__icon">{item.icon}</span>
                  <span className="contact-social__copy">
                    <span className="contact-social__name">{item.name}</span>
                    {item.detail ? <small>{item.detail}</small> : null}
                  </span>
                </a>
              ) : (
                <div
                  className="contact-social contact-social--inactive"
                  key={item.name}
                  aria-label={`${item.name}: profile link not added`}
                  title={`${item.name}: profile link not added`}
                >
                  <span className="contact-social__icon">{item.icon}</span>
                  <span className="contact-social__copy">
                    <span className="contact-social__name">{item.name}</span>
                    {item.detail ? <small>{item.detail}</small> : null}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
        <section className="home-section" id="stack">
          <RuleTitle n="03">Skills &amp; Technologies</RuleTitle>
          <p className="stack-intro">Languages, frameworks, platforms, and tools I work with.</p>
          <div className="stack-list">
            {skills.map((group, index) => (
              <div className="stack-row" key={group.number}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{group.group}</b>
                <div className="chip-list">
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="home-section" id="experience">
          <RuleTitle n="04">Experience</RuleTitle>
          <div className="experience-list">
            {experience
              .filter((item) => item.status !== "Education")
              .map((item) => (
                <details className="experience-item" key={item.organization} open>
                  <summary>
                    <span className="experience-org">
                      <i />
                      {item.organization}
                    </span>
                    <span className="experience-entry-main">
                      <span className="experience-entry-icon">
                        <Code2 aria-hidden="true" />
                      </span>
                      <span className="experience-entry-copy">
                        <span className="experience-role">{item.role}</span>
                        <span className="experience-meta">
                          {item.status === "Active" ? "Current role" : "Internship"}
                          <b />
                          {item.dates}
                        </span>
                        <span className="sr-only">{item.location}</span>
                      </span>
                      <ChevronsUpDown className="experience-chevron" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="experience-body">
                    {item.bullets.length > 0 && (
                      <ul>
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    <div className="chip-list">
                      {item.stack.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
          </div>
        </section>

        <section className="home-section" id="education">
          <RuleTitle n="05">Education</RuleTitle>
          <div className="experience-list education-list">
            {experience
              .filter((item) => item.status === "Education")
              .map((item) => (
                <details className="experience-item" key={item.organization} open>
                  <summary>
                    <span className="experience-org">
                      <i />
                      {item.organization}
                    </span>
                    <span className="experience-entry-main">
                      <span className="experience-entry-icon">
                        <GraduationCap aria-hidden="true" />
                      </span>
                      <span className="experience-entry-copy">
                        <span className="experience-role">{item.role}</span>
                        <span className="experience-meta">
                          {item.dates}
                          <b />
                          {item.location}
                        </span>
                      </span>
                      <ChevronsUpDown className="experience-chevron" aria-hidden="true" />
                    </span>
                  </summary>
                </details>
              ))}
          </div>
        </section>

        <section className="home-section" id="projects">
          <RuleTitle n="06">Project case studies</RuleTitle>
          {projects.length ? (
            <div className="projects-grid">
              {projects.map((project, i) => (
                <motion.article
                  className="project-card"
                  key={project.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                >
                  <div className={`project-visual project-visual--${i + 1}`}>
                    <span className="project-window">
                      <i />
                      <i />
                      <i />
                    </span>
                    <strong>{project.title}</strong>
                    <span className="project-mock-line" />
                    <span className="project-mock-line short" />
                  </div>
                  <div className="project-meta">
                    <span className={`status ${project.status === "live" ? "status--active" : ""}`}>
                      {project.status}
                    </span>
                    {project.badge && <span className="project-badge">{project.badge}</span>}
                  </div>
                  <h3>
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h3>
                  <p>{project.tagline}</p>
                  <div className="chip-list">
                    {project.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.links.live ? (
                      <Link href={project.links.live}>
                        Live demo <ArrowUpRight size={13} />
                      </Link>
                    ) : null}
                    {project.links.github ? (
                      <Link href={project.links.github} target="_blank" rel="noreferrer">
                        GitHub <ArrowUpRight size={13} />
                      </Link>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Project case studies will appear here as demos and source links are ready to share.
            </p>
          )}
        </section>

        <section className="home-section" id="github">
          <RuleTitle n="07">GitHub</RuleTitle>
          <div className="github-panel">
            <div className="github-head">
              <Github size={17} />
              <b>{siteContent.handles.github}</b>
              <span>Code and repositories</span>
            </div>
            <div className="github-empty">
              <a
                href={`https://github.com/${siteContent.handles.github}`}
                target="_blank"
                rel="noreferrer"
              >
                Explore my GitHub profile <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>
        {Object.values(siteContent.featureFlags).some(Boolean) && (
          <div className="feature-placeholder">
            Optional sections are enabled in content/site.ts.
          </div>
        )}
      </Container>
    </main>
  );
}
