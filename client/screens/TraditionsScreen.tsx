import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface Tradition {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: keyof typeof Feather.glyphMap;
}

const TRADITIONS: Record<string, { name: string; color: string; traditions: Tradition[] }> = {
  norway: {
    name: "Norge",
    color: "#BA2020",
    traditions: [
      { id: "n1", title: "Brudekrone", description: "Sølvkrone med dinglende charms", details: "Tradisjonell norsk brudekrone i sølv med små dinglende vedheng som skulle beskytte bruden mot onde ånder. Representerer Jomfru Maria og brukes fortsatt i mange norske bryllup.", icon: "award" },
      { id: "n2", title: "Bunad", description: "Tradisjonell norsk folkedrakt", details: "Mange norske bruder velger å gifte seg i bunad i stedet for hvit kjole. Gjester bærer ofte også bunad. Hver region har sin egen unike bunad med spesifikke farger og mønstre.", icon: "user" },
      { id: "n3", title: "Felemusikk", description: "Hardingfele leder prosesjonen", details: "Tradisjonelt leder en felespiller brudeparet ned kirkegangen. Hardingfela er et norsk strengeinstrument med en distinkt, rik lyd som har vært brukt i bryllup i århundrer.", icon: "music" },
      { id: "n4", title: "Kransekake", description: "Tradisjonell bryllupskake", details: "Et tårn av mandel-ringkaker stablet oppå hverandre og pyntet med norske flagg, blomster og crackers. Brudeparet løfter av den øverste ringen sammen.", icon: "gift" },
      { id: "n5", title: "Brudevalsen", description: "Første dans som ektepar", details: "Den tradisjonelle brudevalsen der brudeparet danser alene først, før gjestene gradvis slutter seg til. Ofte danses den til klassisk norsk musikk.", icon: "heart" },
    ],
  },
  sweden: {
    name: "Sverige",
    color: "#006AA7",
    traditions: [
      { id: "s1", title: "Myrtle-krone", description: "Krone av myrteblader", details: "Svenske bruder bærer tradisjonelt en krone laget av myrteblader, som symboliserer uskyld og renhet. Noen familier har myrteplanter som går i arv gjennom generasjoner.", icon: "award" },
      { id: "s2", title: "Bruden går alene", description: "Progressiv svensk tradisjon", details: "I Sverige går ofte brudeparet ned midtgangen sammen som likeverdige partnere, i stedet for at bruden blir 'gitt bort' av sin far. Dette reflekterer svensk likestilling.", icon: "users" },
      { id: "s3", title: "Glass-klinking", description: "Kyss når glassene klinker", details: "Når gjester klinker i glassene sine under middagen, må brudeparet kysse. En morsom tradisjon som engasjerer gjestene gjennom hele festen.", icon: "heart" },
      { id: "s4", title: "Tre ringer", description: "Forlovelse, bryllup, mor", details: "Svenske kvinner får ofte tre ringer: forlovelsesring, giftering, og en tredje ring når de blir mor. Menn gjenbruker ofte forlovelsesringen som giftering.", icon: "circle" },
      { id: "s5", title: "Prinsesstårta", description: "Svensk prinsessekake", details: "En ikonisk svensk kake med lag av svampkake, kremfyll, og marsipan. Grønn marsipan på toppen er klassisk, men andre farger brukes også.", icon: "gift" },
    ],
  },
  denmark: {
    name: "Danmark",
    color: "#C60C30",
    traditions: [
      { id: "d1", title: "Brudens dans", description: "Gjester klipper slør og slips", details: "Under festen kan gjester klippe små biter av brudens slør og brudgommens slips som lykkeamuletter. Dette er en gammel dansk tradisjon.", icon: "scissors" },
      { id: "d2", title: "Polterabend", description: "Knuse porselen før bryllupet", details: "Kvelden før bryllupet samles venner og familie for å knuse porselen og keramikk utenfor brudens hjem. Brudeparet må feie opp skårene sammen.", icon: "zap" },
      { id: "d3", title: "Bryllupssanger", description: "Gjester synger hele kvelden", details: "I danske bryllup er det tradisjon at gjester skriver og fremfører sanger for brudeparet. Det kan være mange sanger gjennom kvelden.", icon: "music" },
      { id: "d4", title: "Fot-stamping", description: "Kyss når alle stamper", details: "Når gjester stamper med føttene under bordet, må brudeparet kysse. En morsom måte å engasjere gjestene på gjennom hele festen.", icon: "heart" },
      { id: "d5", title: "Bryllupskringle", description: "Tradisjonell dansk kringle", details: "En pretzel-formet kake laget med mandler og sukker, ofte servert som del av bryllupsbuffeten. Formen symboliserer evig kjærlighet.", icon: "gift" },
    ],
  },
  hindu: {
    name: "Hindu",
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
  muslim: {
    name: "Muslim",
    color: "#1B5E20",
    traditions: [
      { id: "m1", title: "Nikah", description: "Den islamske vielsen", details: "Den religiøse vielsesseremonien der brudeparet signerer ekteskapskontrakten (nikah-nama) i nærvær av vitner og en imam.", icon: "book" },
      { id: "m2", title: "Mehr", description: "Brudens gave", details: "Brudgommen gir bruden en obligatorisk gave (mehr) som kan være penger, smykker eller eiendom. Dette er hennes rettighet og sikkerhet.", icon: "gift" },
      { id: "m3", title: "Walima", description: "Bryllupsmiddagen", details: "Festen etter vielsen arrangert av brudgommens familie. Det er en offentlig kunngjøring av ekteskapet og en feiring med familie og venner.", icon: "coffee" },
      { id: "m4", title: "Rukhsati", description: "Brudens avskjed", details: "Den emosjonelle avskjeden når bruden forlater sin families hjem for å bli med ektemannens familie. Foreldre velsigner henne.", icon: "heart" },
      { id: "m5", title: "Henna/Mehndi", description: "Henna-fest", details: "Bruden og kvinnelige gjester feirer med henna-dekorasjoner, musikk og dans. En fargerik og glad tradisjon før bryllupsdagen.", icon: "feather" },
    ],
  },
  jewish: {
    name: "Jødisk",
    color: "#1565C0",
    traditions: [
      { id: "j1", title: "Chuppah", description: "Bryllupsbaldakinen", details: "Vielsen foregår under en baldakin som symboliserer det nye hjemmet paret vil bygge. Den er åpen på alle sider som et tegn på gjestfrihet.", icon: "home" },
      { id: "j2", title: "Ketubah", description: "Ekteskapskontrakten", details: "En vakker illustrert kontrakt som beskriver brudgommens forpliktelser til bruden. Ofte rammes inn og henges opp i hjemmet.", icon: "file-text" },
      { id: "j3", title: "Knuse glasset", description: "Tradisjonell avslutning", details: "Brudgommen knuser et glass med foten på slutten av seremonien. Dette minner om tempelets ødeleggelse og at livet har både glede og sorg.", icon: "zap" },
      { id: "j4", title: "Circling", description: "Bruden sirkler brudgommen", details: "Bruden går rundt brudgommen syv ganger, som representerer de syv skapelsesdagene og at hun bygger en beskyttende vegg rundt ham.", icon: "repeat" },
      { id: "j5", title: "Yichud", description: "Privatøyeblikket", details: "Rett etter vielsen tilbringer paret noen minutter alene. Deres første øyeblikk som ektepar, ofte for å spise etter fasten.", icon: "lock" },
    ],
  },
  chinese: {
    name: "Kinesisk",
    color: "#D32F2F",
    traditions: [
      { id: "c1", title: "Te-seremoni", description: "Servere te til eldre", details: "Brudeparet kneler og serverer te til foreldre og besteforeldre som tegn på respekt. De eldre gir røde konvolutter med penger som velsignelse.", icon: "coffee" },
      { id: "c2", title: "Dobbelt lykke", description: "Shuangxi-symbolet", details: "Det kinesiske tegnet for 'dobbelt lykke' dekorerer alt fra invitasjoner til bryllupslokalet. Symboliserer to mennesker som blir ett.", icon: "heart" },
      { id: "c3", title: "Røde konvolutter", description: "Hongbao med penger", details: "Gjester gir røde konvolutter med penger som bryllupsgave. Rødt symboliserer lykke og velstand i kinesisk kultur.", icon: "gift" },
      { id: "c4", title: "Brudgommen henter bruden", description: "Dør-spill", details: "Brudgommen må passere flere hindringer og spill satt opp av brudepikene før han får møte bruden. Morsom og underholdende tradisjon.", icon: "unlock" },
      { id: "c5", title: "Dragefønikskjole", description: "Qipao eller kjoletradisjon", details: "Bruden bærer ofte en rød kjole med drage- og føniksbroderier. Dragen representerer brudgommen, føniksen bruden.", icon: "award" },
    ],
  },
};

export default function TraditionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedCulture, setSelectedCulture] = useState<string>("norway");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          <Feather name="book-open" size={24} color={Colors.dark.accent} />
          <ThemedText type="h2" style={styles.headerTitle}>Bryllupstradisjoner</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Utforsk skikker fra ulike kulturer og religioner
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cultureTabs}>
          {Object.entries(TRADITIONS).map(([key, culture]) => (
            <Pressable
              key={key}
              onPress={() => {
                setSelectedCulture(key);
                setExpandedId(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.cultureTab,
                {
                  backgroundColor: selectedCulture === key ? culture.color : theme.backgroundDefault,
                  borderColor: selectedCulture === key ? culture.color : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.cultureTabText,
                  { color: selectedCulture === key ? "#FFFFFF" : theme.text },
                ]}
              >
                {culture.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
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
                  <Feather name={tradition.icon} size={20} color={cultureData.color} />
                </View>
                <View style={styles.traditionInfo}>
                  <ThemedText style={styles.traditionTitle}>{tradition.title}</ThemedText>
                  <ThemedText style={[styles.traditionDesc, { color: theme.textSecondary }]}>
                    {tradition.description}
                  </ThemedText>
                </View>
                <Feather
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
          <Feather name="info" size={20} color={Colors.dark.accent} />
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
  cultureTabs: { marginBottom: Spacing.lg, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  cultureTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  cultureTabText: { fontSize: 14, fontWeight: "600" },
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
