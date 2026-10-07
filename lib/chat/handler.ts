import { getKnowledgeBase } from "@/lib/knowledge";
import { getProjects } from "@/lib/projects";

export type ChatInputMessage = { role: "user" | "assistant"; content: string };
export type ChatSource = { title: string; url: string };

export async function getMockReply(messages: ChatInputMessage[]) {
  const question = messages.at(-1)?.content.toLowerCase() ?? "";
  const knowledge = getKnowledgeBase();
  const projects = await getProjects();
  const matchedProject = projects.find((project) => question.includes(project.title.toLowerCase()));
  const isContactTask = ["contact", "email", "call", "reach"].some((term) =>
    question.includes(term),
  );
  const reply = isContactTask
    ? "The best next step is the contact form. A booking link has not been configured yet, and I don’t expose personal contact details here."
    : matchedProject
      ? `${matchedProject.title}: ${matchedProject.tagline} Open its case study for the problem, build notes, and stack.`
      : question.includes("project") || question.includes("show me") || question.includes("find")
        ? projects.length
          ? `The public case studies are: ${projects.map((project) => project.title).join(", ")}.`
          : "I’m preparing project case studies for publication. You can explore the portfolio chat prototype while I get those ready."
        : question.includes("open") ||
            question.includes("hire") ||
            question.includes("role") ||
            question.includes("available")
          ? "Nishank is open to AI engineering roles and project conversations. He is based in Lucknow, India."
          : question.includes("experience") || question.includes("work")
            ? "Nishank is a Full Stack Developer at GreenIoMart, planning frontend architecture for a B2B green energy marketplace and mapping a WordPress-to-MERN migration. Previously, he interned at DRDO and built a machine monitoring dashboard."
            : question.includes("stack") || question.includes("skill")
              ? "Nishank works with React, Node.js, Python, JavaScript, MongoDB, MySQL, and LLM APIs from OpenAI and Gemini. His listed workflow tools include Git, GitHub, Linux, Postman, and Vercel."
              : `I can answer questions about Nishank's projects, experience, and skills. ${knowledge.split("\n").slice(0, 3).join(" · ")}`;
  const sources: ChatSource[] = isContactTask
    ? [{ title: "Open contact form", url: "/contact" }]
    : matchedProject
      ? [
          {
            title: `Open ${matchedProject.title}`,
            url: `/projects/${matchedProject.slug}`,
          },
        ]
      : question.includes("resume")
        ? [{ title: "View resume", url: "/resume" }]
        : question.includes("open") ||
            question.includes("hire") ||
            question.includes("role") ||
            question.includes("available")
          ? [{ title: "Contact Nishank", url: "/contact" }]
          : question.includes("experience") || question.includes("work")
            ? [{ title: "Experience", url: "/#experience" }]
            : question.includes("stack") || question.includes("skill")
              ? [{ title: "Skills", url: "/#stack" }]
              : [
                  { title: "Projects", url: "/projects" },
                  { title: "About", url: "/#about" },
                ];

  return { reply, sources };
}
