export const projects = [
  {
    name: "PlaylistPilot",
    status: "Live",
    category: ["fullstack"],
    badge: "100+ video playlists",
    tagline: "Turns YouTube playlists into daily study plans.",
    stack: ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
    problem: "No tool plans 100+ video playlists around your speed and time.",
    built: "Greedy scheduling algorithm plus Markdown export.",
    live: "[URL]", // TODO: replace [URL]
    github: "[URL]", // TODO: replace [URL]
  },
  {
    name: "System Monitoring Dashboard",
    status: "Live",
    category: ["fullstack"],
    badge: "400+ machines",
    tagline: "Query 400+ networked machines from one dashboard.",
    stack: ["PHP", "MySQL", "JavaScript", "Charts"],
    problem: "Admins tracked hardware and software by hand.",
    built: "Remote querying with load and performance charts.",
    github: "[URL]", // TODO: replace [URL]
  },
  {
    name: "AI Document Processor",
    status: "Live",
    category: ["ai"],
    tagline: "Turns messy documents into clean JSON.",
    stack: ["Python", "OpenAI API", "Gemini API", "Prompt Engineering"],
    problem: "Manual data extraction is slow and error-prone.",
    built: "Strict JSON parsing with fallback sanitization.",
    github: "[URL]", // TODO: replace [URL]
  },
  {
    name: "Nishank AI",
    status: "Building",
    category: ["ai", "fullstack"],
    tagline: "Chat with an AI version of me.",
    stack: ["Next.js", "TypeScript", "LLM API"],
    live: "/chat",
    github: "[URL]", // TODO: replace [URL]
  },
] as const;
