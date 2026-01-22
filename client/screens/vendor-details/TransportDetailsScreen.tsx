import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Alert, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface TransportDetails {
  vehicleTypes: string[];
  vehicleCapacity: number | null;
  multipleVehiclesAvailable: boolean;
  maxVehicles: number | null;
  decorationIncluded: boolean;
  decorationOptions: string[];
  champagneIncluded: boolean;
  redCarpetAvailable: boolean;
  driverInUniform: boolean;
  airConditioned: boolean;
  minHours: number | null;
  maxHours: number | null;
  hourlyRate: number | null;
  flatRateAvailable: boolean;
  flatRateDescription: string | null;
  multipleTripsAvailable: boolean;
  airportPickupAvailable: boolean;
  guestShuttleAvailable: boolean;
  shuttleCapacity: number | null;
  travelRadius: number | null;
  insuranceIncluded: boolean;
  bookingLeadDays: number | null;
}

const defaultDetails: TransportDetails = {
  vehicleTypes: [], vehicleCapacity: null, multipleVehiclesAvailable: false, maxVehicles: null,
  decorationIncluded: false, decorationOptions: [], champagneIncluded: false, redCarpetAvailable: false,
  driverInUniform: true, airConditioned: true,
  minHours: null, maxHours: null, hourlyRate: null, flatRateAvailable: false, flatRateDescription: null,
  multipleTripsAvailable: false, airportPickupAvailable: false, guestShuttleAvailable: false, shuttleCapacity: null,
  travelRadius: null, insuranceIncluded: true, bookingLeadDays: null,
};

const VEHICLE_TYPES = ["Limousin", "Veteranbil", "Klassisk bil", "Luksusbil", "SUV", "Buss/Van", "Hestevogn", "Motorsykkel", "Båt", "Helikopter"];
const DECORATION_OPTIONS = ["Blomster", "Bånd", "Ballonger", "Just Married-skilt", "Hjertedekor", "Røde roser"];

export default function TransportDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<TransportDetails>(defaultDetails);

  useEffect(() => { AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => { if (data) setSessionToken(JSON.parse(data).sessionToken); }); }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/transport-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/transport-details", getApiUrl()).toString(), { headers: { Authorization: `Bearer ${sessionToken}` } });
      return response.ok ? response.json() : null;
    },
    enabled: !!sessionToken,
  });

  useEffect(() => { if (savedData) setDetails({ ...defaultDetails, ...savedData }); }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/transport-details", getApiUrl()).toString(), {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); queryClient.invalidateQueries({ queryKey: ["/api/vendor/transport-details"] }); Alert.alert("Lagret", "Transportdetaljene er oppdatert"); },
    onError: (error: Error) => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert("Feil", error.message); },
  });

  const updateDetail = <K extends keyof TransportDetails>(key: K, value: TransportDetails[K]) => setDetails(prev => ({ ...prev, [key]: value }));
  const toggleArrayItem = (key: "vehicleTypes" | "decorationOptions", item: string) => {
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
      <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}><Feather name={icon as any} size={16} color={theme.accent} /></View>
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
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="truck" size={20} color="#FFFFFF" /></View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Transport</ThemedText></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.accent} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="truck" size={20} color="#FFFFFF" /></View><View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Transportdetaljer</ThemedText><ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText></View></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>

      <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("truck", "Kjøretøy")}
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>Type kjøretøy</ThemedText>
          {renderChipGrid(VEHICLE_TYPES, details.vehicleTypes, (item) => toggleArrayItem("vehicleTypes", item))}
          {renderInput("Passasjerkapasitet", details.vehicleCapacity?.toString() || "", (v) => updateDetail("vehicleCapacity", v ? parseInt(v) : null), { placeholder: "4", keyboardType: "number-pad", suffix: "pers" })}
          {renderSwitch("Flere kjøretøy tilgjengelig", details.multipleVehiclesAvailable, (v) => updateDetail("multipleVehiclesAvailable", v))}
          {details.multipleVehiclesAvailable && renderInput("Maks antall kjøretøy", details.maxVehicles?.toString() || "", (v) => updateDetail("maxVehicles", v ? parseInt(v) : null), { placeholder: "3", keyboardType: "number-pad" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("heart", "Dekorasjon & Tillegg")}
          {renderSwitch("Dekorasjon inkludert", details.decorationIncluded, (v) => updateDetail("decorationIncluded", v))}
          {details.decorationIncluded && (
            <>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>Dekorasjonstyper</ThemedText>
              {renderChipGrid(DECORATION_OPTIONS, details.decorationOptions, (item) => toggleArrayItem("decorationOptions", item))}
            </>
          )}
          {renderSwitch("Champagne inkludert", details.champagneIncluded, (v) => updateDetail("champagneIncluded", v))}
          {renderSwitch("Rød løper tilgjengelig", details.redCarpetAvailable, (v) => updateDetail("redCarpetAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("user", "Sjåfør & Komfort")}
          {renderSwitch("Sjåfør i uniform", details.driverInUniform, (v) => updateDetail("driverInUniform", v))}
          {renderSwitch("Klimaanlegg", details.airConditioned, (v) => updateDetail("airConditioned", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("clock", "Tid & Priser")}
          <View style={styles.rowInputs}>
            {renderInput("Min timer", details.minHours?.toString() || "", (v) => updateDetail("minHours", v ? parseInt(v) : null), { placeholder: "2", keyboardType: "number-pad" })}
            {renderInput("Maks timer", details.maxHours?.toString() || "", (v) => updateDetail("maxHours", v ? parseInt(v) : null), { placeholder: "10", keyboardType: "number-pad" })}
          </View>
          {renderInput("Timepris", details.hourlyRate?.toString() || "", (v) => updateDetail("hourlyRate", v ? parseInt(v) : null), { placeholder: "2000", keyboardType: "number-pad", suffix: "kr/t" })}
          {renderSwitch("Fastpris tilgjengelig", details.flatRateAvailable, (v) => updateDetail("flatRateAvailable", v))}
          {details.flatRateAvailable && renderInput("Fastpris-beskrivelse", details.flatRateDescription || "", (v) => updateDetail("flatRateDescription", v || null), { placeholder: "F.eks. 5000kr for 3 timer...", multiline: true })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("repeat", "Ekstra tjenester")}
          {renderSwitch("Flere turer på dagen", details.multipleTripsAvailable, (v) => updateDetail("multipleTripsAvailable", v))}
          {renderSwitch("Flyplasshenting", details.airportPickupAvailable, (v) => updateDetail("airportPickupAvailable", v))}
          {renderSwitch("Gjeste-shuttle", details.guestShuttleAvailable, (v) => updateDetail("guestShuttleAvailable", v))}
          {details.guestShuttleAvailable && renderInput("Shuttle-kapasitet", details.shuttleCapacity?.toString() || "", (v) => updateDetail("shuttleCapacity", v ? parseInt(v) : null), { placeholder: "20", keyboardType: "number-pad", suffix: "pers" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("map-pin", "Område & Booking")}
          {renderInput("Kjøreradius", details.travelRadius?.toString() || "", (v) => updateDetail("travelRadius", v ? parseInt(v) : null), { placeholder: "100", keyboardType: "number-pad", suffix: "km" })}
          {renderSwitch("Forsikring inkludert", details.insuranceIncluded, (v) => updateDetail("insuranceIncluded", v))}
          {renderInput("Book i forveien", details.bookingLeadDays?.toString() || "", (v) => updateDetail("bookingLeadDays", v ? parseInt(v) : null), { placeholder: "14", keyboardType: "number-pad", suffix: "dager" })}
        </View>

        <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9 }]}>
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><View style={styles.saveBtnIcon}><Feather name="save" size={16} color="#FFFFFF" /></View><ThemedText style={styles.saveBtnText}>Lagre transportdetaljer</ThemedText></>}
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
  rowInputs: { flexDirection: "row", gap: Spacing.md },
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
