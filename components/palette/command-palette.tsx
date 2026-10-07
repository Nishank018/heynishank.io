"use client";

import { Command } from "cmdk";
import {
  ArrowRight,
  Laptop,
  Moon,
  Search,
  Sun,
  Github,
  Linkedin,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects";
import { siteContent } from "@/content/site";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { setTheme } = useTheme();
  const router = useRouter();
  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="search-pill"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" size={14} />
        <span>Search</span>
        <kbd>Ctrl K</kbd>
      </button>
      {open ? (
        <div
          className="command-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div aria-label="Command menu" aria-modal="true" className="command-dialog" role="dialog">
            <Command label="Portfolio commands">
              <div className="command-input-wrap">
                <Search aria-hidden="true" size={16} />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search pages, projects, or start a conversation…"
                />
                <kbd>ESC</kbd>
              </div>
              <Command.List>
                <Command.Empty>No commands found.</Command.Empty>
                <Command.Group heading="Navigate">
                  {[
                    ["Home", "/"],
                    ["Projects", "/projects"],
                    ["Resume", "/resume"],
                    ["Uses", "/uses"],
                    ["Analytics", "/analytics"],
                    ["Support", "/support"],
                    ["Contact", "/contact"],
                    ["AI engineering stack", "/#stack"],
                    ["Chat prototype", "/chat"],
                  ].map(([label, href]) => (
                    <Command.Item
                      key={href}
                      onSelect={() => navigate(href)}
                      value={`${label} ${href}`}
                    >
                      <ArrowRight aria-hidden="true" size={15} /> {label}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="Projects">
                  {projects.map((project) => (
                    <Command.Item
                      key={project.slug}
                      onSelect={() => navigate(`/projects/${project.slug}`)}
                      value={`${project.title} ${project.tagline}`}
                    >
                      <ArrowRight aria-hidden="true" size={15} /> {project.title}
                    </Command.Item>
                  ))}
                </Command.Group>
                {query.trim().length > 0 && (
                  <Command.Group heading="Ask portfolio chat">
                    <Command.Item
                      value={`Ask AI ${query}`}
                      onSelect={() => navigate(`/chat?q=${encodeURIComponent(query.trim())}`)}
                    >
                      <ArrowRight aria-hidden="true" size={15} /> Ask: “{query.trim()}”
                    </Command.Item>
                  </Command.Group>
                )}
                <Command.Group heading="Socials">
                  <Command.Item
                    onSelect={() => {
                      window.open(
                        `https://github.com/${siteContent.handles.github}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      setOpen(false);
                    }}
                    value="GitHub"
                  >
                    <Github aria-hidden="true" size={15} /> GitHub <ArrowUpRight size={12} />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      window.open(
                        `https://linkedin.com/in/${siteContent.handles.linkedin}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      setOpen(false);
                    }}
                    value="LinkedIn"
                  >
                    <Linkedin aria-hidden="true" size={15} /> LinkedIn <ArrowUpRight size={12} />
                  </Command.Item>
                </Command.Group>
                <Command.Group heading="Theme">
                  <Command.Item
                    onSelect={() => {
                      setTheme("light");
                      setOpen(false);
                    }}
                    value="Light theme"
                  >
                    <Sun aria-hidden="true" size={15} /> Light
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setTheme("dark");
                      setOpen(false);
                    }}
                    value="Dark theme"
                  >
                    <Moon aria-hidden="true" size={15} /> Dark
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setTheme("system");
                      setOpen(false);
                    }}
                    value="System theme"
                  >
                    <Laptop aria-hidden="true" size={15} /> System
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      ) : null}
    </>
  );
}
