"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Radio, Trophy, BookOpen, CalendarDays } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/standings", label: "Table", icon: Trophy },
  { href: "/records", label: "Records", icon: BookOpen },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-rule-strong bg-paper/95 backdrop-blur md:hidden">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 py-2 transition-colors ${
              active ? "text-accent" : "text-ink-soft"
            }`}
          >
            <span className="relative">
              <Icon className="size-5" />
              {t.href === "/live" && (
                <span className="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-accent live-dot" />
              )}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
