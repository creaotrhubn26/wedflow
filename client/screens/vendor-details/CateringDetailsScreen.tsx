import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
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

interface CateringDetails {
  // Kapasitet
  minGuests: number | null;
  maxGuests: number | null;
  minOrderValue: number | null;
  
  // Menyer
  offersBuffet: boolean;
  offersSetMenu: boolean;
  offersFamilyStyle: boolean;
  offersFineDining: boolean;
  offersGrazing: boolean;
  offersFoodStations: boolean;
  
  // Mat-type
  cuisineTypes: string[];
  
  // Diett
  vegetarianOptions: boolean;
  veganOptions: boolean;
  glutenFreeOptions: boolean;
  halalOptions: boolean;
  kosherOptions: boolean;
  allergyAccommodation: boolean;
  
  // Servering
  staffIncluded: boolean;
  staffPerGuests: number | null;
  barServiceIncluded: boolean;
  bartendersIncluded: boolean;
  
  // Drikke
  alcoholServiceAvailable: boolean;
  wineServiceAvailable: boolean;
  signatureCocktails: boolean;
  nonAlcoholicOptions: boolean;
  coffeeTeaService: boolean;
  
  // Utstyr
  equipmentIncluded: boolean;
  tableware: boolean;
  glassware: boolean;
  linens: boolean;
  furnitureRental: boolean;
  
  // Leveranse
  deliveryIncluded: boolean;
  setupIncluded: boolean;
  cleanupIncluded: boolean;
  onSiteCooking: boolean;
  
  // Ekstra
  tastingAvailable: boolean;
  tastingFee: number | null;
  tastingIncludedInBooking: boolean;
  customMenusAvailable: boolean;
  cakeAvailable: boolean;
  lateNightSnacks: boolean;
  
  // Tidslinjer
  bookingLeadWeeks: number | null;
  finalNumbersDays: number | null;
}

const defaultDetails: CateringDetails = {
  minGuests: null,
  maxGuests: null,
  minOrderValue: null,
  offersBuffet: true,
  offersSetMenu: true,
  offersFamilyStyle: false,
  offersFineDining: false,
  offersGrazing: false,
  offersFoodStations: false,
  cuisineTypes: [],
  vegetarianOptions: true,
  veganOptions: true,
  glutenFreeOptions: true,
  halalOptions: false,
  kosherOptions: false,
  allergyAccommodation: true,
  staffIncluded: false,
  staffPerGuests: null,
  barServiceIncluded: false,
  bartendersIncluded: false,
  alcoholServiceAvailable: false,
  wineServiceAvailable: false,
  signatureCocktails: false,
  nonAlcoholicOptions: true,
  coffeeTeaService: true,
  equipmentIncluded: false,
  tableware: false,
  glassware: false,
  linens: false,
  furnitureRental: false,
  deliveryIncluded: false,
  setupIncluded: false,
  cleanupIncluded: false,
  onSiteCooking: false,
  tastingAvailable: false,
  tastingFee: null,
  tastingIncludedInBooking: false,
  customMenusAvailable: true,
  cakeAvailable: false,
  lateNightSnacks: false,
  bookingLeadWeeks: null,
  finalNumbersDays: null,
};

const CUISINE_TYPES = [
  "Norsk/Skandinavisk",
  "Fransk",
  "Italiensk",
  "Asiatisk",
  "Middelhavet",
  "Amerikansk",
  "Mexicansk",
  "Indisk",
  "Fusion",
  "Farm-to-table",
  "Sjømat",
  "BBQ/Grill",
];

export default function CateringDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<CateringDetails>(defaultDetails);

  useEffect(() => {
    AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setSessionToken(parsed.sessionToken);
      }
    });
  }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/catering-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/catering-details", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!sessionToken,
  });

  useEffect(() => {
    if (savedData) {
      setDetails({ ...defaultDetails, ...savedData });
    }
  }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/catering-details", getApiUrl()).toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Kunne ikke lagre");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/catering-details"] });
      showToast("Cateringdetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message);
    },
  });

  const updateDetail = <K extends keyof CateringDetails>(key: K, value: CateringDetails[K]) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const toggleCuisine = (cuisine: string) => {
    setDetails(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const renderSectionHeader = (icon: string, title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
        <EvendiIcon name={icon as any} size={16} color={theme.accent} />
      </View>
      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>{title}</ThemedText>
    </View>
  );

  const renderSwitch = (label: string, value: boolean, onChange: (v: boolean) => void, description?: string) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchRow}>
        <View style={styles.switchTextContainer}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>{label}</ThemedText>
          {description && <ThemedText style={[styles.switchDescription, { color: theme.textSecondary }]}>{description}</ThemedText>}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
          thumbColor={value ? Colors.dark.accent : theme.backgroundSecondary}
        />
      </View>
    </View>
  );

  const renderInput = (label: string, value: string | null, onChange: (v: string) => void, options?: {
    placeholder?: string;
    keyboardType?: "default" | "number-pad";
    suffix?: string;
  }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }, options?.suffix && { paddingRight: 50 }]}
          value={value || ""}
          onChangeText={onChange}
          placeholder={options?.placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={options?.keyboardType || "default"}
        />
        {options?.suffix && <ThemedText style={[styles.inputSuffix, { color: theme.textSecondary }]}>{options.suffix}</ThemedText>}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
              <EvendiIcon name="coffee" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Cateringdetaljer</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Laster...</ThemedText>
            </View>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.closeButton, { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot }]}>
            <EvendiIcon name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <EvendiIcon name="coffee" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Cateringdetaljer</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText>
          </View>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.closeButton, { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot }]}>
          <EvendiIcon name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
      >
        {/* Kapasitet */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("users", "Kapasitet")}
          
          <View style={styles.rowInputs}>
            {renderInput("Minimum gjester", details.minGuests?.toString() || "", (v) => updateDetail("minGuests", v ? parseInt(v) : null), { placeholder: "20", keyboardType: "number-pad" })}
            {renderInput("Maksimum gjester", details.maxGuests?.toString() || "", (v) => updateDetail("maxGuests", v ? parseInt(v) : null), { placeholder: "300", keyboardType: "number-pad" })}
          </View>
          {renderInput("Minimum ordresum", details.minOrderValue?.toString() || "", (v) => updateDetail("minOrderValue", v ? parseInt(v) : null), { placeholder: "15000", keyboardType: "number-pad", suffix: "kr" })}
        </View>

        {/* Serveringsformat */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("layout", "Serveringsformat")}
          
          {renderSwitch("Buffet", details.offersBuffet, (v) => updateDetail("offersBuffet", v))}
          {renderSwitch("Satt meny", details.offersSetMenu, (v) => updateDetail("offersSetMenu", v), "Serverte retter")}
          {renderSwitch("Family style", details.offersFamilyStyle, (v) => updateDetail("offersFamilyStyle", v), "Fat på bordet")}
          {renderSwitch("Fine dining", details.offersFineDining, (v) => updateDetail("offersFineDining", v))}
          {renderSwitch("Grazing tables", details.offersGrazing, (v) => updateDetail("offersGrazing", v), "Store serveringsbord")}
          {renderSwitch("Matstasjoner", details.offersFoodStations, (v) => updateDetail("offersFoodStations", v))}
        </View>

        {/* Kjøkken */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("globe", "Kjøkkentype")}
          
          <View style={styles.styleGrid}>
            {CUISINE_TYPES.map((cuisine) => (
              <Pressable
                key={cuisine}
                onPress={() => toggleCuisine(cuisine)}
                style={[
                  styles.styleChip,
                  { borderColor: details.cuisineTypes.includes(cuisine) ? theme.accent : theme.border },
                  details.cuisineTypes.includes(cuisine) && { backgroundColor: theme.accent + "15" },
                ]}
              >
                <ThemedText style={[styles.styleChipText, { color: details.cuisineTypes.includes(cuisine) ? theme.accent : theme.textSecondary }]}>
                  {cuisine}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Diett */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("heart", "Diett & Allergier")}
          
          {renderSwitch("Vegetar-alternativer", details.vegetarianOptions, (v) => updateDetail("vegetarianOptions", v))}
          {renderSwitch("Veganske alternativer", details.veganOptions, (v) => updateDetail("veganOptions", v))}
          {renderSwitch("Glutenfrie alternativer", details.glutenFreeOptions, (v) => updateDetail("glutenFreeOptions", v))}
          {renderSwitch("Halal", details.halalOptions, (v) => updateDetail("halalOptions", v))}
          {renderSwitch("Kosher", details.kosherOptions, (v) => updateDetail("kosherOptions", v))}
          {renderSwitch("Allergi-tilpasning", details.allergyAccommodation, (v) => updateDetail("allergyAccommodation", v), "Vi tilpasser til allergier")}
        </View>

        {/* Personal */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("user-check", "Servering & Personal")}
          
          {renderSwitch("Servitører inkludert", details.staffIncluded, (v) => updateDetail("staffIncluded", v))}
          {details.staffIncluded && renderInput("Servitør per X gjester", details.staffPerGuests?.toString() || "", (v) => updateDetail("staffPerGuests", v ? parseInt(v) : null), { placeholder: "20", keyboardType: "number-pad" })}
          {renderSwitch("Bar-service", details.barServiceIncluded, (v) => updateDetail("barServiceIncluded", v))}
          {details.barServiceIncluded && renderSwitch("Bartendere inkludert", details.bartendersIncluded, (v) => updateDetail("bartendersIncluded", v))}
        </View>

        {/* Drikke */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("droplet", "Drikkeservering")}
          
          {renderSwitch("Alkoholservering", details.alcoholServiceAvailable, (v) => updateDetail("alcoholServiceAvailable", v))}
          {details.alcoholServiceAvailable && renderSwitch("Vinservering", details.wineServiceAvailable, (v) => updateDetail("wineServiceAvailable", v))}
          {details.alcoholServiceAvailable && renderSwitch("Signaturcocktails", details.signatureCocktails, (v) => updateDetail("signatureCocktails", v))}
          {renderSwitch("Alkoholfrie alternativer", details.nonAlcoholicOptions, (v) => updateDetail("nonAlcoholicOptions", v))}
          {renderSwitch("Kaffe/te-servering", details.coffeeTeaService, (v) => updateDetail("coffeeTeaService", v))}
        </View>

        {/* Utstyr */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("box", "Utstyr & Servise")}
          
          {renderSwitch("Utstyr inkludert", details.equipmentIncluded, (v) => updateDetail("equipmentIncluded", v))}
          {renderSwitch("Servise (tallerkener etc.)", details.tableware, (v) => updateDetail("tableware", v))}
          {renderSwitch("Glass", details.glassware, (v) => updateDetail("glassware", v))}
          {renderSwitch("Duker/servietter", details.linens, (v) => updateDetail("linens", v))}
          {renderSwitch("Møbelutleie", details.furnitureRental, (v) => updateDetail("furnitureRental", v), "Bord, stoler etc.")}
        </View>

        {/* Leveranse */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("truck", "Levering & Oppsett")}
          
          {renderSwitch("Levering inkludert", details.deliveryIncluded, (v) => updateDetail("deliveryIncluded", v))}
          {renderSwitch("Oppsett inkludert", details.setupIncluded, (v) => updateDetail("setupIncluded", v))}
          {renderSwitch("Opprydding inkludert", details.cleanupIncluded, (v) => updateDetail("cleanupIncluded", v))}
          {renderSwitch("Matlaging på stedet", details.onSiteCooking, (v) => updateDetail("onSiteCooking", v), "Fersk tilberedning")}
        </View>

        {/* Ekstra */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("star", "Ekstra tjenester")}
          
          {renderSwitch("Smaksprøver tilgjengelig", details.tastingAvailable, (v) => updateDetail("tastingAvailable", v))}
          {details.tastingAvailable && (
            <>
              {renderSwitch("Smaksprøve inkl. ved booking", details.tastingIncludedInBooking, (v) => updateDetail("tastingIncludedInBooking", v))}
              {!details.tastingIncludedInBooking && renderInput("Pris smaksprøve", details.tastingFee?.toString() || "", (v) => updateDetail("tastingFee", v ? parseInt(v) : null), { placeholder: "1500", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
          {renderSwitch("Tilpassede menyer", details.customMenusAvailable, (v) => updateDetail("customMenusAvailable", v))}
          {renderSwitch(isWedding ? "Bryllupskake" : "Festkake", details.cakeAvailable, (v) => updateDetail("cakeAvailable", v))}
          {renderSwitch("Late night snacks", details.lateNightSnacks, (v) => updateDetail("lateNightSnacks", v))}
        </View>

        {/* Booking */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", "Booking")}
          
          {renderInput("Book i forveien", details.bookingLeadWeeks?.toString() || "", (v) => updateDetail("bookingLeadWeeks", v ? parseInt(v) : null), { placeholder: "8", keyboardType: "number-pad", suffix: "uker" })}
          {renderInput("Endelig gjestetall", details.finalNumbersDays?.toString() || "", (v) => updateDetail("finalNumbersDays", v ? parseInt(v) : null), { placeholder: "14", keyboardType: "number-pad", suffix: "dager før" })}
        </View>

        {/* Save */}
        <Pressable
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <View style={styles.saveBtnIcon}><EvendiIcon name="save" size={16} color="#FFFFFF" /></View>
              <ThemedText style={styles.saveBtnText}>Lagre cateringdetaljer</ThemedText>
            </>
          )}
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
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
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
  saveBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.2 },
});
