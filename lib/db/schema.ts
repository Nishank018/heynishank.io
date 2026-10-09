import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import type { Project } from "@/content/projects";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const projects = pgTable("projects", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  status: text("status").notNull(),
  categories: text("categories").array().notNull(),
  stack: text("stack").array().notNull(),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  approach: text("approach").notNull(),
  result: text("result"),
  metrics: jsonb("metrics").$type<Project["metrics"]>(),
  badge: text("badge"),
  links: jsonb("links")
    .$type<Project["links"]>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  cover: text("cover"),
  featured: boolean("featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export type SocialLink = {
  name: string;
  href: string;
  detail?: string;
};

export type SupportConfig = {
  coffee?: string;
  github?: string;
  upi?: string;
  qr?: string;
  note?: string;
};

export const siteProfile = pgTable("site_profile", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default("Nishank Gupta"),
  location: text("location").notNull().default("Lucknow, India"),
  roleLine: text("role_line").notNull().default("AI Engineer in training · Full Stack Developer"),
  bannerText: text("banner_text").notNull().default("Open to AI engineering roles"),
  roleTitles: text("role_titles").array().notNull().default(sql`ARRAY['AI Engineer in training', 'Full-stack developer', '23 · Builder']::text[]`),
  pfp1: text("pfp1").notNull().default("/profile.png"),
  pfp2: text("pfp2").notNull().default("/profile-real.jpg"),
  about: text("about").array().notNull().default(sql`ARRAY['Hi, I’m Nishank Gupta, a developer based in Lucknow, India. I like learning by building—taking an idea, working through the rough edges, and turning it into something people can use.', 'My background is in full-stack development. During my internship at DRDO, I worked on a network-monitoring dashboard. At GreenIoMart, I’m planning frontend architecture and mapping a WordPress-to-MERN migration for a green-energy marketplace.', 'These days, I’m moving toward AI engineering by experimenting with LLM APIs and building practical AI applications. I’m still exploring where I want to specialize, and I’m looking for opportunities to keep learning, contribute, and ship useful products.']::text[]`),
  quote: text("quote").default("“Code is read much more often than it is written, so plan for clarity, ship with discipline, and build things that genuinely help people.”"),
  quoteAuthor: text("quote_author").default("Nishank Gupta"),
  resumeUrl: text("resume_url").default(""),
  homeProjectCount: integer("home_project_count").notNull().default(4),
  socials: jsonb("socials").$type<SocialLink[]>().notNull().default(sql`'[]'::jsonb`),
  support: jsonb("support").$type<SupportConfig>().notNull().default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  location: text("location").default(""),
  dates: text("dates").notNull(),
  status: text("status").notNull().default("Active"),
  type: text("type").notNull().default("experience"), // "experience" | "education"
  bullets: text("bullets").array().notNull().default(sql`ARRAY[]::text[]`),
  stack: text("stack").array().notNull().default(sql`ARRAY[]::text[]`),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const skillGroups = pgTable("skill_groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  number: text("number").notNull().default("01"),
  group: text("group").notNull(),
  items: text("items").array().notNull().default(sql`ARRAY[]::text[]`),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

