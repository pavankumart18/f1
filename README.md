# 🏁 The Pit Wall

An editorial **Formula 1 dashboard** — a digital broadsheet for the modern era.
A cinematic intro, live race telemetry, real championship standings, driver
dossiers with photos & walk-out songs, circuit histories, a complete **stats
archive back to 1950**, and analysis over the whole history of the sport —
mobile-first, with two skins.

### ▶ Live: **https://f1-rose.vercel.app**

Built with **Next.js 16** (App Router), **React 19**, **Tailwind v4**, deployed on Vercel.

## Features

**Experience**
- **Cinematic intro** — lights-out start sequence → F1 cars rushing the camera → driver-by-driver parade (OpenF1 headshots) → title reveal, set to "Lose My Mind". First-visit gated; replay from the footer.
- **Two skins, one toggle** — *Broadsheet* (warm paper) and *Carbon* (dark).
- **Lights-out page transitions**, a global **music toggle** (per-driver walk-out songs), and **livery theming** (driver/constructor/circuit pages recolour to the team).
- **Mobile-first** — sticky bottom tab bar, pull-to-refresh, swipe/scroll-snap strips.

**Live race mode** (`/live`, OpenF1)
- Auto-refreshing **timing board** — positions, gaps, intervals, tyres (your driver highlighted).
- **The Pace** — lap-time chart (top 5, pit/safety-car laps stripped).
- **Position by Lap** — the iconic "spaghetti" race-progression chart.
- **Tyre Strategy** — per-driver stint bars (the undercut/overcut story).
- The same telemetry appears on **historic race pages for 2023+** via a Jolpica→OpenF1 session mapping.

**Dashboard & stats**
- **Dashboard** — next-race **odometer countdown**, car slideshow (every team's livery), season calendar, standings (with driver faces), Paddock Intel, live ticker, **On This Day**, and your **favourite driver's** live form.
- **Driver dossiers** — photo, career stats, **season-by-season timeline**, milestones, and **auto-detected setbacks & comebacks**, plus a points-by-season trajectory chart.
- **Records** (`/records`) — all-time leaderboards: wins, titles, podiums, poles, points, starts.
- **Circuits** (`/circuits`) — per-track history, track map, "King of the Circuit", roll of honour.
- **Analysis** (`/analysis`) — calendar growth, races per decade, most dominant seasons, reliability.
- **Compare** (`/compare`) — head-to-head career totals + **rivalry mode** (season-by-season points + H2H tally).
- **Archive** (`/archive`) — every season 1950→now; race result pages.
- **Shareable OG images** for home, driver and constructor pages (`next/og`).
- **Track maps** — real circuit outlines (`f1-circuits` GeoJSON).

> `/garage` (a "lite" exploded-kit + drivable car homage) exists but is currently hidden from the nav pending a 3D rework.

## Data sources

- **[Jolpica-F1](https://github.com/jolpica/jolpica-f1)** (Ergast successor) — schedule, results, standings, drivers, constructors. 1950–present.
- **Wikipedia REST API** — driver photos.
- **[f1-circuits](https://github.com/bacinger/f1-circuits)** — circuit layout GeoJSON.
- **[OpenF1](https://openf1.org)** — live timing, laps, stints, positions & driver headshots (`/live`, 2023+).

Not affiliated with Formula 1. For personal / educational use.

📚 See **[LEARNINGS.md](./LEARNINGS.md)** for the technical, architectural and product takeaways from building this.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build the history archive

`/records` and `/analysis` read a local dump of the full archive:

```bash
node scripts/fetch-archive.mjs           # core dump (results + standings + entities)
node scripts/fetch-archive.mjs --quali   # also pull qualifying
```

The script is **resumable** — Jolpica rate-limits bulk pulls, so it backs off and
skips files it already has. Re-run it to fill any gaps. Output → `data/`.

## Deploy

```bash
npx vercel          # preview
npx vercel --prod   # production
```
