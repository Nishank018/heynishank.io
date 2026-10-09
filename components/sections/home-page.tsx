"use client";

import { useEffect, useMemo, useState } from "react";
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
  RotateCw,
  Sparkles,
  X,
  Youtube,
  Facebook,
  Share2,
} from "lucide-react";
import type { SiteProfileData, ExperienceData, SkillGroupData } from "@/lib/site-data";
import type { Project } from "@/content/projects";
import { Container } from "@/components/ui/primitives";
import { useSound } from "@/hooks/use-sound";
import { cardSlide1Sound } from "@/lib/sounds/card-slide-1";

function RuleTitle({ n, children, id }: { n: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="home-rule" id={id}>
      <span>{n} /</span>
      <h2>{children}</h2>
      <i />
    </div>
  );
}

function getSocialIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("github")) return <Github />;
  if (n.includes("linkedin")) return <Linkedin />;
  if (n.includes("twitter") || n === "x" || n.includes(" x")) return <X />;
  if (n.includes("instagram")) return <Instagram />;
  if (n.includes("youtube")) return <Youtube />;
  if (n.includes("facebook")) return <Facebook />;
  if (n.includes("medium")) return <span className="social-medium-mark">M</span>;
  return <Share2 />;
}

export function HomePage({
  profile,
  projects,
  experiences,
  skills,
}: {
  profile: SiteProfileData;
  projects: Project[];
  experiences: ExperienceData[];
  skills: SkillGroupData[];
}) {
  const router = useRouter();
  const [ask, setAsk] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleText, setRoleText] = useState("");
  const [deletingRole, setDeletingRole] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [playCardFlip] = useSound(cardSlide1Sound, { volume: 1 });

  const roleTitles = useMemo(() => {
    return profile.roleTitles && profile.roleTitles.length > 0
      ? profile.roleTitles
      : ["AI Engineer in training", "Full-stack developer", "23 · Builder"];
  }, [profile.roleTitles]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRoleText(roleTitles[roleIndex] || "");
      setDeletingRole(false);
      return;
    }

    const currentRole = roleTitles[roleIndex] || roleTitles[0] || "";
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
  }, [roleIndex, roleText, deletingRole, roleTitles]);

  const socialLinks = profile.socials.map((s) => ({
    name: s.name,
    href: s.href || undefined,
    detail: s.detail || "",
    icon: getSocialIcon(s.name),
  }));

  return (
    <main className="home-main">
      <Container>
        <div aria-hidden="true" className="profile-banner" />
        <section className="profile-row">
          <button
            type="button"
            className={`avatar-monogram ${isFlipped ? "is-flipped" : ""}`}
            onClick={() => {
              playCardFlip();
              setIsFlipped((prev) => !prev);
            }}
            aria-label={
              isFlipped
                ? "Showing real photo. Click to show illustrated avatar."
                : "Showing illustrated avatar. Click to reveal real photo."
            }
            title={
              isFlipped
                ? "Click to switch to illustrated avatar"
                : "Click to reveal real photo"
            }
          >
            <div className="avatar-flipper-inner">
              <div className="avatar-face avatar-face-front">
                <Image
                  src={profile.pfp1 || "/profile.png"}
                  alt={`Stylized portrait of ${profile.name}`}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 600px) 88px, 116px"
                  className="profile-avatar-image"
                />
              </div>
              <div className="avatar-face avatar-face-back">
                <Image
                  src={profile.pfp2 || "/profile-real.jpg"}
                  alt={`Real portrait of ${profile.name}`}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 600px) 88px, 116px"
                  className="profile-avatar-image profile-avatar-real"
                />
              </div>
            </div>
            <span className="avatar-flip-hint" aria-hidden="true">
              <RotateCw size={11} />
            </span>
          </button>
          <div className="profile-copy">
            <div className="eyebrow">
              PERSONAL PORTFOLIO <span>·</span> 2025—26
            </div>
            <h1 className="profile-name">
              {profile.name}
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
              <MapPin size={13} /> {profile.location}
            </div>
          </div>
          <a
            className="resume-icon"
            href={profile.resumeUrl || "/resume"}
            aria-label="View resume"
            target={profile.resumeUrl ? "_blank" : undefined}
            rel={profile.resumeUrl ? "noreferrer" : undefined}
          >
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
            aria-label={`Ask about ${profile.name}`}
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask about my work, projects, or experience"
          />
          <button aria-label="Send question">
            <ArrowUpRight size={15} />
          </button>
        </form>

        {/* SECTION 01: ABOUT */}
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
            {(profile.about || [])
              .flatMap((item) => (typeof item === "string" ? item.split(/\r?\n+/) : []))
              .map((s) => s.trim())
              .filter(Boolean)
              .map((line, idx) => (
                <li key={idx}>
                  <span aria-hidden="true">•</span>
                  {line}
                </li>
              ))}
          </ul>
        </motion.section>

        {/* SECTION 02: CONNECT */}
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

        {/* SECTION 03: SKILLS */}
        <section className="home-section" id="stack">
          <RuleTitle n="03">Skills &amp; Technologies</RuleTitle>
          <p className="stack-intro">Languages, frameworks, platforms, and tools I work with.</p>
          <div className="stack-list">
            {skills.map((group, index) => (
              <div className="stack-row" key={group.id || group.number}>
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

        {/* SECTION 04: EXPERIENCE */}
        <section className="home-section" id="experience">
          <RuleTitle n="04">Experience</RuleTitle>
          <div className="experience-list">
            {experiences
              .filter((item) => item.type === "experience")
              .map((item) => (
                <details className="experience-item" key={item.id} open>
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
                          {item.status === "Active" ? "Current role" : item.status}
                          <b />
                          {item.dates}
                        </span>
                        {item.location && <span className="sr-only">{item.location}</span>}
                      </span>
                      <ChevronsUpDown className="experience-chevron" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="experience-body">
                    {item.bullets.length > 0 && (
                      <ul>
                        {item.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {item.stack.length > 0 && (
                      <div className="chip-list">
                        {item.stack.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))}
          </div>
        </section>

        {/* SECTION 05: EDUCATION */}
        <section className="home-section" id="education">
          <RuleTitle n="05">Education</RuleTitle>
          <div className="experience-list education-list">
            {experiences
              .filter((item) => item.type === "education")
              .map((item) => (
                <details className="experience-item" key={item.id} open>
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

        {/* SECTION 06: PROJECTS */}
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
                  <div className={`project-visual project-visual--${(i % 3) + 1}`}>
                    {project.cover ? (
                      <Image
                        src={project.cover}
                        alt={`${project.title} preview`}
                        fill
                        unoptimized
                        sizes="(max-width: 600px) 100vw, 360px"
                        className="project-visual-image"
                      />
                    ) : (
                      <>
                        <span className="project-window">
                          <i />
                          <i />
                          <i />
                        </span>
                        <strong>{project.title}</strong>
                        <span className="project-mock-line" />
                        <span className="project-mock-line short" />
                      </>
                    )}
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
                      <Link href={project.links.live} target="_blank" rel="noreferrer">
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

        {/* SECTION 07: GITHUB */}
        <section className="home-section" id="github">
          <RuleTitle n="07">GitHub</RuleTitle>
          <div className="github-panel">
            <div className="github-head">
              <Github size={17} />
              <b>{profile.name}</b>
              <span>Code and repositories</span>
            </div>
            <div className="github-empty">
              {profile.socials.find((s) => s.name.toLowerCase().includes("github"))?.href ? (
                <a
                  href={profile.socials.find((s) => s.name.toLowerCase().includes("github"))!.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore my GitHub profile <ArrowUpRight size={14} />
                </a>
              ) : (
                <a
                  href={`https://github.com/${profile.name.replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore my GitHub profile <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 08: QUOTE CALLOUT BLOCK BELOW GITHUB */}
        {profile.quote && (
          <section className="home-section" id="quote">
            <RuleTitle n="08">Words to live by</RuleTitle>
            <div className="home-quote-block">
              <p className="home-quote-text">{profile.quote}</p>
              <cite className="home-quote-author">— {profile.quoteAuthor || profile.name}</cite>
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
