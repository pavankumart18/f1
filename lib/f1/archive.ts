import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Race, DriverStanding, ConstructorStanding } from "./types";

const DATA = path.resolve(process.cwd(), "data");

async function readJSON<T>(rel: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(DATA, rel), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function archiveAvailable(): Promise<boolean> {
  return (await readJSON<string[]>("seasons.json")) !== null;
}

export interface DriverRecord {
  id: string;
  name: string;
  nationality: string;
  lastTeam?: string;
  races: number;
  wins: number;
  podiums: number;
  poles: number; // grid == 1 (approx.)
  points: number;
  fastestLaps: number;
  dnf: number;
  titles: number;
  firstYear?: string;
  lastYear?: string;
}

export interface TeamRecord {
  id: string;
  name: string;
  wins: number;
  podiums: number;
  points: number;
  titles: number;
  oneTwos: number;
  firstYear?: string;
  lastYear?: string;
}

export interface Records {
  seasons: string[];
  drivers: DriverRecord[];
  teams: TeamRecord[];
  totals: { races: number; results: number; seasons: number };
}

// Module-level cache so we only crunch the archive once per server process.
let cache: Records | null = null;

const DNF_STATUSES = /^(?!Finished|\+\d).+/; // not "Finished" and not "+1 Lap" etc.

export async function computeRecords(): Promise<Records | null> {
  if (cache) return cache;
  const seasons = await readJSON<string[]>("seasons.json");
  if (!seasons) return null;

  const drivers = new Map<string, DriverRecord>();
  const teams = new Map<string, TeamRecord>();
  let raceCount = 0;
  let resultCount = 0;

  const resultFiles = (await readdir(path.join(DATA, "results")).catch(
    () => [] as string[]
  )).filter((f) => f.endsWith(".json"));

  for (const file of resultFiles) {
    const year = file.replace(".json", "");
    const races = (await readJSON<Race[]>(`results/${file}`)) ?? [];
    for (const race of races) {
      raceCount++;
      for (const r of race.Results ?? []) {
        resultCount++;
        const pos = Number(r.position);
        const isWin = pos === 1;
        const isPodium = pos <= 3;
        const isPole = Number(r.grid) === 1;
        const fl = r.FastestLap?.rank === "1";
        const dnf = DNF_STATUSES.test(r.status) && r.status !== "Finished";

        // driver
        const dId = r.Driver.driverId;
        let d = drivers.get(dId);
        if (!d) {
          d = {
            id: dId,
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            nationality: r.Driver.nationality,
            races: 0,
            wins: 0,
            podiums: 0,
            poles: 0,
            points: 0,
            fastestLaps: 0,
            dnf: 0,
            titles: 0,
          };
          drivers.set(dId, d);
        }
        d.races++;
        d.wins += isWin ? 1 : 0;
        d.podiums += isPodium ? 1 : 0;
        d.poles += isPole ? 1 : 0;
        d.points += Number(r.points) || 0;
        d.fastestLaps += fl ? 1 : 0;
        d.dnf += dnf ? 1 : 0;
        d.lastTeam = r.Constructor.constructorId;
        if (!d.firstYear || year < d.firstYear) d.firstYear = year;
        if (!d.lastYear || year > d.lastYear) d.lastYear = year;

        // team
        const tId = r.Constructor.constructorId;
        let t = teams.get(tId);
        if (!t) {
          t = {
            id: tId,
            name: r.Constructor.name,
            wins: 0,
            podiums: 0,
            points: 0,
            titles: 0,
            oneTwos: 0,
          };
          teams.set(tId, t);
        }
        t.wins += isWin ? 1 : 0;
        t.podiums += isPodium ? 1 : 0;
        t.points += Number(r.points) || 0;
        if (!t.firstYear || year < t.firstYear) t.firstYear = year;
        if (!t.lastYear || year > t.lastYear) t.lastYear = year;
      }

      // 1-2 finishes for constructors
      const top2 = (race.Results ?? []).filter((r) => Number(r.position) <= 2);
      if (top2.length === 2 && top2[0].Constructor.constructorId === top2[1].Constructor.constructorId) {
        const t = teams.get(top2[0].Constructor.constructorId);
        if (t) t.oneTwos++;
      }
    }
  }

  // titles from final standings
  for (const year of seasons) {
    const ds = await readJSON<DriverStanding[]>(`standings/drivers-${year}.json`);
    const champ = ds?.find((s) => s.position === "1");
    if (champ) {
      const d = drivers.get(champ.Driver.driverId);
      if (d) d.titles++;
    }
    const cs = await readJSON<ConstructorStanding[]>(
      `standings/constructors-${year}.json`
    );
    const cChamp = cs?.find((s) => s.position === "1");
    if (cChamp) {
      const t = teams.get(cChamp.Constructor.constructorId);
      if (t) t.titles++;
    }
  }

  cache = {
    seasons,
    drivers: [...drivers.values()],
    teams: [...teams.values()],
    totals: { races: raceCount, results: resultCount, seasons: seasons.length },
  };
  return cache;
}

// Career championship count for a driver, from the season-by-season archive.
// (Jolpica's per-driver standings endpoint now requires a season filter, so the
// archive is the reliable source for all-time title counts.)
export async function getDriverTitles(driverId: string): Promise<number> {
  const r = await computeRecords();
  return r?.drivers.find((d) => d.id === driverId)?.titles ?? 0;
}

export type LeaderKey = keyof Pick<
  DriverRecord,
  "wins" | "podiums" | "poles" | "points" | "titles" | "fastestLaps" | "races"
>;

export function topDrivers(
  records: Records,
  key: LeaderKey,
  n = 15
): DriverRecord[] {
  return [...records.drivers].sort((a, b) => b[key] - a[key]).slice(0, n);
}

export function topTeams(
  records: Records,
  key: keyof Pick<TeamRecord, "wins" | "podiums" | "points" | "titles" | "oneTwos">,
  n = 15
): TeamRecord[] {
  return [...records.teams].sort((a, b) => b[key] - a[key]).slice(0, n);
}
