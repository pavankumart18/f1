// Map Ergast country names AND nationality demonyms to ISO-3166 alpha-2,
// then render a regional-indicator emoji flag.

const ISO: Record<string, string> = {
  // countries (race locations)
  australia: "AU", austria: "AT", azerbaijan: "AZ", bahrain: "BH",
  belgium: "BE", brazil: "BR", canada: "CA", china: "CN", france: "FR",
  germany: "DE", "great britain": "GB", uk: "GB", "united kingdom": "GB",
  hungary: "HU", india: "IN", italy: "IT", japan: "JP", korea: "KR",
  malaysia: "MY", mexico: "MX", monaco: "MC", morocco: "MA",
  netherlands: "NL", portugal: "PT", qatar: "QA", russia: "RU",
  "saudi arabia": "SA", singapore: "SG", "south africa": "ZA",
  spain: "ES", sweden: "SE", switzerland: "CH", turkey: "TR",
  uae: "AE", "united arab emirates": "AE", usa: "US",
  "united states": "US", "united states of america": "US", vietnam: "VN",
  argentina: "AR", indonesia: "ID", "san marino": "SM",

  // nationalities (drivers / constructors)
  australian: "AU", austrian: "AT", argentine: "AR", azerbaijani: "AZ",
  belgian: "BE", brazilian: "BR", british: "GB", english: "GB",
  scottish: "GB", canadian: "CA", chinese: "CN", colombian: "CO",
  czech: "CZ", danish: "DK", dutch: "NL", finnish: "FI", french: "FR",
  german: "DE", hungarian: "HU", indian: "IN", indonesian: "ID",
  irish: "IE", italian: "IT", japanese: "JP", malaysian: "MY",
  mexican: "MX", "monegasque": "MC", "new zealander": "NZ",
  polish: "PL", portuguese: "PT", russian: "RU", "saudi": "SA",
  spanish: "ES", swedish: "SE", swiss: "CH", thai: "TH", turkish: "TR",
  american: "US", venezuelan: "VE",
};

export function flag(name?: string | null): string {
  if (!name) return "🏁";
  const code = ISO[name.trim().toLowerCase()];
  if (!code) return "🏁";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
