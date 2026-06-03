import type {
  Race,
  DriverStanding,
  ConstructorStanding,
  Driver,
  Constructor,
  RaceResult,
  MRData,
} from "./types";
import { getDriverTitles } from "./archive";

const BASE = "https://api.jolpi.ca/ergast/f1";

// F1 data barely changes between sessions, so cache hard and revalidate.
// Standings/next-race refresh more often; archive data is effectively static.
async function get<T>(path: string, revalidate = 3600): Promise<MRData<T>> {
  const url = `${BASE}/${path}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Jolpica ${res.status} for ${path}`);
  }
  return res.json();
}

/* ------------------------------------------------------------------ schedule */

export async function getSeasonSchedule(season = "current"): Promise<Race[]> {
  const data = await get<{ RaceTable: { Races: Race[] } }>(
    `${season}.json?limit=100`,
    6 * 3600
  );
  return data.MRData.RaceTable.Races;
}

export async function getNextRace(): Promise<Race | null> {
  try {
    const data = await get<{ RaceTable: { Races: Race[] } }>(
      `current/next.json`,
      600
    );
    return data.MRData.RaceTable.Races[0] ?? null;
  } catch {
    return null;
  }
}

export async function getLastResults(): Promise<Race | null> {
  try {
    const data = await get<{ RaceTable: { Races: Race[] } }>(
      `current/last/results.json`,
      600
    );
    return data.MRData.RaceTable.Races[0] ?? null;
  } catch {
    return null;
  }
}

export async function getRaceResults(
  season: string,
  round: string
): Promise<Race | null> {
  try {
    const data = await get<{ RaceTable: { Races: Race[] } }>(
      `${season}/${round}/results.json?limit=100`,
      6 * 3600
    );
    return data.MRData.RaceTable.Races[0] ?? null;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------- standings */

export async function getDriverStandings(
  season = "current"
): Promise<DriverStanding[]> {
  const data = await get<{
    StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] };
  }>(`${season}/driverstandings.json?limit=100`, 1800);
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(
  season = "current"
): Promise<ConstructorStanding[]> {
  const data = await get<{
    StandingsTable: {
      StandingsLists: { ConstructorStandings: ConstructorStanding[] }[];
    };
  }>(`${season}/constructorstandings.json?limit=100`, 1800);
  return (
    data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
  );
}

/* ------------------------------------------------------------------- archive */

export async function getSeasons(): Promise<string[]> {
  const data = await get<{ SeasonTable: { Seasons: { season: string }[] } }>(
    `seasons.json?limit=100`,
    24 * 3600
  );
  return data.MRData.SeasonTable.Seasons.map((s) => s.season).reverse();
}

export async function getSeasonChampion(season: string): Promise<{
  driver: DriverStanding | null;
  constructor: ConstructorStanding | null;
} | null> {
  try {
    const [d, c] = await Promise.all([
      get<{
        StandingsTable: {
          StandingsLists: { DriverStandings: DriverStanding[] }[];
        };
      }>(`${season}/driverstandings.json?limit=1`, 24 * 3600),
      get<{
        StandingsTable: {
          StandingsLists: { ConstructorStandings: ConstructorStanding[] }[];
        };
      }>(`${season}/constructorstandings.json?limit=1`, 24 * 3600),
    ]);
    return {
      driver:
        d.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0] ?? null,
      constructor:
        c.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings[0] ??
        null,
    };
  } catch {
    return null;
  }
}

export async function getDriver(driverId: string): Promise<Driver | null> {
  try {
    const data = await get<{ DriverTable: { Drivers: Driver[] } }>(
      `drivers/${driverId}.json`,
      24 * 3600
    );
    return data.MRData.DriverTable.Drivers[0] ?? null;
  } catch {
    return null;
  }
}

export async function getConstructor(
  constructorId: string
): Promise<Constructor | null> {
  try {
    const data = await get<{ ConstructorTable: { Constructors: Constructor[] } }>(
      `constructors/${constructorId}.json`,
      24 * 3600
    );
    return data.MRData.ConstructorTable.Constructors[0] ?? null;
  } catch {
    return null;
  }
}

export async function getDriverSeasonResults(
  driverId: string,
  season = "current"
): Promise<Race[]> {
  try {
    const data = await get<{ RaceTable: { Races: Race[] } }>(
      `${season}/drivers/${driverId}/results.json?limit=100`,
      6 * 3600
    );
    return data.MRData.RaceTable.Races;
  } catch {
    return [];
  }
}

export interface DriverCareer {
  wins: number;
  podiums: number;
  poles: number;
  championships: number;
  starts: number;
}

// Career totals via Ergast count endpoints (each returns MRData.total).
// Podiums = finishes in P1 + P2 + P3.
export async function getDriverCareer(
  driverId: string
): Promise<DriverCareer | null> {
  const total = async (path: string) => {
    try {
      const d = await get<Record<string, unknown>>(path, 24 * 3600);
      return Number(d.MRData.total) || 0;
    } catch {
      return 0;
    }
  };
  try {
    const [wins, p2, p3, poles, starts, championships] = await Promise.all([
      total(`drivers/${driverId}/results/1.json?limit=1`),
      total(`drivers/${driverId}/results/2.json?limit=1`),
      total(`drivers/${driverId}/results/3.json?limit=1`),
      total(`drivers/${driverId}/qualifying/1.json?limit=1`),
      total(`drivers/${driverId}/results.json?limit=1`),
      // Titles come from the local season-by-season archive (the live per-driver
      // standings endpoint now requires a season_year param and 400s otherwise).
      getDriverTitles(driverId),
    ]);
    return {
      wins,
      podiums: wins + p2 + p3,
      poles,
      starts,
      championships,
    };
  } catch {
    return null;
  }
}
