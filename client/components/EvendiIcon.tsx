/**
 * EvendiIcon — Bold filled icon system for the Evendi app.
 *
 * Style: 100% filled, thick visual mass, soft rounded shapes,
 * uniform blue (#1E6BFF), no outline, no gradient.
 *
 * Drop-in replacement for <Feather> — same `name` + `size` + `color` API.
 * Maps Feather icon names → Ionicons filled equivalents.
 */
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// ─── Feather → Ionicons (filled) mapping ────────────────────────────────────

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  // Navigation & arrows
  "arrow-down": "arrow-down",
  "arrow-left": "arrow-back",
  "arrow-right": "arrow-forward",
  "chevron-down": "chevron-down",
  "chevron-left": "chevron-back",
  "chevron-right": "chevron-forward",
  "chevron-up": "chevron-up",

  // Actions
  check: "checkmark",
  "check-circle": "checkmark-circle",
  "check-square": "checkbox",
  plus: "add",
  "plus-circle": "add-circle",
  minus: "remove",
  x: "close",
  "x-circle": "close-circle",
  edit: "create",
  copy: "copy",
  save: "save",
  send: "send",
  search: "search",
  filter: "filter",
  refresh: "refresh",
  "refresh-cw": "refresh",
  "rotate-ccw": "refresh",
  "rotate-cw": "refresh",
  download: "download",
  "download-cloud": "cloud-download",
  upload: "cloud-upload",
  trash: "trash",
  "trash-2": "trash",
  move: "move",
  scissors: "cut",
  printer: "print",
  "external-link": "open",

  // Communication
  mail: "mail",
  "message-circle": "chatbubble",
  "message-square": "chatbox",
  phone: "call",
  mic: "mic",
  "video": "videocam",
  headphones: "headset",

  // Media
  camera: "camera",
  "camera-off": "camera",
  image: "image",
  film: "film",
  play: "play",
  "play-circle": "play-circle",
  music: "musical-notes",
  aperture: "aperture",

  // Interface
  home: "home",
  settings: "settings",
  sliders: "options",
  globe: "globe",
  grid: "grid",
  layout: "apps",
  list: "list",
  layers: "layers",
  link: "link",
  hash: "text",
  loader: "sync",
  slash: "ban",

  // User
  user: "person",
  "user-plus": "person-add",
  users: "people",
  "log-in": "log-in",
  "log-out": "log-out",

  // Status & info
  info: "information-circle",
  "help-circle": "help-circle",
  "alert-circle": "alert-circle",
  "alert-triangle": "warning",
  bell: "notifications",
  "bell-off": "notifications-off",
  shield: "shield",
  lock: "lock-closed",
  key: "key",
  eye: "eye",
  "eye-off": "eye-off",

  // Objects
  calendar: "calendar",
  clock: "time",
  heart: "heart",
  star: "star",
  bookmark: "bookmark",
  tag: "pricetag",
  gift: "gift",
  award: "trophy",
  target: "locate",
  "credit-card": "card",
  "dollar-sign": "cash",
  "shopping-bag": "bag",
  briefcase: "briefcase",
  clipboard: "clipboard",
  file: "document",
  "file-text": "document-text",
  folder: "folder",
  inbox: "mail-open",
  package: "cube",
  truck: "car",
  smartphone: "phone-portrait",
  map: "map",
  "map-pin": "location",
  navigation: "navigate",
  "book-open": "book",
  coffee: "cafe",
  instagram: "logo-instagram",

  // Weather
  sun: "sunny",
  moon: "moon",
  cloud: "cloud",
  "cloud-off": "cloud-offline",
  "cloud-rain": "rainy",
  droplet: "water",
  wind: "leaf",
  thermometer: "thermometer",

  // Data & charts
  "trending-up": "trending-up",
  activity: "pulse",
  zap: "flash",

  // Feather-only — best-effort Ionicons match
  "share-2": "share",
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type EvendiIconName = keyof typeof ICON_MAP;

// ─── Component ──────────────────────────────────────────────────────────────

interface EvendiIconProps {
  name: string;
  size?: number;
  color?: string;
  fill?: string;
  style?: any;
}

export function EvendiIcon({ name, size = 24, color = "#1E6BFF", style }: EvendiIconProps) {
  const ionName = ICON_MAP[name] ?? "ellipse";
  return <Ionicons name={ionName} size={size} color={color} style={style} />;
}

// Re-export glyphMap-compatible type for places that reference Feather.glyphMap
export const EvendiIconGlyphMap = ICON_MAP;

export default EvendiIcon;
