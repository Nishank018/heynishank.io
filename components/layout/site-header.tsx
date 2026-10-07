"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/palette/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Resume", href: "/resume" },
    { label: "Analytics", href: "/analytics" },
    { label: "Support", href: "/support" },
  ];

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 80) {
        setHidden(false);
      } else if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setHidden(currentScrollY > lastScrollY);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header className={`site-header${hidden ? " site-header--hidden" : ""}`}>
      <Link aria-label="Home" className="wordmark" href="/">
        Nishank Gupta
      </Link>
      <nav aria-label="Main navigation" className="main-nav">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`main-nav__link${active ? " main-nav__link--active" : ""}`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <CommandPalette />
        <ThemeToggle />
      </div>
    </header>
  );
}
