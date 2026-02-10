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
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "@/lib/toast";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface CakeDetails {
  cakeStyles: string[];
  cakeFlavors: string[];
  deliveryIncluded: boolean;
  deliveryRadius: number | null;
  deliveryFee: number | null;
  setupIncluded: boolean;
  tastingAvailable: boolean;
  tastingFee: number | null;
  tastingIncludedInBooking: boolean;
  customDesignsAvailable: boolean;
  tieredCakesAvailable: boolean;
  maxTiers: number | null;
  servesMinGuests: number | null;
  servesMaxGuests: number | null;
  dessertTableAvailable: boolean;
  cupcakesAvailable: boolean;
  miniCakesAvailable: boolean;
  cakePopsAvailable: boolean;
  macaronsAvailable: boolean;
  cakeStandRental: boolean;
  cakeKnifeSetRental: boolean;
  dietaryOptions: string[];
  bookingLeadWeeks: number | null;
}

const defaultDetails: CakeDetails = {
  cakeStyles: [], cakeFlavors: [],
  deliveryIncluded: false, deliveryRadius: null, deliveryFee: null, setupIncluded: false,
  tastingAvailable: true, tastingFee: null, tastingIncludedInBooking: false,
  customDesignsAvailable: true, tieredCakesAvailable: true, maxTiers: null,
  servesMinGuests: null, servesMaxGuests: null,
  dessertTableAvailable: false, cupcakesAvailable: false, miniCakesAvailable: false, cakePopsAvailable: false, macaronsAvailable: false,
  cakeStandRental: false, cakeKnifeSetRental: false,
  dietaryOptions: [], bookingLeadWeeks: null,
};

const CAKE_STYLES = ["Klassisk", "Moderne", "Rustikk", "Bohemsk", "Elegant", "Minimalistisk", "Blomsterdekorert", "Naked cake", "Drip cake", "Geometrisk"];
const CAKE_FLAVORS = ["Sjokolade", "Vanilje", "Sitron", "Bringebær", "Karamell", "Red velvet", "Kokos", "Mandel", "Hasselnøtt", "Kaffekaramell", "Pasjonsfrukt"];
const DIETARY_OPTIONS = ["Glutenfri", "Vegansk", "Laktosefri", "Nøttefri", "Eggfri", "Sukkerfri"];

export default function CakeDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<CakeDetails>(defaultDetails);

  useEffect(() => { AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => { if (data) setSessionToken(JSON.parse(data).sessionToken); }); }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/cake-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/cake-details", getApiUrl()).toString(), { headers: { Authorization: `Bearer ${sessionToken}` } });
      return response.ok ? response.json() : null;
    },
    enabled: !!sessionToken,
  });

  useEffect(() => { if (savedData) setDetails({ ...defaultDetails, ...savedData }); }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/cake-details", getApiUrl()).toString(), {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/cake-details"] });
      showToast("Kakedetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message);
    },
  });

  const updateDetail = <K extends keyof CakeDetails>(key: K, value: CakeDetails[K]) => setDetails(prev => ({ ...prev, [key]: value }));
  const toggleArrayItem = (key: "cakeStyles" | "cakeFlavors" | "dietaryOptions", item: string) => {
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

  const renderInput = (label: string, value: string | null, onChange: (v: string) => void, options?: { placeholder?: string; keyboardType?: "default" | "number-pad"; suffix?: string }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }, options?.suffix && { paddingRight: 50 }]} value={value || ""} onChangeText={onChange} placeholder={options?.placeholder} placeholderTextColor={theme.textMuted} keyboardType={options?.keyboardType || "default"} />
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
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><EvendiIcon name="gift" size={20} color="#FFFFFF" /></View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Kakedetaljer</ThemedText></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><EvendiIcon name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.accent} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><EvendiIcon name="gift" size={20} color="#FFFFFF" /></View><View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Kakedetaljer</ThemedText><ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText></View></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><EvendiIcon name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>

      <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("star", "Kakestiler")}
          {renderChipGrid(CAKE_STYLES, details.cakeStyles, (item) => toggleArrayItem("cakeStyles", item))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("heart", "Smaker")}
          {renderChipGrid(CAKE_FLAVORS, details.cakeFlavors, (item) => toggleArrayItem("cakeFlavors", item))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("layers", "Kaker")}
          {renderSwitch("Tilpassede design", details.customDesignsAvailable, (v) => updateDetail("customDesignsAvailable", v))}
          {renderSwitch("Etasjekaker", details.tieredCakesAvailable, (v) => updateDetail("tieredCakesAvailable", v))}
          {details.tieredCakesAvailable && renderInput("Maks etasjer", details.maxTiers?.toString() || "", (v) => updateDetail("maxTiers", v ? parseInt(v) : null), { placeholder: "5", keyboardType: "number-pad" })}
          <View style={styles.rowInputs}>
            {renderInput("Min gjester", details.servesMinGuests?.toString() || "", (v) => updateDetail("servesMinGuests", v ? parseInt(v) : null), { placeholder: "20", keyboardType: "number-pad" })}
            {renderInput("Maks gjester", details.servesMaxGuests?.toString() || "", (v) => updateDetail("servesMaxGuests", v ? parseInt(v) : null), { placeholder: "200", keyboardType: "number-pad" })}
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("box", "Tilleggsprodukter")}
          {renderSwitch("Dessertbord", details.dessertTableAvailable, (v) => updateDetail("dessertTableAvailable", v))}
          {renderSwitch("Cupcakes", details.cupcakesAvailable, (v) => updateDetail("cupcakesAvailable", v))}
          {renderSwitch("Minikaker", details.miniCakesAvailable, (v) => updateDetail("miniCakesAvailable", v))}
          {renderSwitch("Cake pops", details.cakePopsAvailable, (v) => updateDetail("cakePopsAvailable", v))}
          {renderSwitch("Macarons", details.macaronsAvailable, (v) => updateDetail("macaronsAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("check-square", "Diett-alternativer")}
          {renderChipGrid(DIETARY_OPTIONS, details.dietaryOptions, (item) => toggleArrayItem("dietaryOptions", item))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("truck", "Levering")}
          {renderSwitch("Levering inkludert", details.deliveryIncluded, (v) => updateDetail("deliveryIncluded", v))}
          {!details.deliveryIncluded && (
            <>
              {renderInput("Gratis innenfor", details.deliveryRadius?.toString() || "", (v) => updateDetail("deliveryRadius", v ? parseInt(v) : null), { placeholder: "30", keyboardType: "number-pad", suffix: "km" })}
              {renderInput("Leveringsgebyr", details.deliveryFee?.toString() || "", (v) => updateDetail("deliveryFee", v ? parseInt(v) : null), { placeholder: "500", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
          {renderSwitch("Oppsett inkludert", details.setupIncluded, (v) => updateDetail("setupIncluded", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("clipboard", "Smaksprøve")}
          {renderSwitch("Smaksprøve tilgjengelig", details.tastingAvailable, (v) => updateDetail("tastingAvailable", v))}
          {details.tastingAvailable && (
            <>
              {renderSwitch("Inkludert ved booking", details.tastingIncludedInBooking, (v) => updateDetail("tastingIncludedInBooking", v))}
              {!details.tastingIncludedInBooking && renderInput("Pris smaksprøve", details.tastingFee?.toString() || "", (v) => updateDetail("tastingFee", v ? parseInt(v) : null), { placeholder: "400", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("tool", "Utleie")}
          {renderSwitch("Kakefat-utleie", details.cakeStandRental, (v) => updateDetail("cakeStandRental", v))}
          {renderSwitch("Kakekniv-sett utleie", details.cakeKnifeSetRental, (v) => updateDetail("cakeKnifeSetRental", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", "Booking")}
          {renderInput("Book i forveien", details.bookingLeadWeeks?.toString() || "", (v) => updateDetail("bookingLeadWeeks", v ? parseInt(v) : null), { placeholder: "6", keyboardType: "number-pad", suffix: "uker" })}
        </View>

        <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9 }]}>
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><View style={styles.saveBtnIcon}><EvendiIcon name="save" size={16} color="#FFFFFF" /></View><ThemedText style={styles.saveBtnText}>Lagre kakedetaljer</ThemedText></>}
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
  inputSuffix: { position: "absolute", right: Spacing.md, top: 14, fontSize: 14 },
  rowInputs: { flexDirection: "row", gap: Spacing.md },
  switchContainer: { marginBottom: Spacing.sm },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.sm },
  switchTextContainer: { flex: 1, marginRight: Spacing.md },
  switchLabel: { fontSize: 15, fontWeight: "500" },
  switchDescription: { fontSize: 12, marginTop: 2 },
  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  styleChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  styleChipText: { fontSize: 13, fontWeight: "500" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: BorderRadius.lg, marginTop: Spacing.md, gap: Spacing.sm, shadowColor: "#C9A962", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
