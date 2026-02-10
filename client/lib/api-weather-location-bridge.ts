/**
 * Weather / Location / Travel Bridge API
 * Connects Wedflow wedding planning with CreatorHub's location intelligence
 * — Kartverket address search, YR.no weather, travel cost calculations
 *
 * Data flows:
 *   CreatorHub ExternalDataService → Backend bridge → Wedflow screens
 *   Wedflow venue selection → Backend bridge → CreatorHub project timelines
 */

import { getApiUrl } from './query-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BridgeCoordinates {
  lat: number;
  lng: number;
}

export interface BridgeWeatherCurrent {
  temperature: number;
  windSpeed: number;
  humidity: number;
  pressure?: number;
  cloudCover?: number;
  symbol: string;
  precipitation: number;
  time: string;
}

export interface BridgeWeatherHourly {
  time: string;
  temperature: number;
  windSpeed?: number;
  humidity?: number;
  symbol: string;
  precipitation: number;
}

export interface BridgeWeatherDaily {
  time: string;
  temperature: number;
  windSpeed?: number;
  symbol: string;
  precipitationMax: number;
}

export interface WeddingDayForecast {
  date: string;
  entries: BridgeWeatherHourly[];
  avgTemperature: number;
  maxPrecipitation: number;
  tips: string[];
}

export interface BridgeVenueInfo {
  name: string;
  coordinates: BridgeCoordinates;
  municipality?: string | null;
  county?: string | null;
}

export interface TravelInfo {
  straightLineKm: number;
  roadDistanceKm: number;
  drivingMinutes: number;
  drivingFormatted: string;
  fuelCostNok: number;
  tollEstimateNok: number;
}

export interface TravelFromCity extends TravelInfo {
  name: string;
  lat: number;
  lng: number;
}

export interface EventWithWeather {
  id: string;
  time: string;
  title: string;
  icon?: string;
  weather: BridgeWeatherHourly | null;
  weatherTip?: string;
}

export interface WeatherLocationData {
  couple: {
    id: string;
    email: string;
    displayName: string;
    weddingDate: string;
  };
  venue: BridgeVenueInfo;
  weather: {
    current: BridgeWeatherCurrent | null;
    hourly: BridgeWeatherHourly[];
    daily: BridgeWeatherDaily[];
    weddingDayForecast: WeddingDayForecast | null;
  } | null;
  eventsWithWeather: EventWithWeather[];
  travelFromCities: TravelFromCity[];
  source: string;
}

export interface KartverketSearchResult {
  address: string;
  coordinates: BridgeCoordinates;
  municipality: string;
  county: string;
  postalCode: string;
  postalPlace: string;
}

export interface VenueUpdateResult {
  saved: boolean;
  venue: { name: string; coordinates: BridgeCoordinates };
  currentWeather: { temperature: number; windSpeed: number; symbol: string } | null;
}

export interface TravelResult {
  travel: TravelInfo;
  origin: { coordinates: BridgeCoordinates; weather: { temperature: number; symbol: string } | null };
  venue: { name: string; coordinates: BridgeCoordinates; weather: { temperature: number; symbol: string } | null };
}

export interface EventWeatherResult {
  date: string;
  venue: { coordinates: BridgeCoordinates };
  events: EventWithWeather[];
  dailySummary: {
    avgTemperature: number;
    maxPrecipitation: number;
    maxWind: number;
  } | null;
}

// ─── Cache ──────────────────────────────────────────────────────────────────

const CACHE_KEY_PREFIX = 'weather_location_bridge_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Silent cache failure
  }
}

// ─── CreatorHub Bridge Base URL ─────────────────────────────────────────────

function getCreatorHubApiUrl(): string {
  // The weather-location bridge endpoints live on the CreatorHub backend
  // In production: both apps share same domain or use configured URL
  // In dev: CreatorHub runs on port 3001
  const envUrl = process.env.EXPO_PUBLIC_CREATORHUB_API_URL;
  if (envUrl) return envUrl;

  // Check if we're in a browser (web mode)
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname;
    const isGithubCodespaces = host?.includes('.app.github.dev') || host?.includes('.github.dev');
    if (isGithubCodespaces) {
      // Replace port with 3001 for CreatorHub API in Codespaces
      const apiHost = host.replace(/-\d{4,5}\./, '-3001.');
      return `https://${apiHost}`;
    }
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalhost) return 'http://localhost:3001';
    const isLanIp = /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host || '');
    if (isLanIp) return `http://${host}:3001`;
  }

  // Fallback: try the same API server (in case Wedflow API proxies)
  return getApiUrl();
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Get full weather/location/travel intelligence for a couple's wedding
 */
export async function getWeatherLocationData(coupleId: string): Promise<WeatherLocationData> {
  const cacheKey = `full_${coupleId}`;
  const cached = await getCached<WeatherLocationData>(cacheKey);
  if (cached) return cached;

  const baseUrl = getCreatorHubApiUrl();
  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/${coupleId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Kunne ikke hente vær- og stedsdata');
  }
  const data: WeatherLocationData = await res.json();
  await setCache(cacheKey, data);
  return data;
}

/**
 * Search for addresses using Kartverket (Geonorge)
 */
export async function searchAddress(query: string): Promise<KartverketSearchResult[]> {
  if (!query || query.length < 2) return [];

  const baseUrl = getCreatorHubApiUrl();
  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.addresses || [];
}

/**
 * Update wedding venue location (coordinates + name)
 */
export async function updateVenueLocation(
  coupleId: string,
  venue: { venueName?: string; lat?: number; lng?: number; address?: string }
): Promise<VenueUpdateResult | { results: KartverketSearchResult[]; message: string }> {
  const baseUrl = getCreatorHubApiUrl();
  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/${coupleId}/venue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(venue),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Kunne ikke oppdatere bryllupssted');
  }
  // Invalidate cache
  await AsyncStorage.removeItem(CACHE_KEY_PREFIX + `full_${coupleId}`);
  return res.json();
}

/**
 * Calculate travel info from a location to the wedding venue
 */
export async function calculateTravel(
  coupleId: string,
  from: { lat?: number; lng?: number; city?: string }
): Promise<TravelResult> {
  const baseUrl = getCreatorHubApiUrl();
  const params = new URLSearchParams();
  if (from.lat && from.lng) {
    params.set('fromLat', from.lat.toString());
    params.set('fromLng', from.lng.toString());
  }
  if (from.city) params.set('fromCity', from.city);

  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/${coupleId}/travel?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Kunne ikke beregne reiseinformasjon');
  }
  return res.json();
}

/**
 * Get weather forecast matched to each timeline event
 */
export async function getEventWeather(coupleId: string, date?: string): Promise<EventWeatherResult> {
  const baseUrl = getCreatorHubApiUrl();
  const params = date ? `?date=${date}` : '';
  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/${coupleId}/event-weather${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Kunne ikke hente vær per hendelse');
  }
  return res.json();
}

/**
 * Sync location data from a CreatorHub project to the couple's wedding planning
 */
export async function syncLocationFromProject(
  projectId: string,
  locationData: {
    venueCoordinates?: BridgeCoordinates;
    venueName?: string;
    locationAnalysis?: any;
    travelData?: any;
  }
): Promise<{ synced: boolean; coupleId: string; projectId: string }> {
  const baseUrl = getCreatorHubApiUrl();
  const res = await fetch(`${baseUrl}/api/wedflow/weather-location/sync-from-project/${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(locationData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Kunne ikke synkronisere stedsinformasjon');
  }
  return res.json();
}

// ─── Helper: Weather Symbol to Emoji ────────────────────────────────────────

export function weatherSymbolToEmoji(symbol: string | undefined | null): string {
  if (!symbol) return '🌤️';
  const s = symbol.toLowerCase();
  if (s.includes('clearsky')) return '☀️';
  if (s.includes('fair')) return '🌤️';
  if (s.includes('partlycloudy')) return '⛅';
  if (s.includes('cloudy')) return '☁️';
  if (s.includes('heavyrain') || s.includes('heavysleet')) return '🌧️';
  if (s.includes('lightrain') || s.includes('rain')) return '🌦️';
  if (s.includes('snow') || s.includes('sleet')) return '❄️';
  if (s.includes('fog')) return '🌫️';
  if (s.includes('thunder')) return '⛈️';
  return '🌤️';
}

/**
 * Get wedding planning weather tips based on conditions
 */
export function getWeddingWeatherTips(weather: BridgeWeatherCurrent | null): string[] {
  if (!weather) return [];
  const tips: string[] = [];
  if (weather.precipitation > 2) tips.push('☂️ Ha paraplyer og Plan B for utendørs seremoni');
  if (weather.precipitation > 0 && weather.precipitation <= 2) tips.push('🌦️ Let nedbør mulig — vurder telt');
  if (weather.windSpeed > 10) tips.push('💨 Sterk vind — sikre dekorasjoner og slør');
  if (weather.temperature < 5) tips.push('🧥 Kaldt — ha varme sjal og pledd for gjestene');
  if (weather.temperature > 25) tips.push('☀️ Varmt — server kalde drikker og sørg for skygge');
  if (weather.temperature >= 15 && weather.temperature <= 25 && weather.precipitation < 1) {
    tips.push('✨ Perfekt vær for utendørsbryllup!');
  }
  if (weather.humidity > 80) tips.push('💧 Høy fuktighet — vurder innendørs alternativ');
  return tips;
}
