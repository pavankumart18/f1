"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group inline-flex items-center gap-2 border border-rule px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:border-rule-strong hover:text-ink transition-colors"
    >
      {mounted ? (
        isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />
      ) : (
        <span className="size-3.5" />
      )}
      <span className="hidden sm:inline font-mono">
        {mounted ? (isDark ? "Carbon" : "Broadsheet") : "Theme"}
      </span>
    </button>
  );
}
