import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails, getCoupleSession } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import {
  getWeatherLocationData,
  searchAddress,
  updateVenueLocation,
  calculateTravel,
  weatherSymbolToEmoji,
  getWeddingWeatherTips,
  type WeatherLocationData,
  type TravelFromCity,
  type TravelResult,
  type KartverketSearchResult,
} from "@/lib/api-weather-location-bridge";

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

const SYMBOL_MAP: Record<string, keyof typeof EvendiIconGlyphMap> = {
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
  const { isWedding, config } = useEventType();

  const eventDayLabel = isWedding ? "Bryllupsdagen" : config.labelNo + "en";
  const eventDayLabelShort = isWedding ? "Bryllupsdag" : config.dateLabel.no.replace("dato", "dag");
  const eventVenueLabel = isWedding ? "Bryllupssted" : "Arrangementssted";
  const travelLabel = isWedding ? "Reisetid til bryllupet" : "Reisetid til arrangementet";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venue, setVenue] = useState("Oslo");
  const [weddingDate, setWeddingDate] = useState("");

  // Bridge state
  const [bridgeData, setBridgeData] = useState<WeatherLocationData | null>(null);
  const [travelCities, setTravelCities] = useState<TravelFromCity[]>([]);
  const [showTravelSection, setShowTravelSection] = useState(false);
  const [customTravelResult, setCustomTravelResult] = useState<TravelResult | null>(null);
  const [travelSearchCity, setTravelSearchCity] = useState("");
  const [travelLoading, setTravelLoading] = useState(false);
  const [showVenueSearch, setShowVenueSearch] = useState(false);
  const [venueSearchQuery, setVenueSearchQuery] = useState("");
  const [venueSearchResults, setVenueSearchResults] = useState<KartverketSearchResult[]>([]);
  const [venueSearchLoading, setVenueSearchLoading] = useState(false);
  const [weddingDayTips, setWeddingDayTips] = useState<string[]>([]);

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

      // Also try to load bridge data for enhanced features
      try {
        const session = await getCoupleSession();
        if (session?.coupleId) {
          const bridge = await getWeatherLocationData(session.coupleId);
          setBridgeData(bridge);
          setTravelCities(bridge.travelFromCities || []);
          if (bridge.venue?.name) setVenue(bridge.venue.name);
          if (bridge.weather?.weddingDayForecast?.tips) {
            setWeddingDayTips(bridge.weather.weddingDayForecast.tips);
          }
          if (bridge.weather?.current) {
            const tips = getWeddingWeatherTips(bridge.weather.current);
            if (tips.length > 0 && weddingDayTips.length === 0) setWeddingDayTips(tips);
          }
        }
      } catch (bridgeErr) {
        // Bridge is optional — basic weather still works
        console.log('Bridge data not available:', bridgeErr);
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Kunne ikke hente værdata fra YR. Prøv igjen senere.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVenueSearch = useCallback(async (query: string) => {
    setVenueSearchQuery(query);
    if (query.length < 2) {
      setVenueSearchResults([]);
      return;
    }
    setVenueSearchLoading(true);
    try {
      const results = await searchAddress(query);
      setVenueSearchResults(results);
    } catch {
      setVenueSearchResults([]);
    } finally {
      setVenueSearchLoading(false);
    }
  }, []);

  const handleSelectVenue = useCallback(async (result: KartverketSearchResult) => {
    try {
      const session = await getCoupleSession();
      if (session?.coupleId) {
        await updateVenueLocation(session.coupleId, {
          venueName: result.address,
          lat: result.coordinates.lat,
          lng: result.coordinates.lng,
        });
      }
      setVenue(result.address);
      setShowVenueSearch(false);
      setVenueSearchQuery("");
      setVenueSearchResults([]);
      fetchWeather(); // Refresh with new location
    } catch (err) {
      console.error('Venue update error:', err);
    }
  }, [fetchWeather]);

  const handleTravelSearch = useCallback(async () => {
    if (!travelSearchCity.trim()) return;
    setTravelLoading(true);
    try {
      const session = await getCoupleSession();
      if (session?.coupleId) {
        const result = await calculateTravel(session.coupleId, { city: travelSearchCity.trim() });
        setCustomTravelResult(result);
      }
    } catch (err) {
      console.error('Travel calc error:', err);
    } finally {
      setTravelLoading(false);
    }
  }, [travelSearchCity]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const getWeatherIcon = (symbol: string): keyof typeof EvendiIconGlyphMap => {
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
                <EvendiIcon name={getWeatherIcon(weather.current.symbol)} size={40} color={Colors.dark.accent} />
              </View>
              <ThemedText style={[styles.tempLarge, { color: getTempColor(weather.current.temperature) }]}>
                {Math.round(weather.current.temperature)}°C
              </ThemedText>
              <ThemedText style={[styles.venueText, { color: theme.textSecondary }]}>
                {venue}
              </ThemedText>
              <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
                {eventDayLabelShort}: {formatDate(weddingDate)}
              </ThemedText>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <EvendiIcon name="wind" size={18} color={theme.textSecondary} />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {weather.current.windSpeed} m/s
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Vind</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <EvendiIcon name="droplet" size={18} color="#64B5F6" />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {Math.round(weather.current.humidity)}%
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Fuktighet</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <EvendiIcon name="cloud-rain" size={18} color="#81C784" />
                  <ThemedText style={[styles.statValue, { color: theme.text }]}>
                    {weather.current.precipitation} mm
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Nedbør</ThemedText>
                </View>
              </View>
            </>
          ) : error ? (
            <View style={styles.errorContainer}>
              <EvendiIcon name="cloud-off" size={48} color={theme.textMuted} />
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
                <EvendiIcon name={getWeatherIcon(hour.symbol)} size={24} color={Colors.dark.accent} />
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
          <EvendiIcon name="info" size={14} color={theme.textMuted} />
          <ThemedText style={[styles.yrText, { color: theme.textMuted }]}>
            Værdata fra Yr, levert av Meteorologisk institutt og NRK
          </ThemedText>
        </View>
      </Animated.View>

      {/* ── Wedding Day Forecast (from bridge) ── */}
      {bridgeData?.weather?.weddingDayForecast ? (
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <View style={[styles.weddingDayCard, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent }]}>
            <View style={styles.weddingDayHeader}>
              <EvendiIcon name="heart" size={20} color={Colors.dark.accent} />
              <ThemedText type="h4" style={styles.weddingDayTitle}>{eventDayLabel}</ThemedText>
              <ThemedText style={[styles.weddingDayDate, { color: theme.textSecondary }]}>
                {bridgeData.weather.weddingDayForecast.date}
              </ThemedText>
            </View>
            <View style={styles.weddingDayStats}>
              <View style={styles.statItem}>
                <EvendiIcon name="thermometer" size={18} color={getTempColor(bridgeData.weather.weddingDayForecast.avgTemperature)} />
                <ThemedText style={[styles.statValue, { color: theme.text }]}>
                  {bridgeData.weather.weddingDayForecast.avgTemperature}°C
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Snitt</ThemedText>
              </View>
              <View style={styles.statItem}>
                <EvendiIcon name="cloud-rain" size={18} color="#64B5F6" />
                <ThemedText style={[styles.statValue, { color: theme.text }]}>
                  {bridgeData.weather.weddingDayForecast.maxPrecipitation} mm
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Maks nedbør</ThemedText>
              </View>
            </View>
            {bridgeData.weather.weddingDayForecast.entries.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
                {bridgeData.weather.weddingDayForecast.entries.map((entry, i) => (
                  <View key={i} style={[styles.hourCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                    <ThemedText style={[styles.hourTime, { color: theme.textSecondary }]}>{formatTime(entry.time)}</ThemedText>
                    <ThemedText style={{ fontSize: 18 }}>{weatherSymbolToEmoji(entry.symbol)}</ThemedText>
                    <ThemedText style={[styles.hourTemp, { color: getTempColor(entry.temperature) }]}>{Math.round(entry.temperature)}°</ThemedText>
                  </View>
                ))}
              </ScrollView>
            )}
            {weddingDayTips.length > 0 && (
              <View style={styles.tipsContainer}>
                {weddingDayTips.map((tip, i) => (
                  <ThemedText key={i} style={[styles.weddingTip, { color: Colors.dark.accent }]}>{tip}</ThemedText>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      ) : weddingDayTips.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <View style={[styles.weddingDayCard, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent }]}>
            <View style={styles.weddingDayHeader}>
              <EvendiIcon name="alert-circle" size={20} color={Colors.dark.accent} />
              <ThemedText type="h4" style={styles.weddingDayTitle}>Værtips</ThemedText>
            </View>
            <View style={styles.tipsContainer}>
              {weddingDayTips.map((tip, i) => (
                <ThemedText key={i} style={[styles.weddingTip, { color: Colors.dark.accent }]}>{tip}</ThemedText>
              ))}
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* ── Venue Location (Kartverket search) ── */}
      <Animated.View entering={FadeInDown.delay(340).duration(400)}>
        <View style={[styles.venueSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.venueHeader}>
            <EvendiIcon name="map-pin" size={20} color={Colors.dark.accent} />
            <ThemedText type="h4" style={styles.sectionTitle}>{eventVenueLabel}</ThemedText>
            <Pressable onPress={() => setShowVenueSearch(!showVenueSearch)} style={styles.editVenueBtn}>
              <EvendiIcon name={showVenueSearch ? "x" : "edit-2"} size={16} color={Colors.dark.accent} />
            </Pressable>
          </View>
          <ThemedText style={[styles.venueName, { color: theme.text }]}>{venue}</ThemedText>
          {bridgeData?.venue?.municipality && (
            <ThemedText style={[styles.venueDetail, { color: theme.textSecondary }]}>
              {bridgeData.venue.municipality}{bridgeData.venue.county ? `, ${bridgeData.venue.county}` : ''}
            </ThemedText>
          )}
          {bridgeData?.venue?.coordinates && (
            <ThemedText style={[styles.venueDetail, { color: theme.textMuted }]}>
              📍 {bridgeData.venue.coordinates.lat.toFixed(4)}°N, {bridgeData.venue.coordinates.lng.toFixed(4)}°Ø
            </ThemedText>
          )}
          {showVenueSearch && (
            <View style={styles.venueSearchContainer}>
              <TextInput
                style={[styles.searchInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                placeholder="Søk adresse (Kartverket)..."
                placeholderTextColor={theme.textMuted}
                value={venueSearchQuery}
                onChangeText={handleVenueSearch}
              />
              {venueSearchLoading && <ActivityIndicator size="small" color={Colors.dark.accent} style={{ marginTop: Spacing.xs }} />}
              {venueSearchResults.map((result, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSelectVenue(result)}
                  style={[styles.searchResult, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                >
                  <EvendiIcon name="map-pin" size={14} color={Colors.dark.accent} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <ThemedText style={{ fontSize: 13 }}>{result.address}</ThemedText>
                    <ThemedText style={[styles.searchResultSub, { color: theme.textSecondary }]}>
                      {result.municipality}, {result.county} • {result.postalCode} {result.postalPlace}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── Travel Time to Venue ── */}
      <Animated.View entering={FadeInDown.delay(360).duration(400)}>
        <Pressable
          onPress={() => setShowTravelSection(!showTravelSection)}
          style={[styles.travelHeader, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <EvendiIcon name="navigation" size={20} color={Colors.dark.accent} />
          <ThemedText type="h4" style={[styles.sectionTitle, { flex: 1 }]}>{travelLabel}</ThemedText>
          <EvendiIcon name={showTravelSection ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
        </Pressable>

        {showTravelSection && (
          <View style={[styles.travelContent, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {/* Custom travel search */}
            <View style={styles.travelSearchRow}>
              <TextInput
                style={[styles.travelInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                placeholder="Søk by eller sted..."
                placeholderTextColor={theme.textMuted}
                value={travelSearchCity}
                onChangeText={setTravelSearchCity}
                onSubmitEditing={handleTravelSearch}
              />
              <Pressable onPress={handleTravelSearch} style={[styles.travelSearchBtn, { backgroundColor: Colors.dark.accent }]}>
                {travelLoading ? (
                  <ActivityIndicator size="small" color="#1A1A1A" />
                ) : (
                  <EvendiIcon name="search" size={18} color="#1A1A1A" />
                )}
              </Pressable>
            </View>

            {customTravelResult && (
              <View style={[styles.travelResultCard, { borderColor: Colors.dark.accent, backgroundColor: Colors.dark.accent + '10' }]}>
                <ThemedText style={[styles.travelCity, { color: Colors.dark.accent }]}>
                  {travelSearchCity} → {customTravelResult.venue.name}
                </ThemedText>
                <View style={styles.travelStats}>
                  <View style={styles.travelStat}>
                    <EvendiIcon name="clock" size={14} color={Colors.dark.accent} />
                    <ThemedText style={styles.travelValue}>{customTravelResult.travel.drivingFormatted}</ThemedText>
                  </View>
                  <View style={styles.travelStat}>
                    <EvendiIcon name="navigation" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.travelValue, { color: theme.textSecondary }]}>{customTravelResult.travel.roadDistanceKm} km</ThemedText>
                  </View>
                  <View style={styles.travelStat}>
                    <EvendiIcon name="dollar-sign" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.travelValue, { color: theme.textSecondary }]}>~{Math.round(customTravelResult.travel.fuelCostNok)} kr</ThemedText>
                  </View>
                </View>
                {customTravelResult.origin.weather && customTravelResult.venue.weather && (
                  <View style={styles.travelWeatherRow}>
                    <ThemedText style={[styles.travelWeather, { color: theme.textSecondary }]}>
                      {weatherSymbolToEmoji(customTravelResult.origin.weather.symbol)} {Math.round(customTravelResult.origin.weather.temperature)}°C →{' '}
                      {weatherSymbolToEmoji(customTravelResult.venue.weather.symbol)} {Math.round(customTravelResult.venue.weather.temperature)}°C
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* Pre-calculated cities */}
            {travelCities.length > 0 && (
              <>
                <ThemedText style={[styles.travelSubtitle, { color: theme.textSecondary }]}>Fra norske byer</ThemedText>
                {travelCities
                  .sort((a, b) => a.drivingMinutes - b.drivingMinutes)
                  .map((city, i) => (
                  <View key={i} style={[styles.travelRow, { borderColor: theme.border }]}>
                    <ThemedText style={[styles.travelCityName, { color: theme.text }]}>{city.name}</ThemedText>
                    <View style={styles.travelRowInfo}>
                      <ThemedText style={[styles.travelTime, { color: Colors.dark.accent }]}>{city.drivingFormatted}</ThemedText>
                      <ThemedText style={[styles.travelDist, { color: theme.textSecondary }]}>{city.roadDistanceKm} km</ThemedText>
                      <ThemedText style={[styles.travelCost, { color: theme.textMuted }]}>~{Math.round(city.fuelCostNok)} kr</ThemedText>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
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
                <EvendiIcon name={tip.icon as any} size={20} color={Colors.dark.accent} />
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
  yrText: { fontSize: 12, marginLeft: Spacing.xs, flex: 1 },
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
  // Wedding day forecast
  weddingDayCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  weddingDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  weddingDayTitle: { marginBottom: 0, flex: 1 },
  weddingDayDate: { fontSize: 13 },
  weddingDayStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.md,
  },
  tipsContainer: { marginTop: Spacing.sm },
  weddingTip: { fontSize: 13, marginBottom: Spacing.xs, lineHeight: 18 },
  // Venue section
  venueSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  venueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  editVenueBtn: { padding: Spacing.xs },
  venueName: { fontSize: 15, fontWeight: "600", marginTop: Spacing.sm },
  venueDetail: { fontSize: 12, marginTop: 2 },
  venueSearchContainer: { marginTop: Spacing.md },
  searchInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  searchResultSub: { fontSize: 11, marginTop: 2 },
  // Travel section
  travelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 1,
  },
  travelContent: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: Spacing.lg,
  },
  travelSearchRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  travelInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
  },
  travelSearchBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  travelResultCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  travelCity: { fontSize: 14, fontWeight: "600", marginBottom: Spacing.sm },
  travelStats: { flexDirection: "row", gap: Spacing.lg },
  travelStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  travelValue: { fontSize: 13, fontWeight: "500" },
  travelWeatherRow: { marginTop: Spacing.sm },
  travelWeather: { fontSize: 12 },
  travelSubtitle: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm },
  travelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  travelRowInfo: { flexDirection: "row", gap: Spacing.md, alignItems: "center" },
  travelCityName: { fontSize: 13, fontWeight: "500" },
  travelTime: { fontSize: 13, fontWeight: "600" },
  travelDist: { fontSize: 12 },
  travelCost: { fontSize: 11 },
});
