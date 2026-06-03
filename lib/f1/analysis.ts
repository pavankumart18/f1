import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Race } from "./types";

const DATA = path.resolve(process.cwd(), "data");

async function readJSON<T>(rel: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(DATA, rel), "utf8")) as T;
  } catch {
    return null;
  }
}

export interface Analysis {
  racesPerSeason: { year: string; count: number }[];
  winsByDecade: { decade: string; count: number }[];
  dominantSeasons: {
    year: string;
    driver: string;
    driverId: string;
    team?: string;
    wins: number;
    races: number;
    pct: number;
  }[];
  reliability: {
    driver: string;
    driverId: string;
    team?: string;
    finishRate: number;
    races: number;
  }[];
}

let cache: Analysis | null = null;

const isFinish = (status: string) =>
  status === "Finished" || /^\+\d+ Lap/.test(status);

export async function computeAnalysis(): Promise<Analysis | null> {
  if (cache) return cache;
  const files = (
    await readdir(path.join(DATA, "results")).catch(() => [] as string[])
  ).filter((f) => f.endsWith(".json"));
  if (!files.length) return null;

  const racesPerSeason: { year: string; count: number }[] = [];
  const decade = new Map<string, number>();

  // per (year, driver)
  type DS = {
    name: string;
    team?: string;
    wins: number;
    races: number;
  };
  const dominant: Analysis["dominantSeasons"] = [];

  // career reliability
  const rel = new Map<
    string,
    { name: string; team?: string; finishes: number; races: number }
  >();

  for (const file of files.sort()) {
    const year = file.replace(".json", "");
    const races = (await readJSON<Race[]>(`results/${file}`)) ?? [];
    racesPerSeason.push({ year, count: races.length });
    const dec = `${Math.floor(Number(year) / 10) * 10}s`;
    decade.set(dec, (decade.get(dec) ?? 0) + races.length);

    const seasonDrivers = new Map<string, DS>();
    for (const race of races) {
      for (const r of race.Results ?? []) {
        const id = r.Driver.driverId;
        const name = `${r.Driver.givenName} ${r.Driver.familyName}`;
        const team = r.Constructor.constructorId;
        const win = Number(r.position) === 1;

        const sd = seasonDrivers.get(id) ?? { name, team, wins: 0, races: 0 };
        sd.wins += win ? 1 : 0;
        sd.races += 1;
        sd.team = team;
        seasonDrivers.set(id, sd);

        const rr = rel.get(id) ?? { name, team, finishes: 0, races: 0 };
        rr.finishes += isFinish(r.status) ? 1 : 0;
        rr.races += 1;
        rr.team = team;
        rel.set(id, rr);
      }
    }
    for (const [id, sd] of seasonDrivers) {
      if (sd.wins >= 4) {
        dominant.push({
          year,
          driver: sd.name,
          driverId: id,
          team: sd.team,
          wins: sd.wins,
          races: races.length,
          pct: Math.round((sd.wins / races.length) * 100),
        });
      }
    }
  }

  cache = {
    racesPerSeason,
    winsByDecade: [...decade.entries()].map(([d, c]) => ({
      decade: d,
      count: c,
    })),
    dominantSeasons: dominant.sort((a, b) => b.pct - a.pct).slice(0, 14),
    reliability: [...rel.entries()]
      .filter(([, r]) => r.races >= 80)
      .map(([id, r]) => ({
        driver: r.name,
        driverId: id,
        team: r.team,
        finishRate: Math.round((r.finishes / r.races) * 100),
        races: r.races,
      }))
      .sort((a, b) => b.finishRate - a.finishRate)
      .slice(0, 14),
  };
  return cache;
}
