import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";

export function InnerPage({
  route,
  title,
  subtitle,
  children,
  action,
}: {
  route: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <main className="inner-main">
      <Container>
        <div className="route-label">[ /{route} ]</div>
        <h1 className="inner-title">{title}</h1>
        <p className="inner-subtitle">{subtitle}</p>
        <div className="inner-content">{children}</div>
        <div className="inner-actions">
          <Link href="/" className="text-action">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          {action ? (
            action.href ? (
              <Link className="text-action" href={action.href}>
                {action.label} <ArrowUpRight size={14} />
              </Link>
            ) : (
              <button className="text-action" onClick={action.onClick}>
                {action.label} <ArrowUpRight size={14} />
              </button>
            )
          ) : null}
        </div>
      </Container>
    </main>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
