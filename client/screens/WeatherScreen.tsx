import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

interface WeatherData {
  current: {
    time: string;
    temperature: number;
    windSpeed: number;
    humidity: number;
    symbol: string;
    precipitation: number;
  } | null;
  hourly: Array<{
    time: string;
    temperature: number;
    symbol: string;
    precipitation: number;
  }>;
  daily: Array<{
    time: string;
    temperature: number;
    symbol: string;
    precipitationMax: number;
  }>;
}

const SCANDINAVIAN_CITIES: Record<string, { lat: number; lon: number }> = {
  "Oslo": { lat: 59.9139, lon: 10.7522 },
  "Bergen": { lat: 60.3913, lon: 5.3221 },
  "Trondheim": { lat: 63.4305, lon: 10.3951 },
  "Stavanger": { lat: 58.9700, lon: 5.7331 },
  "Kristiansand": { lat: 58.1599, lon: 8.0182 },
  "Tromsø": { lat: 69.6492, lon: 18.9553 },
  "Ålesund": { lat: 62.4722, lon: 6.1495 },
  "Drammen": { lat: 59.7439, lon: 10.2045 },
  "Stockholm": { lat: 59.3293, lon: 18.0686 },
  "Göteborg": { lat: 57.7089, lon: 11.9746 },
  "Malmö": { lat: 55.6050, lon: 13.0038 },
  "Uppsala": { lat: 59.8586, lon: 17.6389 },
  "København": { lat: 55.6761, lon: 12.5683 },
  "Aarhus": { lat: 56.1629, lon: 10.2039 },
  "Odense": { lat: 55.4038, lon: 10.4024 },
  "Aalborg": { lat: 57.0488, lon: 9.9217 },
};

const SYMBOL_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  clearsky_day: "sun",
  clearsky_night: "moon",
  cloudy: "cloud",
  fair_day: "sun",
  fair_night: "moon",
  fog: "cloud",
  heavyrain: "cloud-rain",
  heavyrainandthunder: "cloud-lightning",
  heavyrainshowers_day: "cloud-rain",
  heavyrainshowers_night: "cloud-rain",
  heavysleet: "cloud-drizzle",
  heavysnow: "cloud-snow",
  lightrain: "cloud-drizzle",
  lightrainshowers_day: "cloud-drizzle",
  lightrainshowers_night: "cloud-drizzle",
  lightsleet: "cloud-drizzle",
  lightsnow: "cloud-snow",
  partlycloudy_day: "cloud",
  partlycloudy_night: "cloud",
  rain: "cloud-rain",
  rainandthunder: "cloud-lightning",
  rainshowers_day: "cloud-rain",
  rainshowers_night: "cloud-rain",
  sleet: "cloud-drizzle",
  snow: "cloud-snow",
  snowandthunder: "cloud-lightning",
  snowshowers_day: "cloud-snow",
  snowshowers_night: "cloud-snow",
};

const BACKUP_TIPS = [
  { icon: "umbrella", title: "Paraply-stasjon", desc: "Sett opp paraplyer for gjester" },
  { icon: "home", title: "Plan B lokale", desc: "Ha innendørs alternativ klart" },
  { icon: "camera", title: "Foto-timing", desc: "Ta bilder tidlig hvis regn varslet" },
  { icon: "sun", title: "Solbeskyttelse", desc: "Vifter og vann for varme dager" },
];

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venue, setVenue] = useState("Oslo");
  const [weddingDate, setWeddingDate] = useState("");

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const weddingData = await getWeddingDetails();
      if (weddingData) {
        setVenue(weddingData.venue || "Oslo");
        setWeddingDate(weddingData.weddingDate);
      }

      const cityName = weddingData?.venue?.split(",")[0]?.trim() || "Oslo";
      const coords = SCANDINAVIAN_CITIES[cityName] || SCANDINAVIAN_CITIES["Oslo"];

      const apiUrl = getApiUrl();
      const url = new URL(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, apiUrl);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Kunne ikke hente værdata");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Kunne ikke hente værdata fra YR. Prøv igjen senere.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const getWeatherIcon = (symbol: string): keyof typeof Feather.glyphMap => {
    if (!symbol) return "cloud";
    const baseSymbol = symbol.replace(/_day|_night|_polartwilight/g, "_day");
    return SYMBOL_MAP[baseSymbol] || SYMBOL_MAP[symbol] || "cloud";
  };

  const getTempColor = (temp: number) => {
    if (temp < 0) return "#64B5F6";
    if (temp < 10) return "#81C784";
    if (temp < 20) return "#FFB74D";
    return "#E57373";
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
          Henter værdata fra YR.no...
        </ThemedText>
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
        <View style={[styles.mainCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {weather?.current ? (
            <>
              <View style={[styles.weatherIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name={getWeatherIcon(weather.current.symbol)} size={40} color={Colors.dark.accent} />
              </View>
              <ThemedText style={[styles.tempLarge, { color: getTempColor(weather.current.temperature) }]}>
                {Math.round(weather.current.temperature)}°C
              </ThemedText>
              <ThemedText style={[styles.venueText, { color: theme.textSecondary }]}>
                {venue}
              </ThemedText>
              <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
                Bryllupsdag: {formatDate(weddingDate)}
              </ThemedText>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="wind" size={18} color={theme.textSecondary} />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {weather.current.windSpeed} m/s
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Vind</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Feather name="droplet" size={18} color="#64B5F6" />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {Math.round(weather.current.humidity)}%
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Fuktighet</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Feather name="cloud-rain" size={18} color="#81C784" />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {weather.current.precipitation} mm
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Nedbør</ThemedText>
                </View>
              </View>
            </>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="cloud-off" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>{error}</ThemedText>
              <Button onPress={fetchWeather} style={styles.retryButton}>Prøv igjen</Button>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {weather?.hourly && weather.hourly.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>Neste timer</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
            {weather.hourly.map((hour, index) => (
              <View
                key={index}
                style={[styles.hourCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              >
                <ThemedText style={[styles.hourTime, { color: theme.textSecondary }]}>
                  {formatTime(hour.time)}
                </ThemedText>
                <Feather name={getWeatherIcon(hour.symbol)} size={24} color={Colors.dark.accent} />
                <ThemedText style={[styles.hourTemp, { color: getTempColor(hour.temperature) }]}>
                  {Math.round(hour.temperature)}°
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.yrCredit, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="info" size={14} color={theme.textMuted} />
          <ThemedText style={[styles.yrText, { color: theme.textMuted }]}>
            Værdata fra Yr, levert av Meteorologisk institutt og NRK
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>Værplanlegging-tips</ThemedText>
        <View style={styles.tipsGrid}>
          {BACKUP_TIPS.map((tip, index) => (
            <View
              key={index}
              style={[styles.tipCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            >
              <View style={[styles.tipIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name={tip.icon as any} size={20} color={Colors.dark.accent} />
              </View>
              <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
              <ThemedText style={[styles.tipDesc, { color: theme.textSecondary }]}>{tip.desc}</ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: Spacing.lg, fontSize: 14 },
  mainCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  weatherIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tempLarge: { fontSize: 48, fontWeight: "700" },
  venueText: { fontSize: 16, marginTop: Spacing.xs },
  dateText: { fontSize: 13, marginTop: Spacing.xs },
  statsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: Spacing.xl },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "600", marginTop: Spacing.xs },
  statLabel: { fontSize: 12, marginTop: 2 },
  errorContainer: { alignItems: "center", paddingVertical: Spacing.xl },
  errorText: { marginTop: Spacing.md, textAlign: "center", fontSize: 14 },
  retryButton: { marginTop: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.md, marginTop: Spacing.lg },
  hourlyScroll: { marginBottom: Spacing.lg, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  hourCard: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 70,
  },
  hourTime: { fontSize: 12, marginBottom: Spacing.xs },
  hourTemp: { fontSize: 16, fontWeight: "600", marginTop: Spacing.xs },
  yrCredit: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  yrText: { fontSize: 11, marginLeft: Spacing.xs, flex: 1 },
  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  tipCard: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipTitle: { fontSize: 14, fontWeight: "600" },
  tipDesc: { fontSize: 12, marginTop: 2 },
});
