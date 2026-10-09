"use client";

import { useState } from "react";
import {
  User,
  FolderGit2,
  Cpu,
  Briefcase,
  Share2,
  Quote,
  HeartHandshake,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Search,
} from "lucide-react";
import type { SiteProfileData, ExperienceData, SkillGroupData } from "@/lib/site-data";
import type { Project } from "@/content/projects";
import { FileUploader } from "@/components/ui/file-uploader";
import {
  saveSiteProfile,
  saveProject,
  deleteProject,
  updateProjectState,
  updateProjectOrder,
  moveProject,
  saveExperience,
  deleteExperience,
  saveSkillGroup,
  deleteSkillGroup,
} from "./actions";

export function AdminPanel({
  profile,
  projects,
  experiences,
  skills,
  initialTab = "profile",
  disabled = false,
}: {
  profile: SiteProfileData;
  projects: Project[];
  experiences: ExperienceData[];
  skills: SkillGroupData[];
  initialTab?: string;
  disabled?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile local states for dynamic lists
  const [aboutBullets, setAboutBullets] = useState<string[]>(() => {
    const initial = (profile.about || [])
      .flatMap((item) => (typeof item === "string" ? item.split(/\r?\n+/) : []))
      .map((s) => s.trim())
      .filter(Boolean);
    return initial.length > 0 ? initial : [""];
  });
  const [socials, setSocials] = useState(profile.socials || []);

  // Project filter & search states
  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [publishFilter, setPublishFilter] = useState<string>("all");

  const addAboutBullet = () => setAboutBullets([...aboutBullets, ""]);
  const removeAboutBullet = (idx: number) =>
    setAboutBullets(aboutBullets.filter((_, i) => i !== idx));

  const addSocial = () =>
    setSocials([...socials, { name: "Custom", href: "https://", detail: "" }]);
  const removeSocial = (idx: number) => setSocials(socials.filter((_, i) => i !== idx));

  const tabs = [
    { id: "profile", label: "Profile & Bio", icon: <User size={13} /> },
    { id: "projects", label: "Projects", icon: <FolderGit2 size={13} /> },
    { id: "skills", label: "Skills", icon: <Cpu size={13} /> },
    { id: "experience", label: "Experience & Education", icon: <Briefcase size={13} /> },
    { id: "connects", label: "Connects", icon: <Share2 size={13} /> },
    { id: "quote", label: "Quote Block", icon: <Quote size={13} /> },
    { id: "support", label: "Resume & Support", icon: <HeartHandshake size={13} /> },
  ];

  return (
    <div className="admin-container">
      {/* Navigation Tabs */}
      <nav aria-label="Admin Tabs" className="admin-nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab-btn ${activeTab === tab.id ? "admin-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ========================================================
          TAB 1: PROFILE & BIO
          ======================================================== */}
      {activeTab === "profile" && (
        <section className="admin-card">
          <h2 className="admin-card__title">Profile &amp; Biography</h2>
          <p className="admin-card__subtitle">
            Customize your name, location, avatars, rotating roles, and bio bullet points.
          </p>

          <form action={saveSiteProfile} className="admin-form">
            <input type="hidden" name="tab" value="profile" />
            <input type="hidden" name="socials" value={JSON.stringify(socials)} />
            <input type="hidden" name="quote" value={profile.quote} />
            <input type="hidden" name="quoteAuthor" value={profile.quoteAuthor} />
            <input type="hidden" name="resumeUrl" value={profile.resumeUrl} />
            <input type="hidden" name="homeProjectCount" value={profile.homeProjectCount} />
            <input type="hidden" name="supportCoffee" value={profile.support.coffee ?? ""} />
            <input type="hidden" name="supportGithub" value={profile.support.github ?? ""} />
            <input type="hidden" name="supportUpi" value={profile.support.upi ?? ""} />
            <input type="hidden" name="supportQr" value={profile.support.qr ?? ""} />
            <input type="hidden" name="supportNote" value={profile.support.note ?? ""} />

            <fieldset disabled={disabled}>
              <div className="admin-fields">
                <label>
                  Display Name
                  <input name="name" defaultValue={profile.name} required />
                </label>
                <label>
                  Location
                  <input name="location" defaultValue={profile.location} required />
                </label>
                <label className="admin-wide">
                  Headline Role (Navbar &amp; Metadata)
                  <input name="roleLine" defaultValue={profile.roleLine} required />
                </label>
                <label className="admin-wide">
                  Top Banner Status / Announcement
                  <input name="bannerText" defaultValue={profile.bannerText} />
                </label>
              </div>

              {/* Avatars */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 13, marginBottom: 12 }}>Profile Avatars (PFP)</h3>
                <div className="admin-fields">
                  <div>
                    <FileUploader
                      label="Front Avatar (PFP 1 — Stylized/Illustrated)"
                      name="pfp1"
                      defaultValue={profile.pfp1}
                      accept="image/*"
                      placeholder="/profile.png or upload image"
                    />
                  </div>
                  <div>
                    <FileUploader
                      label="Back Avatar (PFP 2 — Real Photo on Flip)"
                      name="pfp2"
                      defaultValue={profile.pfp2}
                      accept="image/*"
                      placeholder="/profile-real.jpg or upload image"
                    />
                  </div>
                </div>
              </div>

              {/* Rotating Typewriter Roles */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 13, marginBottom: 4 }}>Rotating Typewriter Roles</h3>
                <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 10 }}>
                  Titles animated in typewriter text on the home page.
                </p>
                <textarea
                  name="roleTitles"
                  defaultValue={profile.roleTitles.join("\n")}
                  rows={4}
                  placeholder="One role per line"
                  style={{
                    width: "100%",
                    padding: 8,
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11,
                  }}
                />
              </div>

              {/* Dynamic Bio Points */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 13, marginBottom: 4 }}>Bio / About Bullet Points</h3>
                <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 10 }}>
                  Each entry will appear as a separate bullet point in Section 01 (About). Enter your points below, press Enter to create the next bullet, or paste multiple lines to split them automatically.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {aboutBullets.map((bullet, idx) => (
                    <div key={idx} className="dynamic-item-row">
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...aboutBullets];
                          updated[idx] = e.target.value;
                          setAboutBullets(updated);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            const target = e.currentTarget;
                            const value = target.value;
                            const cursor = target.selectionStart ?? value.length;
                            const before = value.slice(0, cursor).trim();
                            const after = value.slice(cursor).trim();
                            const updated = [...aboutBullets];
                            if (before) {
                              updated[idx] = before;
                              updated.splice(idx + 1, 0, after);
                            } else {
                              updated.splice(idx + 1, 0, "");
                            }
                            setAboutBullets(updated);
                          }
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          const lines = pasted.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
                          if (lines.length > 1) {
                            e.preventDefault();
                            const updated = [...aboutBullets];
                            updated.splice(idx, 1, ...lines);
                            setAboutBullets(updated);
                          }
                        }}
                        placeholder={`Bio bullet point ${idx + 1}... (Press Enter for next bullet)`}
                        rows={3}
                      />
                      <button
                        type="button"
                        className="dynamic-item-remove"
                        onClick={() => removeAboutBullet(idx)}
                        title="Remove point"
                        disabled={aboutBullets.length <= 1}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="dynamic-add-btn" onClick={addAboutBullet}>
                    <Plus size={13} /> Add another bio point
                  </button>
                  <input type="hidden" name="about" value={JSON.stringify(aboutBullets)} />
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <button className="outline-action" type="submit">
                  Save Profile Changes
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}

      {/* ========================================================
          TAB 2: PROJECTS
          ======================================================== */}
      {activeTab === "projects" && (() => {
        const filteredProjects = projects.filter((project) => {
          if (projectSearch.trim()) {
            const q = projectSearch.toLowerCase();
            const match =
              project.title.toLowerCase().includes(q) ||
              project.slug.toLowerCase().includes(q) ||
              project.tagline.toLowerCase().includes(q) ||
              project.stack.some((s) => s.toLowerCase().includes(q));
            if (!match) return false;
          }
          if (statusFilter !== "all" && project.status !== statusFilter) return false;
          if (featuredFilter === "featured" && !project.featured) return false;
          if (featuredFilter === "normal" && project.featured) return false;
          if (publishFilter === "published" && !project.published) return false;
          if (publishFilter === "draft" && project.published) return false;
          return true;
        });

        return (
          <div>
            {/* Search & Filter Controls */}
            <div className="project-controls-bar">
              <div className="project-search-wrap">
                <Search size={14} color="hsl(var(--muted-foreground))" />
                <input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects by title, tagline, slug, or tech stack..."
                />
                {projectSearch && (
                  <button
                    type="button"
                    onClick={() => setProjectSearch("")}
                    style={{ background: "transparent", border: 0, color: "hsl(var(--muted-foreground))", cursor: "pointer", fontSize: 11 }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="project-filter-row">
                <span className="project-filter-label">STATUS:</span>
                {(["all", "live", "building", "idea", "archived"] as const).map((st) => {
                  const count = st === "all" ? projects.length : projects.filter((p) => p.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      className={`project-filter-btn ${statusFilter === st ? "project-filter-btn--active" : ""}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st.toUpperCase()} <small>({count})</small>
                    </button>
                  );
                })}
              </div>

              <div className="project-filter-row">
                <span className="project-filter-label">VISIBILITY:</span>
                <button
                  type="button"
                  className={`project-filter-btn ${featuredFilter === "all" && publishFilter === "all" ? "project-filter-btn--active" : ""}`}
                  onClick={() => {
                    setFeaturedFilter("all");
                    setPublishFilter("all");
                  }}
                >
                  All ({projects.length})
                </button>
                <button
                  type="button"
                  className={`project-filter-btn ${featuredFilter === "featured" ? "project-filter-btn--active" : ""}`}
                  onClick={() => setFeaturedFilter(featuredFilter === "featured" ? "all" : "featured")}
                >
                  ★ Featured ({projects.filter((p) => p.featured).length})
                </button>
                <button
                  type="button"
                  className={`project-filter-btn ${publishFilter === "published" ? "project-filter-btn--active" : ""}`}
                  onClick={() => setPublishFilter(publishFilter === "published" ? "all" : "published")}
                >
                  Published ({projects.filter((p) => p.published).length})
                </button>
                <button
                  type="button"
                  className={`project-filter-btn ${publishFilter === "draft" ? "project-filter-btn--active" : ""}`}
                  onClick={() => setPublishFilter(publishFilter === "draft" ? "all" : "draft")}
                >
                  Drafts ({projects.filter((p) => !p.published).length})
                </button>
              </div>
            </div>

            {/* Homepage Count Selector */}
            <div className="admin-card">
              <h2 className="admin-card__title">Homepage Display Settings</h2>
              <form action={saveSiteProfile} className="admin-form" style={{ padding: 0 }}>
                <input type="hidden" name="tab" value="projects" />
                <input type="hidden" name="name" value={profile.name} />
                <input type="hidden" name="location" value={profile.location} />
                <input type="hidden" name="roleLine" value={profile.roleLine} />
                <input type="hidden" name="bannerText" value={profile.bannerText} />
                <input type="hidden" name="pfp1" value={profile.pfp1} />
                <input type="hidden" name="pfp2" value={profile.pfp2} />
                <input type="hidden" name="roleTitles" value={profile.roleTitles.join("\n")} />
                <input type="hidden" name="about" value={profile.about.join("\n\n")} />
                <input type="hidden" name="quote" value={profile.quote} />
                <input type="hidden" name="quoteAuthor" value={profile.quoteAuthor} />
                <input type="hidden" name="resumeUrl" value={profile.resumeUrl} />
                <input type="hidden" name="socials" value={JSON.stringify(profile.socials)} />
                <input type="hidden" name="supportCoffee" value={profile.support.coffee ?? ""} />
                <input type="hidden" name="supportGithub" value={profile.support.github ?? ""} />
                <input type="hidden" name="supportUpi" value={profile.support.upi ?? ""} />
                <input type="hidden" name="supportQr" value={profile.support.qr ?? ""} />
                <input type="hidden" name="supportNote" value={profile.support.note ?? ""} />

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span>Projects shown on homepage:</span>
                    <select
                      name="homeProjectCount"
                      defaultValue={profile.homeProjectCount}
                      style={{
                        height: 32,
                        padding: "0 8px",
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      <option value={2}>2 projects</option>
                      <option value={4}>4 projects</option>
                      <option value={6}>6 projects</option>
                      <option value={100}>All published projects</option>
                    </select>
                  </label>
                  <button className="outline-action" type="submit" style={{ height: 32 }}>
                    Update Count
                  </button>
                </div>
              </form>
            </div>

            {/* Project List */}
            {filteredProjects.length === 0 ? (
              <p className="admin-feedback">No projects match the current search / filter.</p>
            ) : (
              <div className="admin-projects">
                {filteredProjects.map((project) => {
                  const actualIndex = projects.findIndex((p) => p.slug === project.slug);
                  return (
                    <ProjectEditor
                      key={project.slug}
                      project={project}
                      disabled={disabled}
                      index={actualIndex}
                      total={projects.length}
                    />
                  );
                })}
              </div>
            )}

            {/* New Project Form */}
            <details className="admin-new">
              <summary>+ Add New Project</summary>
              <ProjectEditor
                project={newProjectTemplate(projects.length + 1)}
                disabled={disabled}
                isNew
              />
            </details>
          </div>
        );
      })()}

      {/* ========================================================
          TAB 3: SKILLS
          ======================================================== */}
      {activeTab === "skills" && (
        <div>
          <div className="admin-card">
            <h2 className="admin-card__title">Skills &amp; Technologies</h2>
            <p className="admin-card__subtitle">
              Manage skill categories and tags displayed on the home page and resume.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {skills.map((skillGroup) => (
                <details key={skillGroup.id} className="admin-project" open>
                  <summary>
                    <span>
                      {skillGroup.number} / {skillGroup.group}
                    </span>
                    <small>{skillGroup.items.length} items</small>
                  </summary>

                  <form action={saveSkillGroup} className="admin-form">
                    <input type="hidden" name="id" value={skillGroup.id} />
                    <fieldset disabled={disabled}>
                      <div className="admin-fields" style={{ marginBottom: 10 }}>
                        <label>
                          Number / ID
                          <input name="number" defaultValue={skillGroup.number} required />
                        </label>
                        <label>
                          Category Name
                          <input name="group" defaultValue={skillGroup.group} required />
                        </label>
                        <label className="admin-wide">
                          Skill Chips (Comma-separated)
                          <input
                            name="items"
                            defaultValue={skillGroup.items.join(", ")}
                            placeholder="Python, React, TypeScript, Node.js"
                            required
                          />
                        </label>
                        <label>
                          Display Order
                          <input
                            name="order"
                            type="number"
                            defaultValue={skillGroup.order}
                            min={0}
                          />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button className="outline-action" type="submit">
                          Save Group
                        </button>
                      </div>
                    </fieldset>
                  </form>

                  <div className="admin-secondary">
                    <form action={deleteSkillGroup}>
                      <input type="hidden" name="id" value={skillGroup.id} />
                      <button disabled={disabled} className="admin-delete">
                        Delete Group
                      </button>
                    </form>
                  </div>
                </details>
              ))}
            </div>

            <details className="admin-new" style={{ marginTop: 20 }}>
              <summary>+ Add New Skill Category</summary>
              <form action={saveSkillGroup} className="admin-form" style={{ padding: 12 }}>
                <input type="hidden" name="id" value="" />
                <fieldset disabled={disabled}>
                  <div className="admin-fields" style={{ marginBottom: 10 }}>
                    <label>
                      Number
                      <input
                        name="number"
                        defaultValue={String(skills.length + 1).padStart(2, "0")}
                        required
                      />
                    </label>
                    <label>
                      Category Group Name
                      <input name="group" placeholder="e.g. Cloud & DevOps" required />
                    </label>
                    <label className="admin-wide">
                      Skill Items (Comma-separated)
                      <input
                        name="items"
                        placeholder="Docker, Kubernetes, AWS, Terraform"
                        required
                      />
                    </label>
                    <label>
                      Order
                      <input name="order" type="number" defaultValue={skills.length} min={0} />
                    </label>
                  </div>
                  <button className="outline-action" type="submit">
                    Create Skill Category
                  </button>
                </fieldset>
              </form>
            </details>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: EXPERIENCE & EDUCATION
          ======================================================== */}
      {activeTab === "experience" && (
        <div>
          {/* Work Experiences */}
          <div className="admin-card">
            <h2 className="admin-card__title">Work Experience</h2>
            <p className="admin-card__subtitle">Roles, internships, and company achievements.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {experiences
                .filter((e) => e.type === "experience")
                .map((item) => (
                  <ExperienceEditor key={item.id} item={item} disabled={disabled} />
                ))}
            </div>

            <details className="admin-new" style={{ marginTop: 14 }}>
              <summary>+ Add Work Experience</summary>
              <ExperienceEditor
                item={{
                  id: "new-exp",
                  organization: "",
                  role: "",
                  location: "",
                  dates: "",
                  status: "Active",
                  type: "experience",
                  bullets: [],
                  stack: [],
                  order: experiences.length,
                }}
                disabled={disabled}
                isNew
              />
            </details>
          </div>

          {/* Education */}
          <div className="admin-card">
            <h2 className="admin-card__title">Education</h2>
            <p className="admin-card__subtitle">University degrees, certifications, and schooling.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {experiences
                .filter((e) => e.type === "education")
                .map((item) => (
                  <ExperienceEditor key={item.id} item={item} disabled={disabled} />
                ))}
            </div>

            <details className="admin-new" style={{ marginTop: 14 }}>
              <summary>+ Add Education Entry</summary>
              <ExperienceEditor
                item={{
                  id: "new-edu",
                  organization: "",
                  role: "",
                  location: "",
                  dates: "",
                  status: "Education",
                  type: "education",
                  bullets: [],
                  stack: [],
                  order: experiences.length,
                }}
                disabled={disabled}
                isNew
              />
            </details>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: CONNECTS & SOCIALS
          ======================================================== */}
      {activeTab === "connects" && (
        <section className="admin-card">
          <h2 className="admin-card__title">Connects &amp; Social Links</h2>
          <p className="admin-card__subtitle">
            Manage public links (GitHub, LinkedIn, Twitter/X, Instagram, YouTube, Discord, Email, etc.).
          </p>

          <form action={saveSiteProfile} className="admin-form">
            <input type="hidden" name="tab" value="connects" />
            <input type="hidden" name="name" value={profile.name} />
            <input type="hidden" name="location" value={profile.location} />
            <input type="hidden" name="roleLine" value={profile.roleLine} />
            <input type="hidden" name="bannerText" value={profile.bannerText} />
            <input type="hidden" name="pfp1" value={profile.pfp1} />
            <input type="hidden" name="pfp2" value={profile.pfp2} />
            <input type="hidden" name="roleTitles" value={profile.roleTitles.join("\n")} />
            <input type="hidden" name="about" value={profile.about.join("\n\n")} />
            <input type="hidden" name="quote" value={profile.quote} />
            <input type="hidden" name="quoteAuthor" value={profile.quoteAuthor} />
            <input type="hidden" name="resumeUrl" value={profile.resumeUrl} />
            <input type="hidden" name="homeProjectCount" value={profile.homeProjectCount} />
            <input type="hidden" name="supportCoffee" value={profile.support.coffee ?? ""} />
            <input type="hidden" name="supportGithub" value={profile.support.github ?? ""} />
            <input type="hidden" name="supportUpi" value={profile.support.upi ?? ""} />
            <input type="hidden" name="supportQr" value={profile.support.qr ?? ""} />
            <input type="hidden" name="supportNote" value={profile.support.note ?? ""} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {socials.map((link, idx) => (
                <div key={idx} className="admin-social-row">
                  <input
                    value={link.name}
                    onChange={(e) => {
                      const updated = [...socials];
                      updated[idx].name = e.target.value;
                      setSocials(updated);
                    }}
                    placeholder="Platform"
                    style={{
                      height: 32,
                      padding: "0 8px",
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <input
                    value={link.href}
                    onChange={(e) => {
                      const updated = [...socials];
                      updated[idx].href = e.target.value;
                      setSocials(updated);
                    }}
                    placeholder="https://..."
                    style={{
                      height: 32,
                      padding: "0 8px",
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <input
                    value={link.detail || ""}
                    onChange={(e) => {
                      const updated = [...socials];
                      updated[idx].detail = e.target.value;
                      setSocials(updated);
                    }}
                    placeholder="@handle"
                    style={{
                      height: 32,
                      padding: "0 8px",
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <button
                    type="button"
                    className="dynamic-item-remove"
                    onClick={() => removeSocial(idx)}
                    title="Remove link"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button type="button" className="dynamic-add-btn" onClick={addSocial}>
                <Plus size={13} /> Add Social Link
              </button>

              <input type="hidden" name="socials" value={JSON.stringify(socials)} />

              <div style={{ marginTop: 18 }}>
                <button className="outline-action" type="submit">
                  Save Connects
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================
          TAB 6: QUOTE BLOCK
          ======================================================== */}
      {activeTab === "quote" && (
        <section className="admin-card">
          <h2 className="admin-card__title">Quote / Motto Block</h2>
          <p className="admin-card__subtitle">
            This quote block displays right below the GitHub section on both visitor and admin pages.
          </p>

          <form action={saveSiteProfile} className="admin-form">
            <input type="hidden" name="tab" value="quote" />
            <input type="hidden" name="name" value={profile.name} />
            <input type="hidden" name="location" value={profile.location} />
            <input type="hidden" name="roleLine" value={profile.roleLine} />
            <input type="hidden" name="bannerText" value={profile.bannerText} />
            <input type="hidden" name="pfp1" value={profile.pfp1} />
            <input type="hidden" name="pfp2" value={profile.pfp2} />
            <input type="hidden" name="roleTitles" value={profile.roleTitles.join("\n")} />
            <input type="hidden" name="about" value={profile.about.join("\n\n")} />
            <input type="hidden" name="socials" value={JSON.stringify(profile.socials)} />
            <input type="hidden" name="resumeUrl" value={profile.resumeUrl} />
            <input type="hidden" name="homeProjectCount" value={profile.homeProjectCount} />
            <input type="hidden" name="supportCoffee" value={profile.support.coffee ?? ""} />
            <input type="hidden" name="supportGithub" value={profile.support.github ?? ""} />
            <input type="hidden" name="supportUpi" value={profile.support.upi ?? ""} />
            <input type="hidden" name="supportQr" value={profile.support.qr ?? ""} />
            <input type="hidden" name="supportNote" value={profile.support.note ?? ""} />

            <div className="admin-fields">
              <label className="admin-wide">
                Quote Text
                <textarea
                  name="quote"
                  defaultValue={profile.quote}
                  rows={3}
                  style={{
                    padding: 8,
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                  required
                />
              </label>
              <label>
                Quote Attribution / Author
                <input name="quoteAuthor" defaultValue={profile.quoteAuthor} />
              </label>
            </div>

            <div style={{ marginTop: 18 }}>
              <button className="outline-action" type="submit">
                Save Quote Block
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 11, font: "10px var(--font-geist-mono)", color: "hsl(var(--muted-foreground))" }}>
              LIVE PREVIEW (AS SEEN BY VISITORS):
            </h3>
            <div className="home-quote-block">
              <p className="home-quote-text">{profile.quote}</p>
              <cite className="home-quote-author">— {profile.quoteAuthor || profile.name}</cite>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 7: RESUME & SUPPORT
          ======================================================== */}
      {activeTab === "support" && (
        <div>
          {/* Resume Document Upload */}
          <section className="admin-card">
            <h2 className="admin-card__title">Resume Document</h2>
            <p className="admin-card__subtitle">
              Upload your resume (PDF or document) for visitors to view or download directly from the website.
            </p>

            <form action={saveSiteProfile} className="admin-form">
              <input type="hidden" name="tab" value="support" />
              <input type="hidden" name="name" value={profile.name} />
              <input type="hidden" name="location" value={profile.location} />
              <input type="hidden" name="roleLine" value={profile.roleLine} />
              <input type="hidden" name="bannerText" value={profile.bannerText} />
              <input type="hidden" name="pfp1" value={profile.pfp1} />
              <input type="hidden" name="pfp2" value={profile.pfp2} />
              <input type="hidden" name="roleTitles" value={profile.roleTitles.join("\n")} />
              <input type="hidden" name="about" value={profile.about.join("\n\n")} />
              <input type="hidden" name="quote" value={profile.quote} />
              <input type="hidden" name="quoteAuthor" value={profile.quoteAuthor} />
              <input type="hidden" name="socials" value={JSON.stringify(profile.socials)} />
              <input type="hidden" name="homeProjectCount" value={profile.homeProjectCount} />
              <input type="hidden" name="supportCoffee" value={profile.support.coffee ?? ""} />
              <input type="hidden" name="supportGithub" value={profile.support.github ?? ""} />
              <input type="hidden" name="supportUpi" value={profile.support.upi ?? ""} />
              <input type="hidden" name="supportQr" value={profile.support.qr ?? ""} />
              <input type="hidden" name="supportNote" value={profile.support.note ?? ""} />

              <FileUploader
                name="resumeUrl"
                defaultValue={profile.resumeUrl}
                label="Resume Document File (PDF or Link)"
                accept="application/pdf,.doc,.docx"
                placeholder="Upload PDF or paste Google Drive / Dropbox link"
              />

              <div style={{ marginTop: 14 }}>
                <button className="outline-action" type="submit">
                  Save Resume File
                </button>
              </div>
            </form>
          </section>

          {/* Support / Payment / QR Options */}
          <section className="admin-card">
            <h2 className="admin-card__title">Support &amp; Sponsorship Details</h2>
            <p className="admin-card__subtitle">
              Configure payment links, UPI handle, and barcode/QR code image for the /support page.
            </p>

            <form action={saveSiteProfile} className="admin-form">
              <input type="hidden" name="tab" value="support" />
              <input type="hidden" name="name" value={profile.name} />
              <input type="hidden" name="location" value={profile.location} />
              <input type="hidden" name="roleLine" value={profile.roleLine} />
              <input type="hidden" name="bannerText" value={profile.bannerText} />
              <input type="hidden" name="pfp1" value={profile.pfp1} />
              <input type="hidden" name="pfp2" value={profile.pfp2} />
              <input type="hidden" name="roleTitles" value={profile.roleTitles.join("\n")} />
              <input type="hidden" name="about" value={profile.about.join("\n\n")} />
              <input type="hidden" name="quote" value={profile.quote} />
              <input type="hidden" name="quoteAuthor" value={profile.quoteAuthor} />
              <input type="hidden" name="socials" value={JSON.stringify(profile.socials)} />
              <input type="hidden" name="homeProjectCount" value={profile.homeProjectCount} />
              <input type="hidden" name="resumeUrl" value={profile.resumeUrl} />

              <div className="admin-fields">
                <label>
                  Buy Me a Coffee Link
                  <input
                    name="supportCoffee"
                    defaultValue={profile.support.coffee ?? ""}
                    placeholder="https://buymeacoffee.com/..."
                  />
                </label>
                <label>
                  GitHub Sponsors Link
                  <input
                    name="supportGithub"
                    defaultValue={profile.support.github ?? ""}
                    placeholder="https://github.com/sponsors/..."
                  />
                </label>
                <label className="admin-wide">
                  UPI ID (e.g. yourname@okaxis)
                  <input
                    name="supportUpi"
                    defaultValue={profile.support.upi ?? ""}
                    placeholder="username@upi"
                  />
                </label>
              </div>

              <div style={{ marginTop: 14 }}>
                <FileUploader
                  name="supportQr"
                  defaultValue={profile.support.qr ?? ""}
                  label="UPI Barcode / QR Code Image (Screenshot / File)"
                  accept="image/*"
                  placeholder="Upload UPI QR image or paste image link"
                />
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ display: "grid", gap: 5, font: "10px var(--font-geist-mono)", color: "hsl(var(--muted-foreground))" }}>
                  Custom Support Message / Wallet Note
                  <textarea
                    name="supportNote"
                    defaultValue={profile.support.note ?? ""}
                    rows={2}
                    style={{
                      padding: 8,
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                    placeholder="Thank you for supporting open source work!"
                  />
                </label>
              </div>

              <div style={{ marginTop: 18 }}>
                <button className="outline-action" type="submit">
                  Save Support Details
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

/* ========================================================
   SUB-COMPONENT: PROJECT EDITOR
   ======================================================== */

function ProjectEditor({
  project,
  disabled,
  isNew = false,
  index = 0,
  total = 1,
}: {
  project: Project;
  disabled: boolean;
  isNew?: boolean;
  index?: number;
  total?: number;
}) {
  return (
    <details open={isNew} className={`admin-project${isNew ? " admin-project--new" : ""}`}>
      <summary style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {!isNew && (
            <span className="project-rank-badge" title={`Project position #${index + 1} of ${total}`}>
              #{index + 1} {index === 0 ? "· TOP" : index === total - 1 ? "· BOTTOM" : ""}
            </span>
          )}

          {project.cover && (
            <span className="project-thumb-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.cover} alt="" />
            </span>
          )}

          <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.title || "New Project Draft"}
          </span>

          <small style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {project.featured && <span style={{ color: "hsl(var(--accent))" }}>★ FEATURED</span>}
            <span style={{ color: project.published ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
              {project.published ? "PUBLISHED" : "DRAFT"}
            </span>
            <span className={`status status--${project.status}`}>{project.status}</span>
          </small>
        </div>

        {!isNew && (
          <div
            className="project-reorder-group"
            onClick={(e) => e.stopPropagation()}
            style={{ marginLeft: 8 }}
          >
            <form action={moveProject} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={project.slug} />
              <input type="hidden" name="direction" value="top" />
              <button
                className="project-reorder-btn"
                disabled={disabled || index === 0}
                title="Move to very Top"
                type="submit"
              >
                <ChevronsUp size={13} />
              </button>
            </form>
            <form action={moveProject} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={project.slug} />
              <input type="hidden" name="direction" value="up" />
              <button
                className="project-reorder-btn"
                disabled={disabled || index === 0}
                title="Move Up one spot"
                type="submit"
              >
                <ArrowUp size={13} />
              </button>
            </form>
            <form action={moveProject} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={project.slug} />
              <input type="hidden" name="direction" value="down" />
              <button
                className="project-reorder-btn"
                disabled={disabled || index === total - 1}
                title="Move Down one spot"
                type="submit"
              >
                <ArrowDown size={13} />
              </button>
            </form>
            <form action={moveProject} style={{ display: "inline" }}>
              <input type="hidden" name="slug" value={project.slug} />
              <input type="hidden" name="direction" value="bottom" />
              <button
                className="project-reorder-btn"
                disabled={disabled || index === total - 1}
                title="Move to very Bottom"
                type="submit"
              >
                <ChevronsDown size={13} />
              </button>
            </form>
          </div>
        )}
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
              Live Demo Link
              <input
                name="live"
                defaultValue={project.links.live ?? ""}
                placeholder="https://... or /route"
              />
            </label>
            <label>
              GitHub Link
              <input
                name="github"
                defaultValue={project.links.github ?? ""}
                placeholder="https://github.com/..."
              />
            </label>
            <label>
              Order (Display rank)
              <input name="order" type="number" min="0" max="10000" defaultValue={project.order} />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <FileUploader
              name="cover"
              defaultValue={project.cover ?? ""}
              label="Project Screenshot / Cover Image"
              accept="image/*"
              placeholder="Upload screenshot or paste image URL"
            />
          </div>

          <div className="admin-checks">
            <label>
              <input name="featured" type="checkbox" defaultChecked={project.featured} /> Show on
              Homepage (Featured)
            </label>
            <label>
              <input name="published" type="checkbox" defaultChecked={project.published} /> Published
            </label>
          </div>

          <button className="outline-action" type="submit">
            {isNew ? "Create Project" : "Save Project Changes"}
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
          <form action={updateProjectState}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="field" value="featured" />
            <input type="hidden" name="value" value={project.featured ? "false" : "true"} />
            <button disabled={disabled}>
              {project.featured ? "Remove from Featured" : "Mark as Featured"}
            </button>
          </form>
          <form action={updateProjectOrder}>
            <input type="hidden" name="slug" value={project.slug} />
            <label>
              Set order
              <input name="order" type="number" min="0" max="10000" defaultValue={project.order} />
            </label>
            <button disabled={disabled}>Update order</button>
          </form>
          <form
            action={deleteProject}
            onSubmit={(e) => {
              if (!confirm(`Are you sure you want to delete project "${project.title}"?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="slug" value={project.slug} />
            <button disabled={disabled} className="admin-delete">
              Delete Project
            </button>
          </form>
        </div>
      )}
    </details>
  );
}

/* ========================================================
   SUB-COMPONENT: EXPERIENCE EDITOR
   ======================================================== */

function ExperienceEditor({
  item,
  disabled,
  isNew = false,
}: {
  item: ExperienceData;
  disabled: boolean;
  isNew?: boolean;
}) {
  return (
    <details open={isNew} className={`admin-project${isNew ? " admin-project--new" : ""}`}>
      <summary>
        <span>
          {item.organization || "New Entry"} — {item.role}
        </span>
        <small>
          {item.dates} · {item.type.toUpperCase()}
        </small>
      </summary>

      <form action={saveExperience} className="admin-form">
        <input type="hidden" name="id" value={isNew ? "" : item.id} />
        <fieldset disabled={disabled}>
          <div className="admin-fields">
            <label>
              Type
              <select name="type" defaultValue={item.type}>
                <option value="experience">Work Experience / Internship</option>
                <option value="education">Education / Degree</option>
              </select>
            </label>
            <label>
              Organization / University
              <input name="organization" defaultValue={item.organization} required />
            </label>
            <label>
              Role / Degree
              <input
                name="role"
                defaultValue={item.role}
                placeholder="e.g. Full Stack Developer or B.Tech CSE"
                required
              />
            </label>
            <label>
              Dates
              <input
                name="dates"
                defaultValue={item.dates}
                placeholder="e.g. Jun 2025 – Present"
                required
              />
            </label>
            <label>
              Location
              <input
                name="location"
                defaultValue={item.location}
                placeholder="e.g. Remote or Lucknow"
              />
            </label>
            <label>
              Status Tag
              <input
                name="status"
                defaultValue={item.status}
                placeholder="Active, Done, Education..."
              />
            </label>
            <label>
              Display Order
              <input name="order" type="number" defaultValue={item.order} min={0} />
            </label>
            <label>
              Tech Stack (Comma-separated)
              <input
                name="stack"
                defaultValue={item.stack.join(", ")}
                placeholder="React, Node.js, MongoDB"
              />
            </label>
            <label className="admin-wide">
              Key Responsibilities / Bullet Points (One per line)
              <textarea
                name="bullets"
                defaultValue={item.bullets.join("\n")}
                rows={3}
                style={{
                  padding: 8,
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  fontSize: 11,
                }}
                placeholder="One accomplishment or bullet per line..."
              />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="outline-action" type="submit">
              {isNew ? "Create Entry" : "Save Entry Changes"}
            </button>
          </div>
        </fieldset>
      </form>

      {!isNew && (
        <div className="admin-secondary">
          <form action={deleteExperience}>
            <input type="hidden" name="id" value={item.id} />
            <button disabled={disabled} className="admin-delete">
              Delete Entry
            </button>
          </form>
        </div>
      )}
    </details>
  );
}

function newProjectTemplate(order: number): Project {
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
    featured: true,
    order,
    published: true,
  };
}
