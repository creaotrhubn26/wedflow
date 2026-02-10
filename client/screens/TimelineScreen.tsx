import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInLeft } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoupleSession, getTimelineCulture, saveTimelineCulture, getSpeeches } from "@/lib/storage";
import { getScheduleEvents, updateScheduleEvent } from "@/lib/api-schedule-events";
import { getCoupleProfile } from "@/lib/api-couples";
import { ScheduleEvent, Speech } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {

  getEventWeather,
  getWeatherLocationData,
  weatherSymbolToEmoji,
  type EventWithWeather,
  type TravelFromCity,
} from "@/lib/api-weather-location-bridge";
import { useVendorLocationIntelligence } from "@/hooks/useVendorLocationIntelligence";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

type ScheduleInterval = {
  id: string;
  from: string;
  to: string;
  eventIdFrom: string;
  eventIdTo: string;
  current: number;
  needed: number;
  index: number;
};

const ICON_MAP: Record<string, keyof typeof EvendiIconGlyphMap> = {
  heart: "heart",
  camera: "camera",
  music: "music",
  users: "users",
  coffee: "coffee",
  sun: "sun",
  moon: "moon",
  star: "star",
};

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [weddingDate, setWeddingDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [culture, setCulture] = useState<string | null>(null);
  const [speeches, setSpeeches] = useState<Speech[]>([]);

  // Subscribe to speeches for real-time updates
  const speechesQuery = useQuery<Speech[]>({
    queryKey: ['speeches'],
    queryFn: async () => {
      const data = await getSpeeches();
      return Array.isArray(data) ? data : [];
    },
  });

  useEffect(() => {
    if (speechesQuery.data) {
      setSpeeches(speechesQuery.data);
    }
  }, [speechesQuery.data]);

  const [expandedBuffer, setExpandedBuffer] = useState<string | null>(null);
  const [totalBufferTime, setTotalBufferTime] = useState(0);
  const [problematicIntervals, setProblematicIntervals] = useState<ScheduleInterval[]>([]);
  const [showOptimizationTips, setShowOptimizationTips] = useState(false);
  const [editingInterval, setEditingInterval] = useState<ScheduleInterval | null>(null);
  const [newTime, setNewTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState<string>("star");
  const [newEventTime, setNewEventTime] = useState("");

  // Weather/Location bridge state
  const [eventWeatherMap, setEventWeatherMap] = useState<Map<string, EventWithWeather>>(new Map());
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [venueWeatherSummary, setVenueWeatherSummary] = useState<{ avgTemp: number; maxPrecip: number; maxWind: number } | null>(null);
  const [travelCities, setTravelCities] = useState<TravelFromCity[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [venueName, setVenueName] = useState("");

  // Vendor location intelligence
  const locationIntel = useVendorLocationIntelligence();
  const [bookedVendors, setBookedVendors] = useState<Array<{
    id: string;
    businessName: string;
    location: string | null;
    category: string;
  }>>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getCoupleSession();
      const storedCulture = await getTimelineCulture();
      if (storedCulture) setCulture(storedCulture);

      let fetchedSchedule: ScheduleEvent[] = [];
      let fetchedWeddingDate = "";
      if (session?.token) {
        const [serverSchedule, coupleProfile] = await Promise.all([
          getScheduleEvents(session.token),
          getCoupleProfile(session.token),
        ]);
        fetchedSchedule = serverSchedule.map(event => ({
          ...event,
          icon: (event.icon || 'star') as 'heart' | 'camera' | 'music' | 'users' | 'coffee' | 'sun' | 'moon' | 'star',
        }));
        fetchedWeddingDate = coupleProfile.weddingDate || "";
      }
      const sortedSchedule = fetchedSchedule.sort((a, b) => a.time.localeCompare(b.time));
      setSchedule(sortedSchedule);
      
      let totalBuffer = 0;
      const problems: ScheduleInterval[] = [];
      for (let i = 0; i < sortedSchedule.length - 1; i++) {
        const diff = getTimeDiff(sortedSchedule[i].time, sortedSchedule[i + 1].time);
        totalBuffer += diff;
        if (diff < 30) {
          problems.push({
            id: `${sortedSchedule[i].id}-${sortedSchedule[i + 1].id}`,
            from: sortedSchedule[i].title,
            to: sortedSchedule[i + 1].title,
            eventIdFrom: sortedSchedule[i].id,
            eventIdTo: sortedSchedule[i + 1].id,
            current: diff,
            needed: getRecommendedBuffer(diff),
            index: i,
          });
        }
      }
      setTotalBufferTime(totalBuffer);
      setProblematicIntervals(problems);
      
      setWeddingDate(fetchedWeddingDate);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Kunne ikke laste timelinedata";
      setError(errorMsg);
      setSchedule([]);
      setProblematicIntervals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Load weather data for timeline events
  const loadWeatherData = useCallback(async () => {
    try {
      setWeatherLoading(true);
      const session = await getCoupleSession();
      if (!session?.coupleId) return;

      // Get event-specific weather
      const weddingDateStr = weddingDate ? new Date(weddingDate).toISOString().split('T')[0] : undefined;
      const eventWeather = await getEventWeather(session.coupleId, weddingDateStr);
      
      const weatherMap = new Map<string, EventWithWeather>();
      for (const evt of eventWeather.events || []) {
        weatherMap.set(evt.id, evt);
      }
      setEventWeatherMap(weatherMap);
      if (eventWeather.dailySummary) {
        setVenueWeatherSummary({
          avgTemp: eventWeather.dailySummary.avgTemperature,
          maxPrecip: eventWeather.dailySummary.maxPrecipitation,
          maxWind: eventWeather.dailySummary.maxWind,
        });
      }

      // Get travel cities
      try {
        const bridgeData = await getWeatherLocationData(session.coupleId);
        setTravelCities(bridgeData.travelFromCities?.slice(0, 5) || []);
        if (bridgeData.venue?.name) setVenueName(bridgeData.venue.name);
      } catch {}

      // Load booked vendors for travel display
      try {
        const sessionRaw = await AsyncStorage.getItem('wedflow_couple_session');
        if (sessionRaw) {
          const { sessionToken } = JSON.parse(sessionRaw);
          const vendorsRes = await fetch(
            `${getApiUrl()}/api/couples/booked-vendors`,
            { headers: { Authorization: `Bearer ${sessionToken}` } }
          );
          if (vendorsRes.ok) {
            const vendorData = await vendorsRes.json();
            const vendorList = (vendorData || []).map((v: any) => ({
              id: v.id || v.vendorId,
              businessName: v.businessName || v.vendorName || '',
              location: v.location || null,
              category: v.category || v.categoryId || '',
            }));
            setBookedVendors(vendorList);

            // Calculate travel for vendors with locations
            if (locationIntel.venueCoordinates && vendorList.length > 0) {
              locationIntel.calculateBatchTravel(vendorList.filter((v: any) => v.location));
            }
          }
        }
      } catch {
        // Vendor travel data is optional — don't break timeline
      }
    } catch (err) {
      console.log('Timeline weather data not available:', err);
    } finally {
      setWeatherLoading(false);
    }
  }, [weddingDate]);

  useEffect(() => {
    if (schedule.length > 0) {
      loadWeatherData();
    }
  }, [schedule.length, loadWeatherData]);

  const getTimeDiff = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newEventTime.trim()) {
      Alert.alert("Feil", "Fyll ut tittel og tid");
      return;
    }
    const session = await getCoupleSession();
    if (!session?.token) {
      Alert.alert("Innlogging kreves", "Logg inn for å legge til hendelser.");
      return;
    }
    try {
      const tempId = `temp_${Date.now()}`;
      const optimistic = [...schedule, { id: tempId, time: newEventTime, title: newTitle.trim(), icon: (newIcon as any) }].sort((a, b) => a.time.localeCompare(b.time));
      setSchedule(optimistic);
      setShowAddModal(false);

      await import("@/lib/api-schedule-events").then(({ createScheduleEvent }) => createScheduleEvent(session.token!, { time: newEventTime, title: newTitle.trim(), icon: newIcon }));
      await loadData();
      setNewTitle("");
      setNewEventTime("");
      setNewIcon("star");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert("Feil", "Kunne ikke opprette hendelse");
      await loadData();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert(
      "Slett hendelse",
      "Er du sikker på at du vil slette denne hendelsen? Dette kan ikke angres.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: async () => {
            const session = await getCoupleSession();
            if (!session?.token) {
              Alert.alert("Innlogging kreves", "Logg inn for å slette hendelser.");
              return;
            }
            try {
              const prev = [...schedule];
              setSchedule(prev.filter((e) => e.id !== id));
              await import("@/lib/api-schedule-events").then(({ deleteScheduleEvent }) => deleteScheduleEvent(session.token!, id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              Alert.alert("Feil", "Kunne ikke slette hendelse");
              await loadData();
            }
          },
        },
      ]
    );
  };

  const getRecommendedBuffer = (diff: number): number => {
    if (diff < 15) return 15 - diff; // Minstekrav
    if (diff < 30) return 30 - diff; // Ideell
    return 0; // Allerede bra
  };

  const getProblematicIntervals = () => {
    const problems = [];
    for (let i = 0; i < schedule.length - 1; i++) {
      const diff = getTimeDiff(schedule[i].time, schedule[i + 1].time);
      if (diff < 30) {
        problems.push({
          from: schedule[i].title,
          to: schedule[i + 1].title,
          current: diff,
          needed: getRecommendedBuffer(diff),
          index: i,
          eventIdFrom: schedule[i].id,
          eventIdTo: schedule[i + 1].id,
        });
      }
    }
    return problems;
  };

  const getTraditionInsight = (eventTitle: string): string => {
    const insights: Record<string, Record<string, string>> = {
      norwegian: {
        "Kransekake": "Norsk tradisjon: Kransekaken krever tid for oppstabling. Gi minst 15-20 min.",
        "Brudevalsen": "Brudevalsen er hjertepunktet. Planlegg 10-15 min for forberedelse og gjestenes deltagelse.",
        "Felemusikk": "Hardingfelen setter stemningen. Planlegg 5-10 min før og etter inngang.",
      },
      hindu: {
        "Saptapadi": "De syv skritt er hellige. Planlegg 15-20 min for denne sentrale seremonien.",
        "Sindoor": "Sindoor-seremonien er kort men betydningsfull. 5 min er nok.",
        "Sangeet": "Sangeet-festen med dans og musikk. Gi 60-90 min.",
        "Mehndi": "Mehndi-kveld for bruden. Planlegg 2-3 timer.",
      },
      sikh: {
        "Laavan": "De fire runder er kjernen. Planlegg 20-30 min med hymner og ritualer.",
        "Milni": "Familiene møtes formelt. 10-15 min for presentasjoner og girlander.",
        "Anand Karaj": "Vigselen i gurdwaraen. Planlegg 45-60 min.",
      },
      jewish: {
        "Chuppah": "Vielsen under baldakinen er sentral. Gi 15-20 min.",
        "Knuse glasset": "Det ikoniske øyeblikket! Planlegg 5 min.",
      },
      muslim: {
        "Nikah": "Nikah-seremonien med imam. Planlegg 15-25 min.",
        "Walima": "Bryllupsmiddagen markerer ekteskapet. Gi tilstrekkelig tid.",
      },
      pakistansk: {
        "Mehndi": "Mehndi-kvelden med henna og dans. Planlegg 2-3 timer.",
        "Baraat": "Brudgommens prosesjon. Gi 30-45 min for ankomst.",
        "Nikah": "Nikah-seremonien. Planlegg 20-30 min.",
        "Walima": "Walima-middagen. Planlegg full kveld.",
      },
      tyrkisk: {
        "Kına": "Kına gecesi er følelsesladet. Planlegg 2-3 timer kvelden før.",
        "Gelin Alma": "Å hente bruden. Gi 30-45 min med dans og musikk.",
        "Takı": "Takı-seremonien med gullgaver. Planlegg 30-45 min.",
      },
      arabisk: {
        "Zaffa": "Zaffa-prosesjonen med trommer og dans. Gi 15-20 min.",
        "Kosha": "Brudeparet sitter på kosha. Planlegg 30 min for bilder og mottakelse.",
      },
      somalisk: {
        "Nikah": "Nikah med imam og familier. Planlegg 20-30 min.",
        "Aroos": "Bryllupsfesten. Planlegg full kveld med mat og dans.",
      },
      etiopisk: {
        "Telosh": "Telosh-seremoni med eldste. Planlegg 30-45 min.",
        "Kaffe": "Kaffeseremonien er hellig. Gi 20-30 min.",
        "Melse": "Melse-festen etter bryllupet. Planlegg en hel ettermiddag.",
      },
      nigeriansk: {
        "Tradisjonell vigsel": "Tradisjonell vigsel med stammeeldste. Planlegg 60-90 min.",
        "Jollof": "Jollof rice-servering er sentral. Planlegg catering-tid.",
      },
      libanesisk: {
        "Dabke": "Dabke-dansen samler alle. Planlegg 20-30 min.",
        "Zaffe": "Zaffe-inngang med trommer. Gi 15-20 min.",
      },
      filipino: {
        "Unity Candle": "Unity Candle og Arras-seremoni. Planlegg 15-20 min.",
        "Snoroppheng": "Snor- og slørseremonien. Gi 10-15 min.",
      },
      kinesisk: {
        "Teseremoni": "Teseremonien for begge familier. Planlegg 30-45 min totalt.",
        "Door Games": "Door Games for brudgommen. Gi 20-30 min.",
        "Bankett": "Kinesisk bryllupsbankett med mange retter. Planlegg 2-3 timer.",
      },
      koreansk: {
        "Pyebaek": "Pyebaek-seremonien med bukk og kastanjer. Planlegg 20-30 min.",
        "Hanbok": "Skifte til hanbok. Gi 15-20 min.",
      },
      thai: {
        "Khan Maak": "Khan Maak-prosesjonen. Gi 20-30 min.",
        "Munkevelsignelse": "Munkene velsigner paret. Planlegg 30-45 min tidlig morgen.",
      },
      iransk: {
        "Sofreh Aghd": "Sofreh Aghd-oppsettet er detaljert. Planlegg 45-60 min for seremoni.",
        "Aghd": "Aghd-seremonien med sukkerknusing. Gi 30-40 min.",
      },
    };

    const eventLower = eventTitle.toLowerCase();
    if (culture && insights[culture]) {
      for (const [event, insight] of Object.entries(insights[culture])) {
        if (eventLower.includes(event.toLowerCase())) {
          return insight;
        }
      }
    } else {
      for (const entries of Object.values(insights)) {
        for (const [event, insight] of Object.entries(entries)) {
          if (eventLower.includes(event.toLowerCase())) {
            return insight;
          }
        }
      }
    }
    return "";
  };

  const handleEditTime = async (interval: ScheduleInterval) => {
    setEditingInterval(interval);
    const nextEvent = schedule.find(e => e.id === interval.eventIdTo);
    if (nextEvent) {
      setNewTime(nextEvent.time);
    }
  };

  const isValidTimeFormat = (time: string): boolean => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time.trim())) return false;
    return true;
  };

  const handleSaveTime = async () => {
    if (!editingInterval || !newTime) return;

    if (!isValidTimeFormat(newTime)) {
      Alert.alert("Ugyldig tid", "Bruk format HH:MM (f.eks. 14:30). Timer: 00-23, minutter: 00-59");
      return;
    }

    setIsSaving(true);
    try {

      const session = await getCoupleSession();
      if (!session?.token) {
        Alert.alert("Innlogging kreves", "Logg inn for å lagre endringer.");
        setIsSaving(false);
        return;
      }

      // optimistic update
      const prevSchedule = [...schedule];
      const optimistic = schedule
        .map((e) => (e.id === editingInterval.eventIdTo ? { ...e, time: newTime } : e))
        .sort((a, b) => a.time.localeCompare(b.time));
      setSchedule(optimistic);

      try {
        await updateScheduleEvent(session.token, editingInterval.eventIdTo, { time: newTime });
        await loadData();
      } catch (err) {
        setSchedule(prevSchedule);
        throw err;
      }
      
      setEditingInterval(null);
      setNewTime("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Lagret!", "Tidsplan er oppdatert og synkronisert.");
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke lagre tidsplan.");
    } finally {
      setIsSaving(false);
    }
  };

  const getBufferStatus = (diff: number): { color: string; label: string; icon: keyof typeof EvendiIconGlyphMap; suggestion: string } => {
    if (diff < 15) return { 
      color: theme.error, 
      label: "For kort buffer!", 
      icon: "alert-triangle",
      suggestion: "Vurder å legge til mer tid mellom hendelsene"
    };
    if (diff < 30) return { 
      color: "#FFB74D", 
      label: "Stram tidslinje", 
      icon: "clock",
      suggestion: "Kan strammes opp litt, men er håndterbar"
    };
    return { 
      color: theme.success, 
      label: "God buffer", 
      icon: "check-circle",
      suggestion: "Perfekt timing med god fleksibilitet"
    };
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="calendar" size={48} color={theme.textSecondary} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={{ color: theme.textSecondary }}>Laster timelinedata…</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="alert-circle" size={48} color={theme.error} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={[styles.errorTitle, { color: theme.error }]}>Kunne ikke laste timeline</ThemedText>
        <ThemedText style={[styles.errorMessage, { color: theme.textSecondary }]}>{error}</ThemedText>
        <Button style={{ marginTop: Spacing.lg }} onPress={loadData}>Prøv igjen</Button>
      </View>
    );
  }

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
          <EvendiIcon name="calendar" size={24} color={Colors.dark.accent} />
          <ThemedText type="h2" style={styles.headerTitle}>Bryllupsdagen</ThemedText>
          <ThemedText style={[styles.headerDate, { color: theme.textSecondary }]}>
            {formatDate(weddingDate)}
          </ThemedText>
          <View style={styles.cultureRow}>
            {[
              { key: "norwegian", label: "Norsk" },
              { key: "hindu", label: "Hindu" },
              { key: "sikh", label: "Sikh" },
              { key: "jewish", label: "Jødisk" },
              { key: "muslim", label: "Muslimsk" },
            ].map((c) => (
              <Pressable
                key={c.key}
                onPress={async () => {
                  setCulture(c.key);
                  await saveTimelineCulture(c.key);
                }}
                style={[
                  styles.cultureChip,
                  { borderColor: theme.border, backgroundColor: culture === c.key ? Colors.dark.accent + "20" : theme.backgroundSecondary },
                ]}
              >
                <ThemedText style={{ fontSize: 12 }}>{c.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Weather & Location Summary (from bridge) */}
          {venueWeatherSummary && (
            <Pressable
              onPress={() => setShowWeatherOverlay(!showWeatherOverlay)}
              style={[styles.weatherSummaryRow, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <EvendiIcon name="cloud" size={16} color={Colors.dark.accent} />
              <ThemedText style={[styles.weatherSummaryText, { color: theme.text }]}>
                {Math.round(venueWeatherSummary.avgTemp)}°C • {venueWeatherSummary.maxPrecip > 0 ? `${venueWeatherSummary.maxPrecip}mm nedbør` : 'Tørt'}
                {venueWeatherSummary.maxWind > 8 ? ` • ${Math.round(venueWeatherSummary.maxWind)} m/s` : ''}
              </ThemedText>
              {venueName ? (
                <ThemedText style={[styles.weatherVenue, { color: theme.textSecondary }]}>📍 {venueName}</ThemedText>
              ) : null}
              <EvendiIcon name={showWeatherOverlay ? "chevron-up" : "chevron-down"} size={14} color={theme.textSecondary} />
            </Pressable>
          )}
          {weatherLoading && !venueWeatherSummary && (
            <View style={[styles.weatherSummaryRow, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <ActivityIndicator size="small" color={Colors.dark.accent} />
              <ThemedText style={[styles.weatherSummaryText, { color: theme.textSecondary }]}>
                Henter vær for hendelsene...
              </ThemedText>
            </View>
          )}

          {/* Expanded weather/travel details */}
          {showWeatherOverlay && (
            <View style={styles.weatherOverlayContent}>
              {/* Travel times from cities */}
              {travelCities.length > 0 && (
                <View style={styles.travelCompact}>
                  <ThemedText style={[styles.travelCompactTitle, { color: Colors.dark.accent }]}>
                    🚗 Reisetid til bryllupsstedet
                  </ThemedText>
                  {travelCities.sort((a, b) => a.drivingMinutes - b.drivingMinutes).map((city, i) => (
                    <View key={i} style={[styles.travelCompactRow, { borderColor: theme.border }]}>
                      <ThemedText style={[styles.travelCompactCity, { color: theme.text }]}>{city.name}</ThemedText>
                      <ThemedText style={[styles.travelCompactTime, { color: Colors.dark.accent }]}>{city.drivingFormatted}</ThemedText>
                      <ThemedText style={[styles.travelCompactDist, { color: theme.textSecondary }]}>{city.roadDistanceKm} km</ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {/* Weather per event preview */}
              {eventWeatherMap.size > 0 && (
                <View style={styles.weatherPerEvent}>
                  <ThemedText style={[styles.travelCompactTitle, { color: Colors.dark.accent }]}>
                    🌤️ Vær per hendelse
                  </ThemedText>
                  {schedule.map((evt) => {
                    const ew = eventWeatherMap.get(evt.id);
                    if (!ew?.weather) return null;
                    return (
                      <View key={evt.id} style={[styles.travelCompactRow, { borderColor: theme.border }]}>
                        <ThemedText style={[styles.travelCompactCity, { color: theme.text }]}>
                          {evt.time} {evt.title}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14 }}>{weatherSymbolToEmoji(ew.weather.symbol)}</ThemedText>
                        <ThemedText style={[styles.travelCompactTime, { color: theme.textSecondary }]}>
                          {Math.round(ew.weather.temperature)}°
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Vendor travel times from venue */}
              {bookedVendors.length > 0 && bookedVendors.some(v => locationIntel.getTravelBadge(v.id)) && (
                <View style={styles.weatherPerEvent}>
                  <ThemedText style={[styles.travelCompactTitle, { color: "#2196F3" }]}>
                    🏬 Reisetid til leverandører
                  </ThemedText>
                  {bookedVendors.map((vendor) => {
                    const badge = locationIntel.getTravelBadge(vendor.id);
                    if (!badge) return null;
                    const travel = locationIntel.getVendorTravel(vendor.id);
                    return (
                      <Pressable
                        key={vendor.id}
                        onPress={() => locationIntel.openDirections(vendor)}
                        style={[styles.travelCompactRow, { borderColor: theme.border }]}
                      >
                        <ThemedText style={[styles.travelCompactCity, { color: theme.text }]} numberOfLines={1}>
                          {vendor.businessName}
                        </ThemedText>
                        <ThemedText style={[styles.travelCompactTime, { color: "#2196F3" }]}>{badge}</ThemedText>
                        {travel?.travel?.fuelCostNok ? (
                          <ThemedText style={[styles.travelCompactDist, { color: theme.textSecondary }]}>
                            ~{Math.round(travel.travel.fuelCostNok)} kr
                          </ThemedText>
                        ) : null}
                        <EvendiIcon name="navigation" size={12} color="#2196F3" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>

      <View style={styles.timeline}>
        {schedule.map((event, index) => {
          const nextEvent = schedule[index + 1];
          const timeDiff = nextEvent ? getTimeDiff(event.time, nextEvent.time) : 0;
          const bufferStatus = nextEvent ? getBufferStatus(timeDiff) : null;

          return (
            <Animated.View key={event.id} entering={FadeInLeft.delay(200 + index * 100).duration(400)}>
              <View style={styles.timelineItem}>
                <View style={styles.timeColumn}>
                  <ThemedText style={[styles.time, { color: Colors.dark.accent }]}>
                    {event.time}
                  </ThemedText>
                </View>

                <View style={styles.dotColumn}>
                  <View style={[styles.dot, { backgroundColor: Colors.dark.accent }]}>
                    <EvendiIcon name={ICON_MAP[event.icon] || "circle"} size={12} color="#1A1A1A" />
                  </View>
                  {index < schedule.length - 1 ? (
                    <View style={[styles.line, { backgroundColor: theme.border }]} />
                  ) : null}
                </View>

                <View style={[styles.eventCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                  <Pressable
                    onPress={() => handleDeleteEvent(event.id)}
                    style={styles.deleteBtn}
                  >
                    <EvendiIcon name="trash-2" size={14} color={theme.textSecondary} />
                  </Pressable>
                  {/* Weather badge for this event */}
                  {eventWeatherMap.has(event.id) && eventWeatherMap.get(event.id)?.weather && (
                    <View style={styles.eventWeatherBadge}>
                      <ThemedText style={{ fontSize: 14 }}>
                        {weatherSymbolToEmoji(eventWeatherMap.get(event.id)?.weather?.symbol)}
                      </ThemedText>
                      <ThemedText style={[styles.eventWeatherTemp, { color: theme.textSecondary }]}>
                        {Math.round(eventWeatherMap.get(event.id)!.weather!.temperature)}°
                      </ThemedText>
                      {(eventWeatherMap.get(event.id)?.weather?.precipitation || 0) > 0 && (
                        <ThemedText style={[styles.eventWeatherPrecip, { color: '#64B5F6' }]}>
                          {eventWeatherMap.get(event.id)!.weather!.precipitation}mm
                        </ThemedText>
                      )}
                    </View>
                  )}
                  {/* Weather tip for this event */}
                  {eventWeatherMap.get(event.id)?.weatherTip && 
                   !eventWeatherMap.get(event.id)?.weatherTip?.startsWith('✅') && (
                    <ThemedText style={[styles.eventWeatherTip, { color: Colors.dark.accent }]}>
                      {eventWeatherMap.get(event.id)?.weatherTip}
                    </ThemedText>
                  )}
                  {nextEvent ? (
                    <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
                      {timeDiff} min til neste
                    </ThemedText>
                  ) : null}
                </View>
              </View>

              {bufferStatus && timeDiff < 30 ? (
                <View style={styles.bufferWarning}>
                  <View style={styles.bufferSpacer} />
                  <Pressable
                    onPress={() => setExpandedBuffer(expandedBuffer === event.id ? null : event.id)}
                    style={[styles.bufferCard, { backgroundColor: bufferStatus.color + "20", borderColor: bufferStatus.color }]}
                  >
                    <EvendiIcon name={bufferStatus.icon} size={14} color={bufferStatus.color} />
                    <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                      <ThemedText style={[styles.bufferText, { color: bufferStatus.color }]}>
                        {bufferStatus.label} • {timeDiff} min
                      </ThemedText>
                      {expandedBuffer === event.id && (
                        <ThemedText style={[styles.bufferSuggestion, { color: bufferStatus.color }]}>
                          {bufferStatus.suggestion}
                        </ThemedText>
                      )}
                    </View>
                    <EvendiIcon name={expandedBuffer === event.id ? "chevron-up" : "chevron-down"} size={14} color={bufferStatus.color} />
                  </Pressable>
                </View>
              ) : null}
            </Animated.View>
          );
        })}
      </View>

      {speeches.length > 0 && (
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ marginTop: Spacing.xl }}>
          <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <EvendiIcon name="mic" size={20} color={Colors.dark.accent} />
              <ThemedText type="h4" style={styles.sectionTitle}>
                Taler ({speeches.length})
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionSubtext, { color: theme.textSecondary }]}>
              Pause/senk musikken når taler starter
            </ThemedText>
            {speeches.sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')).map((speech, idx) => {
              const statusColor = speech.status === 'speaking' ? '#f59e0b' : speech.status === 'done' ? '#22c55e' : '#9ca3af';
              const statusText = speech.status === 'speaking' ? '🔴 NÅ' : speech.status === 'done' ? 'Ferdig' : 'Klar';
              return (
                <View
                  key={speech.id}
                  style={[
                    styles.speechRow,
                    {
                      borderLeftColor: statusColor,
                      backgroundColor: speech.status === 'speaking' ? '#f59e0b10' : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.speechTime}>
                    <ThemedText style={[styles.speechTimeText, { color: theme.accent }]}>
                      {speech.time || 'TBA'}
                    </ThemedText>
                  </View>
                  <View style={styles.speechInfo}>
                    <ThemedText style={styles.speechName}>{speech.speakerName}</ThemedText>
                    <ThemedText style={[styles.speechRole, { color: theme.textSecondary }]}>
                      {speech.role}
                    </ThemedText>
                  </View>
                  <View style={[styles.speechBadge, { backgroundColor: statusColor + '20' }]}>
                    <ThemedText style={[styles.speechBadgeText, { color: statusColor }]}>
                      {statusText}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {schedule.length === 0 ? (
        <View style={styles.emptyState}>
          <EvendiIcon name="calendar" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen hendelser i kjøreplanen
          </ThemedText>
        </View>
      ) : null}

      {problematicIntervals.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={[styles.optimizationCard, { backgroundColor: Colors.dark.accent + "08", borderColor: Colors.dark.accent }]}>
            <View style={styles.optimizationHeader}>
              <EvendiIcon name="alert-circle" size={20} color={Colors.dark.accent} />
              <ThemedText type="h4" style={[styles.optimizationTitle, { color: Colors.dark.accent }]}>
                Tidsoptimalisering
              </ThemedText>
            </View>
            
            <ThemedText style={[styles.optimizationSubtext, { color: theme.textSecondary }]}>
              {problematicIntervals.length} intervall{problematicIntervals.length > 1 ? "er" : ""} kan forbedres
            </ThemedText>
            
            {problematicIntervals.map((interval) => (
              <Pressable 
                key={interval.id}
                onPress={() => handleEditTime(interval)}
                style={[styles.optimizationItem, { borderColor: theme.border }]}
              >
                <View style={styles.optimizationContent}>
                  <View style={styles.eventPair}>
                    <ThemedText style={[styles.eventName, { color: theme.textSecondary }]}>
                      {interval.from}
                    </ThemedText>
                    <EvendiIcon name="arrow-right" size={12} color={theme.textSecondary} />
                    <ThemedText style={[styles.eventName, { color: theme.textSecondary }]}>
                      {interval.to}
                    </ThemedText>
                  </View>
                  
                  {getTraditionInsight(interval.from) && (
                    <ThemedText style={[styles.traditionTip, { color: Colors.dark.accent }]}>
                      💡 {getTraditionInsight(interval.from)}
                    </ThemedText>
                  )}
                  
                  <View style={styles.timingInfo}>
                    <View style={styles.currentTime}>
                      <ThemedText style={[styles.timeLabel, { color: theme.textSecondary }]}>
                        Nåværende
                      </ThemedText>
                      <ThemedText style={[styles.timeBold, { color: theme.text }]}>
                        {interval.current} min
                      </ThemedText>
                    </View>
                    <EvendiIcon name="arrow-right" size={14} color={Colors.dark.accent} />
                    <View style={styles.recommendedTime}>
                      <ThemedText style={[styles.timeLabel, { color: Colors.dark.accent }]}>
                        Anbefalt
                      </ThemedText>
                      <ThemedText style={[styles.timeBold, { color: Colors.dark.accent }]}>
                        {interval.current + interval.needed} min
                      </ThemedText>
                    </View>
                    <View style={[styles.addBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
                      <ThemedText style={[styles.addText, { color: Colors.dark.accent }]}>
                        +{interval.needed}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={[styles.editHint, { backgroundColor: Colors.dark.accent + "10" }]}>
                    <EvendiIcon name="edit-2" size={12} color={Colors.dark.accent} />
                    <ThemedText style={[styles.editHintText, { color: Colors.dark.accent }]}>
                      Trykk for å redigere tiden
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.tipsHeader}>
            <ThemedText type="h4" style={styles.tipsTitle}>Buffer-oversikt</ThemedText>
            <View style={[styles.bufferSummary, { backgroundColor: Colors.dark.accent + "15" }]}>
              <EvendiIcon name="clock" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.bufferSummaryText, { color: Colors.dark.accent }]}>
                {totalBufferTime} min totalt
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.tipsSubtitle, { color: theme.textSecondary }]}>
            Retningslinjer
          </ThemedText>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: theme.success }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.tipText, { color: theme.text }]}>
                <ThemedText style={{ fontWeight: "600" }}>30+ min:</ThemedText> Ideell buffer
              </ThemedText>
              <ThemedText style={[styles.tipHint, { color: theme.textSecondary }]}>
                God fleksibilitet for uforutsette forsinkelser
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: "#FFB74D" }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.tipText, { color: theme.text }]}>
                <ThemedText style={{ fontWeight: "600" }}>15-30 min:</ThemedText> Stram, men ok
              </ThemedText>
              <ThemedText style={[styles.tipHint, { color: theme.textSecondary }]}>
                Krever mer presisjon, begrenset fleksibilitet
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: theme.error }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.tipText, { color: theme.text }]}>
                <ThemedText style={{ fontWeight: "600" }}>Under 15 min:</ThemedText> Risikabelt
              </ThemedText>
              <ThemedText style={[styles.tipHint, { color: theme.textSecondary }]}>
                Lite rom for uforutsette hendelser
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.addFabContainer}>
        <Pressable onPress={() => setShowAddModal(true)} style={[styles.addFab, { backgroundColor: Colors.dark.accent }]}>
          <EvendiIcon name="plus" size={24} color="#1A1A1A" />
        </Pressable>
      </View>

      <Modal visible={!!editingInterval} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3" style={styles.modalTitle}>
                Rediger tid
              </ThemedText>
              <Pressable onPress={() => setEditingInterval(null)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {editingInterval && (
              <>
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Hendelse: <ThemedText style={{ fontWeight: "600" }}>{editingInterval.to}</ThemedText>
                  </ThemedText>
                  <ThemedText style={[styles.modalDescription, { color: theme.textSecondary }]}>
                    Etter: {editingInterval.from}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Ny tid (HH:MM)
                  </ThemedText>
                  <TextInput
                    style={[styles.timeInput, { borderColor: Colors.dark.accent, color: theme.text }]}
                    placeholder="14:30"
                    placeholderTextColor={theme.textSecondary}
                    value={newTime}
                    onChangeText={setNewTime}
                    maxLength={5}
                    editable={!isSaving}
                  />
                </View>

                {getTraditionInsight(editingInterval.from) && (
                  <View style={[styles.modalTip, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent }]}>
                    <EvendiIcon name="info" size={16} color={Colors.dark.accent} />
                    <ThemedText style={[styles.modalTipText, { color: Colors.dark.accent }]}>
                      {getTraditionInsight(editingInterval.from)}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.modalButtonGroup}>
                  <Button
                    onPress={() => setEditingInterval(null)}
                    style={styles.cancelButton}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onPress={handleSaveTime}
                    style={[styles.saveButton, isSaving && { opacity: 0.5 }]}
                    disabled={isSaving}
                  >
                    {isSaving ? "Lagrer..." : "Lagre endringer"}
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }] }>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }] }>
            <View style={styles.modalHeader}>
              <ThemedText type="h3" style={styles.modalTitle}>Ny hendelse</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <View style={styles.modalSection}>
              <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>Tittel</ThemedText>
              <TextInput style={[styles.timeInput, { borderColor: theme.border, color: theme.text }]} value={newTitle} onChangeText={setNewTitle} placeholder="F.eks. Inngang" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.modalSection}>
              <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>Tid (HH:MM)</ThemedText>
              <TextInput style={[styles.timeInput, { borderColor: Colors.dark.accent, color: theme.text }]} value={newEventTime} onChangeText={setNewEventTime} placeholder="14:00" placeholderTextColor={theme.textSecondary} maxLength={5} keyboardType="numeric" />
              <ThemedText style={[styles.modalHint, { color: theme.textSecondary }]}>Timer: 00-23, minutter: 00-59</ThemedText>
            </View>
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>Ikon</ThemedText>
                  <View style={styles.iconRow}>
                    {Object.keys(ICON_MAP).map((key) => (
                      <Pressable
                        key={key}
                        onPress={() => setNewIcon(key)}
                        style={[
                          styles.iconChip,
                          { borderColor: theme.border, backgroundColor: newIcon === key ? Colors.dark.accent + "20" : theme.backgroundSecondary },
                        ]}
                      >
                        <EvendiIcon name={ICON_MAP[key]} size={16} color={newIcon === key ? Colors.dark.accent : theme.textSecondary} />
                      </Pressable>
                    ))}
                  </View>
                </View>
            <View style={styles.modalButtonGroup}>
              <Button onPress={() => setShowAddModal(false)} style={styles.cancelButton}>Avbryt</Button>
              <Button onPress={handleCreateEvent} style={styles.saveButton}>Legg til</Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  errorTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.sm },
  errorMessage: { fontSize: 14, marginBottom: Spacing.md, textAlign: "center", maxWidth: 250 },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: { marginTop: Spacing.sm, textAlign: "center" },
  headerDate: { marginTop: Spacing.xs, fontSize: 14 },
  cultureRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginTop: Spacing.sm },
  cultureChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1, borderRadius: BorderRadius.full },
  timeline: { marginBottom: Spacing.xl },
  timelineItem: { flexDirection: "row", marginBottom: Spacing.sm },
  timeColumn: { width: 50, alignItems: "flex-end", paddingRight: Spacing.md },
  time: { fontSize: 14, fontWeight: "600" },
  dotColumn: { alignItems: "center", width: 30 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  line: { width: 2, flex: 1, marginTop: -2 },
  eventCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  deleteBtn: { position: "absolute", right: Spacing.sm, top: Spacing.sm, padding: Spacing.xs },
  eventTitle: { fontSize: 15, fontWeight: "500" },
  duration: { fontSize: 12, marginTop: 2 },
  bufferWarning: { flexDirection: "row", marginBottom: Spacing.sm, marginTop: -Spacing.xs },
  bufferSpacer: { width: 80 },
  bufferCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  bufferText: { fontSize: 12, fontWeight: "500", flex: 1 },
  bufferSuggestion: { fontSize: 12, marginTop: Spacing.xs, fontStyle: "italic", lineHeight: 16 },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  iconChip: { padding: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  emptyState: { alignItems: "center", paddingVertical: Spacing["5xl"] },
  emptyText: { fontSize: 16, marginTop: Spacing.lg },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionSubtext: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  speechTime: {
    width: 50,
    marginRight: Spacing.md,
  },
  speechTimeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  speechInfo: {
    flex: 1,
  },
  speechName: {
    fontSize: 15,
    fontWeight: '500',
  },
  speechRole: {
    fontSize: 13,
    marginTop: 2,
  },
  speechBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  speechBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipsCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  tipsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  tipsTitle: { marginBottom: 0 },
  bufferSummary: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  bufferSummaryText: { fontSize: 12, fontWeight: "600", marginLeft: Spacing.xs },
  tipsSubtitle: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.md },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.md },
  tipDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.sm, marginTop: 3 },
  tipText: { fontSize: 13, fontWeight: "500", flex: 1 },
  tipHint: { fontSize: 12, marginTop: Spacing.xs, lineHeight: 16 },
  optimizationCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg },
  optimizationHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  optimizationTitle: { marginLeft: Spacing.sm, marginBottom: 0 },
  optimizationSubtext: { fontSize: 12, marginBottom: Spacing.md, fontStyle: "italic" },
  optimizationItem: { borderTopWidth: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  optimizationContent: { gap: Spacing.sm },
  eventPair: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  eventName: { fontSize: 12, fontWeight: "500", flex: 1 },
  traditionTip: { fontSize: 12, fontStyle: "italic", lineHeight: 16, marginVertical: Spacing.xs },
  timingInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: Spacing.xs },
  currentTime: { alignItems: "center" },
  recommendedTime: { alignItems: "center" },
  timeLabel: { fontSize: 12, marginBottom: 2 },
  timeBold: { fontSize: 13, fontWeight: "700" },
  addBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  addText: { fontSize: 12, fontWeight: "600" },
  editHint: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, marginTop: Spacing.sm, gap: Spacing.xs },
  editHintText: { fontSize: 12, fontWeight: "500" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { borderRadius: BorderRadius.lg, padding: Spacing.lg, width: "85%", maxWidth: 400 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  modalTitle: { marginBottom: 0 },
  modalSection: { marginBottom: Spacing.lg },
  modalLabel: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm },
  modalDescription: { fontSize: 12, lineHeight: 16 },
  timeInput: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, fontSize: 16, fontWeight: "600" },
  modalTip: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, marginBottom: Spacing.lg, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  modalTipText: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: "500" },
  modalHint: { fontSize: 11, marginTop: Spacing.xs, fontStyle: "italic" },
  modalButtonGroup: { flexDirection: "row", gap: Spacing.md },
  cancelButton: { flex: 1, backgroundColor: "transparent" },
  saveButton: { flex: 1, opacity: 1 },
  addFabContainer: { position: "absolute", right: Spacing.lg, bottom: Spacing.lg },
  addFab: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  // Weather / Location bridge styles
  weatherSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flexWrap: "wrap",
  },
  weatherSummaryText: { fontSize: 13, fontWeight: "500" },
  weatherVenue: { fontSize: 11, marginLeft: "auto" },
  weatherOverlayContent: { marginTop: Spacing.sm },
  travelCompact: { marginBottom: Spacing.md },
  travelCompactTitle: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.xs },
  travelCompactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
  },
  travelCompactCity: { fontSize: 12, flex: 1 },
  travelCompactTime: { fontSize: 12, fontWeight: "600" },
  travelCompactDist: { fontSize: 11, minWidth: 50, textAlign: "right" },
  weatherPerEvent: { marginTop: Spacing.xs },
  eventWeatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  eventWeatherTemp: { fontSize: 12, fontWeight: "500" },
  eventWeatherPrecip: { fontSize: 11 },
  eventWeatherTip: { fontSize: 11, marginTop: 2, fontStyle: "italic" },
});
