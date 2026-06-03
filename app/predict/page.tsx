import {
  getNextRace,
  getLastResults,
  getDriverStandings,
} from "@/lib/f1/api";
import {
  PredictionsGame,
  type RaceLite,
  type ResultLite,
} from "@/components/predictions-game";

export const revalidate = 600;
export const metadata = { title: "Podium Predictor — The Pit Wall" };

export default async function PredictPage() {
  const [nextRaceRaw, lastRaceRaw, standings] = await Promise.all([
    getNextRace(),
    getLastResults(),
    getDriverStandings("current").catch(() => []),
  ]);

  const nextRace: RaceLite | null = nextRaceRaw
    ? {
        season: nextRaceRaw.season,
        round: nextRaceRaw.round,
        name: nextRaceRaw.raceName,
        date: nextRaceRaw.date,
        time: nextRaceRaw.time,
      }
    : null;

  const lastRace: ResultLite | null = lastRaceRaw?.Results
    ? {
        season: lastRaceRaw.season,
        round: lastRaceRaw.round,
        name: lastRaceRaw.raceName,
        results: lastRaceRaw.Results.map((r) => ({
          id: r.Driver.driverId,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`,
          position: r.position,
          grid: r.grid,
          fl: r.FastestLap?.rank === "1",
        })),
      }
    : null;

  const drivers = standings.map((s) => ({
    id: s.Driver.driverId,
    name: `${s.Driver.givenName} ${s.Driver.familyName}`,
  }));

  return (
    <PredictionsGame nextRace={nextRace} lastRace={lastRace} drivers={drivers} />
  );
}
