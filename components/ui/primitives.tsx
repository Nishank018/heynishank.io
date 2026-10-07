import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

type WrapperProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function Container({ className = "", ...props }: WrapperProps) {
  return <div className={`container ${className}`.trim()} {...props} />;
}

export function GridLines({ className = "", ...props }: WrapperProps) {
  return <div className={`grid-lines ${className}`.trim()} {...props} />;
}

export function HatchDivider({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`hatch-divider ${className}`.trim()} />;
}

export function SectionTitle({
  title,
  eyebrow,
  description,
  id,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  id?: string;
}) {
  return (
    <header className="section-title" id={id}>
      {eyebrow ? <span className="section-title__eyebrow">{eyebrow}</span> : null}
      <div className="section-title__row">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div aria-hidden="true" className="section-title__rule" />
    </header>
  );
}

export function BracketLabel({ children }: { children: ReactNode }) {
  return <span className="bracket-label">[ {children} ]</span>;
}

export function DashedCard({ className = "", ...props }: WrapperProps) {
  return <div className={`dashed-card ${className}`.trim()} {...props} />;
}

export function PillButton({
  children,
  href,
  className = "",
  icon,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span>{children}</span>
      {icon ? (
        <span aria-hidden="true" className="pill-button__icon">
          {icon}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link className={`pill-button ${className}`.trim()} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`pill-button ${className}`.trim()} onClick={onClick} type="button">
      {content}
    </button>
  );
}

export type Status = "live" | "active" | "building" | "done" | "archived";

export function StatusBadge({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true" className="status-badge__dot" />
      {children}
    </span>
  );
}

export function Chip({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="chip">
      {icon ? (
        <span aria-hidden="true" className="chip__icon">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
