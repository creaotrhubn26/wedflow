import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getTraditionHints, CULTURAL_LABELS } from "@/constants/tradition-data";

interface TraditionHintBannerProps {
  traditions: string[];
  category: "venue" | "cake" | "catering" | "dress" | "music" | "flowers";
}

export function TraditionHintBanner({ traditions, category }: TraditionHintBannerProps) {
  const theme = useTheme();
  const hints = getTraditionHints(traditions, category);

  if (hints.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(50).duration(300)}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            borderLeftColor: "#FFB300",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Feather name="info" size={16} color="#FFB300" />
          <ThemedText style={[styles.headerText, { color: "#FFB300" }]}>
            Kulturelle tips
          </ThemedText>
        </View>
        {hints.map((hint, i) => (
          <View key={i} style={styles.hintRow}>
            <Feather
              name={hint.icon as any}
              size={14}
              color={theme.textSecondary}
              style={styles.hintIcon}
            />
            <ThemedText style={[styles.hintText, { color: theme.textSecondary }]}>
              {hint.text}
            </ThemedText>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
  },
  hintIcon: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
