import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "@/lib/toast";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface PlannerDetails {
  planningTypes: string[];
  fullPlanningIncluded: boolean;
  partialPlanningAvailable: boolean;
  dayOfCoordinationAvailable: boolean;
  monthOfCoordinationAvailable: boolean;
  budgetManagement: boolean;
  vendorCoordination: boolean;
  vendorNetworkAccess: boolean;
  numberOfVendorContacts: number | null;
  venueSelection: boolean;
  contractReview: boolean;
  timelineCreation: boolean;
  designConsultation: boolean;
  moodBoardCreation: boolean;
  stationeryDesign: boolean;
  seatingArrangement: boolean;
  rehearsalCoordination: boolean;
  dayOfTimeline: boolean;
  guestManagement: boolean;
  rsvpTracking: boolean;
  welcomeBags: boolean;
  emergencyKit: boolean;
  maxWeddingsPerMonth: number | null;
  meetingsIncluded: number | null;
  virtualMeetings: boolean;
  onSiteHours: number | null;
  additionalHourlyRate: number | null;
  travelIncluded: boolean;
  travelRadius: number | null;
  assistantsProvided: boolean;
  numberOfAssistants: number | null;
  destinationWeddings: boolean;
  specialties: string[];
  languagesSpoken: string[];
}

const defaultDetails: PlannerDetails = {
  planningTypes: [], fullPlanningIncluded: false, partialPlanningAvailable: false, dayOfCoordinationAvailable: false, monthOfCoordinationAvailable: false,
  budgetManagement: false, vendorCoordination: false, vendorNetworkAccess: false, numberOfVendorContacts: null,
  venueSelection: false, contractReview: false, timelineCreation: true, designConsultation: false, moodBoardCreation: false, stationeryDesign: false,
  seatingArrangement: true, rehearsalCoordination: false, dayOfTimeline: true, guestManagement: false, rsvpTracking: false, welcomeBags: false, emergencyKit: false,
  maxWeddingsPerMonth: null, meetingsIncluded: null, virtualMeetings: true, onSiteHours: null, additionalHourlyRate: null,
  travelIncluded: false, travelRadius: null, assistantsProvided: false, numberOfAssistants: null, destinationWeddings: false,
  specialties: [], languagesSpoken: [],
};

const PLANNING_TYPES = ["Full planlegging", "Delvis planlegging", "Koordinering på dagen", "Månedskoordinering", "Ekteskapshelg", "Destinasjonsarrangement"];
const SPECIALTIES = ["Luksuriøst", "Budsjett-vennlig", "Intimt arrangement", "Stort arrangement", "Utendørs", "Strandbryllup", "Fjell/natur", "Byarrangement", "Kulturelt/tradisjonelt", "LGBTQ+", "Eco-vennlig"];
const LANGUAGES = ["Norsk", "Engelsk", "Svensk", "Dansk", "Tysk", "Fransk", "Spansk", "Polsk", "Arabisk", "Urdu"];

export default function PlannerDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<PlannerDetails>(defaultDetails);

  useEffect(() => { AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => { if (data) setSessionToken(JSON.parse(data).sessionToken); }); }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/planner-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/planner-details", getApiUrl()).toString(), { headers: { Authorization: `Bearer ${sessionToken}` } });
      return response.ok ? response.json() : null;
    },
    enabled: !!sessionToken,
  });

  useEffect(() => { if (savedData) setDetails({ ...defaultDetails, ...savedData }); }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/planner-details", getApiUrl()).toString(), {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/planner-details"] });
      showToast("Planleggerdetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message);
    },
  });

  const updateDetail = <K extends keyof PlannerDetails>(key: K, value: PlannerDetails[K]) => setDetails(prev => ({ ...prev, [key]: value }));
  const toggleArrayItem = (key: "planningTypes" | "specialties" | "languagesSpoken", item: string) => {
    setDetails(prev => ({ ...prev, [key]: prev[key].includes(item) ? prev[key].filter(i => i !== item) : [...prev[key], item] }));
  };

  const renderSwitch = (label: string, value: boolean, onChange: (v: boolean) => void, description?: string) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchRow}>
        <View style={styles.switchTextContainer}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>{label}</ThemedText>
          {description && <ThemedText style={[styles.switchDescription, { color: theme.textSecondary }]}>{description}</ThemedText>}
        </View>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }} thumbColor={value ? Colors.dark.accent : theme.backgroundSecondary} />
      </View>
    </View>
  );

  const renderInput = (label: string, value: string | null, onChange: (v: string) => void, options?: { placeholder?: string; keyboardType?: "default" | "number-pad"; suffix?: string; multiline?: boolean }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput style={[options?.multiline ? styles.textArea : styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }, options?.suffix && { paddingRight: 50 }]} value={value || ""} onChangeText={onChange} placeholder={options?.placeholder} placeholderTextColor={theme.textMuted} keyboardType={options?.keyboardType || "default"} multiline={options?.multiline} numberOfLines={options?.multiline ? 3 : 1} textAlignVertical={options?.multiline ? "top" : "center"} />
        {options?.suffix && <ThemedText style={[styles.inputSuffix, { color: theme.textSecondary }]}>{options.suffix}</ThemedText>}
      </View>
    </View>
  );

  const renderSectionHeader = (icon: string, title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}><EvendiIcon name={icon as any} size={16} color={theme.accent} /></View>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>{title}</ThemedText>
    </View>
  );

  const renderChipGrid = (items: string[], selected: string[], onToggle: (item: string) => void) => (
    <View style={styles.styleGrid}>
      {items.map((item) => (
        <Pressable key={item} onPress={() => onToggle(item)} style={[styles.styleChip, { borderColor: selected.includes(item) ? theme.accent : theme.border }, selected.includes(item) && { backgroundColor: theme.accent + "15" }]}>
          <ThemedText style={[styles.styleChipText, { color: selected.includes(item) ? theme.accent : theme.textSecondary }]}>{item}</ThemedText>
        </Pressable>
      ))}
    </View>
  );

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><EvendiIcon name="clipboard" size={20} color="#FFFFFF" /></View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>{isWedding ? "Bryllupsplanlegger" : "Arrangementsplanlegger"}</ThemedText></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><EvendiIcon name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.accent} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><EvendiIcon name="clipboard" size={20} color="#FFFFFF" /></View><View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Planleggerdetaljer</ThemedText><ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText></View></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><EvendiIcon name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>

      <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("layers", "Planleggingstyper")}
          {renderChipGrid(PLANNING_TYPES, details.planningTypes, (item) => toggleArrayItem("planningTypes", item))}
          {renderSwitch("Full planlegging inkludert", details.fullPlanningIncluded, (v) => updateDetail("fullPlanningIncluded", v), isWedding ? "Fra forlovelse til bryllupsdag" : "Fra start til gjennomføring")}
          {renderSwitch("Delvis planlegging tilgjengelig", details.partialPlanningAvailable, (v) => updateDetail("partialPlanningAvailable", v))}
          {renderSwitch("Koordinering på dagen", details.dayOfCoordinationAvailable, (v) => updateDetail("dayOfCoordinationAvailable", v))}
          {renderSwitch("Månedskoordinering", details.monthOfCoordinationAvailable, (v) => updateDetail("monthOfCoordinationAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("dollar-sign", "Budsjett & Leverandører")}
          {renderSwitch("Budsjettadministrasjon", details.budgetManagement, (v) => updateDetail("budgetManagement", v))}
          {renderSwitch("Leverandørkoordinering", details.vendorCoordination, (v) => updateDetail("vendorCoordination", v))}
          {renderSwitch("Tilgang til leverandørnettverk", details.vendorNetworkAccess, (v) => updateDetail("vendorNetworkAccess", v))}
          {details.vendorNetworkAccess && renderInput("Antall leverandørkontakter", details.numberOfVendorContacts?.toString() || "", (v) => updateDetail("numberOfVendorContacts", v ? parseInt(v) : null), { placeholder: "50", keyboardType: "number-pad" })}
          {renderSwitch("Lokale-søk & utvelgelse", details.venueSelection, (v) => updateDetail("venueSelection", v))}
          {renderSwitch("Kontraktgjennomgang", details.contractReview, (v) => updateDetail("contractReview", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("layout", "Design & Planlegging")}
          {renderSwitch("Design-konsultasjon", details.designConsultation, (v) => updateDetail("designConsultation", v))}
          {renderSwitch("Moodboard-laging", details.moodBoardCreation, (v) => updateDetail("moodBoardCreation", v))}
          {renderSwitch("Design av invitasjoner/trykksaker", details.stationeryDesign, (v) => updateDetail("stationeryDesign", v))}
          {renderSwitch("Tidslinje-oppsett", details.timelineCreation, (v) => updateDetail("timelineCreation", v))}
          {renderSwitch("Bordplassering", details.seatingArrangement, (v) => updateDetail("seatingArrangement", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", isWedding ? "Bryllupsdagen" : "Arrangementsdagen")}
          {renderSwitch("Prøvemiddag-koordinering", details.rehearsalCoordination, (v) => updateDetail("rehearsalCoordination", v))}
          {renderSwitch(isWedding ? "Tidslinje for bryllupsdagen" : "Tidslinje for dagen", details.dayOfTimeline, (v) => updateDetail("dayOfTimeline", v))}
          {renderSwitch("Gjesteadministrasjon", details.guestManagement, (v) => updateDetail("guestManagement", v))}
          {renderSwitch("RSVP-sporing", details.rsvpTracking, (v) => updateDetail("rsvpTracking", v))}
          {renderSwitch("Velkomstposer", details.welcomeBags, (v) => updateDetail("welcomeBags", v))}
          {renderSwitch("Nødsett/backup", details.emergencyKit, (v) => updateDetail("emergencyKit", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("clock", "Kapasitet & Tid")}
          {renderInput(isWedding ? "Maks bryllup per måned" : "Maks arrangementer per måned", details.maxWeddingsPerMonth?.toString() || "", (v) => updateDetail("maxWeddingsPerMonth", v ? parseInt(v) : null), { placeholder: "4", keyboardType: "number-pad" })}
          {renderInput("Møter inkludert", details.meetingsIncluded?.toString() || "", (v) => updateDetail("meetingsIncluded", v ? parseInt(v) : null), { placeholder: "5", keyboardType: "number-pad" })}
          {renderSwitch("Virtuelle møter tilgjengelig", details.virtualMeetings, (v) => updateDetail("virtualMeetings", v))}
          {renderInput(isWedding ? "Timer på stedet (bryllupsdagen)" : "Timer på stedet (arrangementsdagen)", details.onSiteHours?.toString() || "", (v) => updateDetail("onSiteHours", v ? parseInt(v) : null), { placeholder: "12", keyboardType: "number-pad", suffix: "timer" })}
          {renderInput("Ekstra time-rate", details.additionalHourlyRate?.toString() || "", (v) => updateDetail("additionalHourlyRate", v ? parseInt(v) : null), { placeholder: "1500", keyboardType: "number-pad", suffix: "kr/t" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("users", "Team & Reise")}
          {renderSwitch("Assistenter inkludert", details.assistantsProvided, (v) => updateDetail("assistantsProvided", v))}
          {details.assistantsProvided && renderInput("Antall assistenter", details.numberOfAssistants?.toString() || "", (v) => updateDetail("numberOfAssistants", v ? parseInt(v) : null), { placeholder: "2", keyboardType: "number-pad" })}
          {renderSwitch("Reise inkludert", details.travelIncluded, (v) => updateDetail("travelIncluded", v))}
          {renderInput("Kjøreradius", details.travelRadius?.toString() || "", (v) => updateDetail("travelRadius", v ? parseInt(v) : null), { placeholder: "100", keyboardType: "number-pad", suffix: "km" })}
          {renderSwitch(isWedding ? "Destinasjonsbryllup" : "Destinasjonsarrangement", details.destinationWeddings, (v) => updateDetail("destinationWeddings", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("award", "Spesialiteter")}
          {renderChipGrid(SPECIALTIES, details.specialties, (item) => toggleArrayItem("specialties", item))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("globe", "Språk")}
          {renderChipGrid(LANGUAGES, details.languagesSpoken, (item) => toggleArrayItem("languagesSpoken", item))}
        </View>

        <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9 }]}>
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><View style={styles.saveBtnIcon}><EvendiIcon name="save" size={16} color="#FFFFFF" /></View><ThemedText style={styles.saveBtnText}>Lagre planleggerdetaljer</ThemedText></>}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  headerIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 1 },
  closeButton: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: Spacing.lg },
  formCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.lg },
  sectionIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  inputGroup: { marginBottom: Spacing.md, flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: "500", marginBottom: Spacing.xs },
  inputWrapper: { position: "relative" },
  input: { height: 48, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, fontSize: 15 },
  textArea: { minHeight: 80, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: 15 },
  inputSuffix: { position: "absolute", right: Spacing.md, top: 14, fontSize: 14 },
  switchContainer: { marginBottom: Spacing.sm },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.sm },
  switchTextContainer: { flex: 1, marginRight: Spacing.md },
  switchLabel: { fontSize: 15, fontWeight: "500" },
  switchDescription: { fontSize: 12, marginTop: 2 },
  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.md },
  styleChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  styleChipText: { fontSize: 13, fontWeight: "500" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: BorderRadius.lg, marginTop: Spacing.md, gap: Spacing.sm, shadowColor: "#C9A962", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
