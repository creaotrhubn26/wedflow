import { config } from "dotenv";
import { faqItems } from "../shared/schema";
import { db } from "../server/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

const vendorFAQs = [
  {
    question: "Hvordan oppdaterer jeg min profil?",
    answer: "Gå til Dashboard og klikk på 'Min profil'-knappen. Her kan du oppdatere all informasjon om virksomheten din, inkludert beskrivelse, bilder, priser, kontaktinformasjon og åpningstider. Husk å legge til gode bilder — profiler med bilder får opptil 3x flere henvendelser.",
    icon: "user",
    category: "vendor" as const,
    sortOrder: 1,
  },
  {
    question: "Hvordan legger jeg til tilbud for par?",
    answer: "Fra Dashboard, klikk på 'Tilbud'-fanen. Her kan du opprette nye tilbud med beskrivelse, pris, gyldighetsperiode og eventuelle rabatter. Tilbudene vil være synlige for alle par som ser på din profil. Du kan også opprette sesongbaserte tilbud som automatisk aktiveres og deaktiveres.",
    icon: "tag",
    category: "vendor" as const,
    sortOrder: 2,
  },
  {
    question: "Hvordan håndterer jeg meldinger fra par?",
    answer: "Du finner alle meldinger under 'Meldinger'-fanen i Dashboard. Her kan du svare direkte på henvendelser fra par, sende kontrakter, dele bilder og holde oversikt over alle samtaler. Du får push-varsler for nye meldinger. Svar raskt — leverandører som svarer innen 2 timer blir prioritert i søkeresultatene.",
    icon: "message-circle",
    category: "vendor" as const,
    sortOrder: 3,
  },
  {
    question: "Hva er inspirasjonsgalleriet?",
    answer: "Inspirasjonsgalleriet lar deg dele bilder fra tidligere arrangementer. Dette hjelper par med å se kvaliteten på arbeidet ditt og får ideer til sitt eget bryllup. Jo flere gode bilder, jo bedre synlighet! Du kan kategorisere bilder og legge til beskrivelser for hvert bilde.",
    icon: "image",
    category: "vendor" as const,
    sortOrder: 4,
  },
  {
    question: "Hvordan sender jeg kontrakter til par?",
    answer: "I meldingsvinduet med et par kan du klikke på 'Send kontrakt'. Last opp kontraktsdokumentet, og paret vil motta en varsling. De kan gjennomgå kontrakten direkte i appen. Kontrakten lagres trygt og begge parter har alltid tilgang.",
    icon: "file-text",
    category: "vendor" as const,
    sortOrder: 5,
  },
  {
    question: "Kan jeg tilpasse mine produkter og tjenester?",
    answer: "Ja! Under 'Produkter' kan du legge til alle tjenestene du tilbyr med egendefinerte priser, beskrivelser, bilder og varianter. Du kan også kategorisere dem for enklere navigasjon for parene. Produktene vises på profilsiden din og kan inkluderes i tilbud.",
    icon: "package",
    category: "vendor" as const,
    sortOrder: 6,
  },
  {
    question: "Hvordan får jeg bedre synlighet i appen?",
    answer: "Hold profilen din oppdatert med gode bilder, detaljerte beskrivelser og relevante priser. Svar raskt på henvendelser fra par. Legg ut tilbud og del bilder i inspirasjonsgalleriet regelmessig. Par finner deg direkte via leverandørsøket i planleggingsskjermene. Gode anmeldelser fra par øker også synligheten din.",
    icon: "trending-up",
    category: "vendor" as const,
    sortOrder: 7,
  },
  {
    question: "Hva koster det å bruke Wedflow?",
    answer: "Wedflow er gratis for leverandører å komme i gang! Vi tilbyr forskjellige abonnementer basert på dine behov. Se 'Abonnement' i Dashboard for mer informasjon om priser og funksjoner. Det er ingen skjulte kostnader.",
    icon: "dollar-sign",
    category: "vendor" as const,
    sortOrder: 8,
  },
  {
    question: "Hvordan kontakter jeg Wedflow support?",
    answer: "Du kan kontakte oss via 'Wedflow Support'-knappen i Dashboard. Vi svarer vanligvis innen 24 timer. For akutte saker, send e-post til support@wedflow.no. Du kan også sjekke Hjelp & FAQ for raske svar, dokumentasjonen for detaljerte guider, og videoguider for visuelle instruksjoner.",
    icon: "help-circle",
    category: "vendor" as const,
    sortOrder: 9,
  },
  {
    question: "Kan jeg se statistikk over min profil?",
    answer: "Ja! Dashboard viser visninger av profilen din, antall henvendelser, konverteringsrate, og annen relevant statistikk. Dette hjelper deg med å forstå hvordan du presterer på plattformen og hva du kan gjøre for å forbedre synligheten.",
    icon: "bar-chart-2",
    category: "vendor" as const,
    sortOrder: 10,
  },
  {
    question: "Hvordan mottar jeg henvendelser fra par?",
    answer: "Når et par finner deg via leverandørsøket i en planleggingsskjerm (f.eks. Blomster, Catering, Transport), kan de sende deg en melding direkte. Du finner alle nye samtaler under 'Meldinger'-fanen i Dashboard. Du får push-varsler for nye henvendelser. Svar raskt for å gjøre et godt førsteinntrykk!",
    icon: "inbox",
    category: "vendor" as const,
    sortOrder: 11,
  },
  {
    question: "Hva skjer når et par velger meg som leverandør?",
    answer: "Når et par søker etter leverandører i planleggingsskjermene sine og velger din bedrift, kan de se profilen din, starte en chat, eller sende en forespørsel. Du vil se den nye samtalen i Dashboard under 'Meldinger' umiddelbart og mottar en push-varsling.",
    icon: "user-check",
    category: "vendor" as const,
    sortOrder: 12,
  },
  {
    question: "Hvordan håndterer jeg leveranser og oppdrag?",
    answer: "Under 'Leveranser' i Dashboard kan du opprette og administrere leveranser knyttet til par. Spor status, legg til tidsfrister, og del detaljer med paret slik at alt er klart til den store dagen. Paret kan også se leveransestatus i sin planleggingsapp.",
    icon: "truck",
    category: "vendor" as const,
    sortOrder: 13,
  },
  {
    question: "Kan jeg administrere tilgjengelighet og kalender?",
    answer: "Ja! Du kan sette opp tilgjengeligheten din slik at par ser hvilke datoer du er ledig. Dette reduserer unødvendige henvendelser og gjør bookingprosessen raskere for alle parter. Oppdater kalenderen regelmessig for best resultat.",
    icon: "calendar",
    category: "vendor" as const,
    sortOrder: 14,
  },
];

const coupleFAQs = [
  {
    question: "Hvordan lager jeg en bryllupsplan?",
    answer: "Start med å gå til 'Planlegging'-fanen. Her finner du verktøy for sjekkliste, budsjett, timeplan, gjesteliste, viktige personer, fotoplaner og mer. Du kan tilpasse alt etter dine behov og legge til egne oppgaver.",
    icon: "clipboard",
    category: "couple" as const,
    sortOrder: 1,
  },
  {
    question: "Hvordan finner jeg leverandører?",
    answer: "Du kan finne leverandører på to måter: 1) Bruk 'Leverandører'-knappen i planleggingsfanen for å se alle tilgjengelige leverandører med filtrering etter kategori og sted, eller 2) Søk direkte i planleggingsskjermene (Blomster, Brudekjole, Hår & Makeup, Catering, Transport, Planlegger) — skriv inn et leverandørnavn, og registrerte leverandører vises automatisk med mulighet for profil, chat og booking.",
    icon: "search",
    category: "couple" as const,
    sortOrder: 2,
  },
  {
    question: "Hvordan kontakter jeg en leverandør?",
    answer: "Du kan finne leverandører direkte i planleggingsskjermene (Blomster, Brudekjole, Hår & Makeup, Catering, Transport, Planlegger). Skriv inn leverandørnavnet i søkefeltet, og registrerte leverandører vises automatisk. Velg en leverandør for å se profilen, sende melding eller sende en forespørsel. Du finner alle dine samtaler under 'Meldinger' i profilfanen.",
    icon: "mail",
    category: "couple" as const,
    sortOrder: 3,
  },
  {
    question: "Hvordan søker jeg etter leverandører i planleggingen?",
    answer: "I hver planleggingsskjerm (Blomster, Brudekjole, Hår & Makeup, Catering, Transport, Planlegger) finner du et søkefelt for leverandør. Begynn å skrive navnet, og matchende registrerte leverandører vises. Du kan trykke 'Profil' for å se detaljer, eller velge leverandøren for å koble dem til planleggingen din.",
    icon: "search",
    category: "couple" as const,
    sortOrder: 4,
  },
  {
    question: "Hva skjer etter at jeg har valgt en leverandør?",
    answer: "Etter at du velger en registrert leverandør vises en handlingslinje med to knapper: 'Se profil' åpner leverandørens detaljside med anmeldelser og produkter, og 'Send melding' starter en chat direkte med leverandøren. Du kan også fjerne valget og søke på nytt.",
    icon: "check-square",
    category: "couple" as const,
    sortOrder: 5,
  },
  {
    question: "Hvordan starter jeg en chat med en leverandør?",
    answer: "Du kan starte en chat på to måter: 1) Velg en leverandør fra søket i planleggingsskjermen og trykk 'Send melding', eller 2) Gå til leverandørens profilside og trykk 'Send melding'. En automatisk velkomstmelding sendes, og leverandøren kan svare direkte. Du finner alle samtaler under 'Meldinger' i Profil-fanen.",
    icon: "message-circle",
    category: "couple" as const,
    sortOrder: 6,
  },
  {
    question: "Hvor finner jeg meldinger, chat og support?",
    answer: "Gå til 'Profil'-fanen og trykk på 'Meldinger'. Her får du en oversikt over alle samtaler med leverandører, kan ringe eller sende SMS til viktige personer i bryllupsfølget, og kontakte Wedflow Support direkte. Du kan også bruke 'Hjelp & FAQ' for raske svar.",
    icon: "message-square",
    category: "couple" as const,
    sortOrder: 7,
  },
  {
    question: "Hva er inspirasjonsgalleriet?",
    answer: "Inspirasjonsgalleriet (Showcase) er samlingen av bilder fra virkelige bryllup og arrangementer delt av leverandører. Du kan lagre favoritter, dele med partneren din, og få ideer til eget bryllup. Trykk på et bilde for å se leverandøren og sende henvendelse direkte.",
    icon: "heart",
    category: "couple" as const,
    sortOrder: 8,
  },
  {
    question: "Hvordan holder jeg oversikt over budsjettet?",
    answer: "Under 'Budsjett' i planleggingsfanen kan du sette totalbudsjett og fordele penger på ulike kategorier. Appen oppdaterer automatisk når du registrerer kostnader, så du alltid ser hvor mye du har igjen. Du kan også bruke 'Hva om...?'-verktøyet for å teste ulike budsjettscenarier.",
    icon: "dollar-sign",
    category: "couple" as const,
    sortOrder: 9,
  },
  {
    question: "Kan jeg dele planleggingen med min partner?",
    answer: "Ja! Gå til 'Profil' > 'Del med partner'. Partneren din får tilgang til samme planlegging med sjekklister, budsjett, gjesteliste og alt annet. Dere kan planlegge sammen i sanntid.",
    icon: "users",
    category: "couple" as const,
    sortOrder: 10,
  },
  {
    question: "Hvordan fungerer gjestelisten?",
    answer: "Under 'Gjester'-fanen kan du legge til alle inviterte, spore RSVP-svar, registrere matpreferanser og allergier, og administrere bordplassering med det interaktive bordkartet. Du kan også gruppere gjester etter kategori.",
    icon: "user-plus",
    category: "couple" as const,
    sortOrder: 11,
  },
  {
    question: "Kan jeg bruke Wedflow gratis?",
    answer: "Ja! Wedflow er helt gratis for brudepar. Du får tilgang til alle planleggingsverktøy, leverandørsøk, chat med leverandører, inspirasjon, gjesteliste, bordkart, budsjett, sjekkliste og alle andre funksjoner uten noen kostnader.",
    icon: "check-circle",
    category: "couple" as const,
    sortOrder: 12,
  },
  {
    question: "Hvordan får jeg varsler om viktige frister?",
    answer: "Appen sender automatiske påminnelser om sjekkliste-oppgaver, betalingsfrister og andre viktige datoer. Du kan tilpasse varslingsinnstillinger under 'Profil' > 'Varsler og påminnelser'. Du kan også legge til egne påminnelser under 'Påminnelser' i planleggingsfanen.",
    icon: "bell",
    category: "couple" as const,
    sortOrder: 13,
  },
  {
    question: "Hva er fotoplan-funksjonen?",
    answer: "Under 'Profil' > 'Fotoplan' kan du planlegge hvilke bilder du vil ha tatt på bryllupsdagen. Legg til ulike kategorier (brudepar, familie, venner, detaljer) og spesifikke bilder du ønsker. Del fotoplanen med fotografen din for å sikre at ingen viktige øyeblikk går tapt.",
    icon: "camera",
    category: "couple" as const,
    sortOrder: 14,
  },
  {
    question: "Kan jeg se leverandørens profil før jeg tar kontakt?",
    answer: "Ja! Når leverandøren dukker opp i søkeresultatene, kan du trykke på 'Profil'-knappen for å se fullstendig informasjon inkludert beskrivelse, anmeldelser, produkter, beliggenhet, og prisklasse — alt uten å sende melding først.",
    icon: "eye",
    category: "couple" as const,
    sortOrder: 15,
  },
  {
    question: "Hvordan logger jeg ut?",
    answer: "Gå til 'Profil'-fanen og scroll ned til bunnen av menyen. Trykk på 'Logg ut'. Du blir spurt om bekreftelse før utlogging. Dine data lagres trygt og er tilgjengelige neste gang du logger inn.",
    icon: "log-out",
    category: "couple" as const,
    sortOrder: 16,
  },
  {
    question: "Hvordan kontakter jeg Wedflow for hjelp?",
    answer: "Du har flere muligheter: 1) Gå til 'Profil' > 'Meldinger' > 'Wedflow Support' for direkte chat, 2) Bruk 'Hjelp & FAQ' for raske svar, 3) Send tilbakemelding via 'Tilbakemelding til Wedflow', eller 4) Send e-post til support@wedflow.no. Vi svarer vanligvis innen 24 timer.",
    icon: "headphones",
    category: "couple" as const,
    sortOrder: 17,
  },
];

async function seedFAQ() {
  console.log("🌱 Starting FAQ seed...");

  try {
    // Clear existing FAQ items
    console.log("🗑️  Clearing existing FAQ items...");
    await db.delete(faqItems);

    const now = new Date();

    // Insert vendor FAQs
    console.log("📝 Adding vendor FAQs...");
    for (const faq of vendorFAQs) {
      await db.insert(faqItems).values({
        ...faq,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`✅ Added ${vendorFAQs.length} vendor FAQs`);

    // Insert couple FAQs
    console.log("💑 Adding couple FAQs...");
    for (const faq of coupleFAQs) {
      await db.insert(faqItems).values({
        ...faq,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`✅ Added ${coupleFAQs.length} couple FAQs`);

    console.log("🎉 FAQ seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding FAQ:", error);
    throw error;
  }
}

seedFAQ().catch((error) => {
  console.error(error);
  process.exit(1);
});
