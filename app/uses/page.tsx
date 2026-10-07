import type { Metadata } from "next";
import { ArrowUpRight, Code2, Database, Globe, Terminal } from "lucide-react";
import { InnerPage } from "@/components/sections/inner-page";

export const metadata: Metadata = {
  title: "Uses — Nishank Gupta",
  description: "Tools and technologies Nishank uses to build software.",
};
const rows = [
  { icon: <Code2 />, title: "Frontend", description: "React · Next.js · HTML · CSS" },
  { icon: <Terminal />, title: "Languages", description: "JavaScript · Python · C++ · C · PHP" },
  {
    icon: <Database />,
    title: "Backend & data",
    description: "Node.js · Express · MongoDB · MySQL · REST APIs",
  },
  { icon: <Globe />, title: "Workflow", description: "Git · GitHub · Linux · Postman · Vercel" },
];
export default function UsesPage() {
  return (
    <InnerPage
      route="uses"
      title="Uses & Setup"
      subtitle="Tools and technologies I use to make things."
    >
      <div className="uses-list">
        {rows.map((row, i) => (
          <div className="uses-row" key={row.title}>
            <span className="uses-index">0{i + 1}</span>
            <span className="uses-icon">{row.icon}</span>
            <span className="uses-copy">
              <b>{row.title}</b>
              <small>{row.description}</small>
            </span>
            <ArrowUpRight size={14} />
          </div>
        ))}
      </div>
      <p className="quiet-note">Physical gear and desk setup details haven’t been added yet.</p>
    </InnerPage>
  );
}
