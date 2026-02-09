// Tradition-specific timeline templates
// Keys synced with CreatorHub culturalType for seamless bridge
// These templates are automatically added when a couple selects their cultural tradition

export interface TimelineTemplate {
  time: string;
  title: string;
  icon: 'heart' | 'camera' | 'music' | 'users' | 'coffee' | 'sun' | 'moon' | 'star';
  description?: string;
}

export const TIMELINE_TEMPLATES: Record<string, TimelineTemplate[]> = {
  // === NORSK (was: norway) ===
  norsk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "14:00", title: "Vielse", icon: "users", description: "Kirkelig vielse" },
    { time: "14:30", title: "Gratulering", icon: "heart", description: "Gratulasjon utenfor kirken" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "16:00", title: "Cocktail", icon: "coffee", description: "Mingling og forfriskninger" },
    { time: "17:00", title: "Middag", icon: "coffee", description: "Bryllupsmiddag" },
    { time: "19:00", title: "Taler", icon: "users", description: "Taler og skåler" },
    { time: "20:00", title: "Kransekake", icon: "heart", description: "Kransekake-seremoni" },
    { time: "20:30", title: "Brudevalsen", icon: "music", description: "Første dans" },
    { time: "21:00", title: "Dans og fest", icon: "music", description: "Feiring til sent på kvelden" },
  ],
  // === SIKH (stays same) ===
  sikh: [
    { time: "06:00", title: "Ganesh Puja", icon: "star", description: "Bønn for å fjerne hindringer" },
    { time: "07:00", title: "Madhuparka", icon: "coffee", description: "Brudgommens velkomst" },
    { time: "08:00", title: "Kanyadaan", icon: "users", description: "Farens gave av bruden" },
    { time: "09:00", title: "Agni Poojan", icon: "sun", description: "Hellig ildseremoni" },
    { time: "10:00", title: "Saptapadi", icon: "heart", description: "De syv skritt rundt ilden" },
    { time: "11:00", title: "Mangalsutra", icon: "heart", description: "Hellig halskjede" },
    { time: "12:00", title: "Sindoor", icon: "star", description: "Rød farge i hårskillen" },
    { time: "13:00", title: "Lunch & Velsignelser", icon: "coffee", description: "Måltid og velsignelser fra eldre" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "users", description: "Reception for gjester" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Festmiddag" },
  ],
  // === INDISK (was: hindu) ===
  indisk: [
    { time: "06:00", title: "Ganesh Puja", icon: "star", description: "Bønn for å fjerne hindringer" },
    { time: "07:00", title: "Madhuparka", icon: "coffee", description: "Brudgommens velkomst" },
    { time: "08:00", title: "Kanyadaan", icon: "users", description: "Farens gave av bruden" },
    { time: "09:00", title: "Agni Poojan", icon: "sun", description: "Hellig ildseremoni" },
    { time: "10:00", title: "Saptapadi", icon: "heart", description: "De syv skritt rundt ilden" },
    { time: "11:00", title: "Mangalsutra", icon: "heart", description: "Hellig halskjede" },
    { time: "12:00", title: "Sindoor", icon: "star", description: "Rød farge i hårskillen" },
    { time: "13:00", title: "Lunch & Velsignelser", icon: "coffee", description: "Måltid og velsignelser fra eldre" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "users", description: "Reception for gjester" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Festmiddag" },
    { time: "20:00", title: "Vidai", icon: "moon", description: "Brudens avskjed fra hjemmet" },
  ],
  sikh: [
    { time: "07:00", title: "Anand Karaj forberedelse", icon: "sun", description: "Morgenforberedelser" },
    { time: "09:00", title: "Milni", icon: "users", description: "Familienes møte" },
    { time: "10:00", title: "Anand Karaj", icon: "heart", description: "Vielse i Gurdwara" },
    { time: "11:00", title: "Laavan - Første runde", icon: "star", description: "Første runde rundt Guru Granth Sahib" },
    { time: "11:15", title: "Laavan - Andre runde", icon: "star", description: "Andre runde - disiplin" },
    { time: "11:30", title: "Laavan - Tredje runde", icon: "star", description: "Tredje runde - spiritualitet" },
    { time: "11:45", title: "Laavan - Fjerde runde", icon: "star", description: "Fjerde runde - harmoni" },
    { time: "12:00", title: "Palla-seremoni", icon: "heart", description: "Sjal som binder paret" },
    { time: "12:30", title: "Karah Parshad", icon: "coffee", description: "Hellig søt pudding" },
    { time: "13:00", title: "Langar", icon: "coffee", description: "Fellesskap måltid i Gurdwara" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Reception", icon: "users", description: "Kveldsmottak for gjester" },
    { time: "20:00", title: "Doli", icon: "moon", description: "Brudens avreise" },
  ],
  // === PAKISTANSK (new) ===
  pakistansk: [
    { time: "16:00", title: "Mehndi forberedelse", icon: "heart", description: "Forberedelser til Mehndi-kveld" },
    { time: "17:00", title: "Mehndi-seremoni", icon: "star", description: "Henna-påføring med tradisjonelle sanger" },
    { time: "18:00", title: "Sangeet", icon: "music", description: "Musikk, dans og opptredener" },
    { time: "20:00", title: "Mehndi-fest", icon: "coffee", description: "Mat og feiring" },
    { time: "09:00", title: "Baraat forberedelse", icon: "sun", description: "Brudgommens forberedelser" },
    { time: "11:00", title: "Baraat", icon: "users", description: "Brudgommens storslåtte prosesjon" },
    { time: "12:00", title: "Nikkah", icon: "heart", description: "Islamsk vielsesseremoni med kontrakt" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "14:00", title: "Rukhsati", icon: "moon", description: "Brudens avskjed fra hjemmet" },
    { time: "18:00", title: "Walima", icon: "coffee", description: "Brudgommens familieresepsjon" },
    { time: "20:00", title: "Walima middag", icon: "coffee", description: "Storslått festmiddag" },
  ],
  // === TYRKISK (new) ===
  tyrkisk: [
    { time: "18:00", title: "Kına Gecesi forberedelse", icon: "heart", description: "Forberedelse til henna-kveld" },
    { time: "19:00", title: "Kına Gecesi", icon: "star", description: "Tradisjonell henna-kveld med sanger" },
    { time: "20:00", title: "Henna-påføring", icon: "heart", description: "Bruden får henna med gullmynt i håndflaten" },
    { time: "21:00", title: "Dans og feiring", icon: "music", description: "Tradisjonell tyrkisk dans og feiring" },
    { time: "10:00", title: "Gelin Alma", icon: "users", description: "Brudgommen henter bruden" },
    { time: "12:00", title: "Düğün seremoni", icon: "heart", description: "Bryllupsseremoni" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Takı Töreni", icon: "star", description: "Gullsmykke-seremoni" },
    { time: "15:00", title: "Düğün fest", icon: "coffee", description: "Storslått bryllupsmiddag" },
    { time: "17:00", title: "Halay dans", icon: "music", description: "Tradisjonell gruppedan i ring" },
  ],
  // === ARABISK (new) ===
  arabisk: [
    { time: "18:00", title: "Henna-kveld", icon: "star", description: "Tradisjonell henna-feiring for kvinner" },
    { time: "19:00", title: "Henna-påføring", icon: "heart", description: "Kunstferdie henna-mønstre" },
    { time: "20:00", title: "Henna-fest", icon: "music", description: "Tradisjonell musikk og dans" },
    { time: "14:00", title: "Nikah forberedelse", icon: "sun", description: "Forberedelser til vielsen" },
    { time: "15:00", title: "Nikah", icon: "heart", description: "Islamsk vielse med kontrakt" },
    { time: "16:00", title: "Zaffe innmarsj", icon: "music", description: "Spektakulær prosesjon med trommer" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Walima middag", icon: "coffee", description: "Storslått bryllupsmiddag" },
    { time: "20:00", title: "Dabke-dans", icon: "music", description: "Tradisjonell gruppedans" },
    { time: "22:00", title: "Avslutning", icon: "moon", description: "Avskjed og velsignelser" },
  ],
  // === SOMALISK (new) ===
  somalisk: [
    { time: "14:00", title: "Nikah forberedelse", icon: "sun", description: "Forberedelser til vielsen" },
    { time: "15:00", title: "Nikah seremoni", icon: "heart", description: "Islamsk vielse med Koran-resitasjon" },
    { time: "16:00", title: "Duaa og velsignelse", icon: "star", description: "Bønner for brudeparet" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "18:00", title: "Aroos feiring", icon: "music", description: "Tradisjonell somalisk feiring" },
    { time: "19:00", title: "Aroos middag", icon: "coffee", description: "Autentisk somalisk mat" },
    { time: "20:00", title: "Niiko dans", icon: "music", description: "Tradisjonell somalisk dans" },
    { time: "22:00", title: "Shaash Saar", icon: "heart", description: "Slør-seremoni" },
  ],
  // === ETIOPISK (new) ===
  etiopisk: [
    { time: "10:00", title: "Telosh forberedelse", icon: "sun", description: "Morgenforberedelser" },
    { time: "12:00", title: "Telosh seremoni", icon: "heart", description: "Tradisjonell førbryllups-seremoni" },
    { time: "13:00", title: "Velsignelse fra eldre", icon: "users", description: "Eldre gir råd og velsignelser" },
    { time: "14:00", title: "Vielsesseremoni", icon: "heart", description: "Ortodoks eller sivil vielse" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Kaffe-seremoni", icon: "coffee", description: "Tradisjonell etiopisk kaffe-seremoni" },
    { time: "17:00", title: "Melse resepsjon", icon: "coffee", description: "Injera og tradisjonell mat" },
    { time: "19:00", title: "Eskista dans", icon: "music", description: "Tradisjonell etiopisk dans" },
    { time: "21:00", title: "Avslutning", icon: "moon", description: "Velsignelser og avskjed" },
  ],
  // === NIGERIANSK (new) ===
  nigeriansk: [
    { time: "10:00", title: "White Wedding forberedelser", icon: "heart", description: "Forberedelser til kirkelig vielse" },
    { time: "12:00", title: "White Wedding", icon: "users", description: "Kirkelig vielsesseremoni" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Cocktail", icon: "coffee", description: "Mingling etter kirken" },
    { time: "16:00", title: "Traditional Wedding", icon: "star", description: "Tradisjonell kulturell seremoni" },
    { time: "17:00", title: "Palmvin-test", icon: "coffee", description: "Bruden finner brudgommen med palmvin" },
    { time: "18:00", title: "Tradisjonell middag", icon: "coffee", description: "Jollof ris og tradisjonell mat" },
    { time: "20:00", title: "Aso-Oke dans", icon: "music", description: "Dans i matchende tradisjonelle klær" },
    { time: "22:00", title: "Spraying", icon: "star", description: "Gjester kaster pengesedler på dansegulvet" },
  ],
  // === MUSLIMSK (was: muslim) ===
  muslimsk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "14:00", title: "Mehndi (valgfritt)", icon: "star", description: "Henna-seremoni for bruden" },
    { time: "16:00", title: "Nikah forberedelse", icon: "users", description: "Forberedelse til vielse" },
    { time: "17:00", title: "Nikah", icon: "heart", description: "Islamsk vielse med imam og vitner" },
    { time: "17:30", title: "Mehr-gave", icon: "star", description: "Brudgommens gave til bruden" },
    { time: "18:00", title: "Du'a", icon: "sun", description: "Bønner og velsignelser" },
    { time: "18:30", title: "Gratulering", icon: "users", description: "Gratulasjon fra familie og venner" },
    { time: "19:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "20:00", title: "Walima", icon: "coffee", description: "Bryllupsfest arrangert av brudgommen" },
    { time: "21:00", title: "Middag", icon: "coffee", description: "Festmåltid for alle gjester" },
    { time: "23:00", title: "Rukhsati", icon: "moon", description: "Brudens avskjed fra familien" },
  ],
  // === LIBANESISK (new) ===
  libanesisk: [
    { time: "18:00", title: "Henna Party", icon: "star", description: "Tradisjonell henna-feiring" },
    { time: "19:00", title: "Henna-påføring", icon: "heart", description: "Eldre kvinner påfører henna" },
    { time: "20:00", title: "Libanesisk fest", icon: "music", description: "Tradisjonell musikk og dabke" },
    { time: "12:00", title: "Vielsesseremoni", icon: "heart", description: "Kirkelig eller sivil vielse" },
    { time: "13:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "15:00", title: "Zaffe innmarsj", icon: "music", description: "Spektakulær prosesjon med trommer" },
    { time: "16:00", title: "Meze-bord", icon: "coffee", description: "Tradisjonell libanesisk mat" },
    { time: "18:00", title: "Middag", icon: "coffee", description: "Storslått libanesisk festmiddag" },
    { time: "20:00", title: "Dabke-dans", icon: "music", description: "Tradisjonell libanesisk gruppedans" },
    { time: "22:00", title: "Avslutning", icon: "moon", description: "Velsignelser og avskjed" },
  ],
  // === FILIPINO (new) ===
  filipino: [
    { time: "18:00", title: "Despedida de Soltera", icon: "star", description: "Avskjedsfest for singel-livet" },
    { time: "19:00", title: "Despedida feiring", icon: "music", description: "Leker, mat og gaver" },
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
    { time: "12:00", title: "Katolsk vielse", icon: "users", description: "Vielse med tradisjonelle elementer" },
    { time: "12:30", title: "Arras mynter", icon: "star", description: "13 mynter som symbol på forsørgelse" },
    { time: "12:45", title: "Veil & Cord", icon: "heart", description: "Slør og ledning som symbol på enhet" },
    { time: "13:00", title: "Unity Candle", icon: "sun", description: "Enhetslys-seremoni" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "16:00", title: "Reception", icon: "coffee", description: "Resepsjon med tradisjonell mat" },
    { time: "18:00", title: "Money Dance", icon: "music", description: "Gjester fester penger på brudeparet" },
  ],
  // === KINESISK (was: chinese) ===
  kinesisk: [
    { time: "07:00", title: "Hårpynt-seremoni", icon: "heart", description: "Brudens hår og sminke" },
    { time: "08:00", title: "Brudgommen henter bruden", icon: "users", description: "Dør-spill og hindringer" },
    { time: "09:00", title: "Te-seremoni", icon: "coffee", description: "Servering av te til eldre familiemedlemmer" },
    { time: "10:00", title: "Hårbøying", icon: "star", description: "Bruden bøyer seg for forfedre" },
    { time: "11:00", title: "Røde konvolutter", icon: "heart", description: "Hongbao fra eldre" },
    { time: "12:00", title: "Fotosession", icon: "camera", description: "Brudepar- og familiebilder" },
    { time: "14:00", title: "Ankomst til bankett", icon: "users", description: "Gjestenes ankomst" },
    { time: "15:00", title: "Bryllups-bankett", icon: "coffee", description: "Tradisjonelt 8-retters måltid" },
    { time: "16:00", title: "Kjole-skift", icon: "heart", description: "Bruden bytter til Qipao/Cheongsam" },
    { time: "17:00", title: "Skåler rundt bordene", icon: "users", description: "Brudeparet skåler med gjestene" },
    { time: "18:00", title: "Lykke-spill", icon: "star", description: "Tradisjonelle bryllupsleker" },
    { time: "19:00", title: "Avskjed", icon: "moon", description: "Takk til gjestene" },
  ],
  // === KOREANSK (new) ===
  koreansk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudeparet gjøres klare" },
    { time: "12:00", title: "Moderne vielse", icon: "users", description: "Vielse i Wedding Hall" },
    { time: "12:30", title: "Pyebaek-forberedelse", icon: "star", description: "Skifte til Hanbok" },
    { time: "13:00", title: "Pyebaek", icon: "heart", description: "Tradisjonell familieseremoni" },
    { time: "13:30", title: "Jujube-kasting", icon: "star", description: "Fruktbarhetsritual" },
    { time: "14:00", title: "Fotosession", icon: "camera", description: "Bilder i Hanbok" },
    { time: "15:00", title: "Koreansk buffet", icon: "coffee", description: "Tradisjonelt koreansk festmåltid" },
    { time: "17:00", title: "Avslutning", icon: "moon", description: "Takk til gjestene" },
  ],
  // === THAI (new) ===
  thai: [
    { time: "06:00", title: "Tak Bat", icon: "sun", description: "Almisse-runde med munker" },
    { time: "08:00", title: "Khan Maak prosesjon", icon: "music", description: "Brudgommens storslåtte prosesjon" },
    { time: "09:00", title: "Gate-penger", icon: "star", description: "Brudgommen betaler for å passere" },
    { time: "09:30", title: "Sinsod-seremoni", icon: "heart", description: "Brudepris-seremoni" },
    { time: "10:00", title: "Sai Sin", icon: "heart", description: "Hellig tråd bindes rundt hendene" },
    { time: "10:30", title: "Rod Nam Sang", icon: "coffee", description: "Vann-velsignelse fra eldre" },
    { time: "11:00", title: "Fotosession", icon: "camera", description: "Familie- og brudepar-bilder" },
    { time: "12:00", title: "Bryllupsmiddag", icon: "coffee", description: "Tradisjonelt thai festmåltid" },
    { time: "14:00", title: "Tradisjonell dans", icon: "music", description: "Thai kulturell dans" },
  ],
  // === IRANSK (new) ===
  iransk: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Bruden og brudgommens forberedelser" },
    { time: "14:00", title: "Sofreh-e Aghd oppdekning", icon: "star", description: "Det hellige bordet dekkes" },
    { time: "15:00", title: "Gjestenes ankomst", icon: "users", description: "Gjester samles rundt Sofreh" },
    { time: "15:30", title: "Aghd seremoni", icon: "heart", description: "Vielsesseremoni med tre samtykker" },
    { time: "16:00", title: "Sukker-maling", icon: "star", description: "Sukker males over silkeklede" },
    { time: "16:30", title: "Honning-ritual", icon: "coffee", description: "Brudeparet mater hverandre honning" },
    { time: "17:00", title: "Fotosession", icon: "camera", description: "Bilder ved Sofreh-e Aghd" },
    { time: "18:00", title: "Aroosi resepsjon", icon: "coffee", description: "Storslått persisk festmiddag" },
    { time: "20:00", title: "Knife Dance", icon: "music", description: "Morsom kake-dans tradisjon" },
    { time: "22:00", title: "Persisk dans", icon: "music", description: "Feiring til sent på kvelden" },
  ],
  // === ANNET (new) ===
  annet: [
    { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudeparets forberedelser" },
    { time: "13:00", title: "Seremoni", icon: "heart", description: "Tilpasset vielsesseremoni" },
    { time: "14:00", title: "Gratulasjon", icon: "users", description: "Gratulasjon fra gjester" },
    { time: "15:00", title: "Fotosession", icon: "camera", description: "Bilder av brudeparet" },
    { time: "16:00", title: "Resepsjon", icon: "coffee", description: "Cocktail og mingling" },
    { time: "17:00", title: "Middag", icon: "coffee", description: "Festmiddag" },
    { time: "19:00", title: "Taler", icon: "users", description: "Taler og skåler" },
    { time: "20:00", title: "Første dans", icon: "music", description: "Brudeparets første dans" },
    { time: "21:00", title: "Fest", icon: "music", description: "Fest og dans" },
  ],
};

// Default generic timeline (if no tradition selected)
export const DEFAULT_TIMELINE: TimelineTemplate[] = [
  { time: "10:00", title: "Forberedelser", icon: "heart", description: "Brudens og brudgommens forberedelser" },
  { time: "14:00", title: "Vielse", icon: "users", description: "Vielsesseremoni" },
  { time: "14:30", title: "Gratulering", icon: "heart", description: "Gratulasjon" },
  { time: "15:00", title: "Fotosession", icon: "camera", description: "Bilder av brudeparet" },
  { time: "16:00", title: "Cocktail", icon: "coffee", description: "Mingling" },
  { time: "17:00", title: "Middag", icon: "coffee", description: "Bryllupsmiddag" },
  { time: "19:00", title: "Taler", icon: "users", description: "Taler og skåler" },
  { time: "20:00", title: "Bryllupskake", icon: "heart", description: "Kake-seremoni" },
  { time: "20:30", title: "Første dans", icon: "music", description: "Brudeparets første dans" },
  { time: "21:00", title: "Dans og fest", icon: "music", description: "Fest" },
];

// Backward-compatible key migration map (old wedflow keys → new synced keys)
export const LEGACY_KEY_MAP: Record<string, string> = {
  norway: 'norsk',
  hindu: 'indisk',
  muslim: 'muslimsk',
  jewish: 'jødisk',
  chinese: 'kinesisk',
  sweden: 'norsk',   // fallback to closest
  denmark: 'norsk',  // fallback to closest
};

// Resolve a tradition key, mapping legacy keys to new synced keys
export function resolveTraditionKey(key: string): string {
  return LEGACY_KEY_MAP[key] || key;
}
