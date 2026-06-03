import { getDriverStandings, getConstructorStandings } from "@/lib/f1/api";
import {
  DriverStandingsTable,
  ConstructorStandingsTable,
} from "@/components/standings";
import { SectionHeading } from "@/components/section-heading";

export const revalidate = 1800;

export const metadata = { title: "Standings — The Pit Wall" };

export default async function StandingsPage() {
  const [drivers, constructors] = await Promise.all([
    getDriverStandings("current").catch(() => []),
    getConstructorStandings("current").catch(() => []),
  ]);
  const season = drivers[0]
    ? "Current"
    : new Date().getFullYear().toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">{season} World Championship</div>
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Championship <span className="italic text-accent">Standings</span>
      </h1>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading label="The Title Race" title="Drivers" />
          <DriverStandingsTable standings={drivers} />
        </div>
        <div>
          <SectionHeading label="The Cup" title="Constructors" />
          <ConstructorStandingsTable standings={constructors} />
        </div>
      </div>
    </div>
  );
}
