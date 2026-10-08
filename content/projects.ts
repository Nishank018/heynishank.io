import { z } from "zod";

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
const httpsUrl = z.string().url().refine(isHttpsUrl, "Use an HTTPS URL.");
const publicLink = z
  .string()
  .refine(
    (value) => (value.startsWith("/") && !value.startsWith("//")) || isHttpsUrl(value),
    "Use an HTTPS URL or same-site path.",
  );

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(100),
  tagline: z.string().min(1).max(140),
  status: z.enum(["idea", "building", "live", "archived"]),
  categories: z.array(z.enum(["ai", "fullstack", "oss"])).min(1),
  stack: z.array(z.string().min(1).max(40)).max(20),
  summary: z.string().min(1).max(240),
  problem: z.string().min(1).max(240),
  approach: z.string().min(1).max(240),
  result: z.string().max(240).optional(),
  metrics: z
    .array(z.object({ label: z.string().min(1).max(50), value: z.string().min(1).max(50) }))
    .max(8)
    .optional(),
  badge: z.string().max(80).optional(),
  links: z.object({ live: publicLink.optional(), github: httpsUrl.optional() }),
  cover: z.string().max(500).optional(),
  featured: z.boolean(),
  order: z.number().int().nonnegative(),
  published: z.boolean().default(true),
});

export type Project = z.infer<typeof projectSchema>;

export const projects: Project[] = [
  {
    slug: "playlistpilot",
    title: "PlaylistPilot",
    status: "live",
    categories: ["fullstack"],
    tagline: "Turn 50-hour YouTube playlists into 10-day roadmaps.",
    summary:
      "Automated YouTube syllabus engine that transforms any course playlist into a personalized daily study schedule with smart speed calibration.",
    problem:
      "Long educational playlists lack structured pacing and daily scheduling tailored to a learner's available study time.",
    approach:
      "Greedy syllabus scheduling engine in vanilla JavaScript, HTML & CSS with smart speed calibration and local storage.",
    result:
      "Generates structured day-by-day learning roadmaps with instant demo presets for popular engineering courses.",
    stack: ["Vanilla JS", "HTML5", "CSS3", "LocalStorage"],
    links: {
      live: "https://playlist-pilot-chi.vercel.app",
    },
    cover: "/projects/playlistpilot.png",
    badge: "v2.0",
    featured: true,
    order: 1,
    published: true,
  },
  {
    slug: "system-monitoring-dashboard",
    title: "System Monitoring Dashboard",
    status: "live",
    categories: ["fullstack"],
    tagline: "Monitor networked machines from one dashboard.",
    summary: "Remote hardware and software monitoring with performance charts.",
    problem: "Admins tracked hardware and software by hand.",
    approach: "Remote querying with load and performance charts.",
    stack: ["PHP", "MySQL", "JavaScript", "Charts"],
    links: {},
    featured: true,
    order: 2,
    published: true,
  },
  {
    slug: "ai-document-processor",
    title: "AI Document Processor",
    status: "building",
    categories: ["ai"],
    tagline: "An experiment in turning unstructured documents into structured data.",
    summary: "Extracts structured fields from unstructured documents.",
    problem: "Manual data extraction is slow and error-prone.",
    approach: "Strict JSON parsing with fallback sanitization.",
    stack: ["Python", "OpenAI API", "Gemini API"],
    links: {},
    featured: true,
    order: 3,
    published: true,
  },
  {
    slug: "nishank-ai",
    title: "Nishank AI",
    status: "building",
    categories: ["ai", "fullstack"],
    tagline: "A prototype chat interface for exploring my portfolio.",
    summary: "A work-in-progress portfolio assistant using deterministic responses while the AI backend is explored.",
    problem: "Visitors need a quick way to find relevant work and background.",
    approach: "A chat interface with a mock response backend, built as a step toward a portfolio assistant.",
    stack: ["Next.js", "TypeScript"],
    links: { live: "/chat" },
    featured: true,
    order: 4,
    published: true,
  },
].map((project) => projectSchema.parse(project));
