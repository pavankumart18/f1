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
  // 2026 grid — verified embeddable YouTube IDs
  max_verstappen: { title: "Pump It", artist: "The Black Eyed Peas", youtubeId: "ZaI2IlHwmgQ" },
  antonelli: { title: "Sarà perché ti amo", artist: "Ricchi e Poveri", youtubeId: "h9ozyZkI064" },
  russell: { title: "Power", artist: "Kanye West", youtubeId: "L53gjP-TtGE" },
  leclerc: { title: "AUS23 (1:1)", artist: "Charles Leclerc", youtubeId: "enf-wUdZNNc" },
  hamilton: { title: "Heart of the City", artist: "Jay-Z", youtubeId: "KxIzmGIvqDA" },
  norris: { title: "Stick Season", artist: "Noah Kahan", youtubeId: "iWG6apzIWAk" },
  piastri: { title: "Thunderstruck", artist: "AC/DC", youtubeId: "v2AC41dglnM" },
  gasly: { title: "One More Time", artist: "Daft Punk", youtubeId: "FGBhQbmPwH8" },
  bearman: { title: "Don't Stop Me Now", artist: "Queen", youtubeId: "HgzGwKwLmgM" },
  lawson: { title: "Don't Forget Your Roots", artist: "Six60", youtubeId: "QaJwG3oQltg" },
  colapinto: { title: "Muchachos", artist: "La Mosca", youtubeId: "VitBwY1y3QQ" },
  hadjar: { title: "Lifestyle", artist: "Jason Derulo", youtubeId: "8kQH9MnCR0c" },
  sainz: { title: "Suavemente", artist: "Elvis Crespo", youtubeId: "WPiEbYSF9kE" },
  arvid_lindblad: { title: "Wonderwall", artist: "Oasis", youtubeId: "bx1Bh8ZvH84" },
  bortoleto: { title: "Evidências", artist: "Chitãozinho & Xororó", youtubeId: "ePjtnSPFWK8" },
  ocon: { title: "Freed from Desire", artist: "Gala", youtubeId: "p3l7fgvrEKM" },
  albon: { title: "Viva la Vida", artist: "Coldplay", youtubeId: "dvgZkm1xWPE" },
  hulkenberg: { title: "99 Luftballons", artist: "Nena", youtubeId: "Fpu5a0Bl8eY" },
  bottas: { title: "Sandstorm", artist: "Darude", youtubeId: "kqyWSFmBFUg" },
  stroll: { title: "Started From the Bottom", artist: "Drake", youtubeId: "OnHeGPSLCcA" },
  alonso: { title: "Vivir Mi Vida", artist: "Marc Anthony", youtubeId: "YXnjy5YlDwk" },
  perez: { title: "El Rey", artist: "Vicente Fernández" },

  // recent grid alumni (kept for archive pages)
  tsunoda: { title: "Blue Bird", artist: "Ikimono-gakari" },
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
