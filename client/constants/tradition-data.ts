/**
 * Tradition data constants for wedflow mobile app
 * Mirrors the 17-culture system synced with CreatorHub monorepo
 */

export const CULTURAL_LABELS: Record<string, string> = {
  norsk: "Norsk",
  sikh: "Sikh",
  indisk: "Indisk / Hindu",
  pakistansk: "Pakistansk",
  tyrkisk: "Tyrkisk",
  arabisk: "Arabisk",
  somalisk: "Somalisk",
  etiopisk: "Etiopisk",
  nigeriansk: "Nigeriansk",
  muslimsk: "Muslimsk",
  libanesisk: "Libanesisk",
  filipino: "Filippinsk",
  kinesisk: "Kinesisk",
  koreansk: "Koreansk",
  thai: "Thai",
  iransk: "Iransk / Persisk",
  annet: "Annet",
};

export interface TraditionBudgetItem {
  category: string;
  label: string;
  estimatedCost: number;
}

export interface TraditionChecklistItem {
  title: string;
  monthsBefore: number;
  category: string;
}

/** Tradition-specific budget items per culture */
export const TRADITION_BUDGET_ITEMS: Record<string, TraditionBudgetItem[]> = {
  norsk: [
    { category: "mat", label: "Kransekake", estimatedCost: 3500 },
    { category: "underholdning", label: "Felemusiker (Hardingfele)", estimatedCost: 8000 },
    { category: "blomster", label: "Brudekrone / bunad-blomster", estimatedCost: 2500 },
  ],
  sikh: [
    { category: "seremoni", label: "Gurdwara-reservasjon", estimatedCost: 5000 },
    { category: "klær", label: "Lehenga / Sherwani", estimatedCost: 25000 },
    { category: "underholdning", label: "Dhol-spiller", estimatedCost: 6000 },
    { category: "dekor", label: "Mandap / scenepynt", estimatedCost: 15000 },
  ],
  indisk: [
    { category: "seremoni", label: "Pandit / prest", estimatedCost: 5000 },
    { category: "klær", label: "Brude-sari / Lehenga", estimatedCost: 20000 },
    { category: "dekor", label: "Mandap-dekorasjon", estimatedCost: 18000 },
    { category: "underholdning", label: "Sangeet DJ / musikk", estimatedCost: 12000 },
    { category: "mat", label: "Mehndi-kunstner", estimatedCost: 4000 },
  ],
  pakistansk: [
    { category: "klær", label: "Brude-lehenga / gharara", estimatedCost: 20000 },
    { category: "dekor", label: "Mehndi-dekorasjon", estimatedCost: 10000 },
    { category: "seremoni", label: "Nikah-arrangement", estimatedCost: 8000 },
    { category: "mat", label: "Walima-middag", estimatedCost: 30000 },
  ],
  tyrkisk: [
    { category: "seremoni", label: "Kına gecesi-arrangement", estimatedCost: 12000 },
    { category: "underholdning", label: "Davul-zurna musikere", estimatedCost: 8000 },
    { category: "smykker", label: "Takı (gullsmykker)", estimatedCost: 30000 },
    { category: "mat", label: "Tyrkisk bryllupsdessert", estimatedCost: 5000 },
  ],
  arabisk: [
    { category: "dekor", label: "Kosha / brudeplatform", estimatedCost: 15000 },
    { category: "underholdning", label: "Zaffa-prosesjon", estimatedCost: 10000 },
    { category: "mat", label: "Arabisk bryllupsmeny", estimatedCost: 35000 },
    { category: "parfyme", label: "Bakhoor / oud", estimatedCost: 3000 },
  ],
  somalisk: [
    { category: "klær", label: "Dirac / guntiino", estimatedCost: 8000 },
    { category: "mat", label: "Somalisk bryllupsmat", estimatedCost: 20000 },
    { category: "seremoni", label: "Nikah-seremoni", estimatedCost: 5000 },
  ],
  etiopisk: [
    { category: "seremoni", label: "Telosh-seremoni", estimatedCost: 5000 },
    { category: "mat", label: "Kaffeseremoni-utstyr", estimatedCost: 3000 },
    { category: "klær", label: "Habesha kemis", estimatedCost: 12000 },
    { category: "mat", label: "Injera-catering", estimatedCost: 18000 },
  ],
  nigeriansk: [
    { category: "klær", label: "Aso Oke / bryllups-outfit", estimatedCost: 15000 },
    { category: "underholdning", label: "Jùjú / Afrobeats band", estimatedCost: 12000 },
    { category: "seremoni", label: "Tradisjonell vigsel", estimatedCost: 8000 },
    { category: "mat", label: "Jollof rice-catering", estimatedCost: 20000 },
  ],
  muslimsk: [
    { category: "seremoni", label: "Imam / nikah", estimatedCost: 3000 },
    { category: "mat", label: "Halal bryllupsmeny", estimatedCost: 25000 },
    { category: "klær", label: "Bryllups-hijab / kjole", estimatedCost: 10000 },
  ],
  libanesisk: [
    { category: "underholdning", label: "Dabke-dansere", estimatedCost: 10000 },
    { category: "mat", label: "Libanesisk mezze-buffet", estimatedCost: 25000 },
    { category: "dekor", label: "Libanesisk blomsteroppsett", estimatedCost: 12000 },
  ],
  filipino: [
    { category: "seremoni", label: "Kirkeseremoni", estimatedCost: 5000 },
    { category: "seremoni", label: "Snoroppheng / slør-seremoni", estimatedCost: 2000 },
    { category: "mat", label: "Lechon-helstekt gris", estimatedCost: 8000 },
    { category: "underholdning", label: "Filipino-band / karaoke", estimatedCost: 7000 },
  ],
  kinesisk: [
    { category: "seremoni", label: "Teseremoni-sett", estimatedCost: 5000 },
    { category: "klær", label: "Qipao / Changshan", estimatedCost: 12000 },
    { category: "dekor", label: "Rød dekor / dobbel-lykke", estimatedCost: 8000 },
    { category: "mat", label: "Kinesisk bryllupsbankett", estimatedCost: 40000 },
  ],
  koreansk: [
    { category: "seremoni", label: "Pyebaek-seremoni", estimatedCost: 8000 },
    { category: "klær", label: "Hanbok", estimatedCost: 10000 },
    { category: "mat", label: "Koreansk bryllupsbankett", estimatedCost: 35000 },
  ],
  thai: [
    { category: "seremoni", label: "Munkevelsignelse", estimatedCost: 5000 },
    { category: "seremoni", label: "Khan Maak-prosesjon", estimatedCost: 6000 },
    { category: "dekor", label: "Garland / Phuang Malai", estimatedCost: 4000 },
  ],
  iransk: [
    { category: "seremoni", label: "Sofreh Aghd", estimatedCost: 12000 },
    { category: "underholdning", label: "Persisk livemusikk", estimatedCost: 15000 },
    { category: "mat", label: "Persisk bryllupsmeny", estimatedCost: 30000 },
  ],
};

/** Tradition-specific checklist items per culture */
export const TRADITION_CHECKLIST_ITEMS: Record<string, TraditionChecklistItem[]> = {
  norsk: [
    { title: "Bestill kransekake", monthsBefore: 2, category: "mat" },
    { title: "Bestill hardingfele-spiller", monthsBefore: 6, category: "underholdning" },
    { title: "Bestill/lån bunad", monthsBefore: 4, category: "klær" },
  ],
  sikh: [
    { title: "Reserver gurdwara", monthsBefore: 8, category: "seremoni" },
    { title: "Bestill dhol-spiller", monthsBefore: 4, category: "underholdning" },
    { title: "Bestill Anand Karaj-prest", monthsBefore: 6, category: "seremoni" },
    { title: "Planlegg Jaggo-natt", monthsBefore: 2, category: "seremoni" },
  ],
  indisk: [
    { title: "Bestill pandit for vigselen", monthsBefore: 6, category: "seremoni" },
    { title: "Planlegg Sangeet-fest", monthsBefore: 3, category: "underholdning" },
    { title: "Bestill mehndi-kunstner", monthsBefore: 2, category: "skjønnhet" },
    { title: "Bestill mandap-dekoratør", monthsBefore: 4, category: "dekor" },
  ],
  pakistansk: [
    { title: "Planlegg Mehndi-kveld", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill Nikah-imam", monthsBefore: 4, category: "seremoni" },
    { title: "Planlegg Walima-middag", monthsBefore: 3, category: "mat" },
    { title: "Bestill Baraat-transport", monthsBefore: 2, category: "logistikk" },
  ],
  tyrkisk: [
    { title: "Planlegg Kına Gecesi", monthsBefore: 1, category: "seremoni" },
    { title: "Bestill davul-zurna", monthsBefore: 3, category: "underholdning" },
    { title: "Planlegg Takı-seremoni", monthsBefore: 1, category: "seremoni" },
  ],
  arabisk: [
    { title: "Bestill Zaffa-musikere", monthsBefore: 3, category: "underholdning" },
    { title: "Design Kosha-plattform", monthsBefore: 4, category: "dekor" },
    { title: "Bestill Bakhoor/Oud", monthsBefore: 1, category: "dekor" },
  ],
  somalisk: [
    { title: "Bestill Nikah-imam", monthsBefore: 4, category: "seremoni" },
    { title: "Bestill Dirac/Guntiino", monthsBefore: 3, category: "klær" },
    { title: "Planlegg Aroos-middag", monthsBefore: 2, category: "mat" },
  ],
  etiopisk: [
    { title: "Planlegg Telosh-seremoni", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill kaffeseremoni-utstyr", monthsBefore: 1, category: "seremoni" },
    { title: "Bestill Habesha Kemis", monthsBefore: 4, category: "klær" },
  ],
  nigeriansk: [
    { title: "Bestill Aso Oke-stoff", monthsBefore: 4, category: "klær" },
    { title: "Bestill Jùjú-band", monthsBefore: 3, category: "underholdning" },
    { title: "Planlegg tradisjonell vigsel", monthsBefore: 6, category: "seremoni" },
  ],
  muslimsk: [
    { title: "Bestill imam for Nikah", monthsBefore: 4, category: "seremoni" },
    { title: "Planlegg Walima", monthsBefore: 3, category: "mat" },
    { title: "Bestill halal-catering", monthsBefore: 2, category: "mat" },
  ],
  libanesisk: [
    { title: "Bestill Dabke-dansere", monthsBefore: 3, category: "underholdning" },
    { title: "Planlegg Zaffe-inngang", monthsBefore: 2, category: "underholdning" },
    { title: "Bestill libanesisk catering", monthsBefore: 3, category: "mat" },
  ],
  filipino: [
    { title: "Reserver kirke", monthsBefore: 8, category: "seremoni" },
    { title: "Planlegg snor/slør-seremoni", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill lechon", monthsBefore: 1, category: "mat" },
  ],
  kinesisk: [
    { title: "Planlegg teseremoni", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill Qipao/Changshan", monthsBefore: 4, category: "klær" },
    { title: "Bestill rød dekorasjon", monthsBefore: 2, category: "dekor" },
    { title: "Planlegg Door Games", monthsBefore: 1, category: "underholdning" },
  ],
  koreansk: [
    { title: "Planlegg Pyebaek-seremoni", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill Hanbok", monthsBefore: 4, category: "klær" },
    { title: "Bestill koreansk bankett", monthsBefore: 3, category: "mat" },
  ],
  thai: [
    { title: "Avtale munkevelsignelse", monthsBefore: 3, category: "seremoni" },
    { title: "Planlegg Khan Maak-prosesjon", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill Phuang Malai-girlander", monthsBefore: 1, category: "dekor" },
  ],
  iransk: [
    { title: "Sett opp Sofreh Aghd", monthsBefore: 2, category: "seremoni" },
    { title: "Bestill persisk musikk", monthsBefore: 3, category: "underholdning" },
    { title: "Planlegg Aghd-seremoni", monthsBefore: 4, category: "seremoni" },
  ],
};

/** Get tradition-aware hints for a given culture and category */
export function getTraditionHints(
  traditions: string[],
  category: string
): { text: string; icon: string }[] {
  const hints: { text: string; icon: string }[] = [];

  for (const t of traditions) {
    const key = t.toLowerCase();
    switch (category) {
      case "venue":
        if (key === "sikh") hints.push({ text: "Sikh-bryllup holdes ofte i Gurdwara. Sjekk om lokalet tillater seremoni.", icon: "home" });
        if (key === "indisk") hints.push({ text: "Hindu-bryllup trenger plass til mandap og hellig ild.", icon: "flame" });
        if (key === "muslimsk" || key === "arabisk") hints.push({ text: "Noen familier foretrekker kjønnsdelte soner.", icon: "users" });
        if (key === "norsk") hints.push({ text: "Norske bryllup har ofte kirkevielse + separat festlokale.", icon: "map-pin" });
        break;
      case "cake":
        if (key === "norsk") hints.push({ text: "Kransekake er norsk tradisjon! Bestill fra spesialist.", icon: "award" });
        if (key === "kinesisk") hints.push({ text: "Kinesiske bryllup serverer ofte rød bønnekake eller fruktkake.", icon: "gift" });
        if (key === "indisk") hints.push({ text: "Vurder tradisjonell indisk barfi eller gulab jamun-tårn.", icon: "star" });
        break;
      case "catering":
        if (key === "muslimsk" || key === "pakistansk" || key === "arabisk" || key === "somalisk") hints.push({ text: "Sørg for halal-sertifisert kjøkken.", icon: "check-circle" });
        if (key === "sikh" || key === "indisk") hints.push({ text: "Langar-tradisjonen: vegetarmat til alle. Sjekk behov.", icon: "heart" });
        if (key === "etiopisk") hints.push({ text: "Injera og doro wot er vanlig. Bestill fra spesialist.", icon: "coffee" });
        if (key === "koreansk") hints.push({ text: "Koreansk buffet med bulgogi og japchae er populært.", icon: "zap" });
        break;
      case "dress":
        if (key === "indisk") hints.push({ text: "Lehenga eller sari — bestill tidlig for tilpasning.", icon: "shopping-bag" });
        if (key === "pakistansk") hints.push({ text: "Gharara eller sharara med dupatta — tillat tid for broderi.", icon: "scissors" });
        if (key === "norsk") hints.push({ text: "Bunad er tradisjonelt. Sjekk om du ønsker brudekrone.", icon: "award" });
        if (key === "kinesisk") hints.push({ text: "Qipao for teseremonien, vestlig kjole for mottagelsen.", icon: "star" });
        if (key === "koreansk") hints.push({ text: "Hanbok for Pyebaek-seremoni. Bestill tilpasset.", icon: "heart" });
        break;
      case "music":
        if (key === "sikh") hints.push({ text: "Dhol-spiller til Baraat er et must!", icon: "music" });
        if (key === "arabisk" || key === "libanesisk") hints.push({ text: "Dabke og Zaffa — bestill profesjonelle dansere.", icon: "users" });
        if (key === "norsk") hints.push({ text: "Hardingfele gir autentisk norsk stemning.", icon: "music" });
        if (key === "nigeriansk") hints.push({ text: "Jùjú-band eller Afrobeats DJ for dansefesten.", icon: "speaker" });
        if (key === "iransk") hints.push({ text: "Persisk livemusikk med tar og santur.", icon: "music" });
        break;
      case "flowers":
        if (key === "indisk" || key === "sikh") hints.push({ text: "Marigold-girlander er tradisjonelle. Bestill i bulk.", icon: "sun" });
        if (key === "thai") hints.push({ text: "Phuang Malai jasmin-girlander er viktige.", icon: "gift" });
        if (key === "norsk") hints.push({ text: "Ville blomster og grønt passer norsk stil.", icon: "feather" });
        break;
    }
  }

  return hints;
}

/** Cake sizing suggestions based on guest count */
export function getCakeSizingSuggestion(guests: number): string {
  if (guests <= 30) return "Liten kake (2–3 etasjer) passer til ~30 gjester.";
  if (guests <= 80) return "Medium kake (3–4 etasjer) passer til ~80 gjester.";
  if (guests <= 150) return "Stor kake (4–5 etasjer) passer til ~150 gjester.";
  return `Ekstra stor kake eller flere kaker anbefales for ${guests} gjester.`;
}

/** Per-person budget scaling */
export function getPerPersonBudget(totalBudget: number, guests: number): number {
  if (guests <= 0) return 0;
  return Math.round(totalBudget / guests);
}
