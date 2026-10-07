import { siteContent } from "@/content/site";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";

export function getKnowledgeBase() {
  return [
    siteContent.name,
    siteContent.location,
    siteContent.roleLine,
    ...siteContent.about,
    ...experience.flatMap((item) => [
      item.organization,
      item.role,
      item.dates,
      ...item.bullets,
      ...item.stack,
    ]),
    ...projects.flatMap((item) => [item.title, item.tagline, item.summary, ...item.stack]),
    ...skills.flatMap((item) => [item.group, ...item.items]),
  ].join("\n");
}
