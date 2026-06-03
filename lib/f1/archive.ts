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

/* ----------------------------------------------------- circuits / venues -- */

export interface CircuitWinner {
  id: string;
  name: string;
  nationality?: string;
  team?: string;
  wins: number;
}
export interface CircuitStat {
  id: string;
  name: string;
  locality: string;
  country: string;
  lat: string;
  long: string;
  grands_prix: number;
  firstYear: string;
  lastYear: string;
  topDrivers: CircuitWinner[];
  topConstructors: CircuitWinner[];
  rollOfHonour: { year: string; round: string; driver: string; driverId: string; team?: string }[];
}

let circuitCache: Map<string, CircuitStat> | null = null;

async function buildCircuits(): Promise<Map<string, CircuitStat>> {
  if (circuitCache) return circuitCache;
  const files = (
    await readdir(path.join(DATA, "results")).catch(() => [] as string[])
  ).filter((f) => f.endsWith(".json"));

  type Acc = {
    stat: CircuitStat;
    drivers: Map<string, CircuitWinner>;
    constructors: Map<string, CircuitWinner>;
  };
  const acc = new Map<string, Acc>();

  for (const file of files.sort()) {
    const year = file.replace(".json", "");
    const races = (await readJSON<Race[]>(`results/${file}`)) ?? [];
    for (const race of races) {
      const c = race.Circuit;
      const winner = (race.Results ?? []).find((r) => r.position === "1");
      let a = acc.get(c.circuitId);
      if (!a) {
        a = {
          stat: {
            id: c.circuitId,
            name: c.circuitName,
            locality: c.Location.locality,
            country: c.Location.country,
            lat: c.Location.lat,
            long: c.Location.long,
            grands_prix: 0,
            firstYear: year,
            lastYear: year,
            topDrivers: [],
            topConstructors: [],
            rollOfHonour: [],
          },
          drivers: new Map(),
          constructors: new Map(),
        };
        acc.set(c.circuitId, a);
      }
      a.stat.grands_prix++;
      if (year < a.stat.firstYear) a.stat.firstYear = year;
      if (year > a.stat.lastYear) a.stat.lastYear = year;
      if (winner) {
        const dId = winner.Driver.driverId;
        const d = a.drivers.get(dId) ?? {
          id: dId,
          name: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
          nationality: winner.Driver.nationality,
          team: winner.Constructor.constructorId,
          wins: 0,
        };
        d.wins++;
        a.drivers.set(dId, d);

        const cId = winner.Constructor.constructorId;
        const ct = a.constructors.get(cId) ?? {
          id: cId,
          name: winner.Constructor.name,
          wins: 0,
        };
        ct.wins++;
        a.constructors.set(cId, ct);

        a.stat.rollOfHonour.push({
          year,
          round: race.round,
          driver: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
          driverId: dId,
          team: winner.Constructor.constructorId,
        });
      }
    }
  }

  const out = new Map<string, CircuitStat>();
  for (const [id, a] of acc) {
    a.stat.topDrivers = [...a.drivers.values()]
      .sort((x, y) => y.wins - x.wins)
      .slice(0, 8);
    a.stat.topConstructors = [...a.constructors.values()]
      .sort((x, y) => y.wins - x.wins)
      .slice(0, 8);
    a.stat.rollOfHonour.reverse(); // newest first
    out.set(id, a.stat);
  }
  circuitCache = out;
  return out;
}

export async function listCircuits(): Promise<CircuitStat[]> {
  const m = await buildCircuits();
  return [...m.values()].sort((a, b) => b.grands_prix - a.grands_prix);
}

export async function getCircuitStat(id: string): Promise<CircuitStat | null> {
  const m = await buildCircuits();
  return m.get(id) ?? null;
}

// Career championship count for a driver, from the season-by-season archive.
// (Jolpica's per-driver standings endpoint now requires a season filter, so the
// archive is the reliable source for all-time title counts.)
export async function getDriverTitles(driverId: string): Promise<number> {
  const r = await computeRecords();
  return r?.drivers.find((d) => d.id === driverId)?.titles ?? 0;
}

/* --------------------------------------------------- driver deep dossier -- */

let allResultsCache: Map<string, Race[]> | null = null;
async function loadAllResults(): Promise<Map<string, Race[]>> {
  if (allResultsCache) return allResultsCache;
  const files = (
    await readdir(path.join(DATA, "results")).catch(() => [] as string[])
  ).filter((f) => f.endsWith(".json"));
  const m = new Map<string, Race[]>();
  for (const f of files.sort()) {
    const races = await readJSON<Race[]>(`results/${f}`);
    if (races) m.set(f.replace(".json", ""), races);
  }
  allResultsCache = m;
  return m;
}

export interface DossierSeason {
  year: string;
  team?: string;
  teamLabel?: string;
  races: number;
  wins: number;
  podiums: number;
  dnf: number;
  points: number;
  position: number | null;
  bestFinish: number | null;
  avgFinish: number | null;
}
export interface Dossier {
  debut?: { year: string; race: string };
  firstWin?: { year: string; race: string };
  teams: string[];
  seasons: DossierSeason[];
  totals: {
    races: number;
    wins: number;
    podiums: number;
    dnf: number;
    finishRate: number;
  };
  milestones: { year: string; text: string; kind: string }[];
  setbacks: string[];
}

const numeric = (s: string) => /^\d+$/.test(s);

export async function getDriverDossier(
  driverId: string
): Promise<Dossier | null> {
  const [results, standings] = await Promise.all([
    loadAllResults(),
    loadDriverStandings(),
  ]);
  if (!results.size) return null;

  const seasons: DossierSeason[] = [];
  const teams: string[] = [];
  let debut: Dossier["debut"];
  let firstWin: Dossier["firstWin"];

  for (const year of [...results.keys()].sort()) {
    const races = results.get(year)!;
    const s: DossierSeason = {
      year,
      races: 0,
      wins: 0,
      podiums: 0,
      dnf: 0,
      points: 0,
      position: null,
      bestFinish: null,
      avgFinish: null,
    };
    const finishes: number[] = [];
    for (const race of races) {
      const r = (race.Results ?? []).find(
        (x) => x.Driver.driverId === driverId
      );
      if (!r) continue;
      s.races++;
      s.points += Number(r.points) || 0;
      s.team = r.Constructor.constructorId;
      s.teamLabel = r.Constructor.name;
      if (!teams.includes(s.team)) teams.push(s.team);
      if (!debut) debut = { year, race: race.raceName };
      if (r.positionText === "1") {
        s.wins++;
        if (!firstWin) firstWin = { year, race: race.raceName };
      }
      if (numeric(r.positionText)) {
        const p = Number(r.positionText);
        if (p <= 3) s.podiums++;
        finishes.push(p);
        if (s.bestFinish === null || p < s.bestFinish) s.bestFinish = p;
      }
      if (r.status !== "Finished" && !/^\+\d+ Lap/.test(r.status)) s.dnf++;
    }
    if (s.races === 0) continue;
    s.avgFinish = finishes.length
      ? Math.round((finishes.reduce((a, b) => a + b, 0) / finishes.length) * 10) / 10
      : null;
    const st = standings.get(year)?.find((x) => x.Driver.driverId === driverId);
    s.position = st ? Number(st.position) : null;
    seasons.push(s);
  }

  if (!seasons.length) return null;

  const totals = seasons.reduce(
    (a, s) => ({
      races: a.races + s.races,
      wins: a.wins + s.wins,
      podiums: a.podiums + s.podiums,
      dnf: a.dnf + s.dnf,
    }),
    { races: 0, wins: 0, podiums: 0, dnf: 0 }
  );
  const finishRate = totals.races
    ? Math.round(((totals.races - totals.dnf) / totals.races) * 100)
    : 0;

  // milestones
  const milestones: Dossier["milestones"] = [];
  if (debut) milestones.push({ year: debut.year, text: `Debut · ${debut.race}`, kind: "debut" });
  if (firstWin)
    milestones.push({ year: firstWin.year, text: `First win · ${firstWin.race}`, kind: "win" });
  for (const s of seasons)
    if (s.position === 1)
      milestones.push({ year: s.year, text: `World Champion`, kind: "title" });

  // setbacks & comebacks — auto-derived
  const setbacks: string[] = [];

  // longest winless streak among racing seasons (after debut)
  let streak = 0;
  let maxStreak = 0;
  let streakStart = "";
  let bestStreakRange = "";
  for (const s of seasons) {
    if (s.wins === 0) {
      if (streak === 0) streakStart = s.year;
      streak++;
      if (streak > maxStreak) {
        maxStreak = streak;
        bestStreakRange = `${streakStart}–${s.year}`;
      }
    } else {
      streak = 0;
    }
  }
  if (maxStreak >= 3 && totals.wins > 0)
    setbacks.push(
      `Weathered a ${maxStreak}-season win drought (${bestStreakRange}) before returning to the top step.`
    );

  // worst reliability season
  const worstDnf = [...seasons].sort((a, b) => b.dnf - a.dnf)[0];
  if (worstDnf && worstDnf.dnf >= 4)
    setbacks.push(
      `Retired from ${worstDnf.dnf} of ${worstDnf.races} races in ${worstDnf.year} — his toughest run for reliability.`
    );

  // pointless seasons after debut
  const zero = seasons.filter((s) => s.points === 0);
  if (zero.length >= 1 && totals.wins > 0)
    setbacks.push(
      `Endured ${zero.length === 1 ? "a winless, point-less campaign" : `${zero.length} point-less campaigns`} (${zero.map((z) => z.year).join(", ")}) early on.`
    );

  // biggest championship comeback (position improvement year-on-year)
  let bestJump = 0;
  let jumpText = "";
  for (let i = 1; i < seasons.length; i++) {
    const prev = seasons[i - 1].position;
    const cur = seasons[i].position;
    if (prev && cur && prev - cur > bestJump) {
      bestJump = prev - cur;
      jumpText = `Surged from P${prev} (${seasons[i - 1].year}) to P${cur} (${seasons[i].year}) in the championship — a ${bestJump}-place leap.`;
    }
  }
  if (bestJump >= 3) setbacks.push(jumpText);

  return {
    debut,
    firstWin,
    teams,
    seasons,
    totals: { ...totals, finishRate },
    milestones,
    setbacks,
  };
}

export interface SeasonPoint {
  year: string;
  points: number;
  wins: number;
  position: number;
}

let driverStandingsCache: Map<string, DriverStanding[]> | null = null;
async function loadDriverStandings(): Promise<Map<string, DriverStanding[]>> {
  if (driverStandingsCache) return driverStandingsCache;
  const seasons = (await readJSON<string[]>("seasons.json")) ?? [];
  const m = new Map<string, DriverStanding[]>();
  for (const y of seasons) {
    const s = await readJSON<DriverStanding[]>(`standings/drivers-${y}.json`);
    if (s) m.set(y, s);
  }
  driverStandingsCache = m;
  return m;
}

// A driver's season-by-season points / wins / final position from the archive.
export async function getDriverProgression(
  driverId: string
): Promise<SeasonPoint[]> {
  const m = await loadDriverStandings();
  const out: SeasonPoint[] = [];
  for (const year of [...m.keys()].sort()) {
    const row = m.get(year)!.find((s) => s.Driver.driverId === driverId);
    if (row) {
      out.push({
        year,
        points: Number(row.points) || 0,
        wins: Number(row.wins) || 0,
        position: Number(row.position) || 0,
      });
    }
  }
  return out;
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
