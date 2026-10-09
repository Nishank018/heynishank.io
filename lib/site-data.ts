import { asc, eq } from "drizzle-orm";
import { siteContent as fallbackSite } from "@/content/site";
import { experience as fallbackExperience } from "@/content/experience";
import { skills as fallbackSkills } from "@/content/skills";
import { getDb } from "@/lib/db";
import {
  experiences,
  siteProfile,
  skillGroups,
  type SocialLink,
  type SupportConfig,
} from "@/lib/db/schema";

export type SiteProfileData = {
  id: string;
  name: string;
  location: string;
  roleLine: string;
  bannerText: string;
  roleTitles: string[];
  pfp1: string;
  pfp2: string;
  about: string[];
  quote: string;
  quoteAuthor: string;
  resumeUrl: string;
  homeProjectCount: number;
  socials: SocialLink[];
  support: SupportConfig;
};

export type ExperienceData = {
  id: string;
  organization: string;
  role: string;
  location: string;
  dates: string;
  status: string;
  type: "experience" | "education";
  bullets: string[];
  stack: string[];
  order: number;
};

export type SkillGroupData = {
  id: string;
  number: string;
  group: string;
  items: string[];
  order: number;
};

export async function getSiteProfile(): Promise<SiteProfileData> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(siteProfile)
        .where(eq(siteProfile.id, "default"))
        .limit(1);

      if (row) {
        return {
          id: row.id,
          name: row.name,
          location: row.location,
          roleLine: row.roleLine,
          bannerText: row.bannerText,
          roleTitles:
            Array.isArray(row.roleTitles) && row.roleTitles.length > 0
              ? row.roleTitles
                  .flatMap((item) =>
                    typeof item === "string" ? item.split(/\r?\n+/) : [],
                  )
                  .map((s) => s.trim())
                  .filter(Boolean)
              : ["AI Engineer in training", "Full-stack developer", "23 · Builder"],
          pfp1: row.pfp1 || "/profile.png",
          pfp2: row.pfp2 || "/profile-real.jpg",
          about: (() => {
            if (Array.isArray(row.about)) {
              const cleaned = row.about
                .flatMap((item) =>
                  typeof item === "string" ? item.split(/\r?\n+/) : [],
                )
                .map((s) => s.trim())
                .filter(Boolean);
              if (cleaned.length > 0) return cleaned;
            }
            return [...fallbackSite.about];
          })(),
          quote:
            row.quote ??
            "“Code is read much more often than it is written, so plan for clarity, ship with discipline, and build things that genuinely help people.”",
          quoteAuthor: row.quoteAuthor ?? "Nishank Gupta",
          resumeUrl: row.resumeUrl ?? "",
          homeProjectCount: row.homeProjectCount ?? 4,
          socials: Array.isArray(row.socials) ? row.socials : [],
          support: row.support || {},
        };
      }
    } catch (err) {
      console.error("Error reading siteProfile from database:", err);
    }
  }

  // Fallback if DB is unavailable or table is uninitialized
  return {
    id: "default",
    name: fallbackSite.name,
    location: fallbackSite.location,
    roleLine: fallbackSite.roleLine,
    bannerText: fallbackSite.bannerText,
    roleTitles: ["AI Engineer in training", "Full-stack developer", "23 · Builder"],
    pfp1: "/profile.png",
    pfp2: "/profile-real.jpg",
    about: [...fallbackSite.about],
    quote:
      "“Code is read much more often than it is written, so plan for clarity, ship with discipline, and build things that genuinely help people.”",
    quoteAuthor: "Nishank Gupta",
    resumeUrl: "",
    homeProjectCount: 4,
    socials: [
      {
        name: "GitHub",
        href: `https://github.com/${fallbackSite.handles.github}`,
        detail: `@${fallbackSite.handles.github}`,
      },
      {
        name: "LinkedIn",
        href: `https://linkedin.com/in/${fallbackSite.handles.linkedin}`,
        detail: fallbackSite.handles.linkedin,
      },
    ],
    support: {},
  };
}

export async function getExperiences(): Promise<ExperienceData[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(experiences).orderBy(asc(experiences.order));
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          organization: r.organization,
          role: r.role,
          location: r.location ?? "",
          dates: r.dates,
          status: r.status,
          type: (r.type as "experience" | "education") || "experience",
          bullets: Array.isArray(r.bullets) ? r.bullets : [],
          stack: Array.isArray(r.stack) ? r.stack : [],
          order: r.order,
        }));
      }
    } catch (err) {
      console.error("Error reading experiences from database:", err);
    }
  }

  return fallbackExperience.map((item, idx) => ({
    id: `fallback-${idx}`,
    organization: item.organization,
    role: item.role,
    location: item.location,
    dates: item.dates,
    status: item.status,
    type: item.status === "Education" ? "education" : "experience",
    bullets: [...item.bullets],
    stack: [...item.stack],
    order: idx,
  }));
}

export async function getSkillGroups(): Promise<SkillGroupData[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(skillGroups).orderBy(asc(skillGroups.order));
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          number: r.number,
          group: r.group,
          items: Array.isArray(r.items) ? r.items : [],
          order: r.order,
        }));
      }
    } catch (err) {
      console.error("Error reading skillGroups from database:", err);
    }
  }

  return fallbackSkills.map((item, idx) => ({
    id: `fallback-${idx}`,
    number: item.number,
    group: item.group,
    items: [...item.items],
    order: idx,
  }));
}
