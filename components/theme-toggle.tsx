"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? Moon : Sun;

  function toggleTheme() {
    if (!mounted) return;

    const applyTheme = () => setTheme(nextTheme);
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("startViewTransition" in document)
    ) {
      applyTheme();
      return;
    }

    document.documentElement.dataset.themeDirection = nextTheme;
    document.startViewTransition(applyTheme);
  }

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      className="icon-button theme-toggle"
      disabled={!mounted}
      onClick={toggleTheme}
      title="Toggle theme"
      type="button"
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
    </button>
  );
}
