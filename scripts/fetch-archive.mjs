#!/usr/bin/env node
/**
 * Full Formula 1 history dump from the Jolpica-F1 (Ergast) API.
 *
 * Strategy: fetch at the SEASON level with pagination (not race-by-race) to
 * keep the whole 1950–present archive under ~400 requests. Polite, resumable
 * (skips files that already exist), and backs off on HTTP 429.
 *
 *   node scripts/fetch-archive.mjs            # core dump (results + standings + entities)
 *   node scripts/fetch-archive.mjs --quali    # also pull qualifying (poles)
 *   node scripts/fetch-archive.mjs --force     # re-fetch even if files exist
 *
 * Output: ./data/**.json
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const BASE = "https://api.jolpi.ca/ergast/f1";
const DATA = path.resolve(process.cwd(), "data");
const DELAY_MS = 350; // ~3 req/s, polite under the burst limit
const PAGE = 100; // Ergast max page size

const args = new Set(process.argv.slice(2));
const WANT_QUALI = args.has("--quali");
const FORCE = args.has("--force");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let reqCount = 0;
async function api(pathname, attempt = 0) {
  reqCount++;
  const url = `${BASE}/${pathname}`;
  const res = await fetch(url, { headers: { "User-Agent": "pit-wall-archive" } });
  if (res.status === 429 || res.status >= 500) {
    const retryAfter = Number(res.headers.get("retry-after")) || 0;
    const wait = retryAfter * 1000 || Math.min(60000, 1000 * 2 ** attempt);
    console.warn(`  ⚠ ${res.status} on ${pathname} — backing off ${wait}ms`);
    await sleep(wait);
    if (attempt < 6) return api(pathname, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${pathname}`);
  await sleep(DELAY_MS);
  return res.json();
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function save(rel, data) {
  const full = path.join(DATA, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, JSON.stringify(data));
}

// Fetch every page of a paginated Ergast endpoint, returning all rows from
// the array at `pick(MRData)`.
async function paginate(pathname, pick) {
  let offset = 0;
  let total = Infinity;
  const out = [];
  while (offset < total) {
    const sep = pathname.includes("?") ? "&" : "?";
    const data = await api(`${pathname}${sep}limit=${PAGE}&offset=${offset}`);
    total = Number(data.MRData.total);
    out.push(...pick(data.MRData));
    offset += PAGE;
  }
  return out;
}

async function main() {
  console.log("📡 Pit Wall — full history dump\n");
  await mkdir(DATA, { recursive: true });

  // 1) seasons list
  const seasonsData = await api(`seasons.json?limit=100`);
  const seasons = seasonsData.MRData.SeasonTable.Seasons.map((s) => s.season);
  await save("seasons.json", seasons);
  console.log(`Seasons: ${seasons[0]}–${seasons.at(-1)} (${seasons.length})`);

  // 2) global entities (one paginate each)
  for (const [name, ep, key] of [
    ["drivers", "drivers.json", "DriverTable"],
    ["constructors", "constructors.json", "ConstructorTable"],
    ["circuits", "circuits.json", "CircuitTable"],
  ]) {
    const file = `${name}.json`;
    if (!FORCE && (await exists(path.join(DATA, file)))) {
      console.log(`✓ ${name} (cached)`);
      continue;
    }
    const rows = await paginate(ep, (m) => {
      const t = m[key];
      return t[Object.keys(t).find((k) => Array.isArray(t[k]))];
    });
    await save(file, rows);
    console.log(`✓ ${name}: ${rows.length}`);
  }

  // 3) per-season: results, standings (+ optional qualifying)
  for (const year of seasons) {
    const jobs = [
      [
        `results/${year}.json`,
        `${year}/results.json`,
        (m) => m.RaceTable.Races,
      ],
      [
        `standings/drivers-${year}.json`,
        `${year}/driverstandings.json`,
        (m) => m.StandingsTable.StandingsLists[0]?.DriverStandings ?? [],
      ],
      [
        `standings/constructors-${year}.json`,
        `${year}/constructorstandings.json`,
        (m) => m.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [],
      ],
    ];
    if (WANT_QUALI) {
      jobs.push([
        `qualifying/${year}.json`,
        `${year}/qualifying.json`,
        (m) => m.RaceTable.Races,
      ]);
    }

    for (const [file, ep, pick] of jobs) {
      if (!FORCE && (await exists(path.join(DATA, file)))) continue;
      try {
        const rows = await paginate(ep, pick);
        await save(file, rows);
      } catch (e) {
        console.warn(`  ✗ ${year} ${file}: ${e.message}`);
      }
    }
    process.stdout.write(`\r⏳ ${year} done · ${reqCount} requests`);
  }

  console.log(`\n\n✅ Archive complete · ${reqCount} total requests`);
  console.log(`   Data written to ./data`);
}

main().catch((e) => {
  console.error("\n💥", e);
  process.exit(1);
});
