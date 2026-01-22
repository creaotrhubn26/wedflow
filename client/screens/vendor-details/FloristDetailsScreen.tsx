import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
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

interface FloristDetails {
  // Tjenester
  offersWeddingBouquet: boolean;
  offersBridesmaidBouquets: boolean;
  offersGroomBoutonniere: boolean;
  offersGroomsmenBoutonnieres: boolean;
  offersCorsages: boolean;
  offersHairFlowers: boolean;
  offersCeremonyArrangements: boolean;
  offersReceptionCenterpieces: boolean;
  offersTableRunners: boolean;
  offersCakeFlowers: boolean;
  offersArches: boolean;
  offersInstallations: boolean;
  
  // Leveranse
  deliveryIncluded: boolean;
  deliveryRadius: number | null;
  deliveryFee: number | null;
  setupIncluded: boolean;
  pickupAfterEvent: boolean;
  
  // Stil
  floralStyles: string[];
  specialtiesDescription: string | null;
  
  // Materialer
  usesLocalFlowers: boolean;
  usesSustainablePractices: boolean;
  offersSeasonalFlowers: boolean;
  offersExoticFlowers: boolean;
  offersDriedFlowers: boolean;
  offersSilkFlowers: boolean;
  
  // Leie & Ekstra
  offersVaseRental: boolean;
  offersPropRental: boolean;
  rentalDescription: string | null;
  offersPreservation: boolean;
  preservationDescription: string | null;
  
  // Konsultasjon
  freeConsultation: boolean;
  consultationFee: number | null;
  moodBoardIncluded: boolean;
  trialBouquetAvailable: boolean;
  trialBouquetFee: number | null;
  
  // Kapasitet
  minOrderValue: number | null;
  maxWeddingsPerWeekend: number | null;
  advanceBookingWeeks: number | null;
}

const defaultDetails: FloristDetails = {
  offersWeddingBouquet: true,
  offersBridesmaidBouquets: true,
  offersGroomBoutonniere: true,
  offersGroomsmenBoutonnieres: true,
  offersCorsages: false,
  offersHairFlowers: false,
  offersCeremonyArrangements: true,
  offersReceptionCenterpieces: true,
  offersTableRunners: false,
  offersCakeFlowers: true,
  offersArches: false,
  offersInstallations: false,
  deliveryIncluded: false,
  deliveryRadius: null,
  deliveryFee: null,
  setupIncluded: false,
  pickupAfterEvent: false,
  floralStyles: [],
  specialtiesDescription: null,
  usesLocalFlowers: true,
  usesSustainablePractices: false,
  offersSeasonalFlowers: true,
  offersExoticFlowers: false,
  offersDriedFlowers: false,
  offersSilkFlowers: false,
  offersVaseRental: false,
  offersPropRental: false,
  rentalDescription: null,
  offersPreservation: false,
  preservationDescription: null,
  freeConsultation: true,
  consultationFee: null,
  moodBoardIncluded: false,
  trialBouquetAvailable: false,
  trialBouquetFee: null,
  minOrderValue: null,
  maxWeddingsPerWeekend: null,
  advanceBookingWeeks: null,
};

const FLORAL_STYLES = [
  "Romantisk",
  "Klassisk",
  "Bohemsk",
  "Moderne/Minimalistisk",
  "Rustikk",
  "Elegant",
  "Tropisk",
  "Vintage",
  "Hage-stil",
  "Naturlig/Vill",
];

export default function FloristDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<FloristDetails>(defaultDetails);

  useEffect(() => {
    AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setSessionToken(parsed.sessionToken);
      }
    });
  }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/florist-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/florist-details", getApiUrl()).toString(), {
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
      const response = await fetch(new URL("/api/vendor/florist-details", getApiUrl()).toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/florist-details"] });
      Alert.alert("Lagret", "Blomsterdetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  const updateDetail = <K extends keyof FloristDetails>(key: K, value: FloristDetails[K]) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const toggleStyle = (style: string) => {
    setDetails(prev => ({
      ...prev,
      floralStyles: prev.floralStyles.includes(style)
        ? prev.floralStyles.filter(s => s !== style)
        : [...prev.floralStyles, style],
    }));
  };

  const renderSectionHeader = (icon: string, title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
        <Feather name={icon as any} size={16} color={theme.accent} />
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
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            options?.multiline ? styles.textArea : styles.input,
            { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
            options?.suffix && { paddingRight: 50 },
          ]}
          value={value || ""}
          onChangeText={onChange}
          placeholder={options?.placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={options?.keyboardType || "default"}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 3 : 1}
          textAlignVertical={options?.multiline ? "top" : "center"}
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
              <Feather name="sun" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Blomsterdetaljer</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Laster...</ThemedText>
            </View>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.closeButton, { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot }]}>
            <Feather name="x" size={20} color={theme.textSecondary} />
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
            <Feather name="sun" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Blomsterdetaljer</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText>
          </View>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.closeButton, { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot }]}>
          <Feather name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
      >
        {/* Bryllupsbuketter */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("heart", "Personlige blomster")}
          
          {renderSwitch("Brudebuketter", details.offersWeddingBouquet, (v) => updateDetail("offersWeddingBouquet", v))}
          {renderSwitch("Brudepikebuketter", details.offersBridesmaidBouquets, (v) => updateDetail("offersBridesmaidBouquets", v))}
          {renderSwitch("Brudgom knappehullsblomst", details.offersGroomBoutonniere, (v) => updateDetail("offersGroomBoutonniere", v))}
          {renderSwitch("Forlovere knappehullsblomster", details.offersGroomsmenBoutonnieres, (v) => updateDetail("offersGroomsmenBoutonnieres", v))}
          {renderSwitch("Corsages", details.offersCorsages, (v) => updateDetail("offersCorsages", v), "Håndleddsblomster")}
          {renderSwitch("Hårblomster", details.offersHairFlowers, (v) => updateDetail("offersHairFlowers", v))}
        </View>

        {/* Dekorasjoner */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("layout", "Dekorasjoner")}
          
          {renderSwitch("Seremonidekorasjoner", details.offersCeremonyArrangements, (v) => updateDetail("offersCeremonyArrangements", v))}
          {renderSwitch("Borddekorasjoner", details.offersReceptionCenterpieces, (v) => updateDetail("offersReceptionCenterpieces", v))}
          {renderSwitch("Table runners", details.offersTableRunners, (v) => updateDetail("offersTableRunners", v), "Blomsterløpere på bord")}
          {renderSwitch("Kakeblomster", details.offersCakeFlowers, (v) => updateDetail("offersCakeFlowers", v))}
          {renderSwitch("Blomsterbuer", details.offersArches, (v) => updateDetail("offersArches", v), "Arches & bakdrop")}
          {renderSwitch("Installasjoner", details.offersInstallations, (v) => updateDetail("offersInstallations", v), "Hengende dekor, vegger etc.")}
        </View>

        {/* Stil */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("star", "Stil")}
          
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>Velg stilene du jobber i</ThemedText>
          <View style={styles.styleGrid}>
            {FLORAL_STYLES.map((style) => (
              <Pressable
                key={style}
                onPress={() => toggleStyle(style)}
                style={[
                  styles.styleChip,
                  { borderColor: details.floralStyles.includes(style) ? theme.accent : theme.border },
                  details.floralStyles.includes(style) && { backgroundColor: theme.accent + "15" },
                ]}
              >
                <ThemedText style={[styles.styleChipText, { color: details.floralStyles.includes(style) ? theme.accent : theme.textSecondary }]}>
                  {style}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          
          {renderInput("Spesialiteter", details.specialtiesDescription || "", (v) => updateDetail("specialtiesDescription", v || null), { placeholder: "Beskriv dine spesialiteter...", multiline: true })}
        </View>

        {/* Materialer */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("feather", "Materialer & Bærekraft")}
          
          {renderSwitch("Lokale blomster", details.usesLocalFlowers, (v) => updateDetail("usesLocalFlowers", v), "Bruker norske produsenter")}
          {renderSwitch("Bærekraftig praksis", details.usesSustainablePractices, (v) => updateDetail("usesSustainablePractices", v))}
          {renderSwitch("Sesongblomster", details.offersSeasonalFlowers, (v) => updateDetail("offersSeasonalFlowers", v))}
          {renderSwitch("Eksotiske blomster", details.offersExoticFlowers, (v) => updateDetail("offersExoticFlowers", v))}
          {renderSwitch("Tørkede blomster", details.offersDriedFlowers, (v) => updateDetail("offersDriedFlowers", v))}
          {renderSwitch("Silkeblomster", details.offersSilkFlowers, (v) => updateDetail("offersSilkFlowers", v))}
        </View>

        {/* Leveranse */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("truck", "Leveranse & Oppsett")}
          
          {renderSwitch("Levering inkludert", details.deliveryIncluded, (v) => updateDetail("deliveryIncluded", v))}
          {!details.deliveryIncluded && (
            <>
              {renderInput("Gratis innenfor", details.deliveryRadius?.toString() || "", (v) => updateDetail("deliveryRadius", v ? parseInt(v) : null), { placeholder: "30", keyboardType: "number-pad", suffix: "km" })}
              {renderInput("Leveringsgebyr", details.deliveryFee?.toString() || "", (v) => updateDetail("deliveryFee", v ? parseInt(v) : null), { placeholder: "500", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
          {renderSwitch("Oppsett inkludert", details.setupIncluded, (v) => updateDetail("setupIncluded", v), "Vi setter opp dekorasjonene")}
          {renderSwitch("Henting etter arrangement", details.pickupAfterEvent, (v) => updateDetail("pickupAfterEvent", v), "Vi henter vaser/rekvisita")}
        </View>

        {/* Utleie */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("box", "Utleie & Ekstra")}
          
          {renderSwitch("Vaseutleie", details.offersVaseRental, (v) => updateDetail("offersVaseRental", v))}
          {renderSwitch("Rekvisittautleie", details.offersPropRental, (v) => updateDetail("offersPropRental", v), "Lykter, stativer etc.")}
          {(details.offersVaseRental || details.offersPropRental) && renderInput("Beskrivelse utleie", details.rentalDescription || "", (v) => updateDetail("rentalDescription", v || null), { placeholder: "Hva tilbyr dere...", multiline: true })}
          
          {renderSwitch("Bukettpreservering", details.offersPreservation, (v) => updateDetail("offersPreservation", v), "Tørking/pressing av brudebukett")}
          {details.offersPreservation && renderInput("Preserveringsbeskrivelse", details.preservationDescription || "", (v) => updateDetail("preservationDescription", v || null), { placeholder: "Beskriv tjenesten..." })}
        </View>

        {/* Konsultasjon */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("message-circle", "Konsultasjon")}
          
          {renderSwitch("Gratis konsultasjon", details.freeConsultation, (v) => updateDetail("freeConsultation", v))}
          {!details.freeConsultation && renderInput("Konsultasjonsgebyr", details.consultationFee?.toString() || "", (v) => updateDetail("consultationFee", v ? parseInt(v) : null), { placeholder: "500", keyboardType: "number-pad", suffix: "kr" })}
          {renderSwitch("Mood board inkludert", details.moodBoardIncluded, (v) => updateDetail("moodBoardIncluded", v), "Visuell presentasjon")}
          {renderSwitch("Prøvebukett tilgjengelig", details.trialBouquetAvailable, (v) => updateDetail("trialBouquetAvailable", v))}
          {details.trialBouquetAvailable && renderInput("Pris prøvebukett", details.trialBouquetFee?.toString() || "", (v) => updateDetail("trialBouquetFee", v ? parseInt(v) : null), { placeholder: "800", keyboardType: "number-pad", suffix: "kr" })}
        </View>

        {/* Kapasitet */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", "Kapasitet & Booking")}
          
          {renderInput("Minimum ordresum", details.minOrderValue?.toString() || "", (v) => updateDetail("minOrderValue", v ? parseInt(v) : null), { placeholder: "5000", keyboardType: "number-pad", suffix: "kr" })}
          {renderInput("Maks bryllup per helg", details.maxWeddingsPerWeekend?.toString() || "", (v) => updateDetail("maxWeddingsPerWeekend", v ? parseInt(v) : null), { placeholder: "2", keyboardType: "number-pad" })}
          {renderInput("Book i forveien", details.advanceBookingWeeks?.toString() || "", (v) => updateDetail("advanceBookingWeeks", v ? parseInt(v) : null), { placeholder: "8", keyboardType: "number-pad", suffix: "uker" })}
        </View>

        {/* Save Button */}
        <Pressable
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: theme.accent },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.saveBtnIcon}>
                <Feather name="save" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.saveBtnText}>Lagre blomsterdetaljer</ThemedText>
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
  saveBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.2 },
});
