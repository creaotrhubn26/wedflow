/**
 * useEventType — Hook for event-type-aware feature visibility
 * 
 * Reads the current user's eventType from their couple profile
 * and provides helpers to conditionally show/hide features.
 */
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCoupleProfile } from "@/lib/api-couples";
import { getEventConfig, isFeatureEnabled, type EventType, type EventTypeConfig } from "@shared/event-types";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface UseEventTypeResult {
  /** The current event type (defaults to "wedding") */
  eventType: EventType;
  /** The full event config for the current type */
  config: EventTypeConfig;
  /** Whether a specific feature is enabled for this event type */
  hasFeature: (feature: keyof EventTypeConfig["features"]) => boolean;
  /** Whether this is a wedding event */
  isWedding: boolean;
  /** Whether this is a corporate/B2B event */
  isCorporate: boolean;
  /** Loading state */
  isLoading: boolean;
}

export function useEventType(): UseEventTypeResult {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["couple-event-type"],
    queryFn: async () => {
      const sessionStr = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!sessionStr) return null;
      const session = JSON.parse(sessionStr);
      if (!session.sessionToken) return null;
      return getCoupleProfile(session.sessionToken);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const eventType: EventType = (profile?.eventType as EventType) || "wedding";
  const config = getEventConfig(eventType);

  return {
    eventType,
    config,
    hasFeature: (feature) => isFeatureEnabled(eventType, feature),
    isWedding: eventType === "wedding",
    isCorporate: config.category === "corporate",
    isLoading,
  };
}
