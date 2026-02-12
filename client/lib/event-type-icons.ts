/**
 * Event Type Icons — Maps event types to bundled PNG images and EvendiIcon fallbacks.
 *
 * 17 event types have bundled PNGs.
 * The remaining 2 (team_building, awards_night)
 * fall back to EvendiIcon (Feather icons).
 * Admin can override any event type icon with a custom image URI
 * stored in AsyncStorage via useCustomEventIcons().
 */
import type { EventType } from "@shared/event-types";
import type { ImageSourcePropType } from "react-native";

// ─── Default EvendiIcon name per event type ─────────────────────
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  wedding: "heart",
  confirmation: "star",
  birthday: "gift",
  anniversary: "award",
  engagement: "diamond" as string,  // feather doesn't have diamond, fallback below
  baby_shower: "smile",
  conference: "mic",
  seminar: "clipboard",
  kickoff: "target",
  summer_party: "sun",
  christmas_party: "gift",
  team_building: "users",
  product_launch: "zap",
  trade_fair: "globe",
  corporate_anniversary: "award",
  awards_night: "award",
  employee_day: "thumbs-up",
  onboarding_day: "user-plus",
  corporate_event: "briefcase",
};

// Fix icons that don't exist in Feather set
const FEATHER_FIXES: Record<string, string> = {
  diamond: "hexagon",
  mic: "mic",
};

/**
 * Get the EvendiIcon name for an event type.
 */
export function getEventTypeIcon(type: EventType): string {
  const icon = EVENT_TYPE_ICONS[type] ?? "calendar";
  return FEATHER_FIXES[icon] ?? icon;
}

// ─── Accent colors per event type ───────────────────────────────
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  wedding: "#ec4899",
  confirmation: "#8b5cf6",
  birthday: "#f59e0b",
  anniversary: "#ef4444",
  engagement: "#ec4899",
  baby_shower: "#06b6d4",
  conference: "#3b82f6",
  seminar: "#6366f1",
  kickoff: "#f97316",
  summer_party: "#eab308",
  christmas_party: "#ef4444",
  team_building: "#10b981",
  product_launch: "#f97316",
  trade_fair: "#6366f1",
  corporate_anniversary: "#f59e0b",
  awards_night: "#f59e0b",
  employee_day: "#10b981",
  onboarding_day: "#3b82f6",
  corporate_event: "#64748b",
};

/**
 * Get accent color for an event type. Admin can override.
 */
export function getEventTypeColor(
  type: EventType,
  customColors?: Record<string, string>,
): string {
  return customColors?.[type] ?? EVENT_TYPE_COLORS[type] ?? "#64748b";
}

// ─── Bundled PNG images ─────────────────────────────────────────
const BUNDLED_IMAGES: Partial<Record<EventType, ImageSourcePropType>> = {
  wedding: require("@/../../assets/images/event_types/Evendi_event_type_wedding.png"),
  confirmation: require("@/../../assets/images/event_types/Evendi_event_type_conformation.png"),
  birthday: require("@/../../assets/images/event_types/Evendi_event_type_birthday.png"),
  anniversary: require("@/../../assets/images/event_types/Evendi_event_type_anniversary.png"),
  engagement: require("@/../../assets/images/event_types/Evendi_event_type_engagement.png"),
  baby_shower: require("@/../../assets/images/event_types/Evendi_event_type_babyshower.png"),
  christmas_party: require("@/../../assets/images/event_types/Evendi_event_type_julebord.png"),
  summer_party: require("@/../../assets/images/event_types/Evendi_event_type_sommer.png"),
  kickoff: require("@/../../assets/images/event_types/Evendi_event_type_kickoff.png"),
  seminar: require("@/../../assets/images/event_types/Evendi_event_type_seminar.png"),
  corporate_event: require("@/../../assets/images/event_types/Evendi_event_type_corporate_event.png"),
  corporate_anniversary: require("@/../../assets/images/event_types/Evendi_event_type_corporate_anniversary.png"),
  employee_day: require("@/../../assets/images/event_types/Evendi_event_type_employee_day.png"),
  onboarding_day: require("@/../../assets/images/event_types/Evendi_event_type_onbording_day.png"),
  trade_fair: require("@/../../assets/images/event_types/Evendi_event_type_trade_fair.png"),
  product_launch: require("@/../../assets/qa-games/qna-product-launch.png"),
  conference: require("@/../../assets/images/event_types/Evendi_event_type_conference.png"),
};

/**
 * Get the image source for an event type if available.
 * Returns custom URI, bundled PNG, or null (meaning use icon instead).
 */
export function getEventTypeImage(
  type: EventType,
  customIcons?: Record<string, string>,
): ImageSourcePropType | null {
  if (customIcons?.[type]) {
    return { uri: customIcons[type] };
  }
  return BUNDLED_IMAGES[type] ?? null;
}
