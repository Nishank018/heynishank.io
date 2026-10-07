"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      className="icon-button theme-toggle"
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
      title="Toggle theme"
      type="button"
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
    </button>
  );
}
