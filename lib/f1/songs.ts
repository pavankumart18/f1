// Per-driver "walk-out" / signature tracks.
//
// There is no public API for F1 driver entrance songs, and we can't legally
// host the audio, so this is a curated, EDITABLE list of editorial picks.
// - `title` / `artist` always show.
// - If you add a real YouTube `youtubeId`, the in-app player streams it when the
//   music toggle is on. Without an id, the UI shows a "search on YouTube" link.
//
// Find an id from a YouTube URL: https://youtube.com/watch?v=XXXXXXXXXXX  ->  "XXXXXXXXXXX"

export interface Song {
  title: string;
  artist: string;
  youtubeId?: string;
}

export const DRIVER_SONGS: Record<string, Song> = {
  max_verstappen: {
    title: "Pump It",
    artist: "The Black Eyed Peas",
    youtubeId: "ZaI2IlHwmgQ",
  },
  hamilton: { title: "Heart of the City (Ain't No Love)", artist: "Jay-Z" },
  leclerc: {
    title: "AUS23 (1:1)",
    artist: "Charles Leclerc",
    youtubeId: "enf-wUdZNNc",
  },
  norris: {
    title: "Stick Season",
    artist: "Noah Kahan",
    youtubeId: "iWG6apzIWAk",
  },
  piastri: {
    title: "Thunderstruck",
    artist: "AC/DC",
    youtubeId: "v2AC41dglnM",
  },
  russell: { title: "Power", artist: "Kanye West" },
  antonelli: {
    title: "Sarà perché ti amo",
    artist: "Ricchi e Poveri",
    youtubeId: "h9ozyZkI064",
  },
  alonso: { title: "Vivir Mi Vida", artist: "Marc Anthony" },
  sainz: { title: "Suavemente", artist: "Elvis Crespo" },
  gasly: { title: "One More Time", artist: "Daft Punk" },
  ocon: { title: "Freed from Desire", artist: "Gala" },
  albon: { title: "Viva la Vida", artist: "Coldplay" },
  stroll: { title: "Started From the Bottom", artist: "Drake" },
  tsunoda: { title: "Blue Bird", artist: "Ikimono-gakari" },
  hulkenberg: { title: "99 Luftballons", artist: "Nena" },
  bearman: { title: "Don't Stop Me Now", artist: "Queen" },
  lawson: { title: "Six60", artist: "Don't Forget Your Roots" },
  colapinto: { title: "Muchachos", artist: "La Mosca" },
  hadjar: { title: "Lifestyle", artist: "Jason Derulo" },
  bortoleto: { title: "Evidências", artist: "Chitãozinho & Xororó" },
  doohan: { title: "Down Under", artist: "Men at Work" },
};

// Default ambience used when the music toggle is on but no driver is in focus.
export const DEFAULT_TRACK: Song = {
  title: "Formula 1 Theme — 'The Formula'",
  artist: "Brian Tyler",
  youtubeId: "vk5wTdKqQWc",
};

export function youtubeSearchUrl(song: Song): string {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
