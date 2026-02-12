/**
 * Q&A Game Icons — Optimized PNG assets mapped by game mode.
 * Original hi-res sources live in client/screens/QaSystem/.
 * These are resized (400px cards, 150px turn indicators) for mobile performance.
 */
import { ImageSourcePropType } from "react-native";
import type { QaGameMode } from "@shared/event-types";

// ─── Game card / selector images (400px wide) ───────────────────
const GAME_IMAGES: Record<string, ImageSourcePropType> = {
  shoe_game: require("@/../../assets/qa-games/qna-shoe-game.png"),
  icebreaker: require("@/../../assets/qa-games/qna-icebreaker.png"),
  quiz: require("@/../../assets/qa-games/qna-quiz.png"),
  two_truths: require("@/../../assets/qa-games/qna-two-truths.png"),
  qa_open: require("@/../../assets/qa-games/qna-games-logo.png"),
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
 * Get the optimized image for a game mode.
 * Falls back to the main Q&A Games logo if mode isn't mapped.
 */
export function getGameImage(mode: QaGameMode | string): ImageSourcePropType {
  return GAME_IMAGES[mode] ?? QA_GAMES_LOGO;
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

export function getGameAccent(mode: QaGameMode | string): string {
  return GAME_ACCENT_COLORS[mode] ?? "#f59e0b";
}
