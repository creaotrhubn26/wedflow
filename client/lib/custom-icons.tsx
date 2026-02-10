import React, { ReactElement } from "react";
import { EvendiIcon } from "@/components/EvendiIcon";
import { Svg, Path, Rect, Polyline, Circle } from "react-native-svg";

export type IconRenderer = (color: string, size?: number) => ReactElement;

// Custom wedding-specific icons
const CUSTOM_ICONS: Record<string, IconRenderer> = {
  dress: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 3c.5 1 1.5 2 3 2s2.5-1 3-2" />
      <Path d="M9 3 7 7l2.5 3.5" />
      <Path d="M15 3l2 4-2.5 3.5" />
      <Path d="M9.5 13.5 7 21h10l-2.5-7.5" />
      <Path d="M10 7h4" />
    </Svg>
  ),
  flowers: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="8" cy="8" r="2.5" />
      <Circle cx="16" cy="7" r="2.5" />
      <Circle cx="12" cy="13" r="2.5" />
      <Path d="M12 13v6" />
      <Path d="M12 15l-3 4" />
      <Path d="M12 15l3 4" />
    </Svg>
  ),
  decor: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v4" />
      <Path d="M5 12h4" />
      <Path d="M15 12h4" />
      <Path d="M12 17v4" />
      <Polyline points="9 9 12 12 15 9" />
      <Polyline points="9 15 12 12 15 15" />
    </Svg>
  ),
  "cake-tier": (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 14h8c1.1 0 2 .9 2 2v3H6v-3c0-1.1.9-2 2-2Z" />
      <Path d="M9 10h6c1.1 0 2 .9 2 2v2H7v-2c0-1.1.9-2 2-2Z" />
      <Path d="M10.5 6.5c0-1.3 1.5-2.3 1.5-3.5 0 1.2 1.5 2.2 1.5 3.5a1.5 1.5 0 0 1-3 0Z" />
      <Path d="M9 10V8" />
      <Path d="M15 10V8" />
      <Path d="M7 16h10" />
    </Svg>
  ),
  venue: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 21h16" />
      <Path d="M5 10 12 4l7 6" />
      <Rect x="6" y="10" width="12" height="9" rx="1" />
      <Path d="M10 19v-4h4v4" />
    </Svg>
  ),
  tablescape: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="4.5" />
      <Path d="M5 8v8" />
      <Path d="M19 8v8" />
      <Path d="M8 5h2" />
      <Path d="M14 5h2" />
      <Path d="M8 19h2" />
      <Path d="M14 19h2" />
    </Svg>
  ),
  bouquet: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 14 9 21" />
      <Path d="M12 14l3 7" />
      <Path d="M7 10l5 4 5-4" />
      <Circle cx="7" cy="8" r="2" />
      <Circle cx="12" cy="6" r="2" />
      <Circle cx="17" cy="8" r="2" />
    </Svg>
  ),
  hair: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 6c0-2 2-3 4-3s4 1 4 3" />
      <Path d="M8 6v3c0 3 1.5 5 4 5s4-2 4-5V6" />
      <Path d="M9 14v5" />
      <Path d="M15 14v5" />
    </Svg>
  ),
  photos: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="4" y="6" width="16" height="12" rx="2" />
      <Path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      <Path d="M16 8h2" />
    </Svg>
  ),
  invitation: (color, size = 20) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="4" y="5" width="16" height="14" rx="2" />
      <Path d="m4 8 8 5 8-5" />
      <Path d="M10 9c0 1 .9 2 2 2s2-1 2-2" />
    </Svg>
  ),
};

const FEATHER_FALLBACK = new Set([
  "heart", "camera", "video", "image", "star", "gift", "home", "music",
  "scissors", "car", "utensils", "flower", "cake", "clipboard", "mail",
  "calendar", "users", "map-pin", "phone", "globe", "award", "bookmark",
]);

export function getAllIconOptions() {
  return [...FEATHER_FALLBACK, ...Object.keys(CUSTOM_ICONS)];
}

export function renderIcon(name: string, color: string, size = 20) {
  const custom = CUSTOM_ICONS[name];
  if (custom) return custom(color, size);
  return <EvendiIcon name={name as any} size={size} color={color} />;
}
