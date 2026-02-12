/**
 * Q&A Game Icons — Optimized PNG assets mapped by game mode.
 * Original hi-res sources live in client/screens/QaSystem/.
 * These are resized (400px cards, 150px turn indicators) for mobile performance.
 *
 * Admin can override any icon via QaSettings.customGameIcons (image URI per mode)
 * and accent colors via QaSettings.customGameAccents (hex string per mode).
 */
import { ImageSourcePropType } from "react-native";
import type { QaGameMode } from "@shared/event-types";

// ─── Game card / selector images (400px wide) ───────────────────
const GAME_IMAGES: Record<string, ImageSourcePropType> = {
  shoe_game: require("@/../../assets/qa-games/qna-shoe-game.png"),
  icebreaker: require("@/../../assets/qa-games/qna-icebreaker.png"),
  quiz: require("@/../../assets/qa-games/qna-quiz.png"),
  two_truths: require("@/../../assets/qa-games/qna-two-truths.png"),
  qa_open: require("@/../../assets/qa-games/qna-qa-open.png"),
  product_launch: require("@/../../assets/qa-games/qna-product-launch.png"),
};

// ─── Turn indicator images for shoe game (150px) ────────────────
export const SHOE_TURN_IMAGES = {
  bride: require("@/../../assets/qa-games/qna-bride-shoe.png") as ImageSourcePropType,
  groom: require("@/../../assets/qa-games/qna-groom-shoe.png") as ImageSourcePropType,
};

// ─── Main Q&A Games logo ────────────────────────────────────────
export const QA_GAMES_LOGO = require("@/../../assets/qa-games/qna-games-logo.png") as ImageSourcePropType;

/**
 * Get the image source for a game mode.
 * If customIcons has a URI for this mode, returns { uri } for remote image.
 * Otherwise falls back to the bundled PNG asset.
 */
export function getGameImage(
  mode: QaGameMode | string,
  customIcons?: Record<string, string>,
): ImageSourcePropType {
  if (customIcons?.[mode]) {
    return { uri: customIcons[mode] };
  }
  return GAME_IMAGES[mode] ?? QA_GAMES_LOGO;
}

/**
 * Get the main Q&A session icon.
 * Admin can override with a custom URI via QaSettings.customQaIcon.
 */
export function getQaSessionIcon(customQaIcon?: string): ImageSourcePropType {
  if (customQaIcon) {
    return { uri: customQaIcon };
  }
  return QA_GAMES_LOGO;
}

/**
 * Accent color per game mode — used for borders, chips, highlights.
 */
export const GAME_ACCENT_COLORS: Record<string, string> = {
  shoe_game: "#ec4899",   // pink
  icebreaker: "#06b6d4",  // cyan
  quiz: "#f59e0b",        // amber
  two_truths: "#8b5cf6",  // violet
  qa_open: "#3b82f6",     // blue
  product_launch: "#f97316", // orange
};

/**
 * Get accent color for a game mode.
 * Admin can override per mode via customAccents.
 */
export function getGameAccent(
  mode: QaGameMode | string,
  customAccents?: Record<string, string>,
): string {
  if (customAccents?.[mode]) {
    return customAccents[mode];
  }
  return GAME_ACCENT_COLORS[mode] ?? "#f59e0b";
}

/**
 * All available default game icons — used in admin icon picker.
 */
export const ALL_DEFAULT_GAME_ICONS: { mode: string; label: string; image: ImageSourcePropType }[] = [
  { mode: "shoe_game", label: "Skoleken", image: GAME_IMAGES.shoe_game },
  { mode: "icebreaker", label: "Icebreaker", image: GAME_IMAGES.icebreaker },
  { mode: "quiz", label: "Quiz", image: GAME_IMAGES.quiz },
  { mode: "two_truths", label: "To sannheter", image: GAME_IMAGES.two_truths },
  { mode: "qa_open", label: "Apne sporsmal", image: GAME_IMAGES.qa_open },
  { mode: "product_launch", label: "Produktlansering", image: GAME_IMAGES.product_launch },
];
