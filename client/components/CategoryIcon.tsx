import React from "react";
import { Feather } from "@expo/vector-icons";

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
}

// Icon mapping from category names to Feather icon names
const ICON_MAP: Record<string, string> = {
  photography: "camera",
  videography: "video",
  catering: "utensils",
  cake: "cake",
  flowers: "flower-2",
  decoration: "sparkles",
  venue: "map-pin",
  music: "music",
  transportation: "car",
  invitations: "mail",
  jewelry: "diamond",
  planning: "clipboard",
  hair: "trim-2",
  makeup: "smile",
  "wedding-dress": "award",
  "groom-suit": "briefcase",
  favors: "gift",
  rentals: "tool",
  lighting: "zap",
  dj: "headphones",
  bar: "wine",
  tent: "home",
  chair: "inbox",
  table: "square",
  programs: "book",
  "napkin-design": "feather",
  "table-number": "hash",
  "name-card": "user",
  "escort-card": "user-check",
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, size = 24, color = "#000" }) => {
  const iconName = ICON_MAP[name.toLowerCase()] || "briefcase";
  return <Feather name={iconName} size={size} color={color} />;
};
