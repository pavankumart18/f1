// OpenF1 live timing (https://openf1.org). Fetched server-side (no CORS) with a
// short cache so the auto-refreshing /live page doesn't hammer the API.

const BASE = "https://api.openf1.org/v1";

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  country_name: string;
  circuit_short_name: string;
  location?: string;
  date_start: string;
  date_end: string;
  year: number;
}

export interface StintSeg {
  compound: string;
  start: number;
  end: number;
  age: number;
}

interface DriverRow {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string;
}
interface PositionRow {
  driver_number: number;
  position: number;
  date: string;
}
interface IntervalRow {
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  date: string;
}
interface StintRow {
  driver_number: number;
  compound: string;
  stint_number: number;
  lap_end: number;
}

export interface TimingRow {
  position: number;
  number: number;
  acronym: string;
  name: string;
  team: string;
  colour: string;
  gapToLeader: string;
  interval: string;
  compound: string | null;
}

async function j<T>(path: string, revalidate = 8): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${BASE}/${path}`, { next: { revalidate } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (!res.ok) throw new Error(`OpenF1 ${res.status} ${path}`);
    return res.json();
  }
  throw new Error(`OpenF1 429 (retry exhausted) ${path}`);
}

// best-effort: never let one endpoint failure break the page
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export async function getLatestSession(): Promise<OpenF1Session | null> {
  try {
    const d = await j<OpenF1Session[]>(`sessions?session_key=latest`, 30);
    return d[0] ?? null;
  } catch {
    return null;
  }
}

function lastByDriver<T extends { driver_number: number; date: string }>(
  rows: T[]
): Map<number, T> {
  const m = new Map<number, T>();
  for (const r of rows) {
    const prev = m.get(r.driver_number);
    if (!prev || r.date > prev.date) m.set(r.driver_number, r);
  }
  return m;
}

function fmtGap(v: number | string | null): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v; // "+1 LAP", "LAP 1", etc.
  if (v === 0) return "LEADER";
  return `+${v.toFixed(3)}`;
}

export async function getLiveTiming(
  session: OpenF1Session
): Promise<TimingRow[]> {
  const sessionKey = session.session_key;
  // Intervals is a huge time-series; only pull the last few minutes (final order
  // for a completed session, recent gaps for a live one) to stay small + cacheable.
  const endMs = new Date(session.date_end).getTime();
  const base = Number.isFinite(endMs) ? Math.min(Date.now(), endMs) : Date.now();
  const cutoff = new Date(base - 240_000).toISOString();

  const [drivers, positions, intervals, stints] = await Promise.all([
    safe(j<DriverRow[]>(`drivers?session_key=${sessionKey}`, 60), []),
    safe(j<PositionRow[]>(`position?session_key=${sessionKey}`), []),
    safe(
      j<IntervalRow[]>(`intervals?session_key=${sessionKey}&date>=${cutoff}`),
      []
    ),
    safe(j<StintRow[]>(`stints?session_key=${sessionKey}`, 30), []),
  ]);

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));
  const posMap = lastByDriver(positions);
  const intMap = lastByDriver(intervals);

  // current compound = highest stint number per driver
  const compoundMap = new Map<number, string>();
  for (const s of stints) {
    const cur = compoundMap.get(s.driver_number);
    const curStint = stints
      .filter((x) => x.driver_number === s.driver_number)
      .reduce((a, b) => (b.stint_number > a.stint_number ? b : a));
    if (!cur) compoundMap.set(s.driver_number, curStint.compound);
  }

  const rows: TimingRow[] = [];
  for (const [num, pos] of posMap) {
    const d = driverMap.get(num);
    if (!d) continue;
    const itv = intMap.get(num);
    rows.push({
      position: pos.position,
      number: num,
      acronym: d.name_acronym,
      name: d.full_name,
      team: d.team_name,
      colour: `#${d.team_colour || "888888"}`,
      gapToLeader: itv ? fmtGap(itv.gap_to_leader) : "—",
      interval: itv ? fmtGap(itv.interval) : "—",
      compound: compoundMap.get(num) ?? null,
    });
  }
  rows.sort((a, b) => a.position - b.position);
  return rows;
}

// Bump an F1 media headshot to a sharper resolution variant.
// (OpenF1 returns the small `1col` transform by default.)
export function headshotRes(url: string, variant = "3col-retina"): string {
  if (!url) return url;
  return url.replace(/transform\/[^/]+\/image\.png/, `transform/${variant}/image.png`);
}

export interface GridDriver {
  number: number;
  acronym: string;
  name: string;
  last: string;
  team: string;
  colour: string;
  headshot: string;
}

// Current grid with official headshots + team colours (for the intro & faces).
export async function getDriverGrid(): Promise<GridDriver[]> {
  const session = await getLatestSession();
  if (!session) return [];
  const rows = await safe(
    j<
      (DriverRow & {
        headshot_url?: string;
        last_name?: string;
      })[]
    >(`drivers?session_key=${session.session_key}`, 3600),
    []
  );
  return rows
    .filter((d) => !!d.headshot_url)
    .map((d) => ({
      number: d.driver_number,
      acronym: d.name_acronym,
      name: d.full_name,
      last: d.last_name ?? d.full_name.split(" ").at(-1) ?? d.name_acronym,
      team: d.team_name,
      colour: `#${d.team_colour || "888888"}`,
      headshot: d.headshot_url as string,
    }));
}

export interface LapPoint {
  lap: number;
  time: number | null;
  pitOut: boolean;
}

// Lap times per driver_number for a session (for the pace chart).
export async function getSessionLaps(
  sessionKey: number
): Promise<Map<number, LapPoint[]>> {
  const rows = await safe(
    j<
      {
        driver_number: number;
        lap_number: number;
        lap_duration: number | null;
        is_pit_out_lap: boolean;
      }[]
    >(`laps?session_key=${sessionKey}`, 15),
    []
  );
  const m = new Map<number, LapPoint[]>();
  for (const r of rows) {
    const arr = m.get(r.driver_number) ?? [];
    arr.push({
      lap: r.lap_number,
      time: r.lap_duration ?? null,
      pitOut: !!r.is_pit_out_lap,
    });
    m.set(r.driver_number, arr);
  }
  return m;
}

// Tyre stints per driver_number for the strategy chart.
export async function getSessionStints(
  sessionKey: number
): Promise<Map<number, StintSeg[]>> {
  const rows = await safe(
    j<
      {
        driver_number: number;
        compound: string;
        lap_start: number;
        lap_end: number;
        tyre_age_at_start: number;
      }[]
    >(`stints?session_key=${sessionKey}`, 30),
    []
  );
  const m = new Map<number, StintSeg[]>();
  for (const r of rows) {
    if (!r.compound) continue;
    const arr = m.get(r.driver_number) ?? [];
    arr.push({
      compound: r.compound,
      start: r.lap_start,
      end: r.lap_end,
      age: r.tyre_age_at_start,
    });
    m.set(r.driver_number, arr);
  }
  for (const arr of m.values()) arr.sort((a, b) => a.start - b.start);
  return m;
}

const normLoc = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Map a Jolpica race (year + locality + country) to its OpenF1 session.
// OpenF1 only covers 2023+. Matches on city/circuit first (handles countries
// with multiple races), then falls back to a unique country match.
export async function getRaceSession(
  year: string | number,
  locality: string,
  country: string
): Promise<OpenF1Session | null> {
  if (Number(year) < 2023) return null;
  const sessions = await safe(
    j<OpenF1Session[]>(`sessions?year=${year}&session_name=Race`, 24 * 3600),
    []
  );
  if (!sessions.length) return null;
  const loc = normLoc(locality);
  const ctry = normLoc(country);
  const exact = sessions.find(
    (s) => normLoc(s.location) === loc || normLoc(s.circuit_short_name) === loc
  );
  if (exact) return exact;
  const partial = sessions.find((s) => {
    const L = normLoc(s.location);
    return L && (L.includes(loc) || loc.includes(L));
  });
  if (partial) return partial;
  const byCountry = sessions.filter((s) => normLoc(s.country_name) === ctry);
  return byCountry.length === 1 ? byCountry[0] : null;
}

export interface PosByLap {
  maxLap: number;
  maxPos: number;
  drivers: {
    number: number;
    acronym: string;
    colour: string;
    positions: (number | null)[]; // index = lap-1
  }[];
}

// Position-by-lap ("spaghetti") data: each driver's track position at the start
// of every lap, derived from position changes + per-lap timestamps.
export async function getPositionByLap(
  sessionKey: number
): Promise<PosByLap | null> {
  const [positions, laps, drivers] = await Promise.all([
    safe(
      j<{ driver_number: number; position: number; date: string }[]>(
        `position?session_key=${sessionKey}`,
        30
      ),
      []
    ),
    safe(
      j<
        { driver_number: number; lap_number: number; date_start: string | null }[]
      >(`laps?session_key=${sessionKey}`, 30),
      []
    ),
    safe(j<DriverRow[]>(`drivers?session_key=${sessionKey}`, 3600), []),
  ]);
  if (!positions.length || !laps.length) return null;

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

  const changes = new Map<number, { t: number; p: number }[]>();
  for (const r of positions) {
    const arr = changes.get(r.driver_number) ?? [];
    arr.push({ t: new Date(r.date).getTime(), p: r.position });
    changes.set(r.driver_number, arr);
  }
  for (const arr of changes.values()) arr.sort((a, b) => a.t - b.t);

  const lapTimes = new Map<number, Map<number, number>>();
  let maxLap = 0;
  for (const l of laps) {
    if (!l.date_start) continue;
    maxLap = Math.max(maxLap, l.lap_number);
    const m = lapTimes.get(l.driver_number) ?? new Map<number, number>();
    m.set(l.lap_number, new Date(l.date_start).getTime());
    lapTimes.set(l.driver_number, m);
  }
  if (maxLap < 2) return null;

  const posAt = (arr: { t: number; p: number }[], t: number) => {
    let p: number | null = null;
    for (const c of arr) {
      if (c.t <= t) p = c.p;
      else break;
    }
    return p;
  };

  let maxPos = 0;
  const out: PosByLap["drivers"] = [];
  for (const [num, arr] of changes) {
    const d = driverMap.get(num);
    if (!d) continue;
    const dl = lapTimes.get(num);
    const positionsArr: (number | null)[] = [];
    for (let lap = 1; lap <= maxLap; lap++) {
      const t = dl?.get(lap);
      const p = t != null ? posAt(arr, t) : null;
      if (p) maxPos = Math.max(maxPos, p);
      positionsArr.push(p);
    }
    out.push({
      number: num,
      acronym: d.name_acronym,
      colour: `#${d.team_colour || "888888"}`,
      positions: positionsArr,
    });
  }
  return { maxLap, maxPos: maxPos || out.length, drivers: out };
}

export const COMPOUND_COLOR: Record<string, string> = {
  SOFT: "#E8002D",
  MEDIUM: "#F5C518",
  HARD: "#B9B9B9",
  INTERMEDIATE: "#43B02A",
  WET: "#0067AD",
};
