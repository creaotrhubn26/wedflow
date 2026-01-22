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

interface BeautyDetails {
  // Tjenester
  offersBridalMakeup: boolean;
  offersBridalHair: boolean;
  offersBridesmaidMakeup: boolean;
  offersBridesmaidHair: boolean;
  offersGroomGrooming: boolean;
  offersMotherOfBride: boolean;
  offersFlowerGirlHair: boolean;
  
  // Prøvetime
  trialIncluded: boolean;
  trialFee: number | null;
  trialMakeup: boolean;
  trialHair: boolean;
  
  // Lokasjon
  onLocationAvailable: boolean;
  travelIncluded: boolean;
  travelRadius: number | null;
  travelFee: number | null;
  salonAvailable: boolean;
  salonAddress: string | null;
  
  // Tillegg
  falseLashesAvailable: boolean;
  falseLashesIncluded: boolean;
  lashExtensionsAvailable: boolean;
  airbrushMakeupAvailable: boolean;
  hairExtensionsAvailable: boolean;
  veilStylingIncluded: boolean;
  
  // Produkter
  usesHighEndProducts: boolean;
  productBrands: string[];
  hypoallergenicAvailable: boolean;
  veganProductsAvailable: boolean;
  
  // Touch-ups
  touchUpServiceAvailable: boolean;
  touchUpIncluded: boolean;
  touchUpFee: number | null;
  staysForCeremony: boolean;
  
  // Tid
  setupTimeMinutes: number | null;
  bridalTimeMinutes: number | null;
  additionalPersonTime: number | null;
  
  // Booking
  maxClientsPerDay: number | null;
  bookingLeadWeeks: number | null;
}

const defaultDetails: BeautyDetails = {
  offersBridalMakeup: true, offersBridalHair: true, offersBridesmaidMakeup: true, offersBridesmaidHair: true,
  offersGroomGrooming: false, offersMotherOfBride: true, offersFlowerGirlHair: false,
  trialIncluded: false, trialFee: null, trialMakeup: true, trialHair: true,
  onLocationAvailable: true, travelIncluded: false, travelRadius: null, travelFee: null, salonAvailable: false, salonAddress: null,
  falseLashesAvailable: true, falseLashesIncluded: false, lashExtensionsAvailable: false, airbrushMakeupAvailable: false, hairExtensionsAvailable: false, veilStylingIncluded: true,
  usesHighEndProducts: true, productBrands: [], hypoallergenicAvailable: true, veganProductsAvailable: false,
  touchUpServiceAvailable: false, touchUpIncluded: false, touchUpFee: null, staysForCeremony: false,
  setupTimeMinutes: null, bridalTimeMinutes: null, additionalPersonTime: null,
  maxClientsPerDay: null, bookingLeadWeeks: null,
};

const PRODUCT_BRANDS = ["MAC", "Charlotte Tilbury", "Bobbi Brown", "NARS", "Laura Mercier", "Dior", "Chanel", "Makeup Forever", "Hourglass", "Too Faced"];

export default function BeautyDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<BeautyDetails>(defaultDetails);

  useEffect(() => { AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => { if (data) setSessionToken(JSON.parse(data).sessionToken); }); }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/beauty-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/beauty-details", getApiUrl()).toString(), { headers: { Authorization: `Bearer ${sessionToken}` } });
      return response.ok ? response.json() : null;
    },
    enabled: !!sessionToken,
  });

  useEffect(() => { if (savedData) setDetails({ ...defaultDetails, ...savedData }); }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/beauty-details", getApiUrl()).toString(), {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); queryClient.invalidateQueries({ queryKey: ["/api/vendor/beauty-details"] }); Alert.alert("Lagret", "Hår & Makeup-detaljene er oppdatert"); },
    onError: (error: Error) => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert("Feil", error.message); },
  });

  const updateDetail = <K extends keyof BeautyDetails>(key: K, value: BeautyDetails[K]) => setDetails(prev => ({ ...prev, [key]: value }));
  const toggleBrand = (brand: string) => setDetails(prev => ({ ...prev, productBrands: prev.productBrands.includes(brand) ? prev.productBrands.filter(b => b !== brand) : [...prev.productBrands, brand] }));

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
      <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}><Feather name={icon as any} size={16} color={theme.accent} /></View>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>{title}</ThemedText>
    </View>
  );

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="scissors" size={20} color="#FFFFFF" /></View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Hår & Makeup</ThemedText></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.accent} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}><View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="scissors" size={20} color="#FFFFFF" /></View><View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Hår & Makeup</ThemedText><ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText></View></View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>

      <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("heart", "Tjenester")}
          {renderSwitch("Brudemakeup", details.offersBridalMakeup, (v) => updateDetail("offersBridalMakeup", v))}
          {renderSwitch("Brudehår", details.offersBridalHair, (v) => updateDetail("offersBridalHair", v))}
          {renderSwitch("Brudepikemakeup", details.offersBridesmaidMakeup, (v) => updateDetail("offersBridesmaidMakeup", v))}
          {renderSwitch("Brudepikehår", details.offersBridesmaidHair, (v) => updateDetail("offersBridesmaidHair", v))}
          {renderSwitch("Brudens mor", details.offersMotherOfBride, (v) => updateDetail("offersMotherOfBride", v))}
          {renderSwitch("Brudgom-styling", details.offersGroomGrooming, (v) => updateDetail("offersGroomGrooming", v))}
          {renderSwitch("Brudepikehår", details.offersFlowerGirlHair, (v) => updateDetail("offersFlowerGirlHair", v), "For små blomsterpiker")}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", "Prøvetime")}
          {renderSwitch("Prøvetime inkludert", details.trialIncluded, (v) => updateDetail("trialIncluded", v))}
          {!details.trialIncluded && renderInput("Pris prøvetime", details.trialFee?.toString() || "", (v) => updateDetail("trialFee", v ? parseInt(v) : null), { placeholder: "1500", keyboardType: "number-pad", suffix: "kr" })}
          {renderSwitch("Prøve-makeup", details.trialMakeup, (v) => updateDetail("trialMakeup", v))}
          {renderSwitch("Prøve-hår", details.trialHair, (v) => updateDetail("trialHair", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("map-pin", "Lokasjon")}
          {renderSwitch("Kommer til lokalet", details.onLocationAvailable, (v) => updateDetail("onLocationAvailable", v))}
          {details.onLocationAvailable && (
            <>
              {renderSwitch("Reise inkludert", details.travelIncluded, (v) => updateDetail("travelIncluded", v))}
              {!details.travelIncluded && (
                <>
                  {renderInput("Gratis innenfor", details.travelRadius?.toString() || "", (v) => updateDetail("travelRadius", v ? parseInt(v) : null), { placeholder: "30", keyboardType: "number-pad", suffix: "km" })}
                  {renderInput("Reisegebyr", details.travelFee?.toString() || "", (v) => updateDetail("travelFee", v ? parseInt(v) : null), { placeholder: "500", keyboardType: "number-pad", suffix: "kr" })}
                </>
              )}
            </>
          )}
          {renderSwitch("Salong tilgjengelig", details.salonAvailable, (v) => updateDetail("salonAvailable", v))}
          {details.salonAvailable && renderInput("Salong-adresse", details.salonAddress || "", (v) => updateDetail("salonAddress", v || null), { placeholder: "Gateadresse, by" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("star", "Tilleggstjenester")}
          {renderSwitch("Løsvipper tilgjengelig", details.falseLashesAvailable, (v) => updateDetail("falseLashesAvailable", v))}
          {details.falseLashesAvailable && renderSwitch("Løsvipper inkludert", details.falseLashesIncluded, (v) => updateDetail("falseLashesIncluded", v))}
          {renderSwitch("Vippeextensions", details.lashExtensionsAvailable, (v) => updateDetail("lashExtensionsAvailable", v))}
          {renderSwitch("Airbrush-makeup", details.airbrushMakeupAvailable, (v) => updateDetail("airbrushMakeupAvailable", v))}
          {renderSwitch("Hair extensions", details.hairExtensionsAvailable, (v) => updateDetail("hairExtensionsAvailable", v))}
          {renderSwitch("Slør-styling inkludert", details.veilStylingIncluded, (v) => updateDetail("veilStylingIncluded", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("package", "Produkter")}
          {renderSwitch("High-end produkter", details.usesHighEndProducts, (v) => updateDetail("usesHighEndProducts", v))}
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>Merker jeg bruker</ThemedText>
          <View style={styles.styleGrid}>
            {PRODUCT_BRANDS.map((brand) => (
              <Pressable key={brand} onPress={() => toggleBrand(brand)} style={[styles.styleChip, { borderColor: details.productBrands.includes(brand) ? theme.accent : theme.border }, details.productBrands.includes(brand) && { backgroundColor: theme.accent + "15" }]}>
                <ThemedText style={[styles.styleChipText, { color: details.productBrands.includes(brand) ? theme.accent : theme.textSecondary }]}>{brand}</ThemedText>
              </Pressable>
            ))}
          </View>
          {renderSwitch("Hypoallergene produkter", details.hypoallergenicAvailable, (v) => updateDetail("hypoallergenicAvailable", v))}
          {renderSwitch("Veganske produkter", details.veganProductsAvailable, (v) => updateDetail("veganProductsAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("refresh-cw", "Touch-up")}
          {renderSwitch("Touch-up service", details.touchUpServiceAvailable, (v) => updateDetail("touchUpServiceAvailable", v))}
          {details.touchUpServiceAvailable && (
            <>
              {renderSwitch("Touch-up inkludert", details.touchUpIncluded, (v) => updateDetail("touchUpIncluded", v))}
              {!details.touchUpIncluded && renderInput("Pris touch-up", details.touchUpFee?.toString() || "", (v) => updateDetail("touchUpFee", v ? parseInt(v) : null), { placeholder: "1000", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
          {renderSwitch("Blir til seremonien", details.staysForCeremony, (v) => updateDetail("staysForCeremony", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("clock", "Tidsbruk")}
          {renderInput("Rigge-tid", details.setupTimeMinutes?.toString() || "", (v) => updateDetail("setupTimeMinutes", v ? parseInt(v) : null), { placeholder: "30", keyboardType: "number-pad", suffix: "min" })}
          {renderInput("Tid per brud", details.bridalTimeMinutes?.toString() || "", (v) => updateDetail("bridalTimeMinutes", v ? parseInt(v) : null), { placeholder: "90", keyboardType: "number-pad", suffix: "min" })}
          {renderInput("Tid per ekstra person", details.additionalPersonTime?.toString() || "", (v) => updateDetail("additionalPersonTime", v ? parseInt(v) : null), { placeholder: "45", keyboardType: "number-pad", suffix: "min" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("users", "Kapasitet")}
          {renderInput("Maks kunder per dag", details.maxClientsPerDay?.toString() || "", (v) => updateDetail("maxClientsPerDay", v ? parseInt(v) : null), { placeholder: "6", keyboardType: "number-pad" })}
          {renderInput("Book i forveien", details.bookingLeadWeeks?.toString() || "", (v) => updateDetail("bookingLeadWeeks", v ? parseInt(v) : null), { placeholder: "8", keyboardType: "number-pad", suffix: "uker" })}
        </View>

        <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9 }]}>
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><View style={styles.saveBtnIcon}><Feather name="save" size={16} color="#FFFFFF" /></View><ThemedText style={styles.saveBtnText}>Lagre hår & makeup-detaljer</ThemedText></>}
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
