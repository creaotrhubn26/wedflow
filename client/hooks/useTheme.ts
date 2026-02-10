import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useDesignContext } from "@/lib/DesignProvider";
import { useContext } from "react";

const DEFAULT_DESIGN_SETTINGS = {
  primaryColor: "#1E6BFF",
  backgroundColor: "#0F1F3A",
  appName: "Evendi",
  appTagline: "Din arrangementsplanlegger",
  logoUrl: "",
  darkMode: true,
  fontFamily: "System",
  fontSize: "16",
  layoutDensity: "standard",
  buttonRadius: "8",
  cardRadius: "12",
  borderWidth: "1",
};

export function useTheme() {
  const colorScheme = useColorScheme();
  
  // Try to get design context, but don't crash if not available
  let settings = DEFAULT_DESIGN_SETTINGS;
  try {
    const designContext = useDesignContext();
    settings = designContext.settings;
  } catch (e) {
    // DesignProvider not available, use defaults
  }

  // Respect design settings for dark mode if available
  const isDark = settings.darkMode ?? (colorScheme === "dark");
  const theme = Colors[isDark ? "dark" : "light"];

  // Detect grayscale-like colors to avoid low-contrast accents
  const isGrayscaleHex = (hex: string) => {
    const m = hex.trim().match(/^#?([\da-f]{6})$/i);
    if (!m) return false;
    const int = parseInt(m[1], 16);
    const r = (int >> 16) & 0xff;
    const g = (int >> 8) & 0xff;
    const b = int & 0xff;
    const rg = Math.abs(r - g);
    const gb = Math.abs(g - b);
    const br = Math.abs(b - r);
    // Consider it grayscale if RGB components are very close
    return rg < 12 && gb < 12 && br < 12;
  };

  const chosenAccent = isGrayscaleHex(settings.primaryColor)
    ? Colors.light.accent
    : settings.primaryColor;

  // Override theme colors with design settings, with safe accent fallback
  const customizedTheme = {
    ...theme,
    primary: chosenAccent,
    accent: chosenAccent,
    background: settings.backgroundColor,
    backgroundDefault: isDark ? settings.backgroundColor : "#FFFFFF",
    backgroundSecondary: isDark ? "#2A2A2A" : "#F5F5F5",
  };

  return {
    theme: customizedTheme,
    isDark,
    designSettings: settings,
  };
}
