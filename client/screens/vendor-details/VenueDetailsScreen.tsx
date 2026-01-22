import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
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

interface TableSetup {
  id: string;
  type: "round" | "rectangular" | "oval" | "square";
  seatsPerTable: number;
  quantity: number;
  description?: string;
}

interface VenueDetails {
  // Kapasitet
  capacityMin: number | null;
  capacityMax: number | null;
  ceremonyCapacity: number | null;
  dinnerCapacity: number | null;
  partyCapacity: number | null;
  
  // Bordoppsett
  tableSetups: TableSetup[];
  customTableSetupAllowed: boolean;
  
  // Overnatting
  hasAccommodation: boolean;
  accommodationCapacity: number | null;
  accommodationRooms: number | null;
  accommodationOnSite: boolean;
  accommodationPartnerName: string | null;
  accommodationPartnerDistance: string | null;
  
  // Parkering
  hasParking: boolean;
  parkingSpaces: number | null;
  parkingFree: boolean;
  parkingPrice: number | null;
  
  // Mat & drikke
  hasCatering: boolean;
  cateringType: "in-house" | "external-allowed" | "external-required";
  hasAlcoholLicense: boolean;
  corkageFee: number | null;
  
  // Fasiliteter
  hasOutdoorArea: boolean;
  outdoorCeremonyPossible: boolean;
  hasAccessibility: boolean;
  accessibilityDetails: string | null;
  hasAudioSystem: boolean;
  hasDanceFloor: boolean;
  hasKitchen: boolean;
  hasBridalSuite: boolean;
  
  // Regler
  noiseCurfew: string | null;
  minRentalHours: number | null;
  setupTimeIncluded: boolean;
  cleanupRequired: boolean;
  decorRestrictions: string | null;
  vendorRestrictions: string | null;
}

const defaultVenueDetails: VenueDetails = {
  capacityMin: null,
  capacityMax: null,
  ceremonyCapacity: null,
  dinnerCapacity: null,
  partyCapacity: null,
  tableSetups: [],
  customTableSetupAllowed: true,
  hasAccommodation: false,
  accommodationCapacity: null,
  accommodationRooms: null,
  accommodationOnSite: false,
  accommodationPartnerName: null,
  accommodationPartnerDistance: null,
  hasParking: false,
  parkingSpaces: null,
  parkingFree: true,
  parkingPrice: null,
  hasCatering: false,
  cateringType: "external-allowed",
  hasAlcoholLicense: false,
  corkageFee: null,
  hasOutdoorArea: false,
  outdoorCeremonyPossible: false,
  hasAccessibility: false,
  accessibilityDetails: null,
  hasAudioSystem: false,
  hasDanceFloor: false,
  hasKitchen: false,
  hasBridalSuite: false,
  noiseCurfew: null,
  minRentalHours: null,
  setupTimeIncluded: false,
  cleanupRequired: false,
  decorRestrictions: null,
  vendorRestrictions: null,
};

const TABLE_TYPES = [
  { value: "round", label: "Rundt", icon: "circle" },
  { value: "rectangular", label: "Langbord", icon: "minus" },
  { value: "oval", label: "Ovalt", icon: "maximize-2" },
  { value: "square", label: "Kvadratisk", icon: "square" },
] as const;

export default function VenueDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<VenueDetails>(defaultVenueDetails);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState<Partial<TableSetup>>({ type: "round", seatsPerTable: 8, quantity: 1 });

  useEffect(() => {
    AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setSessionToken(parsed.sessionToken);
      }
    });
  }, []);

  const { data: venueData, isLoading } = useQuery({
    queryKey: ["/api/vendor/venue-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/venue-details", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!sessionToken,
  });

  useEffect(() => {
    if (venueData) {
      setDetails({ ...defaultVenueDetails, ...venueData });
    }
  }, [venueData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/venue-details", getApiUrl()).toString(), {
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/venue-details"] });
      Alert.alert("Lagret", "Lokaldetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  const updateDetail = <K extends keyof VenueDetails>(key: K, value: VenueDetails[K]) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const addTableSetup = () => {
    if (!newTable.seatsPerTable || !newTable.quantity) {
      Alert.alert("Ugyldig", "Fyll inn antall seter og antall bord");
      return;
    }
    const table: TableSetup = {
      id: Date.now().toString(),
      type: newTable.type || "round",
      seatsPerTable: newTable.seatsPerTable,
      quantity: newTable.quantity,
      description: newTable.description,
    };
    setDetails(prev => ({
      ...prev,
      tableSetups: [...prev.tableSetups, table],
    }));
    setNewTable({ type: "round", seatsPerTable: 8, quantity: 1 });
    setShowAddTable(false);
  };

  const removeTableSetup = (id: string) => {
    setDetails(prev => ({
      ...prev,
      tableSetups: prev.tableSetups.filter(t => t.id !== id),
    }));
  };

  const getTotalSeats = () => {
    return details.tableSetups.reduce((sum, t) => sum + (t.seatsPerTable * t.quantity), 0);
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
          {description && (
            <ThemedText style={[styles.switchDescription, { color: theme.textSecondary }]}>{description}</ThemedText>
          )}
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
    keyboardType?: "default" | "number-pad" | "decimal-pad";
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
        {options?.suffix && (
          <ThemedText style={[styles.inputSuffix, { color: theme.textSecondary }]}>{options.suffix}</ThemedText>
        )}
      </View>
    </View>
  );

  const renderAvailabilityBadge = (available: boolean, availableText: string, unavailableText: string) => (
    <View style={[
      styles.availabilityBadge,
      { backgroundColor: available ? "#4CAF5015" : "#EF535015" }
    ]}>
      <Feather
        name={available ? "check-circle" : "x-circle"}
        size={14}
        color={available ? "#4CAF50" : "#EF5350"}
      />
      <ThemedText style={[
        styles.availabilityText,
        { color: available ? "#4CAF50" : "#EF5350" }
      ]}>
        {available ? availableText : unavailableText}
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
              <Feather name="home" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Lokaldetaljer</ThemedText>
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
            <Feather name="home" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Lokaldetaljer</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser ditt lokale</ThemedText>
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
        {/* Quick Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={[styles.summaryTitle, { color: theme.text }]}>Oppsummering</ThemedText>
          <View style={styles.summaryGrid}>
            {renderAvailabilityBadge(details.hasAccommodation, "Overnatting", "Kun lokale")}
            {renderAvailabilityBadge(details.hasParking, "Parkering", "Ingen parkering")}
            {renderAvailabilityBadge(details.hasCatering, "Catering", "Egen catering")}
            {renderAvailabilityBadge(details.hasOutdoorArea, "Utendørs", "Kun innendørs")}
          </View>
        </View>

        {/* Kapasitet */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("users", "Kapasitet")}
          
          <View style={styles.rowInputs}>
            {renderInput("Minimum gjester", details.capacityMin?.toString() || "", (v) => updateDetail("capacityMin", v ? parseInt(v) : null), { placeholder: "F.eks. 30", keyboardType: "number-pad" })}
            {renderInput("Maksimum gjester", details.capacityMax?.toString() || "", (v) => updateDetail("capacityMax", v ? parseInt(v) : null), { placeholder: "F.eks. 150", keyboardType: "number-pad" })}
          </View>

          <ThemedText style={[styles.subSectionTitle, { color: theme.textSecondary }]}>Kapasitet per arrangement</ThemedText>
          <View style={styles.rowInputs}>
            {renderInput("Seremoni", details.ceremonyCapacity?.toString() || "", (v) => updateDetail("ceremonyCapacity", v ? parseInt(v) : null), { placeholder: "Sitteplasser", keyboardType: "number-pad" })}
            {renderInput("Middag", details.dinnerCapacity?.toString() || "", (v) => updateDetail("dinnerCapacity", v ? parseInt(v) : null), { placeholder: "Ved bord", keyboardType: "number-pad" })}
          </View>
          {renderInput("Fest/dans", details.partyCapacity?.toString() || "", (v) => updateDetail("partyCapacity", v ? parseInt(v) : null), { placeholder: "Stående", keyboardType: "number-pad" })}
        </View>

        {/* Bordoppsett */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("grid", "Bordoppsett")}
          
          {details.tableSetups.length > 0 && (
            <View style={styles.tableList}>
              {details.tableSetups.map((table) => (
                <View key={table.id} style={[styles.tableItem, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
                  <View style={styles.tableItemContent}>
                    <View style={[styles.tableTypeIcon, { backgroundColor: theme.accent + "15" }]}>
                      <Feather name={TABLE_TYPES.find(t => t.value === table.type)?.icon as any || "circle"} size={16} color={theme.accent} />
                    </View>
                    <View style={styles.tableItemText}>
                      <ThemedText style={[styles.tableItemTitle, { color: theme.text }]}>
                        {TABLE_TYPES.find(t => t.value === table.type)?.label} bord
                      </ThemedText>
                      <ThemedText style={[styles.tableItemSubtitle, { color: theme.textSecondary }]}>
                        {table.quantity} stk × {table.seatsPerTable} seter = {table.quantity * table.seatsPerTable} plasser
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable onPress={() => removeTableSetup(table.id)} style={styles.tableRemoveBtn}>
                    <Feather name="trash-2" size={16} color="#EF5350" />
                  </Pressable>
                </View>
              ))}
              <View style={[styles.tableTotalRow, { borderTopColor: theme.border }]}>
                <ThemedText style={[styles.tableTotalLabel, { color: theme.textSecondary }]}>Totalt sitteplasser:</ThemedText>
                <ThemedText style={[styles.tableTotalValue, { color: theme.accent }]}>{getTotalSeats()}</ThemedText>
              </View>
            </View>
          )}

          {showAddTable ? (
            <View style={[styles.addTableForm, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
              <ThemedText style={[styles.addTableTitle, { color: theme.text }]}>Legg til bordtype</ThemedText>
              
              <View style={styles.tableTypeSelector}>
                {TABLE_TYPES.map((type) => (
                  <Pressable
                    key={type.value}
                    onPress={() => setNewTable(prev => ({ ...prev, type: type.value }))}
                    style={[
                      styles.tableTypeOption,
                      { borderColor: newTable.type === type.value ? theme.accent : theme.border },
                      newTable.type === type.value && { backgroundColor: theme.accent + "15" },
                    ]}
                  >
                    <Feather name={type.icon as any} size={18} color={newTable.type === type.value ? theme.accent : theme.textSecondary} />
                    <ThemedText style={[styles.tableTypeLabel, { color: newTable.type === type.value ? theme.accent : theme.textSecondary }]}>
                      {type.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.rowInputs}>
                {renderInput("Seter per bord", newTable.seatsPerTable?.toString() || "", (v) => setNewTable(prev => ({ ...prev, seatsPerTable: v ? parseInt(v) : undefined })), { placeholder: "8", keyboardType: "number-pad" })}
                {renderInput("Antall bord", newTable.quantity?.toString() || "", (v) => setNewTable(prev => ({ ...prev, quantity: v ? parseInt(v) : undefined })), { placeholder: "10", keyboardType: "number-pad" })}
              </View>

              <View style={styles.addTableActions}>
                <Pressable onPress={() => setShowAddTable(false)} style={[styles.cancelBtn, { borderColor: theme.border }]}>
                  <ThemedText style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Avbryt</ThemedText>
                </Pressable>
                <Pressable onPress={addTableSetup} style={[styles.addBtn, { backgroundColor: theme.accent }]}>
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.addBtnText}>Legg til</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setShowAddTable(true)} style={[styles.addTableBtn, { borderColor: theme.accent }]}>
              <Feather name="plus" size={18} color={theme.accent} />
              <ThemedText style={[styles.addTableBtnText, { color: theme.accent }]}>Legg til bordtype</ThemedText>
            </Pressable>
          )}

          {renderSwitch("Tillat egendefinert oppsett", details.customTableSetupAllowed, (v) => updateDetail("customTableSetupAllowed", v), "Brudeparet kan ønske annet oppsett")}
        </View>

        {/* Overnatting */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("moon", "Overnatting")}
          
          {renderSwitch("Tilbyr overnatting", details.hasAccommodation, (v) => updateDetail("hasAccommodation", v), "Gjester kan overnatte")}

          {details.hasAccommodation && (
            <>
              {renderSwitch("På stedet", details.accommodationOnSite, (v) => updateDetail("accommodationOnSite", v), "Overnatting er på samme lokasjon")}
              
              {details.accommodationOnSite ? (
                <>
                  <View style={styles.rowInputs}>
                    {renderInput("Antall rom", details.accommodationRooms?.toString() || "", (v) => updateDetail("accommodationRooms", v ? parseInt(v) : null), { placeholder: "F.eks. 20", keyboardType: "number-pad" })}
                    {renderInput("Totale sengeplasser", details.accommodationCapacity?.toString() || "", (v) => updateDetail("accommodationCapacity", v ? parseInt(v) : null), { placeholder: "F.eks. 50", keyboardType: "number-pad" })}
                  </View>
                </>
              ) : (
                <>
                  {renderInput("Partnerlokale navn", details.accommodationPartnerName || "", (v) => updateDetail("accommodationPartnerName", v || null), { placeholder: "F.eks. Hotell Nærby" })}
                  {renderInput("Avstand", details.accommodationPartnerDistance || "", (v) => updateDetail("accommodationPartnerDistance", v || null), { placeholder: "F.eks. 2 km / 5 min kjøring" })}
                </>
              )}
            </>
          )}

          {!details.hasAccommodation && (
            <View style={[styles.infoBox, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
              <Feather name="info" size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                Dette er kun et lokale uten overnatting. Gjester må finne egen overnatting.
              </ThemedText>
            </View>
          )}
        </View>

        {/* Parkering */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("truck", "Parkering")}
          
          {renderSwitch("Har parkering", details.hasParking, (v) => updateDetail("hasParking", v))}

          {details.hasParking && (
            <>
              {renderInput("Antall plasser", details.parkingSpaces?.toString() || "", (v) => updateDetail("parkingSpaces", v ? parseInt(v) : null), { placeholder: "F.eks. 50", keyboardType: "number-pad" })}
              {renderSwitch("Gratis parkering", details.parkingFree, (v) => updateDetail("parkingFree", v))}
              {!details.parkingFree && renderInput("Parkeringspris", details.parkingPrice?.toString() || "", (v) => updateDetail("parkingPrice", v ? parseInt(v) : null), { placeholder: "Per dag", keyboardType: "number-pad", suffix: "kr" })}
            </>
          )}
        </View>

        {/* Mat & Drikke */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("coffee", "Mat & Drikke")}
          
          {renderSwitch("Tilbyr catering", details.hasCatering, (v) => updateDetail("hasCatering", v), "Lokalet har egen mat-tjeneste")}

          {details.hasCatering && (
            <View style={styles.cateringTypeSelector}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Type catering</ThemedText>
              {[
                { value: "in-house", label: "Kun vårt kjøkken", desc: "Gjester må bruke vår catering" },
                { value: "external-allowed", label: "Fleksibelt", desc: "Både eget kjøkken og ekstern tillatt" },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updateDetail("cateringType", option.value as any)}
                  style={[
                    styles.cateringOption,
                    { borderColor: details.cateringType === option.value ? theme.accent : theme.border },
                    details.cateringType === option.value && { backgroundColor: theme.accent + "10" },
                  ]}
                >
                  <View style={styles.cateringOptionRadio}>
                    {details.cateringType === option.value && <View style={[styles.radioInner, { backgroundColor: theme.accent }]} />}
                  </View>
                  <View style={styles.cateringOptionText}>
                    <ThemedText style={[styles.cateringOptionLabel, { color: theme.text }]}>{option.label}</ThemedText>
                    <ThemedText style={[styles.cateringOptionDesc, { color: theme.textSecondary }]}>{option.desc}</ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {renderSwitch("Skjenkebevilling", details.hasAlcoholLicense, (v) => updateDetail("hasAlcoholLicense", v), "Tillatelse til å servere alkohol")}
          {details.hasAlcoholLicense && !details.hasCatering && renderInput("Korkasjeavgift", details.corkageFee?.toString() || "", (v) => updateDetail("corkageFee", v ? parseInt(v) : null), { placeholder: "Avgift per flaske", keyboardType: "number-pad", suffix: "kr" })}
        </View>

        {/* Fasiliteter */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("check-square", "Fasiliteter")}
          
          {renderSwitch("Utendørs område", details.hasOutdoorArea, (v) => updateDetail("hasOutdoorArea", v))}
          {details.hasOutdoorArea && renderSwitch("Utendørs seremoni mulig", details.outdoorCeremonyPossible, (v) => updateDetail("outdoorCeremonyPossible", v))}
          {renderSwitch("Universell utforming", details.hasAccessibility, (v) => updateDetail("hasAccessibility", v), "Rullestoltilgang etc.")}
          {details.hasAccessibility && renderInput("Tilgjengelighetsdetaljer", details.accessibilityDetails || "", (v) => updateDetail("accessibilityDetails", v || null), { placeholder: "Beskriv tilgjengelighet...", multiline: true })}
          {renderSwitch("Lydanlegg inkludert", details.hasAudioSystem, (v) => updateDetail("hasAudioSystem", v))}
          {renderSwitch("Dansegulv", details.hasDanceFloor, (v) => updateDetail("hasDanceFloor", v))}
          {renderSwitch("Kjøkken tilgjengelig", details.hasKitchen, (v) => updateDetail("hasKitchen", v), "For catering-bruk")}
          {renderSwitch("Brudesuite", details.hasBridalSuite, (v) => updateDetail("hasBridalSuite", v), "Rom for klargjøring")}
        </View>

        {/* Regler */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("alert-circle", "Regler & Begrensninger")}
          
          {renderInput("Støygrense (klokkeslett)", details.noiseCurfew || "", (v) => updateDetail("noiseCurfew", v || null), { placeholder: "F.eks. 23:00" })}
          {renderInput("Minimum leietimer", details.minRentalHours?.toString() || "", (v) => updateDetail("minRentalHours", v ? parseInt(v) : null), { placeholder: "F.eks. 8", keyboardType: "number-pad", suffix: "timer" })}
          {renderSwitch("Oppsett-tid inkludert", details.setupTimeIncluded, (v) => updateDetail("setupTimeIncluded", v), "Tid før arrangementet")}
          {renderSwitch("Rydding påkrevd", details.cleanupRequired, (v) => updateDetail("cleanupRequired", v), "Gjester må rydde selv")}
          {renderInput("Dekorasjonsbegrensninger", details.decorRestrictions || "", (v) => updateDetail("decorRestrictions", v || null), { placeholder: "F.eks. Ingen konfetti, tape på vegg...", multiline: true })}
          {renderInput("Leverandørbegrensninger", details.vendorRestrictions || "", (v) => updateDetail("vendorRestrictions", v || null), { placeholder: "F.eks. Kun godkjente fotografer...", multiline: true })}
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
              <ThemedText style={styles.saveBtnText}>Lagre lokaldetaljer</ThemedText>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 15,
  },
  inputSuffix: {
    position: "absolute",
    right: Spacing.md,
    top: 14,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  switchContainer: {
    marginBottom: Spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  switchDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  tableList: {
    marginBottom: Spacing.md,
  },
  tableItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  tableItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  tableTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tableItemText: {
    flex: 1,
  },
  tableItemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  tableItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tableRemoveBtn: {
    padding: Spacing.sm,
  },
  tableTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.sm,
  },
  tableTotalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  tableTotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  addTableBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addTableBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addTableForm: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  addTableTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  tableTypeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tableTypeOption: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tableTypeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  addTableActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  cateringTypeSelector: {
    marginBottom: Spacing.md,
  },
  cateringOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  cateringOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C9A962",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cateringOptionText: {
    flex: 1,
  },
  cateringOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  cateringOptionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    shadowColor: "#C9A962",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
