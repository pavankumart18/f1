import { IntroReplay } from "./intro-replay";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule-strong">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          The Pit Wall — Independent F1 Almanac
        </p>
        <IntroReplay />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Data: Jolpica-F1 (Ergast) · 1950–2026 · Not affiliated with Formula 1
        </p>
      </div>
    </footer>
  );
}
