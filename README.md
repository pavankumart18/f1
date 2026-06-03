# 🏁 The Pit Wall

An editorial **Formula 1 dashboard** — a digital broadsheet for the modern era.
Live timing, real championship standings, the full calendar, driver photos &
walk-out songs, circuit histories, a complete **stats archive back to 1950**,
and analysis charts over the whole history of the sport.

### ▶ Live: **https://f1-rose.vercel.app**

Built with **Next.js 16** (App Router), **React 19**, **Tailwind v4**.

## Features

- **Two skins, one toggle** — *Broadsheet* (warm paper) and *Carbon* (dark), via the header switch.
- **Live dashboard** — countdown to lights out, season calendar, drivers' & constructors' standings, a data-derived "Paddock Intel" column, and a live stat ticker.
- **Live timing** (`/live`) — positions, gaps, intervals & tyres for the latest/live session, auto-refreshing (OpenF1).
- **Stats explorer** — every season 1950→now, driver & constructor pages, race results, head-to-head comparison.
- **Circuits** (`/circuits`) — per-track history, track map, "King of the Circuit", top constructors, and a full roll of honour.
- **Record books** (`/records`) — all-time leaderboards: wins, titles, podiums, poles, points, starts.
- **Analysis** (`/analysis`) — calendar growth, races per decade, most dominant seasons, reliability.
- **Driver photos** — pulled from Wikipedia/Wikimedia (CC-licensed).
- **Walk-out songs** — verified per-driver tracks for the full grid with a global music toggle (YouTube). Edit `lib/f1/songs.ts`.
- **Track maps** — real circuit outlines (open `f1-circuits` GeoJSON).

## Data sources

- **[Jolpica-F1](https://github.com/jolpica/jolpica-f1)** (Ergast successor) — schedule, results, standings, drivers, constructors. 1950–present.
- **Wikipedia REST API** — driver photos.
- **[f1-circuits](https://github.com/bacinger/f1-circuits)** — circuit layout GeoJSON.
- **[OpenF1](https://openf1.org)** — live timing / telemetry (`/live`).

Not affiliated with Formula 1. For personal / educational use.

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
