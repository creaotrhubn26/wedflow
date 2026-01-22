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

interface MusicDetails {
  // Type
  isDJ: boolean;
  isLiveBand: boolean;
  isSoloArtist: boolean;
  isEnsemble: boolean;
  
  // Utstyr
  soundSystemIncluded: boolean;
  speakersIncluded: boolean;
  microphoneIncluded: boolean;
  lightingIncluded: boolean;
  fogMachineAvailable: boolean;
  
  // Tjenester
  mcServicesAvailable: boolean;
  weddingGameCoordination: boolean;
  firstDanceCoordination: boolean;
  customPlaylistCreation: boolean;
  requestsAccepted: boolean;
  
  // Live
  ceremonyMusicAvailable: boolean;
  cocktailMusicAvailable: boolean;
  dinnerMusicAvailable: boolean;
  partyMusicAvailable: boolean;
  
  // Detaljer
  musicGenres: string[];
  setupTimeMinutes: number | null;
  breaksDuring: boolean;
  breakDurationMinutes: number | null;
  
  // Tid
  minHours: number | null;
  maxHours: number | null;
  overtimeRate: number | null;
  
  // Reise
  travelIncluded: boolean;
  travelRadius: number | null;
}

const defaultDetails: MusicDetails = {
  isDJ: true, isLiveBand: false, isSoloArtist: false, isEnsemble: false,
  soundSystemIncluded: true, speakersIncluded: true, microphoneIncluded: true,
  lightingIncluded: false, fogMachineAvailable: false,
  mcServicesAvailable: false, weddingGameCoordination: false, firstDanceCoordination: true,
  customPlaylistCreation: true, requestsAccepted: true,
  ceremonyMusicAvailable: false, cocktailMusicAvailable: true, dinnerMusicAvailable: true, partyMusicAvailable: true,
  musicGenres: [], setupTimeMinutes: null, breaksDuring: false, breakDurationMinutes: null,
  minHours: null, maxHours: null, overtimeRate: null,
  travelIncluded: false, travelRadius: null,
};

const MUSIC_GENRES = ["Pop", "Rock", "Jazz", "Klassisk", "Soul/R&B", "EDM/House", "Hip-hop", "Country", "Latin", "70-/80-tallet", "Norsk", "Akustisk"];

export default function MusicDetailsScreen({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [details, setDetails] = useState<MusicDetails>(defaultDetails);

  useEffect(() => {
    AsyncStorage.getItem(VENDOR_STORAGE_KEY).then((data) => {
      if (data) setSessionToken(JSON.parse(data).sessionToken);
    });
  }, []);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ["/api/vendor/music-details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/music-details", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.ok ? response.json() : null;
    },
    enabled: !!sessionToken,
  });

  useEffect(() => { if (savedData) setDetails({ ...defaultDetails, ...savedData }); }, [savedData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/music-details", getApiUrl()).toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/music-details"] });
      Alert.alert("Lagret", "Musikkdetaljene er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  const updateDetail = <K extends keyof MusicDetails>(key: K, value: MusicDetails[K]) => setDetails(prev => ({ ...prev, [key]: value }));
  const toggleGenre = (genre: string) => setDetails(prev => ({ ...prev, musicGenres: prev.musicGenres.includes(genre) ? prev.musicGenres.filter(g => g !== genre) : [...prev.musicGenres, genre] }));

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
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="music" size={20} color="#FFFFFF" /></View>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Musikkdetaljer</ThemedText>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.accent} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}><Feather name="music" size={20} color="#FFFFFF" /></View>
          <View><ThemedText style={[styles.headerTitle, { color: theme.text }]}>Musikkdetaljer</ThemedText><ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Spesifiser dine tjenester</ThemedText></View>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}><Feather name="x" size={20} color={theme.textSecondary} /></Pressable>
      </View>

      <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("mic", "Type artist")}
          {renderSwitch("DJ", details.isDJ, (v) => updateDetail("isDJ", v))}
          {renderSwitch("Live band", details.isLiveBand, (v) => updateDetail("isLiveBand", v))}
          {renderSwitch("Solo artist", details.isSoloArtist, (v) => updateDetail("isSoloArtist", v))}
          {renderSwitch("Ensemble", details.isEnsemble, (v) => updateDetail("isEnsemble", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("speaker", "Utstyr")}
          {renderSwitch("Lydanlegg inkludert", details.soundSystemIncluded, (v) => updateDetail("soundSystemIncluded", v))}
          {renderSwitch("Høyttalere inkludert", details.speakersIncluded, (v) => updateDetail("speakersIncluded", v))}
          {renderSwitch("Mikrofon inkludert", details.microphoneIncluded, (v) => updateDetail("microphoneIncluded", v))}
          {renderSwitch("Lysshow inkludert", details.lightingIncluded, (v) => updateDetail("lightingIncluded", v))}
          {renderSwitch("Røykmaskin tilgjengelig", details.fogMachineAvailable, (v) => updateDetail("fogMachineAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("award", "Tjenester")}
          {renderSwitch("Seremonimester/MC", details.mcServicesAvailable, (v) => updateDetail("mcServicesAvailable", v))}
          {renderSwitch("Bryllupsleker-koordinering", details.weddingGameCoordination, (v) => updateDetail("weddingGameCoordination", v))}
          {renderSwitch("Førstdans-koordinering", details.firstDanceCoordination, (v) => updateDetail("firstDanceCoordination", v))}
          {renderSwitch("Tilpasset spilleliste", details.customPlaylistCreation, (v) => updateDetail("customPlaylistCreation", v))}
          {renderSwitch("Tar imot ønsker", details.requestsAccepted, (v) => updateDetail("requestsAccepted", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("calendar", "Tidspunkter")}
          {renderSwitch("Seremonimusikk", details.ceremonyMusicAvailable, (v) => updateDetail("ceremonyMusicAvailable", v))}
          {renderSwitch("Cocktailmusikk", details.cocktailMusicAvailable, (v) => updateDetail("cocktailMusicAvailable", v))}
          {renderSwitch("Middagsmusikk", details.dinnerMusicAvailable, (v) => updateDetail("dinnerMusicAvailable", v))}
          {renderSwitch("Festmusikk", details.partyMusicAvailable, (v) => updateDetail("partyMusicAvailable", v))}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("disc", "Sjangre")}
          <View style={styles.styleGrid}>
            {MUSIC_GENRES.map((genre) => (
              <Pressable key={genre} onPress={() => toggleGenre(genre)} style={[styles.styleChip, { borderColor: details.musicGenres.includes(genre) ? theme.accent : theme.border }, details.musicGenres.includes(genre) && { backgroundColor: theme.accent + "15" }]}>
                <ThemedText style={[styles.styleChipText, { color: details.musicGenres.includes(genre) ? theme.accent : theme.textSecondary }]}>{genre}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("clock", "Tid & Priser")}
          <View style={styles.rowInputs}>
            {renderInput("Min timer", details.minHours?.toString() || "", (v) => updateDetail("minHours", v ? parseInt(v) : null), { placeholder: "3", keyboardType: "number-pad" })}
            {renderInput("Maks timer", details.maxHours?.toString() || "", (v) => updateDetail("maxHours", v ? parseInt(v) : null), { placeholder: "8", keyboardType: "number-pad" })}
          </View>
          {renderInput("Overtidspris", details.overtimeRate?.toString() || "", (v) => updateDetail("overtimeRate", v ? parseInt(v) : null), { placeholder: "2000", keyboardType: "number-pad", suffix: "kr/t" })}
          {renderInput("Riggetid", details.setupTimeMinutes?.toString() || "", (v) => updateDetail("setupTimeMinutes", v ? parseInt(v) : null), { placeholder: "60", keyboardType: "number-pad", suffix: "min" })}
          {renderSwitch("Pauser underveis", details.breaksDuring, (v) => updateDetail("breaksDuring", v))}
          {details.breaksDuring && renderInput("Pauselengde", details.breakDurationMinutes?.toString() || "", (v) => updateDetail("breakDurationMinutes", v ? parseInt(v) : null), { placeholder: "15", keyboardType: "number-pad", suffix: "min" })}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {renderSectionHeader("map-pin", "Reise")}
          {renderSwitch("Reise inkludert", details.travelIncluded, (v) => updateDetail("travelIncluded", v))}
          {!details.travelIncluded && renderInput("Gratis innenfor", details.travelRadius?.toString() || "", (v) => updateDetail("travelRadius", v ? parseInt(v) : null), { placeholder: "50", keyboardType: "number-pad", suffix: "km" })}
        </View>

        <Pressable onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accent }, pressed && { opacity: 0.9 }]}>
          {saveMutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><View style={styles.saveBtnIcon}><Feather name="save" size={16} color="#FFFFFF" /></View><ThemedText style={styles.saveBtnText}>Lagre musikkdetaljer</ThemedText></>}
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
