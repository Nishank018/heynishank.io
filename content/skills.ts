export const skills = [
  { number: "01", group: "Language", items: ["Python", "JavaScript", "C++", "C", "SQL", "PHP"] },
  // TODO: Tailwind // CONFIRM before adding it to the visible list.
  { number: "02", group: "Frontend", items: ["React", "HTML", "CSS"] },
  {
    number: "03",
    group: "Backend & Database",
    items: ["Node.js", "Express", "MongoDB", "MySQL", "REST APIs"],
  },
  {
    number: "04",
    group: "AI / ML",
    items: ["LLM APIs (OpenAI, Gemini)", "Prompt Engineering", "Structured Outputs"],
  },
  {
    number: "05",
    group: "Workflow & Tools",
    items: ["Git", "GitHub", "Linux", "Postman", "Vercel"],
  },
] as const;
// Learning group // CONFIRM: intentionally left blank until Nishank supplies it.
