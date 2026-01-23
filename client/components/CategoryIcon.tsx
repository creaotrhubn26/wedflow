import React from "react";
import { Feather } from "@expo/vector-icons";

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
}

// Icon mapping from category names to Feather icon names
const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  // Wedding icons
  "camera": "camera",
  "photographer": "camera",
  "film": "video",
  "videographer": "video",
  "flower": "flower",
  "flowers": "flower",
  "florist": "flower",
  "coffee": "coffee",
  "catering": "coffee",
  "caterer": "coffee",
  "music": "music",
  "dj": "music",
  "cake": "heart",
  "cakes": "heart",
  "makeup": "zap",
  "tiara": "crown",
  "jewelry": "circle",
  "veil": "feather",
  "shoes": "shopping-bag",
  "arch": "triangle",
  "garland": "leaf",
  "candles": "zap",
  "chandelier": "droplet",
  "dance-floor": "grid",
  "cutting-cake": "knife",
  "sparklers": "star",
  "guestbook": "book",
  "favors": "gift",
  "photobooth": "camera",
  "tent": "home",
  "gazebo": "home",
  "string-lights": "star",
  "honeymoon": "heart",
  "first-dance": "move",
  "boutonniere": "flower",
  "ring-cushion": "square",
  "unity-candle": "flame",
  "lawn-games": "grid",
  
  // Religious icons
  "church": "inbox",
  "mosque": "home",
  "synagogue": "home",
  "chapel": "inbox",
  "temple": "home",
  "cathedral": "inbox",
  "altar": "home",
  "cross": "x",
  "holy-candles": "zap",
  "religious-ceremony": "book",
  
  // Multi-faith icons
  "gurudwara": "home",
  "hindu-temple": "home",
  "pagoda": "home",
  "shinto-shrine": "home",
  "menorah": "zap",
  "om-symbol": "circle",
  "dharma-wheel": "circle",
  "faith-hands": "hand-open",
  "blessing": "hand-open",
  "meditation": "wind",
  
  // Stationery/invitation icons
  "invitation-card": "mail",
  "invitasjoner": "mail",
  "place-cards": "file-text",
  "seating-chart": "grid",
  "menu-card": "book",
  "thank-you-card": "mail",
  "rsvp-card": "inbox",
  "direction-cards": "map",
  "programs": "book",
  "napkin-design": "feather",
  "table-number": "hash",
  "name-card": "user",
  "escort-card": "user-check",
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, size = 24, color = "#000" }) => {
  const iconName = ICON_MAP[name.toLowerCase()] || "briefcase";
  return <Feather name={iconName} size={size} color={color} />;
};

        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11L4.23 5.43C4.5 4.85 5.07 4.5 5.69 4.5H18.31C18.93 4.5 19.5 4.85 19.77 5.43L22 11V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="7" cy="17" r="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="17" cy="17" r="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "mail":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "sparkles":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
            <Path d="M5 3V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M19 17V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3 5H7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 19H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "star":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
          </Svg>
        );

      case "gift":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="20 12 20 22 4 22 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="2" y="7" width="20" height="5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 22V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "cocktail":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M6 2L3 14H21L18 2H6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 14V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 22H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="8" r="1.5" fill={color} />
            <Circle cx="9" cy="5" r="1" fill={color} />
            <Circle cx="15" cy="5" r="1" fill={color} />
          </Svg>
        );

      case "aperture":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14.31 8L20.05 17.94" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9.69 8H21.17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7.38 12L13.12 2.06" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9.69 16L3.95 6.06" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14.31 16H2.83" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16.62 12L10.88 21.94" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "diamond":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M2.7 10.3L12 21.5L21.3 10.3L20.2 2.5H3.8L2.7 10.3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 21.5V10.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 10.3L2.7 10.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 10.3L21.3 10.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 10.3L3.8 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 10.3L20.2 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "suit":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 8L12 3L19 8V21H5V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 11H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="6" r="1" fill={color} />
            <Path d="M5 21H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "bed":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M2 4V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M2 8H22V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22 4V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="7" cy="10" r="1.5" stroke={color} strokeWidth="1.5" />
          </Svg>
        );

      case "heart":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12084 20.84 4.61Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case "wedding-couple":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Brud */}
            <Circle cx="8" cy="5" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M8 7C6 7 5 8 5 10V14L8 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 7C10 7 11 8 11 10V14L8 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Brudekjole detalj */}
            <Path d="M5 14C5 14 6 13 8 13C10 13 11 14 11 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Brudgom */}
            <Circle cx="16" cy="5" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M16 7V14L14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 7V14L18 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dress/suit detalj */}
            <Path d="M14 9L16 11L18 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Hjerte mellom dem */}
            <Path d="M11 3C11 3 10.5 2 9.5 2C8.5 2 8 3 8 3.5C8 3 7.5 2 6.5 2C5.5 2 5 3 5 3C5 4.5 7 6 8 6.5C9 6 11 4.5 11 3Z" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "bride":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hode */}
            <Circle cx="12" cy="6" r="3" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            {/* Slør */}
            <Path d="M9 5C9 5 9 3 12 3C15 3 15 5 15 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 6L7 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M16 6L17 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {/* Kjole */}
            <Path d="M12 9C8 9 6 11 6 14V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 9C16 9 18 11 18 14V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Bukett */}
            <Circle cx="9" cy="16" r="1.5" fill={color} fillOpacity="0.3" />
            <Circle cx="7.5" cy="17.5" r="1" fill={color} fillOpacity="0.3" />
            <Circle cx="10.5" cy="17.5" r="1" fill={color} fillOpacity="0.3" />
          </Svg>
        );

      case "groom":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hode */}
            <Circle cx="12" cy="6" r="3" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            {/* Hatt */}
            <Path d="M9 4H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Rect x="10" y="2" width="4" height="2" rx="0.5" stroke={color} strokeWidth="1.5" />
            {/* Kropp/Dress */}
            <Path d="M12 9V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M12 9L8 11V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 9L16 11V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sløyfe */}
            <Path d="M10 11L12 13L14 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="12" r="0.5" fill={color} />
            {/* Bukse-linje */}
            <Path d="M8 17H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );

      case "rings":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre ring */}
            <Circle cx="9" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="9" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <Circle cx="9" cy="9" r="1.5" fill={color} fillOpacity="0.3" />
            
            {/* Høyre ring (overlappende) */}
            <Circle cx="15" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="15" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
            <Circle cx="15" cy="9" r="1.5" fill={color} fillOpacity="0.3" />
            
            {/* Glimmer effekt */}
            <Path d="M7 7L8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M17 7L16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );

      case "champagne":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre glass */}
            <Path d="M7 8L5 15C5 16 5.5 17 7 17C8.5 17 9 16 9 15L7 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Path d="M7 17V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M5 21H9" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M5 8H9" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Høyre glass */}
            <Path d="M17 8L15 15C15 16 15.5 17 17 17C18.5 17 19 16 19 15L17 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Path d="M17 17V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15 21H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15 8H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Bobler */}
            <Circle cx="7" cy="12" r="0.5" fill={color} />
            <Circle cx="8" cy="10" r="0.5" fill={color} />
            <Circle cx="17" cy="12" r="0.5" fill={color} />
            <Circle cx="16" cy="10" r="0.5" fill={color} />
            
            {/* Skål-effekt (glassene møtes) */}
            <Path d="M9 6L15 6" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
          </Svg>
        );

      case "church":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tårn/spir */}
            <Path d="M12 2L13 6L12 6L11 6L12 2Z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <Rect x="10.5" y="6" width="3" height="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            {/* Kors */}
            <Path d="M12 2V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M11 3H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hovedbygg */}
            <Path d="M6 10L12 6L18 10V21H6V10Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Dør */}
            <Rect x="10" y="16" width="4" height="5" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
            
            {/* Vinduer */}
            <Path d="M8 12L9 13L8 14L7 13L8 12Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.2" />
            <Path d="M16 12L17 13L16 14L15 13L16 12Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "bouquet":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Blomster */}
            <Circle cx="10" cy="8" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Circle cx="14" cy="8" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Circle cx="12" cy="5" r="2.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            <Circle cx="8" cy="11" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Circle cx="16" cy="11" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            
            {/* Sentre i blomstene */}
            <Circle cx="10" cy="8" r="0.8" fill={color} />
            <Circle cx="14" cy="8" r="0.8" fill={color} />
            <Circle cx="12" cy="5" r="0.8" fill={color} />
            
            {/* Stilker */}
            <Path d="M10 10L9 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M14 10L15 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12 7L12 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Bånd */}
            <Path d="M8 16C8 16 10 15 12 15C14 15 16 16 16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 16L7 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M15 16L17 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12 16V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );

      case "dancing":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Par som danser */}
            {/* Kvinne - hode */}
            <Circle cx="9" cy="5" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            {/* Kvinne - kropp */}
            <Path d="M9 6.5L7 10L9 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 6.5L11 10L9 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Kvinne - ben */}
            <Path d="M9 15L8 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M9 15L10 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Mann - hode */}
            <Circle cx="15" cy="5" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            {/* Mann - kropp */}
            <Path d="M15 6.5L13 10L15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M15 6.5L17 10L15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Mann - ben */}
            <Path d="M15 15L14 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M15 15L16 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Musikknote */}
            <Circle cx="12" cy="3" r="0.8" fill={color} fillOpacity="0.5" />
            <Path d="M12 3V1.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
            
            {/* Gulv-linje */}
            <Path d="M4 21H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
          </Svg>
        );

      case "wedding-cake":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Nederste lag */}
            <Ellipse cx="12" cy="18" rx="7" ry="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            <Path d="M5 18V16C5 15 6 14 12 14C18 14 19 15 19 16V18" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Midtre lag */}
            <Ellipse cx="12" cy="12" rx="5" ry="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            <Path d="M7 12V10C7 9.5 8 9 12 9C16 9 17 9.5 17 10V12" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Øverste lag */}
            <Ellipse cx="12" cy="7" rx="3" ry="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            <Path d="M9 7V6C9 5.5 10 5 12 5C14 5 15 5.5 15 6V7" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Bryllupspar på toppen */}
            <Circle cx="10.5" cy="3.5" r="0.8" fill={color} />
            <Circle cx="13.5" cy="3.5" r="0.8" fill={color} />
            <Path d="M10.5 4.3V5" stroke={color} strokeWidth="1" strokeLinecap="round" />
            <Path d="M13.5 4.3V5" stroke={color} strokeWidth="1" strokeLinecap="round" />
            
            {/* Dekorasjon */}
            <Circle cx="8" cy="15" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="16" cy="15" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="9" cy="10" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="15" cy="10" r="0.5" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      case "confetti":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Konfetti partikler */}
            <Rect x="4" y="5" width="2" height="4" rx="0.5" fill={color} fillOpacity="0.6" transform="rotate(20 5 7)" />
            <Rect x="8" y="3" width="1.5" height="3" rx="0.5" fill={color} fillOpacity="0.4" transform="rotate(-15 8.75 4.5)" />
            <Circle cx="14" cy="6" r="1.2" fill={color} fillOpacity="0.5" />
            <Circle cx="18" cy="8" r="0.8" fill={color} fillOpacity="0.7" />
            
            <Path d="M6 10L7 12L6 14L4 12L6 10Z" fill={color} fillOpacity="0.5" />
            <Path d="M16 12L17.5 13.5L16 15L14.5 13.5L16 12Z" fill={color} fillOpacity="0.6" />
            
            <Rect x="10" y="11" width="2" height="3" rx="0.5" fill={color} fillOpacity="0.4" transform="rotate(45 11 12.5)" />
            <Rect x="19" y="13" width="1.5" height="2.5" rx="0.5" fill={color} fillOpacity="0.5" transform="rotate(-30 19.75 14.25)" />
            
            <Circle cx="7" cy="17" r="1" fill={color} fillOpacity="0.6" />
            <Circle cx="12" cy="16" r="1.3" fill={color} fillOpacity="0.4" />
            <Circle cx="17" cy="18" r="0.9" fill={color} fillOpacity="0.7" />
            
            <Path d="M4 19L5 20L4 21L3 20L4 19Z" fill={color} fillOpacity="0.5" />
            <Path d="M14 19L15 20L14 21L13 20L14 19Z" fill={color} fillOpacity="0.6" />
            <Path d="M20 20L21 21L20 22L19 21L20 20Z" fill={color} fillOpacity="0.4" />
            
            <Rect x="9" y="19" width="1.5" height="2" rx="0.5" fill={color} fillOpacity="0.5" transform="rotate(25 9.75 20)" />
          </Svg>
        );

      case "balloons":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Ballong 1 - Hjerte */}
            <Path 
              d="M7 9C7 9 6 8 6 6.5C6 5 7 4 8.5 4C9.5 4 10 4.5 10 5C10 4.5 10.5 4 11.5 4C13 4 14 5 14 6.5C14 8 13 9 13 9C13 10 11.5 12 10 13C8.5 12 7 10 7 9Z" 
              stroke={color} 
              strokeWidth="1.5" 
              fill={color} 
              fillOpacity="0.1" 
            />
            <Path d="M10 13V17" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M10 17L8 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M10 17L12 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Ballong 2 - Hjerte */}
            <Path 
              d="M14 7C14 7 13 6 13 4.5C13 3 14 2 15.5 2C16.5 2 17 2.5 17 3C17 2.5 17.5 2 18.5 2C20 2 21 3 21 4.5C21 6 20 7 20 7C20 8 18.5 10 17 11C15.5 10 14 8 14 7Z" 
              stroke={color} 
              strokeWidth="1.5" 
              fill={color} 
              fillOpacity="0.15" 
            />
            <Path d="M17 11V15" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M17 15L15 20" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M17 15L19 20" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Glimmer */}
            <Circle cx="9" cy="7" r="0.5" fill="#ffffff" fillOpacity="0.8" />
            <Circle cx="16" cy="5" r="0.5" fill="#ffffff" fillOpacity="0.8" />
          </Svg>
        );

      case "certificate":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Dokument */}
            <Path d="M6 2H18C19 2 20 3 20 4V18C20 19 19 20 18 20H6C5 20 4 19 4 18V4C4 3 5 2 6 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.03" />
            
            {/* Dekorative hjørner */}
            <Path d="M6 4L8 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M6 4L6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M18 4L16 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M18 4L18 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Tekst-linjer */}
            <Path d="M8 8H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M8 11H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M8 14H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hjerte/segl */}
            <Path d="M13.5 16.5C13.5 16.5 13 16 13 15.2C13 14.5 13.5 14 14.2 14C14.7 14 15 14.3 15 14.5C15 14.3 15.3 14 15.8 14C16.5 14 17 14.5 17 15.2C17 16 16.5 16.5 16.5 16.5C16.5 17 15.5 18 15 18.5C14.5 18 13.5 17 13.5 16.5Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            
            {/* Bånd */}
            <Path d="M15 18.5V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M14 20L15 22L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case "rose":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Rose-hode (spiralform) */}
            <Circle cx="12" cy="9" r="1.5" fill={color} fillOpacity="0.3" />
            <Path d="M12 7.5C10.5 7.5 9.5 8.5 9.5 9C9.5 9.5 10 10 10.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <Path d="M14 7C15 7.5 15.5 8.5 15.5 9.5C15.5 11 14 12 12.5 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <Path d="M10 11C9 11.5 8 12.5 8 14C8 15.5 9.5 16.5 11 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <Path d="M13.5 11.5C15 12 16 13 16 14.5C16 16 14.5 16.5 13 16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* Blader */}
            <Path d="M7 13C7 13 8 12 9 13C9 13 9 14 8 15C7 14 7 13 7 13Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.2" />
            <Path d="M17 13C17 13 16 12 15 13C15 13 15 14 16 15C17 14 17 13 17 13Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.2" />
            
            {/* Stilk */}
            <Path d="M12 16V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Blad på stilk */}
            <Path d="M12 18C12 18 10 17.5 9 18.5C10 19.5 12 19 12 19" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.2" />
          </Svg>
        );

      case "bells":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre klokke */}
            <Path d="M7 8C7 6 8 4 10 4C12 4 13 6 13 8V11C13 12 12 13 10 13C8 13 7 12 7 11V8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Circle cx="10" cy="14" r="1" fill={color} />
            <Path d="M10 15V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Høyre klokke */}
            <Path d="M11 6C11 4 12 2 14 2C16 2 17 4 17 6V9C17 10 16 11 14 11C12 11 11 10 11 9V6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Circle cx="14" cy="12" r="1" fill={color} />
            <Path d="M14 13V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Bue på toppen */}
            <Path d="M9 4C9 4 10 2 12 2C14 2 15 4 15 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="1.5" r="0.8" fill={color} />
            
            {/* Lydbølger */}
            <Path d="M5 10C4 10 3 9 3 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <Path d="M19 8C20 8 21 7 21 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            
            {/* Bånd */}
            <Path d="M8 16L6 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M10 16L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M14 16L16 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );

      case "table-setting":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tallerken */}
            <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.03" />
            
            {/* Gaffel (venstre) */}
            <Path d="M3 6V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M4.5 6V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M6 6V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M4.5 10V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Kniv (høyre) */}
            <Path d="M18 6V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M18 6L20 8L18 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
            
            {/* Glass (topp) */}
            <Path d="M15 3L14 7H18L17 3H15Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Path d="M16 7V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Ellipse cx="16" cy="9" rx="1.5" ry="0.5" stroke={color} strokeWidth="1.2" />
            
            {/* Dekorativt hjerte på tallerkenen */}
            <Path d="M12 10C12 10 11.5 9.5 11.5 9C11.5 8.5 12 8 12.5 8C13 8 13 8.5 13 8.5C13 8.5 13 8 13.5 8C14 8 14.5 8.5 14.5 9C14.5 9.5 14 10 14 10C14 10.5 13 11.5 12.5 12C12 11.5 12 10.5 12 10Z" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "limousine":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Bil-kropp */}
            <Path d="M2 13H22V16C22 17 21 18 20 18H4C3 18 2 17 2 16V13Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Tak */}
            <Path d="M4 13V11C4 10 5 9 6 9H9L10 11H14L15 9H18C19 9 20 10 20 11V13" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Vinduer */}
            <Rect x="6" y="10" width="3" height="2.5" rx="0.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            <Rect x="11" y="10" width="2" height="2.5" rx="0.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            <Rect x="15" y="10" width="3" height="2.5" rx="0.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            
            {/* Hjul */}
            <Circle cx="6" cy="18" r="2" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.05" />
            <Circle cx="18" cy="18" r="2" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.05" />
            <Circle cx="6" cy="18" r="0.8" fill={color} />
            <Circle cx="18" cy="18" r="0.8" fill={color} />
            
            {/* Frontlys */}
            <Circle cx="21" cy="15" r="0.8" fill={color} fillOpacity="0.3" />
            
            {/* Hjerte-dekorasjon */}
            <Path d="M12 6C12 6 11.5 5.5 11.5 5C11.5 4.5 12 4 12.5 4C13 4 13 4.5 13 4.5C13 4.5 13 4 13.5 4C14 4 14.5 4.5 14.5 5C14.5 5.5 14 6 14 6C14 6.5 13 7.5 12.5 8C12 7.5 12 6.5 12 6Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="0.8" />
          </Svg>
        );

      case "microphone":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Mikrofon-hode */}
            <Rect x="9" y="2" width="6" height="10" rx="3" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            <Path d="M10 4H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            <Path d="M10 6H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            <Path d="M10 8H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            <Path d="M10 10H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            
            {/* Bøyle */}
            <Path d="M6 9C6 9 6 5 12 5C18 5 18 9 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Stang */}
            <Path d="M12 12V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Fot */}
            <Path d="M9 18H15C15 18 16 18 16 19V20C16 21 15 22 14 22H10C9 22 8 21 8 20V19C8 18 9 18 9 18Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Lydbølger */}
            <Path d="M20 8C20 8 21 9 21 12C21 15 20 16 20 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <Path d="M4 8C4 8 3 9 3 12C3 15 4 16 4 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "love-letter":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Konvolutt */}
            <Path d="M4 6L12 13L20 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4 6H20V18C20 19 19 20 18 20H6C5 20 4 19 4 18V6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Konvolutt-flap */}
            <Path d="M4 6L12 2L20 6" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Hjerte-segl */}
            <Path 
              d="M14 10C14 10 13.5 9.5 13.5 9C13.5 8.5 14 8 14.5 8C15 8 15.5 8.5 15.5 8.5C15.5 8.5 16 8 16.5 8C17 8 17.5 8.5 17.5 9C17.5 9.5 17 10 17 10C17 10.5 16 11.5 15.5 12C15 11.5 14 10.5 14 10Z" 
              fill={color} 
              fillOpacity="0.3" 
              stroke={color} 
              strokeWidth="1"
            />
            
            {/* Frimerke */}
            <Rect x="16" y="14" width="3" height="4" rx="0.5" stroke={color} strokeWidth="1.2" strokeDasharray="1 1" fill="none" />
          </Svg>
        );

      case "calendar-heart":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kalender */}
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            <Path d="M3 9H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Topp-klamme */}
            <Path d="M7 4V2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M17 4V2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Datoer (prikker) */}
            <Circle cx="7" cy="12" r="0.8" fill={color} fillOpacity="0.3" />
            <Circle cx="10" cy="12" r="0.8" fill={color} fillOpacity="0.3" />
            <Circle cx="13" cy="12" r="0.8" fill={color} fillOpacity="0.3" />
            <Circle cx="16" cy="12" r="0.8" fill={color} fillOpacity="0.3" />
            <Circle cx="19" cy="12" r="0.8" fill={color} fillOpacity="0.3" />
            
            {/* Hjerte på dato */}
            <Path 
              d="M10 15C10 15 9.5 14.5 9.5 14C9.5 13.5 10 13 10.5 13C11 13 11.5 13.5 11.5 13.5C11.5 13.5 12 13 12.5 13C13 13 13.5 13.5 13.5 14C13.5 14.5 13 15 13 15C13 16 12 17 11.5 17.5C11 17 10 16 10 15Z" 
              fill={color} 
              stroke={color} 
              strokeWidth="1.2"
            />
          </Svg>
        );

      case "location-heart":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Location pin */}
            <Path d="M12 2C8 2 5 5 5 9C5 14 12 22 12 22C12 22 19 14 19 9C19 5 16 2 12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Hjerte inni */}
            <Path 
              d="M10 8C10 8 9.5 7.5 9.5 7C9.5 6.5 10 6 10.5 6C11 6 11.5 6.5 11.5 6.5C11.5 6.5 12 6 12.5 6C13 6 13.5 6.5 13.5 7C13.5 7.5 13 8 13 8C13 9 12 10 11.5 10.5C11 10 10 9 10 8Z" 
              fill={color} 
              fillOpacity="0.4"
              stroke={color} 
              strokeWidth="1.2"
            />
          </Svg>
        );

      case "gift-box":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hovedboks */}
            <Rect x="4" y="10" width="16" height="12" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            <Path d="M12 10V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Lokk */}
            <Rect x="3" y="7" width="18" height="3" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
            <Path d="M12 7V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Sløyfe på toppen */}
            <Path d="M12 2V7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M8 3C8 3 9 2 12 2C15 2 16 3 16 3C16 4 15 5 12 5C9 5 8 4 8 3Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M7 4C7 4 8 3 9 4C8 5 7 5 7 4Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
            <Path d="M17 4C17 4 16 3 15 4C16 5 17 5 17 4Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
            
            {/* Dekorasjon på boks */}
            <Circle cx="8" cy="15" r="1" fill={color} fillOpacity="0.2" />
            <Circle cx="16" cy="15" r="1" fill={color} fillOpacity="0.2" />
            <Circle cx="8" cy="19" r="1" fill={color} fillOpacity="0.2" />
            <Circle cx="16" cy="19" r="1" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "invitation-card":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kort */}
            <Rect x="3" y="2" width="18" height="20" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Dekorative hjørner */}
            <Path d="M5 4L7 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M5 4L5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M19 4L17 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M19 4L19 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Tekst-linjer */}
            <Path d="M8 8H16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <Path d="M8 12H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <Path d="M8 15H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <Path d="M8 18H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            
            {/* Dekorativ linje */}
            <Path d="M6 10H18" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
            
            {/* Bånd på siden */}
            <Path d="M2 10L3 14L2 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill={color} fillOpacity="0.1" />
          </Svg>
        );

      case "menu-card":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kort - folder */}
            <Path d="M3 3H21V18C21 19 20 20 19 20H5C4 20 3 19 3 18V3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.02" />
            
            {/* Fold i midten */}
            <Path d="M12 3V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            
            {/* Menypunkter venstre side */}
            <Path d="M6 6H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M6 8H9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <Path d="M6 11H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M6 13H9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            
            {/* Menypunkter høyre side */}
            <Path d="M14 6H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M15 8H18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <Path d="M14 11H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M15 13H18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            
            {/* Dekorasjon */}
            <Path d="M7 16C7 16 8 15 12 15C16 15 17 16 17 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "seating-card":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kort */}
            <Rect x="4" y="3" width="16" height="18" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Navn-linje */}
            <Path d="M8 8H16" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            
            {/* Bord-nummer */}
            <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.05" />
            <Path d="M11 13H13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M12 12V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Dekorativ linje */}
            <Path d="M7 18H17" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4" />
          </Svg>
        );

      case "thank-you-card":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kort */}
            <Rect x="3" y="3" width="18" height="18" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Hjerte i sentrum */}
            <Path 
              d="M10 9C10 9 9.5 8.5 9.5 8C9.5 7.5 10 7 10.5 7C11 7 11.5 7.5 11.5 7.5C11.5 7.5 12 7 12.5 7C13 7 13.5 7.5 13.5 8C13.5 8.5 13 9 13 9C13 9.5 12 10.5 11.5 11C11 10.5 10 9.5 10 9Z" 
              fill={color} 
              fillOpacity="0.3"
              stroke={color}
              strokeWidth="1.2"
            />
            
            {/* Tekst */}
            <Path d="M8 14H16" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            <Path d="M8 17H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            
            {/* Signatur-linje */}
            <Path d="M8 20H12" stroke={color} strokeWidth="1" strokeLinecap="round" />
          </Svg>
        );

      case "name-card":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kort */}
            <Rect x="2" y="6" width="20" height="12" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Navn */}
            <Path d="M6 10H16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            
            {/* Tittel/rolle */}
            <Path d="M6 13H12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            
            {/* Dekorasjon - hjarte */}
            <Path 
              d="M16 10C16 10 15.8 9.8 15.8 9.5C15.8 9.2 16 9 16.2 9C16.4 9 16.5 9.2 16.5 9.2C16.5 9.2 16.6 9 16.8 9C17 9 17.2 9.2 17.2 9.5C17.2 9.8 17 10 17 10C17 10.3 16.5 10.8 16.2 11C15.9 10.8 15.5 10.3 15.5 10Z" 
              fill={color} 
              fillOpacity="0.4"
            />
          </Svg>
        );

      case "envelope":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Konvolutt-bakgrunn */}
            <Rect x="2" y="4" width="20" height="16" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Flap */}
            <Path d="M2 4L12 11L22 4" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Diagonal linje */}
            <Path d="M12 11L2 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <Path d="M12 11L22 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            
            {/* Segl */}
            <Circle cx="12" cy="8" r="1.5" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "ribbon":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Bånd (horisontal) */}
            <Path d="M2 10L22 10" stroke={color} strokeWidth="4" strokeLinecap="round" fill={color} fillOpacity="0.1" />
            
            {/* Masker/knute */}
            <Path d="M10 10L8 8L10 6L12 8L10 10Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
            <Path d="M14 10L12 8L14 6L16 8L14 10Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
            
            {/* Hengendre ender */}
            <Path d="M8 8V18L6 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M16 8V18L18 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Dekorasjon */}
            <Circle cx="12" cy="10" r="1" fill={color} />
          </Svg>
        );

      case "stamp":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Frimerke med skråstreker */}
            <Rect x="5" y="4" width="10" height="12" rx="0.5" stroke={color} strokeWidth="1.8" strokeDasharray="1 1" fill={color} fillOpacity="0.05" />
            
            {/* Dekorasjon inne i frimerket */}
            <Path 
              d="M9.5 8C9.5 8 9.2 7.8 9.2 7.5C9.2 7.2 9.5 7 9.8 7C10.1 7 10.2 7.2 10.2 7.2C10.2 7.2 10.3 7 10.6 7C10.9 7 11.2 7.2 11.2 7.5C11.2 7.8 10.9 8 10.9 8C10.9 8.3 10.1 9.2 9.8 9.5C9.5 9.2 8.7 8.3 8.7 8Z" 
              fill={color} 
              fillOpacity="0.4"
            />
            
            {/* Linjer under */}
            <Path d="M6 12H14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <Path d="M6 13.5H14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <Path d="M6 15H14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            
            {/* Farge-strek */}
            <Rect x="16" y="5" width="3" height="11" rx="0.5" fill={color} fillOpacity="0.3" />
          </Svg>
        );

      case "program":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Ark */}
            <Path d="M5 2H19C20 2 21 3 21 4V20C21 21 20 22 19 22H5C4 22 3 21 3 20V4C3 3 4 2 5 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.02" />
            
            {/* Tittel */}
            <Path d="M8 6H16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            
            {/* Program-linjer */}
            <Circle cx="8" cy="11" r="0.8" fill={color} />
            <Path d="M10 11H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            <Circle cx="8" cy="14" r="0.8" fill={color} />
            <Path d="M10 14H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            <Circle cx="8" cy="17" r="0.8" fill={color} />
            <Path d="M10 17H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Tid */}
            <Path d="M16 11H18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <Path d="M16 14H18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <Path d="M16 17H18" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </Svg>
        );

      case "decorative-line":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre ornament */}
            <Path d="M2 12L5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M2 12L5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="6" cy="12" r="1.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
            <Circle cx="6" cy="12" r="0.4" fill={color} />
            
            {/* Sentrallinje med hjerte */}
            <Path d="M8 12L16 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hjerte i midten */}
            <Path 
              d="M11.5 10C11.5 10 11.2 9.8 11.2 9.5C11.2 9.2 11.5 9 11.8 9C12.1 9 12.2 9.2 12.2 9.2C12.2 9.2 12.3 9 12.6 9C12.9 9 13.2 9.2 13.2 9.5C13.2 9.8 12.9 10 12.9 10C12.9 10.3 12.1 11.2 11.8 11.5C11.5 11.2 10.7 10.3 10.7 10Z" 
              fill={color} 
              fillOpacity="0.3"
              stroke={color}
              strokeWidth="0.8"
            />
            
            {/* Høyre ornament */}
            <Circle cx="18" cy="12" r="1.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
            <Circle cx="18" cy="12" r="0.4" fill={color} />
            <Path d="M19 12L22 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M19 12L22 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        );

      case "wax-seal":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Voksseal - sirkelformet */}
            <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
            <Circle cx="12" cy="12" r="6.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            
            {/* Hjerte i sirkelen */}
            <Path 
              d="M10 10C10 10 9.5 9.5 9.5 9C9.5 8.5 10 8 10.5 8C11 8 11.5 8.5 11.5 8.5C11.5 8.5 12 8 12.5 8C13 8 13.5 8.5 13.5 9C13.5 9.5 13 10 13 10C13 10.5 12 11.5 11.5 12C11 11.5 10 10.5 10 10Z" 
              fill={color} 
              fillOpacity="0.5"
              stroke={color}
              strokeWidth="0.8"
            />
            
            {/* Dripeffekt */}
            <Path d="M7 17L5 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M17 17L19 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case "ornament-swirl":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre svirl */}
            <Path d="M2 8C2 8 4 6 7 8C10 10 8 12 6 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M4 10C4 10 5 9 6 10C7 11 6 12 5 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* Høyre svirl */}
            <Path d="M22 8C22 8 20 6 17 8C14 10 16 12 18 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M20 10C20 10 19 9 18 10C17 11 18 12 19 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* Hjerte i sentrum */}
            <Path 
              d="M10.5 8C10.5 8 10.2 7.8 10.2 7.5C10.2 7.2 10.5 7 10.8 7C11.1 7 11.2 7.2 11.2 7.2C11.2 7.2 11.3 7 11.6 7C11.9 7 12.2 7.2 12.2 7.5C12.2 7.8 11.9 8 11.9 8C11.9 8.3 11.1 9.2 10.8 9.5C10.5 9.2 9.7 8.3 9.7 8Z" 
              fill={color} 
              fillOpacity="0.4"
              stroke={color}
              strokeWidth="0.8"
            />
            
            {/* Horisontallinje */}
            <Path d="M6 14H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "foil-accent":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Folie-firkantet 1 */}
            <Rect x="3" y="3" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.15" />
            <Path d="M3 3L11 11" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M11 3L3 11" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            
            {/* Folie-firkantet 2 */}
            <Rect x="13" y="13" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.15" />
            <Path d="M13 13L21 21" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M21 13L13 21" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            
            {/* Liten aksent */}
            <Circle cx="18" cy="7" r="1.5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
            <Circle cx="18" cy="7" r="0.8" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      case "calligraphy":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Pennskaft */}
            <Path d="M5 22L8 8L9 2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Pennespiss */}
            <Path d="M8 8L10 9L8.5 11L7 10L8 8Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
            
            {/* Skrevne linjer */}
            <Path d="M12 5Q14 4 16 5Q18 6 16 8Q14 9 12 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <Path d="M12 12Q14 11 16 12Q18 13 16 15Q14 16 12 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <Path d="M12 19Q14 18 16 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "makeup":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Ansikt/speil */}
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Øyne */}
            <Circle cx="8" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            <Circle cx="16" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            <Circle cx="8" cy="10" r="0.5" fill={color} />
            <Circle cx="16" cy="10" r="0.5" fill={color} />
            
            {/* Øyeliner */}
            <Path d="M6.5 10L9.5 10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M14.5 10L17.5 10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Munn */}
            <Path d="M10 15C10 15 12 16.5 14 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Kosmetikk-vippende */}
            <Path d="M3 5L5 2L7 5" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
            <Circle cx="5" cy="3" r="0.6" fill={color} />
          </Svg>
        );

      case "tiara":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Base */}
            <Path d="M3 15C3 15 5 12 8 12C11 12 12 14 12 14C12 14 13 12 16 12C19 12 21 15 21 15" stroke={color} strokeWidth="2" strokeLinecap="round" fill={color} fillOpacity="0.05" />
            
            {/* Diamanter/perler på toppen */}
            <Circle cx="8" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
            <Circle cx="12" cy="8" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.4" />
            <Circle cx="16" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
            
            {/* Glimmer */}
            <Circle cx="12" cy="8" r="0.8" fill="#ffffff" fillOpacity="0.6" />
            <Circle cx="8" cy="10" r="0.4" fill="#ffffff" fillOpacity="0.5" />
            <Circle cx="16" cy="10" r="0.4" fill="#ffffff" fillOpacity="0.5" />
            
            {/* Stilker */}
            <Path d="M8 11V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M12 10V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M16 11V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          </Svg>
        );

      case "jewelry":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Halskjede base */}
            <Path d="M8 6C8 6 6 8 6 11C6 14 8 16 12 16C16 16 18 14 18 11C18 8 16 6 16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Perler/diamanter */}
            <Circle cx="8" cy="9" r="1" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <Circle cx="10" cy="7" r="1.2" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <Circle cx="12" cy="6" r="1.5" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1" />
            <Circle cx="14" cy="7" r="1.2" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <Circle cx="16" cy="9" r="1" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            
            {/* Glimmer */}
            <Circle cx="12" cy="6" r="0.6" fill="#ffffff" fillOpacity="0.7" />
            
            {/* Ring ved halskjeden */}
            <Circle cx="12" cy="16.5" r="1.5" stroke={color} strokeWidth="1.8" fill="none" />
            <Circle cx="12" cy="16.5" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
          </Svg>
        );

      case "veil":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tiara/kam */}
            <Path d="M6 6L8 4L10 6L12 4L14 6L16 4L18 6" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
            <Rect x="8" y="5" width="8" height="1" rx="0.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            
            {/* Slør - venstre side */}
            <Path d="M10 7L6 10L5 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M10 7L8 9L7 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            
            {/* Slør - høyre side */}
            <Path d="M14 7L18 10L19 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M14 7L16 9L17 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            
            {/* Blomst-detalj */}
            <Circle cx="12" cy="5" r="0.8" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      case "shoes":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre sko */}
            <Path d="M4 14C4 14 4 12 6 11L8 11C9 11 9 13 8 14H4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <Path d="M4 14H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M4.5 14V16C4.5 17 5 18 6 18H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Høyre sko */}
            <Path d="M16 14C16 14 16 12 14 11L12 11C11 11 11 13 12 14H16Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <Path d="M16 14H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15.5 14V16C15.5 17 15 18 14 18H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hæl-detalj */}
            <Path d="M5 18L5 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M14 18L14 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </Svg>
        );

      case "arch":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Bue-struktur */}
            <Path d="M4 20Q4 8 12 4Q20 8 20 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Blomster på siden - venstre */}
            <Circle cx="6" cy="15" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="5" cy="12" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="7" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            
            {/* Blomster på siden - høyre */}
            <Circle cx="18" cy="15" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="19" cy="12" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="17" cy="10" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            
            {/* Topp-blomst */}
            <Circle cx="12" cy="4" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            
            {/* Stilker */}
            <Path d="M6 15L5 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M18 15L19 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "garland":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Snor */}
            <Path d="M2 8Q6 5 10 8Q14 11 18 8Q22 5 24 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Blomster langs snoren */}
            <Circle cx="6" cy="8" r="1.8" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="6" cy="8" r="0.8" fill={color} />
            
            <Circle cx="12" cy="8" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            <Circle cx="12" cy="8" r="0.9" fill={color} />
            
            <Circle cx="18" cy="8" r="1.8" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="18" cy="8" r="0.8" fill={color} />
            
            {/* Blad */}
            <Path d="M8 9L7 11L8 10Z" fill={color} fillOpacity="0.2" />
            <Path d="M16 9L17 11L16 10Z" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "candles":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre lys */}
            <Rect x="4" y="10" width="2.5" height="8" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            <Path d="M5.25 10L4.5 8C4.5 8 5 6 5.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M5 6L6 4" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
            
            {/* Senter lys (større) */}
            <Rect x="10" y="8" width="4" height="10" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            <Path d="M12 8L11 5C11 5 11.5 2 12.5 1" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M11.5 4L13 1" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            
            {/* Høyre lys */}
            <Rect x="17.5" y="10" width="2.5" height="8" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            <Path d="M18.75 10L18 8C18 8 18.5 6 19 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M18.5 6L19.5 4" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
            
            {/* Base */}
            <Path d="M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case "chandelier":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Krysting på toppen */}
            <Circle cx="12" cy="3" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
            
            {/* Kjede ned */}
            <Path d="M12 4.5V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hovedbase */}
            <Ellipse cx="12" cy="9" rx="5" ry="1.5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.05" />
            
            {/* Armer ut */}
            <Path d="M8 9L5 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12 9V12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M16 9L19 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Lysholders */}
            <Circle cx="5" cy="12" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            <Circle cx="12" cy="12" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            <Circle cx="19" cy="12" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.1" />
            
            {/* Lysene */}
            <Path d="M5 12L4.5 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M12 12L11.5 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M19 12L18.5 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Pendelkrystall */}
            <Path d="M12 12V16" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1.2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
          </Svg>
        );

      case "dance-floor":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Plattform */}
            <Rect x="2" y="10" width="20" height="12" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            
            {/* Ruteter */}
            <Rect x="4" y="12" width="2.5" height="2.5" stroke={color} strokeWidth="1" opacity="0.3" />
            <Rect x="7" y="12" width="2.5" height="2.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
            <Rect x="10" y="12" width="2.5" height="2.5" stroke={color} strokeWidth="1" opacity="0.3" />
            <Rect x="13" y="12" width="2.5" height="2.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
            <Rect x="16" y="12" width="2.5" height="2.5" stroke={color} strokeWidth="1" opacity="0.3" />
            
            <Rect x="4" y="15" width="2.5" height="2.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
            <Rect x="7" y="15" width="2.5" height="2.5" stroke={color} strokeWidth="1" opacity="0.3" />
            <Rect x="10" y="15" width="2.5" height="2.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
            <Rect x="13" y="15" width="2.5" height="2.5" stroke={color} strokeWidth="1" opacity="0.3" />
            <Rect x="16" y="15" width="2.5" height="2.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1" />
            
            {/* Spotlight */}
            <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M10 7L8 4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <Path d="M14 7L16 4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "cutting-cake":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kake */}
            <Path d="M5 14V18C5 19 6 20 7 20H17C18 20 19 19 19 18V14" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            <Ellipse cx="12" cy="14" rx="7" ry="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
            
            {/* Knivsneitt */}
            <Path d="M8 10L10 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M14 10L12 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Kniv og spade */}
            <Path d="M8 10L6 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Rect x="5" y="2" width="2" height="1.5" rx="0.3" stroke={color} strokeWidth="1.2" />
            
            <Path d="M14 10L16 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M17 2L19 2L18.5 3.5L16.5 3.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
            
            {/* Dekorasjon på kake */}
            <Circle cx="12" cy="11" r="1.5" fill={color} fillOpacity="0.3" />
          </Svg>
        );

      case "sparklers":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre sparkler */}
            <Path d="M3 12L6 12L8 3L12 10L14 4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            
            {/* Høyre sparkler */}
            <Path d="M13 12L16 12L18 3L22 10L24 4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            
            {/* Stjerner/sparkles */}
            <Path d="M6 10L6.5 8L7 10L8.5 10L7 11L7.5 13L6 11.5L4.5 13L5 11L3.5 10L5 10Z" fill={color} fillOpacity="0.4" />
            <Path d="M16 10L16.5 8L17 10L18.5 10L17 11L17.5 13L16 11.5L14.5 13L15 11L13.5 10L15 10Z" fill={color} fillOpacity="0.4" />
            <Path d="M12 15L12.5 13L13 15L14.5 15L13 16L13.5 18L12 16.5L10.5 18L11 16L9.5 15L11 15Z" fill={color} fillOpacity="0.3" />
          </Svg>
        );

      case "guestbook":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Bok */}
            <Path d="M3 4C3 3 4 2 5 2H21C22 2 23 3 23 4V20C23 21 22 22 21 22H5C4 22 3 21 3 20V4Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.02" />
            
            {/* Rygg */}
            <Path d="M3 4V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            
            {/* Sider */}
            <Path d="M5 4L5 20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
            <Path d="M21 4L21 20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
            
            {/* Underskrifts-linjer */}
            <Path d="M8 7L18 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M8 9L18 9" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            
            <Path d="M8 12L18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M8 14L18 14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            
            <Path d="M8 17L18 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M8 19L18 19" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            
            {/* Hjerte */}
            <Path 
              d="M14 5C14 5 13.5 4.5 13.5 4C13.5 3.5 14 3 14.5 3C15 3 15.5 3.5 15.5 3.5C15.5 3.5 16 3 16.5 3C17 3 17.5 3.5 17.5 4C17.5 4.5 17 5 17 5C17 5.5 16 6.5 15.5 7C15 6.5 14 5.5 14 5Z" 
              fill={color} 
              fillOpacity="0.3"
            />
          </Svg>
        );

      case "favors":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Gavepose */}
            <Path d="M4 8H20V18C20 19 19 20 18 20H6C5 20 4 19 4 18V8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.03" />
            
            {/* Håndtak */}
            <Path d="M8 8L8 5C8 4 9 3 10 3H14C15 3 16 4 16 5L16 8" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            
            {/* Fold på toppen */}
            <Path d="M4 8H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            
            {/* Innhold/dekorasjon */}
            <Circle cx="8" cy="13" r="1.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            <Circle cx="12" cy="14" r="1.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            <Circle cx="16" cy="13" r="1.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            
            {/* Tag */}
            <Rect x="7" y="10" width="3" height="2" rx="0.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" />
          </Svg>
        );

      case "photobooth":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kabine */}
            <Rect x="3" y="2" width="12" height="20" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Dørframe */}
            <Path d="M3 2H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            
            {/* Speil */}
            <Rect x="5" y="4" width="8" height="10" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            
            {/* Lys rundt speil */}
            <Circle cx="6" cy="4" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="12" cy="4" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="6" cy="14" r="0.5" fill={color} fillOpacity="0.4" />
            <Circle cx="12" cy="14" r="0.5" fill={color} fillOpacity="0.4" />
            
            {/* Kamerafrontside */}
            <Circle cx="9" cy="16" r="2.5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.05" />
            <Circle cx="9" cy="16" r="1.5" stroke={color} strokeWidth="1.2" fill="none" />
            <Circle cx="9" cy="16" r="0.7" fill={color} fillOpacity="0.3" />
            
            {/* Knapper */}
            <Circle cx="7" cy="20" r="0.6" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="0.8" />
            <Circle cx="9" cy="20" r="0.6" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="0.8" />
            <Circle cx="11" cy="20" r="0.6" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="0.8" />
            
            {/* Utskrift-slot */}
            <Rect x="16" y="8" width="2" height="8" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
          </Svg>
        );

      case "tent":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Teltform */}
            <Path d="M4 18L12 4L20 18Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Sentral stang */}
            <Path d="M12 4V18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Sidestenger */}
            <Path d="M4 18L8 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M20 18L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Åpning/dør */}
            <Path d="M9 18L9 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15 18L15 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Flag på toppen */}
            <Path d="M12 4L14 2L12 3Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            
            {/* Stolper */}
            <Path d="M2 18L4 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <Path d="M22 18L20 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "gazebo":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Taket */}
            <Path d="M6 10L12 3L18 10" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Takets åtte sider */}
            <Path d="M8 10L5 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12 10V15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M16 10L19 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Takrattep */}
            <Path d="M6 10H18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M8 7H16" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.2" />
            
            {/* Vegger/poster */}
            <Path d="M5 15L5 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M19 15L19 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M9 15L9 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <Path d="M15 15L15 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            
            {/* Base */}
            <Path d="M4 20H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Blomsterkrans på toppen */}
            <Path d="M7 9L12 5L17 9" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "string-lights":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Snor */}
            <Path d="M2 8Q5 5 8 8Q11 11 14 8Q17 5 20 8Q23 11 24 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Lyspærer */}
            <Circle cx="5" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="5" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            <Circle cx="8" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="8" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            <Circle cx="11" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="11" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            <Circle cx="14" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="14" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            <Circle cx="17" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="17" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            <Circle cx="20" cy="8" r="1.2" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.15" />
            <Circle cx="20" cy="8" r="0.5" fill={color} fillOpacity="0.5" />
            
            {/* Ledninger */}
            <Path d="M5 9L5 12" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
            <Path d="M20 9L20 12" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "honeymoon":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Flygeplan */}
            <Path d="M2 12L20 8L16 12L20 16L2 12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <Circle cx="8" cy="12" r="0.6" fill={color} />
            <Circle cx="11" cy="12" r="0.6" fill={color} />
            <Circle cx="14" cy="12" r="0.6" fill={color} />
            
            {/* Sky */}
            <Path d="M3 5C3 5 2 4 3 3C4 2 5 3 5 4" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
            <Path d="M18 6C18 6 17 5 18 4C19 3 20 4 20 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
            
            {/* Hjerte på siden */}
            <Path 
              d="M18.5 10C18.5 10 18 9.5 18 9C18 8.5 18.5 8 19 8C19.5 8 20 8.5 20 8.5C20 8.5 20.5 8 21 8C21.5 8 22 8.5 22 9C22 9.5 21.5 10 21.5 10C21.5 10.3 21 10.8 20.5 11C20 10.8 19.5 10.3 19.5 10Z" 
              fill={color} 
              fillOpacity="0.3"
            />
          </Svg>
        );

      case "first-dance":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Dansegolv-spotlys */}
            <Circle cx="12" cy="14" r="6" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Brud - danser */}
            <Circle cx="9" cy="11" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M9 12.5L7 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 12.5L11 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 12.5L8 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M9 12.5L10 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Brudgom - danser */}
            <Circle cx="15" cy="11" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M15 12.5L13 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15 12.5L17 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M15 12.5L14 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M15 12.5L16 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Hånd i hånd */}
            <Path d="M10 13L14 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            
            {/* Musikk-noter */}
            <Circle cx="4" cy="8" r="0.6" fill={color} />
            <Path d="M4 8L4.5 5" stroke={color} strokeWidth="0.8" />
            <Circle cx="6" cy="6" r="0.6" fill={color} />
            <Path d="M6 6L6.5 3" stroke={color} strokeWidth="0.8" />
          </Svg>
        );

      case "boutonniere":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Blomster */}
            <Circle cx="8" cy="6" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Circle cx="6" cy="8" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
            <Circle cx="10" cy="8" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
            <Circle cx="8" cy="10" r="1.3" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.1" />
            
            {/* Sentre */}
            <Circle cx="8" cy="8" r="0.8" fill={color} />
            
            {/* Blad */}
            <Path d="M7 10L5 13L6 11Z" fill={color} fillOpacity="0.1" />
            <Path d="M9 10L11 13L10 11Z" fill={color} fillOpacity="0.1" />
            
            {/* Stilk */}
            <Path d="M8 11V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Pin/nål */}
            <Path d="M4 18L12 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="4" cy="18" r="0.5" fill={color} />
          </Svg>
        );

      case "ring-cushion":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Pute */}
            <Rect x="4" y="10" width="16" height="8" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            
            {/* Putte-tekstur */}
            <Path d="M8 12L9 13L8 14L7 13L8 12Z" stroke={color} strokeWidth="1" opacity="0.2" />
            <Path d="M12 11L13 12L12 13L11 12L12 11Z" stroke={color} strokeWidth="1" opacity="0.2" />
            <Path d="M16 12L17 13L16 14L15 13L16 12Z" stroke={color} strokeWidth="1" opacity="0.2" />
            <Path d="M10 15L11 16L10 17L9 16L10 15Z" stroke={color} strokeWidth="1" opacity="0.2" />
            <Path d="M14 15L15 16L14 17L13 16L14 15Z" stroke={color} strokeWidth="1" opacity="0.2" />
            
            {/* Ringer på puten */}
            <Circle cx="10" cy="13" r="1.5" stroke={color} strokeWidth="1.8" fill="none" />
            <Circle cx="10" cy="13" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            
            <Circle cx="14" cy="13" r="1.5" stroke={color} strokeWidth="1.8" fill="none" />
            <Circle cx="14" cy="13" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            
            {/* Bånd/dekorasjon */}
            <Path d="M4 18L20 18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "unity-candle":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre lys (rødt/rosa) */}
            <Rect x="3" y="11" width="2" height="7" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M4 11L3.5 9C3.5 9 4 7 4.5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Høyre lys (blått) */}
            <Rect x="19" y="11" width="2" height="7" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M20 11L19.5 9C19.5 9 20 7 20.5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Senter enhetslys (større) */}
            <Rect x="10" y="9" width="4" height="9" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
            <Path d="M12 9L11.5 6C11.5 6 12 3 12.5 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Lys-luer */}
            <Path d="M4 6L3 5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <Path d="M12 2L11 1" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <Path d="M20 6L21 5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            
            {/* Dekorasjon */}
            <Circle cx="12" cy="8" r="0.8" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      case "lawn-games":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Gressmatte-bakgrunn */}
            <Rect x="2" y="14" width="20" height="8" fill={color} fillOpacity="0.04" stroke={color} strokeWidth="1.5" />
            
            {/* Cornhole - målbrett venstre */}
            <Rect x="3" y="10" width="5" height="4" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
            <Circle cx="5.5" cy="12" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.05" />
            
            {/* Cornhole - målbrett høyre */}
            <Rect x="16" y="10" width="5" height="4" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
            <Circle cx="18.5" cy="12" r="1" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.05" />
            
            {/* Poser */}
            <Rect x="4" y="8" width="1" height="1.5" rx="0.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.8" transform="rotate(-20 4.5 8.75)" />
            <Rect x="17" y="8" width="1" height="1.5" rx="0.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.8" transform="rotate(20 17.5 8.75)" />
            
            {/* Flagg/marker */}
            <Path d="M10 5L11 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Rect x="11" y="5" width="1.5" height="1" rx="0.2" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.2" />
            
            <Path d="M14 5L13 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Rect x="11.5" y="5" width="1.5" height="1" rx="0.2" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.2" transform="rotate(180 12.25 5.5)" />
          </Svg>
        );

      case "church":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Topp kors */}
            <Path d="M12 2L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 4L15 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Kirketårn */}
            <Path d="M8 6L8 12L10 14L14 14L16 12L16 6" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Takkje på tårn */}
            <Path d="M8 6L12 3L16 6" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            
            {/* Hovedtak */}
            <Path d="M5 14L12 9L19 14" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={color} fillOpacity="0.04" />
            
            {/* Kirkevegg */}
            <Path d="M5 14L5 20L19 20L19 14Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.02" />
            
            {/* Dør */}
            <Path d="M11 14L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 14L13 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="0.5" fill={color} />
            
            {/* Vinduer */}
            <Rect x="6" y="15" width="1.5" height="1.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" />
            <Rect x="16.5" y="15" width="1.5" height="1.5" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" />
          </Svg>
        );

      case "mosque":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kupol på toppen */}
            <Path d="M12 3C14.5 5 16 8 16 11L8 11C8 8 9.5 5 12 3Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" strokeLinejoin="round" />
            
            {/* Kuppel-outline */}
            <Circle cx="12" cy="11" r="4" stroke={color} strokeWidth="2" fill="none" />
            
            {/* Minaret (tårn) */}
            <Rect x="19" y="10" width="1" height="10" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <Path d="M19 10L18.5 8L19.5 8L20 10" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
            
            {/* Hoved-bygning */}
            <Path d="M5 14L5 20L19 20L19 14Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.02" />
            
            {/* Kreskent-symbol på kupol */}
            <Path d="M11 6C11 6 10 7 10 8C10 9 10.5 10 11 10C11.5 10 12 9 12 8C12 7 11 6 11 6Z" stroke={color} strokeWidth="1" opacity="0.5" />
            <Path d="M13 7L14.5 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
            
            {/* Vinduer */}
            <Rect x="7" y="15" width="1.2" height="1.2" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.08" />
            <Rect x="15.8" y="15" width="1.2" height="1.2" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.08" />
          </Svg>
        );

      case "synagogue":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tak-spiss */}
            <Path d="M6 12L12 4L18 12" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={color} fillOpacity="0.05" />
            
            {/* Hovedbygning */}
            <Rect x="5" y="12" width="14" height="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* To tårn på siden */}
            <Rect x="3" y="14" width="1.5" height="6" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
            <Rect x="19.5" y="14" width="1.5" height="6" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
            
            {/* Tårn-topp */}
            <Path d="M3.75 14L3.75 12L4.75 12L4.75 14" stroke={color} strokeWidth="1" opacity="0.4" />
            <Path d="M20.25 14L20.25 12L21.25 12L21.25 14" stroke={color} strokeWidth="1" opacity="0.4" />
            
            {/* Davidsstjerne (6-pointed star) */}
            <Path d="M12 7L13.5 9L12 10.5L10.5 9Z" stroke={color} strokeWidth="1.2" opacity="0.5" />
            <Path d="M12 7L13.5 9M12 10.5L10.5 9M10.5 7L12 9M13.5 10.5L12 9" stroke={color} strokeWidth="1" opacity="0.3" />
            
            {/* Dør */}
            <Path d="M11 12L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 12L13 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Vinduer */}
            <Rect x="7" y="14" width="1" height="1" stroke={color} strokeWidth="0.8" opacity="0.3" />
            <Rect x="16" y="14" width="1" height="1" stroke={color} strokeWidth="0.8" opacity="0.3" />
          </Svg>
        );

      case "chapel":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tak */}
            <Path d="M7 11L12 5L17 11" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.04" />
            
            {/* Kors på toppen */}
            <Path d="M12 5L12 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M11 6L13 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Vegg */}
            <Rect x="7" y="11" width="10" height="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Dør */}
            <Path d="M11 11L11 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M13 11L13 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Vindu på siden */}
            <Rect x="17.5" y="13" width="1.5" height="2" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" />
            
            {/* Stolper */}
            <Path d="M8 12L8 15" stroke={color} strokeWidth="1" opacity="0.3" />
            <Path d="M16 12L16 15" stroke={color} strokeWidth="1" opacity="0.3" />
          </Svg>
        );

      case "temple":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tak-lag 1 */}
            <Path d="M6 14L12 8L18 14" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={color} fillOpacity="0.04" />
            
            {/* Tak-lag 2 */}
            <Path d="M7 14L12 10L17 14" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.03" opacity="0.6" />
            
            {/* Hovedbygning */}
            <Rect x="6" y="14" width="12" height="6" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Søyler foran */}
            <Path d="M8 14L8 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M10 14L10 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M14 14L14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M16 14L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Dør i midten */}
            <Path d="M11 15L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 15L13 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Ornamenter på toppen */}
            <Circle cx="6" cy="8" r="0.8" fill={color} fillOpacity="0.2" />
            <Circle cx="12" cy="6" r="1" fill={color} fillOpacity="0.3" />
            <Circle cx="18" cy="8" r="0.8" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      case "cathedral":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hovedtårn i midten */}
            <Path d="M11 2L11 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 5L13 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 7L14 7L16 12L8 12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Sidekirkeskip */}
            <Path d="M5 10L5 18L19 18L19 10" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.03" />
            
            {/* Dør */}
            <Path d="M11 10L11 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Rose-vindu */}
            <Circle cx="12" cy="8" r="1.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.05" />
            <Path d="M12 6.5L12 9.5M10.5 8L13.5 8" stroke={color} strokeWidth="0.8" opacity="0.3" />
            
            {/* Gotiske vinduer */}
            <Path d="M6 12L6.5 12L6.5 14L6 14Z" stroke={color} strokeWidth="1" opacity="0.3" />
            <Path d="M18 12L17.5 12L17.5 14L18 14Z" stroke={color} strokeWidth="1" opacity="0.3" />
            
            {/* Sidetårn */}
            <Path d="M3 10L3 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <Path d="M21 10L21 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </Svg>
        );

      case "altar":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Alterbase */}
            <Rect x="4" y="12" width="16" height="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.04" />
            
            {/* Altertopp/bord */}
            <Rect x="5" y="10" width="14" height="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
            
            {/* Frontal (deco foran) */}
            <Rect x="6" y="14" width="12" height="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.05" />
            <Path d="M8 15L8 17M12 15L12 17M16 15L16 17" stroke={color} strokeWidth="1" opacity="0.3" />
            
            {/* Kors på alter */}
            <Path d="M12 4L12 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M10 6L14 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Lysestaker på siden */}
            <Rect x="3" y="8" width="1" height="4" rx="0.3" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Circle cx="3.5" cy="7" r="0.5" fill={color} fillOpacity="0.3" />
            
            <Rect x="20" y="8" width="1" height="4" rx="0.3" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Circle cx="20.5" cy="7" r="0.5" fill={color} fillOpacity="0.3" />
          </Svg>
        );

      case "cross":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Kors */}
            <Path d="M12 2L12 22" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Path d="M4 12L20 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
            
            {/* Dekoration rundt korset */}
            <Circle cx="12" cy="12" r="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            
            {/* Lys-stråler */}
            <Path d="M8 8L6 6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M16 8L18 6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M8 16L6 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <Path d="M16 16L18 18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "holy-candles":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Lysestake */}
            <Rect x="5" y="16" width="14" height="4" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
            
            {/* Tre stearinlys */}
            <Rect x="4" y="8" width="2" height="8" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06" />
            <Path d="M5 8L4.5 5C4.5 5 5 3 5.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="5" cy="6" r="0.4" fill={color} opacity="0.5" />
            
            <Rect x="11" y="6" width="2" height="10" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
            <Path d="M12 6L11.5 2C11.5 2 12 0 12.5 -0.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="3" r="0.5" fill={color} opacity="0.6" />
            
            <Rect x="18" y="8" width="2" height="8" rx="0.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06" />
            <Path d="M19 8L18.5 5C18.5 5 19 3 19.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="19" cy="6" r="0.4" fill={color} opacity="0.5" />
            
            {/* Hellig glans rundt */}
            <Circle cx="12" cy="4" r="3" stroke={color} strokeWidth="1" fill="none" opacity="0.2" />
          </Svg>
        );

      case "religious-ceremony":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Religiøst arrangement */}
            <Rect x="3" y="11" width="18" height="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Altar/fokuspunkt i midten */}
            <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" />
            <Path d="M12 5L12 8L15 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Religiøs symbol (kors) */}
            <Path d="M12 4L12 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M11 5L13 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Folk som deltar */}
            <Circle cx="5" cy="13" r="1" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            <Circle cx="19" cy="13" r="1" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            
            {/* Musikk-element */}
            <Circle cx="6" cy="9" r="0.5" fill={color} />
            <Path d="M6 9L6.3 6" stroke={color} strokeWidth="0.7" />
            <Circle cx="8" cy="7" r="0.5" fill={color} />
            <Path d="M8 7L8.3 4" stroke={color} strokeWidth="0.7" />
          </Svg>
        );

      case "gurudwara":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Sikh flagg på toppen */}
            <Path d="M12 2L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M11 4L13 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M13 3L14 2L13 4Z" fill={color} fillOpacity="0.3" />
            
            {/* Hovedbygning */}
            <Rect x="4" y="8" width="16" height="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.03" />
            
            {/* Gylden kupol */}
            <Path d="M8 8C8 8 8 5 12 3C16 5 16 8 16 8" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
            
            {/* Aksial stang (Khanda symbol) */}
            <Path d="M12 3L12 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
            <Circle cx="12" cy="3" r="0.6" fill={color} />
            
            {/* Søyler */}
            <Path d="M6 8L6 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M18 8L18 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Inngangsdør */}
            <Path d="M11 14L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 14L13 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="0.5" fill={color} />
            
            {/* Vinduer */}
            <Rect x="6.5" y="10" width="1" height="1.5" stroke={color} strokeWidth="0.8" opacity="0.3" />
            <Rect x="16.5" y="10" width="1" height="1.5" stroke={color} strokeWidth="0.8" opacity="0.3" />
          </Svg>
        );

      case "hindu-temple":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Shikhara (spire) - tre lag */}
            <Path d="M12 2L14 6L12 8L10 6Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
            <Path d="M11 7L13 11L11 13L9 11Z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.08" strokeLinejoin="round" opacity="0.7" />
            <Path d="M10 12L14 16L10 18L6 16Z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.06" strokeLinejoin="round" opacity="0.5" />
            
            {/* Hovedbygning */}
            <Rect x="5" y="16" width="14" height="4" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Søyler */}
            <Path d="M7 16L7 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M10 16L10 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M14 16L14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M17 16L17 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Dør */}
            <Path d="M11 16L11 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M13 16L13 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Dekorative markering på toppen */}
            <Circle cx="12" cy="2" r="0.5" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      case "pagoda":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Tak-lag 1 (topp) */}
            <Path d="M9 6L12 3L15 6" stroke={color} strokeWidth="2.2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <Path d="M8 6L16 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            
            {/* Tak-lag 2 */}
            <Path d="M8 9L12 6L16 9" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.06" opacity="0.8" />
            <Path d="M7.5 9L16.5 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
            
            {/* Tak-lag 3 */}
            <Path d="M7 12L12 9L17 12" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color} fillOpacity="0.04" opacity="0.6" />
            <Path d="M6.5 12L17.5 12" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.15" />
            
            {/* Hovedbygning */}
            <Rect x="7" y="12" width="10" height="8" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Sentral søyle */}
            <Path d="M12 3L12 20" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
            
            {/* Dør */}
            <Path d="M11 12L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 12L13 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      case "shinto-shrine":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Torii gate - øverste element */}
            <Path d="M8 8L8 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M16 8L16 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 8L16 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M7.5 10L16.5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            
            {/* Hovedbygning bak */}
            <Path d="M6 12L6 18L18 18L18 12" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.03" />
            
            {/* Tak med kurvatur */}
            <Path d="M6 12Q12 8 18 12" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" strokeLinecap="round" />
            
            {/* Dør */}
            <Path d="M11 12L11 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M13 12L13 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Lanterne */}
            <Rect x="3" y="14" width="1.5" height="2" rx="0.3" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Rect x="19.5" y="14" width="1.5" height="2" rx="0.3" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
          </Svg>
        );

      case "menorah":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Base */}
            <Rect x="4" y="18" width="16" height="2" rx="0.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
            
            {/* Sentral stang */}
            <Path d="M12 4L12 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Syv lysholdere - tre på hver side + sentral */}
            {/* Venstre side */}
            <Path d="M8 16L8 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="8" cy="13" r="0.8" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Path d="M8 13L7.5 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            
            <Path d="M10 15L10 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="10" cy="12" r="0.8" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Path d="M10 12L9.5 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            
            {/* Sentral (høyest) */}
            <Path d="M12 13L12 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="9" r="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
            <Path d="M12 9L11.5 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            
            {/* Høyre side */}
            <Path d="M14 15L14 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="14" cy="12" r="0.8" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Path d="M14 12L14.5 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            
            <Path d="M16 16L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="16" cy="13" r="0.8" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" />
            <Path d="M16 13L16.5 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "om-symbol":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Ytre sirkel */}
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.02" />
            
            {/* Dyrk "3" form for OM */}
            <Path d="M8 10C8 10 7 9 8 8C9 7 10 8 10 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill={color} fillOpacity="0.1" />
            <Path d="M8 13C8 13 7 12 8 11C9 10 10 11 10 12" stroke={color} strokeWidth="2" strokeLinecap="round" fill={color} fillOpacity="0.1" />
            
            {/* Punkt over */}
            <Circle cx="12" cy="6" r="1" fill={color} fillOpacity="0.4" />
            
            {/* Kurve under */}
            <Path d="M8 17Q12 18 16 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            
            {/* Dekorasjon */}
            <Path d="M6 12L5 12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            <Path d="M18 12L19 12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "dharma-wheel":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Ytre hjul */}
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.03" />
            
            {/* Indre sirkel */}
            <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" fill="none" />
            
            {/* Sentral punkt */}
            <Circle cx="12" cy="12" r="1" fill={color} />
            
            {/* Åtte eiker */}
            <Path d="M12 2L12 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <Path d="M12 18L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <Path d="M2 12L6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <Path d="M18 12L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            
            {/* Diagonal eiker */}
            <Path d="M4.5 4.5L7 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <Path d="M19.5 4.5L17 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <Path d="M4.5 19.5L7 17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <Path d="M19.5 19.5L17 17" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </Svg>
        );

      case "faith-hands":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Venstre hånd */}
            <Path d="M4 14L4 8C4 8 4 6 6 6C7 6 8 7 8 8L8 12C8 12 8 10 10 10C11 10 11 11 11 12L11 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Høyre hånd */}
            <Path d="M20 14L20 8C20 8 20 6 18 6C17 6 16 7 16 8L16 12C16 12 16 10 14 10C13 10 13 11 13 12L13 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Hjerte i midten */}
            <Path 
              d="M11 12C11 12 10.5 11.5 10.5 11C10.5 10.5 11 10 11.5 10C12 10 12.5 10.5 12.5 10.5C12.5 10.5 13 10 13.5 10C14 10 14.5 10.5 14.5 11C14.5 11.5 14 12 14 12C14 12.3 13 13.3 12.5 14C12 13.3 11 12.3 11 12Z" 
              fill={color} 
              fillOpacity="0.3"
            />
            
            {/* Glans/lys */}
            <Path d="M12 9L12.5 7" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </Svg>
        );

      case "blessing":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hånd i velsignelse-posisjon */}
            <Path d="M6 8L6 14C6 14 6 16 8 16C9 16 10 15 10 14L10 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <Path d="M14 8L14 14C14 14 14 16 12 16C11 16 10 15 10 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            
            {/* Håndflate */}
            <Ellipse cx="8" cy="14" rx="2.5" ry="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            
            {/* Lys/glans stråler */}
            <Path d="M8 10L8 4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <Path d="M6 11L3 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <Path d="M10 11L13 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <Path d="M5 7L3 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
            <Path d="M11 7L13 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
          </Svg>
        );

      case "meditation":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Person sittende */}
            <Circle cx="12" cy="6" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            
            {/* Kropp i meditasjon */}
            <Path d="M12 8L12 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
            
            {/* Bein i lotus-posisjon */}
            <Path d="M10 14L8 16L8 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M14 14L16 16L16 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Armer i mediativ posisjon */}
            <Path d="M12 10L9 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M12 10L15 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Energi-aura rundt */}
            <Circle cx="12" cy="11" r="5" stroke={color} strokeWidth="1.2" fill="none" opacity="0.2" />
            <Circle cx="12" cy="11" r="7" stroke={color} strokeWidth="0.8" fill="none" opacity="0.1" />
            
            {/* Chakra punkt */}
            <Circle cx="12" cy="12" r="0.6" fill={color} fillOpacity="0.4" />
          </Svg>
        );

      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          </Svg>
        );
    }
  };

  return <View>{renderIcon()}</View>;
};
