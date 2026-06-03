// Driver/constructor photos from Wikipedia's REST summary endpoint.
// Images are served from Wikimedia Commons (mostly CC-licensed). We derive the
// page title from the Wikipedia URL Ergast/Jolpica already gives us.

function titleFromUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/(.+)$/);
  return m ? m[1] : null;
}

export async function getWikiImage(
  wikipediaUrl?: string
): Promise<string | null> {
  const title = titleFromUrl(wikipediaUrl);
  if (!title) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { next: { revalidate: 7 * 24 * 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const thumb: string | undefined = data?.thumbnail?.source;
    // Wikimedia thumb URLs embed the width (e.g. /330px-Name.jpg); request 640.
    if (thumb) return thumb.replace(/\/\d+px-/, "/640px-");
    return data?.originalimage?.source ?? null;
  } catch {
    return null;
  }
}
