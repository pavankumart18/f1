import Link from "next/link";
import { getOnThisDay } from "@/lib/f1/archive";
import { flag } from "@/lib/f1/flags";
import { teamColor } from "@/lib/f1/teams";
import { SectionHeading } from "./section-heading";

export async function OnThisDay() {
  const now = new Date();
  const entries = await getOnThisDay(now.getMonth() + 1, now.getDate());
  const today = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <SectionHeading label={`On This Day · ${today}`} title="From the Vault" />
      {entries.length === 0 ? (
        <p className="py-6 text-sm text-ink-soft">
          No World Championship race has fallen on {today} — check back tomorrow.
        </p>
      ) : (
        <ol className="border-t border-rule-strong">
          {entries.slice(0, 5).map((e) => (
            <li key={`${e.year}-${e.round}`}>
              <Link
                href={`/race/${e.season}/${e.round}`}
                className="group flex items-baseline gap-3 border-b border-rule py-2.5 hover:bg-paper-raised"
              >
                <span className="w-12 shrink-0 font-mono text-sm font-semibold tabular-nums text-accent">
                  {e.year}
                </span>
                <span
                  className="mt-1 h-3.5 w-1 shrink-0 self-start"
                  style={{ background: teamColor(e.team) }}
                />
                <span className="text-sm leading-snug">
                  <strong className="font-semibold group-hover:text-accent">
                    {e.winner}
                  </strong>{" "}
                  won the {flag(e.country)} {e.raceName}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
