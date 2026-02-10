import { Platform } from "react-native";

const evendiBlue = "#1E6BFF";
const evendiTeal = "#00D2C6";

export const Colors = {
  light: {
    text: "#1C2433",
    textSecondary: "#6B6B6B",
    textMuted: "#A7B3C7",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A7B3C7",
    tabIconSelected: evendiBlue,
    link: evendiBlue,
    accent: evendiBlue,
    accentLight: evendiTeal,
    backgroundRoot: "#F5F8FC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#E6EDF7",
    backgroundTertiary: "#E6EDF7",
    backgroundElevated: "#F5F8FC",
    border: "#E6EDF7",
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#EF5350",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A7B3C7",
    textMuted: "#6B7A8D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7A8D",
    tabIconSelected: evendiBlue,
    link: evendiBlue,
    accent: evendiBlue,
    accentLight: evendiTeal,
    backgroundRoot: "#0F1F3A",
    backgroundDefault: "#172A4A",
    backgroundSecondary: "#1E3356",
    backgroundTertiary: "#253D62",
    backgroundElevated: "#1E3356",
    border: "#253D62",
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#EF5350",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  card: Platform.select({
    web: { boxShadow: "0 8px 24px rgba(15, 31, 58, 0.08)" },
    default: {
      shadowColor: "#0F1F3A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 3,
    },
  }),
  button: Platform.select({
    web: { boxShadow: "0 4px 12px rgba(15, 31, 58, 0.1)" },
    default: {
      shadowColor: "#0F1F3A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 2,
    },
  }),
};
