import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MusicToggle } from "./music-toggle";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/standings", label: "Standings" },
  { href: "/schedule", label: "Schedule" },
  { href: "/records", label: "Records" },
  { href: "/compare", label: "Compare" },
  { href: "/archive", label: "Archive" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule-strong bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="inline-block h-2.5 w-5 bg-accent" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight">
            The Pit Wall
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-accent live-dot" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Live Edition
            </span>
          </span>
          <MusicToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center justify-center gap-5 border-t border-rule px-4 py-1.5 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:text-accent transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
