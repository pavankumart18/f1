// OpenF1 live timing (https://openf1.org). Fetched server-side (no CORS) with a
// short cache so the auto-refreshing /live page doesn't hammer the API.

const BASE = "https://api.openf1.org/v1";

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  country_name: string;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
  year: number;
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

export const COMPOUND_COLOR: Record<string, string> = {
  SOFT: "#E8002D",
  MEDIUM: "#F5C518",
  HARD: "#B9B9B9",
  INTERMEDIATE: "#43B02A",
  WET: "#0067AD",
};
