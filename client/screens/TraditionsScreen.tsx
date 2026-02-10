import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoupleProfile, updateCoupleProfile } from "@/lib/api-couples";
import { getCoupleSession } from "@/lib/storage";
import { showToast } from "@/lib/toast";

interface Tradition {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: keyof typeof EvendiIconGlyphMap;
}

// Keys synced with CreatorHub culturalType for seamless bridge
const TRADITIONS: Record<string, { name: string; color: string; traditions: Tradition[] }> = {
  norsk: {
    name: "Norsk",
    color: "#BA2020",
    traditions: [
      { id: "n1", title: "Brudekrone", description: "Sølvkrone med dinglende charms", details: "Tradisjonell norsk brudekrone i sølv med små dinglende vedheng som skulle beskytte bruden mot onde ånder. Representerer Jomfru Maria og brukes fortsatt i mange norske bryllup.", icon: "award" },
      { id: "n2", title: "Bunad", description: "Tradisjonell norsk folkedrakt", details: "Mange norske bruder velger å gifte seg i bunad i stedet for hvit kjole. Gjester bærer ofte også bunad. Hver region har sin egen unike bunad med spesifikke farger og mønstre.", icon: "user" },
      { id: "n3", title: "Felemusikk", description: "Hardingfele leder prosesjonen", details: "Tradisjonelt leder en felespiller brudeparet ned kirkegangen. Hardingfela er et norsk strengeinstrument med en distinkt, rik lyd som har vært brukt i bryllup i århundrer.", icon: "music" },
      { id: "n4", title: "Kransekake", description: "Tradisjonell bryllupskake", details: "Et tårn av mandel-ringkaker stablet oppå hverandre og pyntet med norske flagg, blomster og crackers. Brudeparet løfter av den øverste ringen sammen.", icon: "gift" },
      { id: "n5", title: "Brudevalsen", description: "Første dans som ektepar", details: "Den tradisjonelle brudevalsen der brudeparet danser alene først, før gjestene gradvis slutter seg til. Ofte danses den til klassisk norsk musikk.", icon: "heart" },
    ],
  },
  sikh: {
    name: "Sikh",
    color: "#FF9933",
    traditions: [
      { id: "si1", title: "Anand Karaj", description: "Glede-seremonien", details: "Den hellige sikh-vielsen som finner sted i Gurdwara (sikh-tempelet) foran Guru Granth Sahib (den hellige boken). Betyr 'glederik union'.", icon: "sun" },
      { id: "si2", title: "Laavan", description: "Fire runder rundt Guru Granth Sahib", details: "Brudeparet går fire runder rundt den hellige boken mens hymner synges. Hver runde representerer en fase i kjærligheten: plikt, disiplin, spiritualitet og harmoni.", icon: "repeat" },
      { id: "si3", title: "Palla", description: "Sjal som binder paret", details: "Brudens far plasserer en ende av brudgommens sjal i brudens hender, som symboliserer at hun nå er under hans omsorg og beskyttelse.", icon: "link" },
      { id: "si4", title: "Milni", description: "Familienes møte", details: "Før seremonien møtes mannlige familiemedlemmer fra begge sider og utveksler girlander. Dette symboliserer forening av to familier.", icon: "users" },
      { id: "si5", title: "Karah Parshad", description: "Hellig søt pudding", details: "Etter vielsen deles karah parshad (søt semule-pudding) til alle gjester. Dette representerer likhet og velsignelse fra Gud.", icon: "coffee" },
      { id: "si6", title: "Doli", description: "Brudens avreise", details: "Bruden forlater familiehjemmet i en dekorert bil. Hun kaster ris bakover for å ønske familien velstand. En emosjonell og vakker tradisjon.", icon: "truck" },
    ],
  },
  indisk: {
    name: "Indisk (Hindu)",
    color: "#FF6B35",
    traditions: [
      { id: "h1", title: "Mehndi", description: "Henna-seremoni for bruden", details: "Kvelden før bryllupet dekoreres brudens hender og føtter med intrikate henna-mønstre. Brudgommens initialer skjules ofte i designet. Jo mørkere fargen blir, jo sterkere sies kjærligheten å være.", icon: "feather" },
      { id: "h2", title: "Saptapadi", description: "De syv skritt", details: "Brudeparet går syv skritt sammen rundt den hellige ilden (Agni). Hvert skritt representerer et løfte: mat, styrke, velstand, visdom, barn, helse og vennskap.", icon: "navigation" },
      { id: "h3", title: "Mangalsutra", description: "Hellig bryllupshalskjede", details: "Brudgommen knyter et hellig halskjede med svarte og gull-perler rundt brudens hals. Dette symboliserer deres union og bæres gjennom livet.", icon: "heart" },
      { id: "h4", title: "Kanyadaan", description: "Farens gave", details: "Brudens far gir bort datteren til brudgommen. Dette anses som en av de mest hellige ritualene, der foreldrene overfører ansvaret til ektemannen.", icon: "users" },
      { id: "h5", title: "Sindoor", description: "Rød farge i hårskillen", details: "Brudgommen påfører rød sindoor-pulver i brudens hårskill. Dette markerer hennes status som gift kvinne og er et symbol på velstand.", icon: "droplet" },
      { id: "h6", title: "Vidai", description: "Avskjeden fra hjemmet", details: "Bruden forlater barndomshjemmet og kaster ris bakover over skulderen. Risen symboliserer velstand og takk til foreldrene.", icon: "home" },
    ],
  },
  pakistansk: {
    name: "Pakistansk",
    color: "#00A651",
    traditions: [
      { id: "pk1", title: "Mehndi & Sangeet", description: "Henna-fest med musikk og dans", details: "En fargerik feiring hvor bruden får henna påført mens familie og venner synger tradisjonelle pakistanske bryllupssanger med dholki-tromme.", icon: "feather" },
      { id: "pk2", title: "Baraat", description: "Brudgommens prosesjon", details: "Brudgommen ankommer bryllupet i en storslått prosesjon med musikk, dans og fyrverkeri. Familien følger ham til bruden.", icon: "users" },
      { id: "pk3", title: "Nikkah", description: "Islamsk vielseskontrakt", details: "Den religiøse vielsesseremonien der imam leser fra Koranen og brudeparet signerer nikah-kontrakten med vitner tilstede.", icon: "book" },
      { id: "pk4", title: "Walima", description: "Brudgommens resepsjon", details: "Tradisjonell resepsjon arrangert av brudgommens familie dagen etter for å feire ekteskapet med storslagen mat og feiring.", icon: "coffee" },
      { id: "pk5", title: "Rukhsati", description: "Brudens avskjed", details: "Den emosjonelle avskjeden der bruden forlater barndomshjemmet. Koranen holdes over hodet hennes mens hun går til bilen.", icon: "heart" },
    ],
  },
  tyrkisk: {
    name: "Tyrkisk",
    color: "#E30A17",
    traditions: [
      { id: "tr1", title: "Kına Gecesi", description: "Henna-kveld med tårer og dans", details: "Kvelden før bryllupet samles kvinnene. Bruden gråter mens en sorgtung sang synges, og henna påføres hendene med en gullmynt i håndflaten.", icon: "feather" },
      { id: "tr2", title: "Takı Töreni", description: "Gullsmykke-seremoni", details: "Under festen fester gjester gullmynter og smykker på et rødt bånd rundt brudeparets skuldre som bryllupsgave.", icon: "gift" },
      { id: "tr3", title: "Düğün", description: "Bryllupsfesten med tradisjonell dans", details: "Storslått feiring med tyrkisk mat, tradisjonell halay-dans i ring, og livlig musikk. Ofte med hundrevis av gjester.", icon: "music" },
      { id: "tr4", title: "Gelin Alma", description: "Hente bruden", details: "Brudgommen og hans familie henter bruden fra familiens hjem med musikk og feiring. Brudens bror binder et rødt bånd rundt henne.", icon: "users" },
    ],
  },
  arabisk: {
    name: "Arabisk",
    color: "#007A3D",
    traditions: [
      { id: "ar1", title: "Nikah", description: "Islamsk vielsesseremoni", details: "Den hellige vielsen med imam, signering av nikah-kontrakt, mehr-avtale og duaa-bønner i nærvær av familie og vitner.", icon: "book" },
      { id: "ar2", title: "Zaffe", description: "Spektakulær innmarsj", details: "En dramatisk prosesjon med trommer, ululating og tradisjonell musikk som leder brudeparet til festlokalet. Dansere og musikere skaper en uforglemmelig entre.", icon: "music" },
      { id: "ar3", title: "Dabke-dans", description: "Tradisjonell gruppedans", details: "Gjestene danser dabke i stor ring med stampende føtter og håndholding. En viktig del av arabisk bryllupsfeiring.", icon: "users" },
      { id: "ar4", title: "Henna-kveld", description: "Henna og feiring", details: "Kvelden før bryllupet feires med henna-påføring, tradisjonelle sanger og dans blant de kvinnelige gjestene.", icon: "feather" },
    ],
  },
  somalisk: {
    name: "Somalisk",
    color: "#4189DD",
    traditions: [
      { id: "so1", title: "Nikah", description: "Islamsk vielsesseremoni", details: "Den religiøse vielsen med recitasjon av Koranen, nikah-kontrakt og duaa i nærvær av familie, eldre og samfunnet.", icon: "book" },
      { id: "so2", title: "Aroos", description: "Tradisjonell bryllupsfeiring", details: "Storslått feiring med autentisk somalisk mat, tradisjonell dans (niiko), poesi og musikk som hedrer den nye familien.", icon: "music" },
      { id: "so3", title: "Dirac & Guntiino", description: "Tradisjonelle bryllupskjoler", details: "Bruden bærer vakre, fargerike stoffer (dirac) gjennom feiringen. Ulike antrekk for ulike deler av bryllupet.", icon: "award" },
      { id: "so4", title: "Shaash Saar", description: "Slør-seremoni", details: "Viktig seremoni der brudgommens familie tildekker bruden med et sjal som tegn på å ønske henne velkommen i familien.", icon: "heart" },
    ],
  },
  etiopisk: {
    name: "Etiopisk",
    color: "#FCDD09",
    traditions: [
      { id: "et1", title: "Telosh", description: "Førbryllups-seremoni", details: "En tradisjonell etiopisk seremoni med velsignelser, bønner og familiesamling som forbereder paret for bryllupsdagen.", icon: "sun" },
      { id: "et2", title: "Kaffe-seremoni", description: "Tradisjonell kaffetilberedning", details: "En viktig del av etiopisk kultur der kaffe brennes, males og brygges foran gjestene som et tegn på respekt og fellesskap.", icon: "coffee" },
      { id: "et3", title: "Melse", description: "Resepsjon med Injera", details: "Storslått feiring med tradisjonell etiopisk mat servert på injera (surt flatbrød), kulturell musikk og eskista-dans.", icon: "music" },
      { id: "et4", title: "Tilf", description: "Velsignelse fra eldre", details: "De eldste i familien gir seremonielle velsignelser og råd til brudeparet for et lykkelig ekteskap.", icon: "users" },
    ],
  },
  nigeriansk: {
    name: "Nigeriansk",
    color: "#008751",
    traditions: [
      { id: "ng1", title: "White Wedding", description: "Vestlig vielsesseremoni", details: "Kirkelig eller sivil seremoni med hvit brudekjole, ofte i en kristen kirke med vestlige tradisjoner blandet med nigerianske elementer.", icon: "heart" },
      { id: "ng2", title: "Traditional Wedding", description: "Kulturell stammeseremoni", details: "Autentisk nigeriansk seremoni med tradisjonelle klær (aso-oke), ritualer, palmvin-seremoni og musikk spesifikk for familiens stamme.", icon: "users" },
      { id: "ng3", title: "Palmvin-test", description: "Bruden finner brudgommen", details: "Bruden får et glass palmvin og må finne brudgommen blant gjestene. Når hun finner ham, kneler hun og gir ham vinen.", icon: "coffee" },
      { id: "ng4", title: "Aso-Oke", description: "Matchende tradisjonelle klær", details: "Familien kler seg i matchende tradisjonelle stoffer. Fargevalget er viktig og gjester respekterer brudeparets fargetema.", icon: "award" },
    ],
  },
  muslimsk: {
    name: "Muslimsk",
    color: "#239F40",
    traditions: [
      { id: "mu1", title: "Nikah", description: "Den islamske vielsen", details: "Den religiøse vielsesseremonien der brudeparet signerer ekteskapskontrakten (nikah-nama) i nærvær av vitner og en imam.", icon: "book" },
      { id: "mu2", title: "Mehr", description: "Brudens gave", details: "Brudgommen gir bruden en obligatorisk gave (mehr) som kan være penger, smykker eller eiendom. Dette er hennes rettighet og sikkerhet.", icon: "gift" },
      { id: "mu3", title: "Walima", description: "Bryllupsmiddagen", details: "Festen etter vielsen arrangert av brudgommens familie. Det er en offentlig kunngjøring av ekteskapet og en feiring med familie og venner.", icon: "coffee" },
      { id: "mu4", title: "Mehndi-kveld", description: "Henna-fest", details: "Bruden og kvinnelige gjester feirer med henna-dekorasjoner, tradisjonelle sanger, musikk og dans. Fargerik tradisjon før bryllupsdagen.", icon: "feather" },
      { id: "mu5", title: "Rukhsati", description: "Brudens avskjed", details: "Den emosjonelle avskjeden når bruden forlater sin families hjem for å bli med ektemannens familie. Foreldre velsigner henne.", icon: "heart" },
    ],
  },
  libanesisk: {
    name: "Libanesisk",
    color: "#FF0000",
    traditions: [
      { id: "lb1", title: "Henna Party", description: "Henna-fest med dans", details: "Kvelden før bryllupet feires med henna-påføring av eldre kvinnelige slektninger, tradisjonell libanesisk musikk og feiring.", icon: "feather" },
      { id: "lb2", title: "Zaffe", description: "Spektakulær innmarsj", details: "En dramatisk prosesjon med trommer, dabke-dansere og ululating som leder brudeparet til festlokalet. Uforglemmelig entre.", icon: "music" },
      { id: "lb3", title: "Dabke-dans", description: "Tradisjonell libanesisk dans", details: "Gjester og brudeparet danser dabke i store ringer med stampende føtter. En av de viktigste delene av feiringen.", icon: "users" },
      { id: "lb4", title: "Kibbe Nayyeh", description: "Tradisjonell bryllupsmeny", details: "Storslått libanesisk meze-bord med kibbe, tabbouleh, hummus og grillmat. Mat er en sentral del av libanesisk bryllupsfeiring.", icon: "coffee" },
    ],
  },
  filipino: {
    name: "Filipino",
    color: "#0038A8",
    traditions: [
      { id: "fl1", title: "Despedida de Soltera", description: "Avskjedsfest", details: "En avskjedsfest for singel-livet organisert av brudens venner og familie, med mat, leker og gaver.", icon: "gift" },
      { id: "fl2", title: "Arras", description: "13 mynter seremoni", details: "Brudgommen gir 13 mynter til bruden som symbol på hans løfte om å sørge for familien. Mynter representerer også Jesu 12 apostler pluss Kristus.", icon: "star" },
      { id: "fl3", title: "Veil & Cord", description: "Slør og ledning-seremoni", details: "Et slør legges over brudeparets hoder og en ledning i form av åttetall rundt dem, som symboliserer evig enhet.", icon: "link" },
      { id: "fl4", title: "Unity Candle", description: "Enhetslys", details: "Brudeparet tenner et felles lys fra to individuelle lys, som symboliserer foreningen av to familier til én.", icon: "sun" },
    ],
  },
  kinesisk: {
    name: "Kinesisk",
    color: "#DE2910",
    traditions: [
      { id: "cn1", title: "Te-seremoni", description: "Servere te til eldre", details: "Brudeparet kneler og serverer te til foreldre og besteforeldre som tegn på respekt. De eldre gir røde konvolutter med penger som velsignelse.", icon: "coffee" },
      { id: "cn2", title: "Dobbelt lykke", description: "Shuangxi-symbolet", details: "Det kinesiske tegnet for 'dobbelt lykke' dekorerer alt fra invitasjoner til bryllupslokalet. Symboliserer to mennesker som blir ett.", icon: "heart" },
      { id: "cn3", title: "Røde konvolutter", description: "Hongbao med penger", details: "Gjester gir røde konvolutter med penger som bryllupsgave. Rødt symboliserer lykke og velstand i kinesisk kultur.", icon: "gift" },
      { id: "cn4", title: "Door Games", description: "Dør-spill hos bruden", details: "Brudgommen må passere flere hindringer og spill satt opp av brudepikene før han får møte bruden. Morsom og underholdende tradisjon.", icon: "unlock" },
      { id: "cn5", title: "Dragefønikskjole", description: "Qipao med broderier", details: "Bruden bærer ofte en rød kjole med drage- og føniksbroderier. Dragen representerer brudgommen, føniksen bruden.", icon: "award" },
    ],
  },
  koreansk: {
    name: "Koreansk",
    color: "#003478",
    traditions: [
      { id: "kr1", title: "Pyebaek", description: "Familieseremoni etter vielsen", details: "Etter den moderne vielsen holder brudeparet en tradisjonell Pyebaek-seremoni der de bøyer seg for foreldrene og serverer daddler og kastanjer.", icon: "users" },
      { id: "kr2", title: "Hanbok", description: "Tradisjonell koreansk drakt", details: "Brudeparet bærer vakre hanbok (tradisjonelle koreanske klær) under Pyebaek-seremonien. Ofte fargesterke med silke.", icon: "award" },
      { id: "kr3", title: "Jujube-kasting", description: "Fruktbarhetssymbol", details: "Foreldrene kaster daddler og kastanjer mot bruden som sitter i et silk-teppe. Antallet hun fanger varsler antall barn.", icon: "star" },
      { id: "kr4", title: "Bryllupsduk", description: "Dekorert bord med symboler", details: "Et spesielt bord dekkes med symbolske gjenstander: bambus, furutrær, vilt-gås og frukt som representerer langt liv og lykke.", icon: "gift" },
    ],
  },
  thai: {
    name: "Thai",
    color: "#A51931",
    traditions: [
      { id: "th1", title: "Khan Maak", description: "Brudgommens prosesjon", details: "Brudgommen leder en storslått prosesjon til brudens hjem med gaver, gull og mat på dekorerte brett. Musikk og dans følger.", icon: "music" },
      { id: "th2", title: "Rod Nam Sang", description: "Vann-velsignelse", details: "Eldre og respekterte gjester heller velsignet vann over brudeparets hender som tegn på lykke og velstand.", icon: "droplet" },
      { id: "th3", title: "Sai Sin", description: "Hellig tråd-seremoni", details: "En buddhistisk munk binder hvite tråder rundt brudeparets hender som symbol på forening og velsignelse.", icon: "link" },
      { id: "th4", title: "Sinsod", description: "Brudepris-seremoni", details: "Brudgommens familie presenterer gull og medgift til brudens familie som respekt og verdsel. Vises ofte offentlig.", icon: "gift" },
    ],
  },
  iransk: {
    name: "Iransk/Persisk",
    color: "#239F40",
    traditions: [
      { id: "ir1", title: "Sofreh-e Aghd", description: "Det hellige bryllupsbordet", details: "Et vakkert dekorert bord med symbolske gjenstander: speil, kandelaber, honning, brød, urter, egg og nøtter som representerer et godt liv.", icon: "star" },
      { id: "ir2", title: "Aghd", description: "Vielsesseremonien", details: "Bruden blir spurt tre ganger om hun samtykker. Tradisjonelt svarer hun først etter tredje gang. Zucker (sukker) males over et silkeklede over hodene.", icon: "heart" },
      { id: "ir3", title: "Honey-finger", description: "Honning-ritual", details: "Brudeparet mater hverandre honning for å sikre et søtt liv sammen. Et vakkert og intimt øyeblikk i seremonien.", icon: "coffee" },
      { id: "ir4", title: "Knife Dance", description: "Kake-dans", details: "Gjester 'stjeler' kakekniven og brudeparet må betale (med dans eller gaver) for å få den tilbake. Morsom tradisjon.", icon: "music" },
    ],
  },
  annet: {
    name: "Annet/Tilpasset",
    color: "#666666",
    traditions: [
      { id: "an1", title: "Tilpasset seremoni", description: "Lag deres egen tradisjon", details: "Kombiner elementer fra ulike kulturer eller skap helt nye tradisjoner som passer for dere som par. Det finnes ingen regler!", icon: "heart" },
      { id: "an2", title: "Personlige løfter", description: "Skriv egne løfter", details: "Mange par velger å skrive og lese opp personlige løfter til hverandre under vielsen, noe som gjør seremonien unik og personlig.", icon: "feather" },
      { id: "an3", title: "Blandet kulturfeiring", description: "Det beste fra flere verdener", details: "Stadig vanligere å kombinere tradisjoner fra ulike kulturer og religioner. Feir mangfoldet som gjør dere unike.", icon: "users" },
    ],
  },
};

export default function TraditionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { config } = useEventType();
  const queryClient = useQueryClient();

  const [selectedCulture, setSelectedCulture] = useState<string>("norway");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);

  // Load couple profile to get selected traditions
  const { data: session } = useQuery({
    queryKey: ["coupleSession"],
    queryFn: getCoupleSession,
  });

  const { data: profile } = useQuery({
    queryKey: ["coupleProfile"],
    queryFn: () => {
      if (!session?.token) throw new Error("No session");
      return getCoupleProfile(session.token);
    },
    enabled: !!session?.token,
  });

  // Update local state when profile loads
  useEffect(() => {
    if (profile?.selectedTraditions) {
      setSelectedTraditions(profile.selectedTraditions);
      // Auto-select first selected culture if available
      if (profile.selectedTraditions.length > 0 && TRADITIONS[profile.selectedTraditions[0]]) {
        setSelectedCulture(profile.selectedTraditions[0]);
      }
    }
  }, [profile]);

  // Mutation to update traditions
  const updateTraditionsMutation = useMutation({
    mutationFn: async (traditions: string[]) => {
      if (!session?.token) throw new Error("No session");
      return updateCoupleProfile(session.token, { selectedTraditions: traditions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupleProfile"] });
    },
    onError: (error) => { 
      showToast(error instanceof Error ? error.message : "Kunne ikke lagre valg");
    },
  });

  const toggleTraditionSelection = (cultureKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSelection = selectedTraditions.includes(cultureKey)
      ? selectedTraditions.filter((t) => t !== cultureKey)
      : [...selectedTraditions, cultureKey];

    setSelectedTraditions(newSelection);
    updateTraditionsMutation.mutate(newSelection);
  };

  const cultureData = TRADITIONS[selectedCulture];

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <EvendiIcon name="book-open" size={24} color={Colors.dark.accent} />
          <ThemedText type="h2" style={styles.headerTitle}>{config.featureLabels?.traditions?.no || "Bryllupstradisjoner"}</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {config.featureLabels?.traditions?.descriptionNo || "Velg kulturer som passer for deres bryllup"}
          </ThemedText>
          {selectedTraditions.length > 0 && (
            <View style={[styles.selectedBadge, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent }]}>
              <EvendiIcon name="check-circle" size={16} color={Colors.dark.accent} />
              <ThemedText style={[styles.selectedBadgeText, { color: Colors.dark.accent }]}>
                {selectedTraditions.length} valgt
              </ThemedText>
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cultureTabs}>
          {Object.entries(TRADITIONS).map(([key, culture]) => {
            const isSelected = selectedTraditions.includes(key);
            const isViewing = selectedCulture === key;
            return (
              <Pressable
                key={key}
                onLongPress={() => {
                  toggleTraditionSelection(key);
                }}
                onPress={() => {
                  setSelectedCulture(key);
                  setExpandedId(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.cultureTab,
                  {
                    backgroundColor: isViewing ? culture.color : theme.backgroundDefault,
                    borderColor: isViewing ? culture.color : (isSelected ? culture.color : theme.border),
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {isSelected && (
                  <EvendiIcon 
                    name="check-circle" 
                    size={14} 
                    color={isViewing ? "#FFFFFF" : culture.color}
                    style={styles.cultureCheckIcon}
                  />
                )}
                <ThemedText
                  style={[
                    styles.cultureTabText,
                    { color: isViewing ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {culture.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
        <ThemedText style={[styles.selectionHint, { color: theme.textSecondary }]}>
          Trykk for å se detaljer • Hold inne for å velge
        </ThemedText>
      </Animated.View>

      <View style={[styles.cultureHeader, { borderColor: cultureData.color }]}>
        <View style={[styles.cultureIndicator, { backgroundColor: cultureData.color }]} />
        <ThemedText type="h3">{cultureData.name} tradisjoner</ThemedText>
      </View>

      {cultureData.traditions.map((tradition, index) => (
        <Animated.View key={tradition.id} entering={FadeInDown.delay(300 + index * 80).duration(400)}>
          <Pressable onPress={() => handleExpand(tradition.id)}>
            <View
              style={[
                styles.traditionCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <View style={styles.traditionHeader}>
                <View style={[styles.traditionIcon, { backgroundColor: cultureData.color + "20" }]}>
                  <EvendiIcon name={tradition.icon} size={20} color={cultureData.color} />
                </View>
                <View style={styles.traditionInfo}>
                  <ThemedText style={styles.traditionTitle}>{tradition.title}</ThemedText>
                  <ThemedText style={[styles.traditionDesc, { color: theme.textSecondary }]}>
                    {tradition.description}
                  </ThemedText>
                </View>
                <EvendiIcon
                  name={expandedId === tradition.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>

              {expandedId === tradition.id ? (
                <View style={[styles.traditionDetails, { borderTopColor: theme.border }]}>
                  <ThemedText style={[styles.detailsText, { color: theme.textSecondary }]}>
                    {tradition.details}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(800).duration(400)}>
        <View style={[styles.tipsCard, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent }]}>
          <EvendiIcon name="info" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.tipsText, { color: theme.text }]}>
            Det er helt normalt å kombinere tradisjoner fra flere kulturer. Velg det som føles riktig for dere som par!
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: { marginTop: Spacing.sm, textAlign: "center" },
  headerSubtitle: { marginTop: Spacing.xs, fontSize: 14, textAlign: "center" },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  cultureTabs: { marginBottom: Spacing.xs, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  cultureTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  cultureCheckIcon: {
    marginRight: Spacing.xs,
  },
  cultureTabText: { fontSize: 14, fontWeight: "600" },
  selectionHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  cultureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingLeft: Spacing.sm,
  },
  cultureIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  traditionCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  traditionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  traditionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  traditionInfo: { flex: 1 },
  traditionTitle: { fontSize: 16, fontWeight: "600" },
  traditionDesc: { fontSize: 13, marginTop: 2 },
  traditionDetails: {
    padding: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  detailsText: { fontSize: 14, lineHeight: 20 },
  tipsCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  tipsText: { flex: 1, marginLeft: Spacing.md, fontSize: 14 },
});
